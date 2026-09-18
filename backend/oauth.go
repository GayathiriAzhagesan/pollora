package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

// getFrontendURL returns the frontend base URL from env or defaults to http://localhost:5173
func getFrontendURL() string {
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:5173"
	}
	return strings.TrimRight(frontendURL, "/")
}

// AuthProvidersHandler returns which OAuth providers are configured
func AuthProvidersHandler(c *gin.Context) {
	googleID := strings.TrimSpace(os.Getenv("GOOGLE_CLIENT_ID"))
	googleSecret := strings.TrimSpace(os.Getenv("GOOGLE_CLIENT_SECRET"))
	microsoftID := strings.TrimSpace(os.Getenv("MICROSOFT_CLIENT_ID"))
	microsoftSecret := strings.TrimSpace(os.Getenv("MICROSOFT_CLIENT_SECRET"))

	c.JSON(http.StatusOK, gin.H{
		"google": gin.H{
			"configured": googleID != "" && googleSecret != "",
		},
		"microsoft": gin.H{
			"configured": microsoftID != "" && microsoftSecret != "",
		},
	})
}

// GoogleAuthHandler initiates Google OAuth flow
func GoogleAuthHandler(c *gin.Context) {
	clientID := strings.TrimSpace(os.Getenv("GOOGLE_CLIENT_ID"))
	clientSecret := strings.TrimSpace(os.Getenv("GOOGLE_CLIENT_SECRET"))
	redirectURI := strings.TrimSpace(os.Getenv("GOOGLE_REDIRECT_URL"))

	if clientID == "" || clientSecret == "" {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error":   "Google OAuth is not configured",
			"message": "Please configure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URL in the backend environment variables.",
		})
		return
	}

	if redirectURI == "" {
		redirectURI = "http://localhost:8080/auth/google/callback"
	}

	authURL := fmt.Sprintf(
		"https://accounts.google.com/o/oauth2/v2/auth?client_id=%s&redirect_uri=%s&response_type=code&scope=openid%%20email%%20profile&access_type=offline&prompt=select_account",
		url.QueryEscape(clientID),
		url.QueryEscape(redirectURI),
	)

	c.Redirect(http.StatusTemporaryRedirect, authURL)
}

