package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
)

func TestPasswordHashing(t *testing.T) {
	password := "supersecret123"

	hashed, err := HashPassword(password)
	if err != nil {
		t.Fatalf("Failed to hash password: %v", err)
	}

	if hashed == password {
		t.Fatalf("Hashed password must not equal plain password")
	}

	if !CheckPasswordHash(password, hashed) {
		t.Fatalf("Password verification failed for correct password")
	}

	if CheckPasswordHash("wrongpassword", hashed) {
		t.Fatalf("Password verification should fail for wrong password")
	}
}

func TestJWTGenerationAndValidation(t *testing.T) {
	userID := "64e0a1b2c3d4e5f6a7b8c9d0"
	email := "testuser@example.com"
	name := "Test User"

	token, err := GenerateToken(userID, email, name)
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}

	if token == "" {
		t.Fatalf("Generated token is empty")
	}

	claims, err := ValidateToken(token)
	if err != nil {
		t.Fatalf("Failed to validate token: %v", err)
	}

	if claims.UserID != userID {
		t.Errorf("Expected userID %s, got %s", userID, claims.UserID)
	}
	if claims.Email != email {
		t.Errorf("Expected email %s, got %s", email, claims.Email)
	}
	if claims.Name != name {
		t.Errorf("Expected name %s, got %s", name, claims.Name)
	}
}

func setupTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.POST("/signup", SignupHandler)
	r.POST("/login", LoginHandler)
	return r
}

func TestAuthEndpointsIntegration(t *testing.T) {
	connectDB()
	if usersCollection == nil {
		t.Fatalf("MongoDB usersCollection is not initialized")
	}

	router := setupTestRouter()
	uniqueTestEmail := fmt.Sprintf("test_integration_%d@example.com", time.Now().UnixNano())
	testPassword := "securePassword123"
	testName := "Integration Tester"

	// Cleanup test email before and after
	defer func() {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		usersCollection.DeleteOne(ctx, bson.M{"email": uniqueTestEmail})
	}()

	// 1. Test POST /signup
	signupPayload := map[string]string{
		"name":     testName,
		"email":    uniqueTestEmail,
		"password": testPassword,
	}
	body, _ := json.Marshal(signupPayload)
	req, _ := http.NewRequest(http.MethodPost, "/signup", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("Expected /signup to return 201 Created, got %d: %s", w.Code, w.Body.String())
	}

	var signupResp AuthResponse
	if err := json.Unmarshal(w.Body.Bytes(), &signupResp); err != nil {
		t.Fatalf("Failed to decode signup response: %v", err)
	}
	if signupResp.Token == "" {
		t.Errorf("Expected signup response to contain JWT token")
	}
	if signupResp.User.Email != uniqueTestEmail {
		t.Errorf("Expected user email %s, got %s", uniqueTestEmail, signupResp.User.Email)
	}

	// 2. Test Duplicate Email POST /signup
	wDup := httptest.NewRecorder()
	reqDup, _ := http.NewRequest(http.MethodPost, "/signup", bytes.NewBuffer(body))
	reqDup.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(wDup, reqDup)

	if wDup.Code != http.StatusConflict {
		t.Fatalf("Expected duplicate /signup to return 409 Conflict, got %d: %s", wDup.Code, wDup.Body.String())
	}

	// 3. Test POST /login with wrong password
	wrongLoginPayload := map[string]string{
		"email":    uniqueTestEmail,
		"password": "wrongpassword999",
	}
	wrongBody, _ := json.Marshal(wrongLoginPayload)
	reqWrong, _ := http.NewRequest(http.MethodPost, "/login", bytes.NewBuffer(wrongBody))
	reqWrong.Header.Set("Content-Type", "application/json")
	wWrong := httptest.NewRecorder()
	router.ServeHTTP(wWrong, reqWrong)

	if wWrong.Code != http.StatusUnauthorized {
		t.Fatalf("Expected wrong password login to return 401 Unauthorized, got %d: %s", wWrong.Code, wWrong.Body.String())
	}

	// 4. Test POST /login with correct password
	correctLoginPayload := map[string]string{
		"email":    uniqueTestEmail,
		"password": testPassword,
	}
	correctBody, _ := json.Marshal(correctLoginPayload)
	reqCorrect, _ := http.NewRequest(http.MethodPost, "/login", bytes.NewBuffer(correctBody))
	reqCorrect.Header.Set("Content-Type", "application/json")
	wCorrect := httptest.NewRecorder()
	router.ServeHTTP(wCorrect, reqCorrect)

	if wCorrect.Code != http.StatusOK {
		t.Fatalf("Expected correct login to return 200 OK, got %d: %s", wCorrect.Code, wCorrect.Body.String())
	}

	var loginResp AuthResponse
	if err := json.Unmarshal(wCorrect.Body.Bytes(), &loginResp); err != nil {
		t.Fatalf("Failed to decode login response: %v", err)
	}
	if loginResp.Token == "" {
		t.Errorf("Expected login response to contain JWT token")
	}
	if loginResp.User.Email != uniqueTestEmail {
		t.Errorf("Expected login user email %s, got %s", uniqueTestEmail, loginResp.User.Email)
	}

	// Validate the JWT token returned by login
	claims, err := ValidateToken(loginResp.Token)
	if err != nil {
		t.Fatalf("Login JWT validation failed: %v", err)
	}
	if claims.Email != uniqueTestEmail {
		t.Errorf("JWT claims email mismatch: expected %s, got %s", uniqueTestEmail, claims.Email)
	}
}