// GoogleCallbackHandler handles Google OAuth callback
func GoogleCallbackHandler(c *gin.Context) {
	frontendURL := getFrontendURL()
	code := c.Query("code")
	if code == "" {
		errDesc := c.Query("error")
		if errDesc == "" {
			errDesc = "oauth_cancelled"
		}
		c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("%s/login?error=%s", frontendURL, url.QueryEscape(errDesc)))
		return
	}

	clientID := strings.TrimSpace(os.Getenv("GOOGLE_CLIENT_ID"))
	clientSecret := strings.TrimSpace(os.Getenv("GOOGLE_CLIENT_SECRET"))
	redirectURI := strings.TrimSpace(os.Getenv("GOOGLE_REDIRECT_URL"))
	if redirectURI == "" {
		redirectURI = "http://localhost:8080/auth/google/callback"
	}

	// Exchange authorization code for tokens
	tokenResp, err := http.PostForm("https://oauth2.googleapis.com/token", url.Values{
		"code":          {code},
		"client_id":     {clientID},
		"client_secret": {clientSecret},
		"redirect_uri":  {redirectURI},
		"grant_type":    {"authorization_code"},
	})
	if err != nil || tokenResp.StatusCode != http.StatusOK {
		c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("%s/login?error=%s", frontendURL, url.QueryEscape("Failed to exchange code with Google")))
		return
	}
	defer tokenResp.Body.Close()

	var tokenData struct {
		AccessToken string `json:"access_token"`
	}
	if err := json.NewDecoder(tokenResp.Body).Decode(&tokenData); err != nil || tokenData.AccessToken == "" {
		c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("%s/login?error=%s", frontendURL, url.QueryEscape("Failed to parse Google access token")))
		return
	}

	// Fetch user profile from Google
	req, _ := http.NewRequest("GET", "https://www.googleapis.com/oauth2/v2/userinfo", nil)
	req.Header.Set("Authorization", "Bearer "+tokenData.AccessToken)
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("%s/login?error=%s", frontendURL, url.QueryEscape("Failed to retrieve Google user profile")))
		return
	}
	defer resp.Body.Close()

	var googleUser struct {
		ID    string `json:"id"`
		Email string `json:"email"`
		Name  string `json:"name"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&googleUser); err != nil || googleUser.Email == "" {
		c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("%s/login?error=%s", frontendURL, url.QueryEscape("Invalid profile received from Google")))
		return
	}

	// Find or create user in MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	email := strings.ToLower(strings.TrimSpace(googleUser.Email))
	name := strings.TrimSpace(googleUser.Name)
	if name == "" {
		name = strings.Split(email, "@")[0]
	}

	var user User
	err = usersCollection.FindOne(ctx, bson.M{"email": email}).Decode(&user)
	if errors.Is(err, mongo.ErrNoDocuments) {
		// Create new user
		now := time.Now().UTC()
		user = User{
			ID:        bson.NewObjectID(),
			Name:      name,
			Email:     email,
			Password:  "", // OAuth users don't have password
			CreatedAt: now,
			UpdatedAt: now,
		}
		_, insertErr := usersCollection.InsertOne(ctx, user)
		if insertErr != nil {
			c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("%s/login?error=%s", frontendURL, url.QueryEscape("Failed to create user record")))
			return
		}
	} else if err != nil {
		c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("%s/login?error=%s", frontendURL, url.QueryEscape("Database error verifying user")))
		return
	}

	// Generate existing JWT
	token, err := GenerateToken(user.ID.Hex(), user.Email, user.Name)
	if err != nil {
		c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("%s/login?error=%s", frontendURL, url.QueryEscape("Failed to generate JWT session")))
		return
	}

	redirectURL := fmt.Sprintf(
		"%s/login?oauth_token=%s&user_id=%s&user_name=%s&user_email=%s",
		frontendURL,
		url.QueryEscape(token),
		url.QueryEscape(user.ID.Hex()),
		url.QueryEscape(user.Name),
		url.QueryEscape(user.Email),
	)
	c.Redirect(http.StatusTemporaryRedirect, redirectURL)
}

// MicrosoftAuthHandler initiates Microsoft OAuth/OIDC flow
func MicrosoftAuthHandler(c *gin.Context) {
	clientID := strings.TrimSpace(os.Getenv("MICROSOFT_CLIENT_ID"))
	clientSecret := strings.TrimSpace(os.Getenv("MICROSOFT_CLIENT_SECRET"))
	redirectURI := strings.TrimSpace(os.Getenv("MICROSOFT_REDIRECT_URL"))

	if clientID == "" || clientSecret == "" {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error":   "Microsoft OAuth is not configured",
			"message": "Please configure MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, and MICROSOFT_REDIRECT_URL in the backend environment variables.",
		})
		return
	}

	if redirectURI == "" {
		redirectURI = "http://localhost:8080/auth/microsoft/callback"
	}

	authURL := fmt.Sprintf(
		"https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=%s&response_type=code&redirect_uri=%s&response_mode=query&scope=openid%%20profile%%20email",
		url.QueryEscape(clientID),
		url.QueryEscape(redirectURI),
	)

	c.Redirect(http.StatusTemporaryRedirect, authURL)
}

// MicrosoftCallbackHandler handles Microsoft OAuth callback
func MicrosoftCallbackHandler(c *gin.Context) {
	frontendURL := getFrontendURL()
	code := c.Query("code")
	if code == "" {
		errDesc := c.Query("error")
		if errDesc == "" {
			errDesc = "oauth_cancelled"
		}
		c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("%s/login?error=%s", frontendURL, url.QueryEscape(errDesc)))
		return
	}

	clientID := strings.TrimSpace(os.Getenv("MICROSOFT_CLIENT_ID"))
	clientSecret := strings.TrimSpace(os.Getenv("MICROSOFT_CLIENT_SECRET"))
	redirectURI := strings.TrimSpace(os.Getenv("MICROSOFT_REDIRECT_URL"))
	if redirectURI == "" {
		redirectURI = "http://localhost:8080/auth/microsoft/callback"
	}

	tokenResp, err := http.PostForm("https://login.microsoftonline.com/common/oauth2/v2.0/token", url.Values{
		"client_id":     {clientID},
		"client_secret": {clientSecret},
		"code":          {code},
		"redirect_uri":  {redirectURI},
		"grant_type":    {"authorization_code"},
	})
	if err != nil || tokenResp.StatusCode != http.StatusOK {
		c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("%s/login?error=%s", frontendURL, url.QueryEscape("Failed to exchange code with Microsoft")))
		return
	}
	defer tokenResp.Body.Close()

	var tokenData struct {
		AccessToken string `json:"access_token"`
	}
	if err := json.NewDecoder(tokenResp.Body).Decode(&tokenData); err != nil || tokenData.AccessToken == "" {
		c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("%s/login?error=%s", frontendURL, url.QueryEscape("Failed to parse Microsoft token")))
		return
	}

	// Fetch Microsoft profile via Microsoft Graph
	req, _ := http.NewRequest("GET", "https://graph.microsoft.com/v1.0/me", nil)
	req.Header.Set("Authorization", "Bearer "+tokenData.AccessToken)
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		_ = body
		c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("%s/login?error=%s", frontendURL, url.QueryEscape("Failed to retrieve Microsoft user profile")))
		return
	}
	defer resp.Body.Close()

	var msUser struct {
		DisplayName       string `json:"displayName"`
		Mail              string `json:"mail"`
		UserPrincipalName string `json:"userPrincipalName"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&msUser); err != nil {
		c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("%s/login?error=%s", frontendURL, url.QueryEscape("Invalid profile received from Microsoft")))
		return
	}

	email := msUser.Mail
	if email == "" {
		email = msUser.UserPrincipalName
	}
	email = strings.ToLower(strings.TrimSpace(email))
	if email == "" {
		c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("%s/login?error=%s", frontendURL, url.QueryEscape("No valid email associated with Microsoft account")))
		return
	}

	name := strings.TrimSpace(msUser.DisplayName)
	if name == "" {
		name = strings.Split(email, "@")[0]
	}

	// Find or create in MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var user User
	err = usersCollection.FindOne(ctx, bson.M{"email": email}).Decode(&user)
	if errors.Is(err, mongo.ErrNoDocuments) {
		now := time.Now().UTC()
		user = User{
			ID:        bson.NewObjectID(),
			Name:      name,
			Email:     email,
			Password:  "",
			CreatedAt: now,
			UpdatedAt: now,
		}
		_, insertErr := usersCollection.InsertOne(ctx, user)
		if insertErr != nil {
			c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("%s/login?error=%s", frontendURL, url.QueryEscape("Failed to create user record")))
			return
		}
	} else if err != nil {
		c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("%s/login?error=%s", frontendURL, url.QueryEscape("Database error verifying user")))
		return
	}

	token, err := GenerateToken(user.ID.Hex(), user.Email, user.Name)
	if err != nil {
		c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("%s/login?error=%s", frontendURL, url.QueryEscape("Failed to generate JWT session")))
		return
	}

	redirectURL := fmt.Sprintf(
		"%s/login?oauth_token=%s&user_id=%s&user_name=%s&user_email=%s",
		frontendURL,
		url.QueryEscape(token),
		url.QueryEscape(user.ID.Hex()),
		url.QueryEscape(user.Name),
		url.QueryEscape(user.Email),
	)
	c.Redirect(http.StatusTemporaryRedirect, redirectURL)
}
