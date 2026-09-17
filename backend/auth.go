package main

import (
	"context"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"golang.org/x/crypto/bcrypt"
)

// HashPassword hashes a raw password using bcrypt
func HashPassword(password string) (string, error) {
	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedBytes), nil
}

// CheckPasswordHash compares a hashed password with a plain text password
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// SignupHandler handles user registration (POST /signup)
func SignupHandler(c *gin.Context) {
	var req SignupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request payload: " + err.Error(),
		})
		return
	}

	// Support both 'name' and 'full_name'
	name := strings.TrimSpace(req.Name)
	if name == "" {
		name = strings.TrimSpace(req.FullName)
	}
	if name == "" {
		// Default name to email prefix if not provided
		parts := strings.Split(req.Email, "@")
		if len(parts) > 0 {
			name = parts[0]
		}
	}

	email := strings.ToLower(strings.TrimSpace(req.Email))
	if email == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Email is required",
		})
		return
	}

	if len(req.Password) < 6 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Password must be at least 6 characters long",
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// 8. Validate duplicate email in MongoDB users collection
	var existingUser User
	err := usersCollection.FindOne(ctx, bson.M{"email": email}).Decode(&existingUser)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"error": "User with this email already exists",
		})
		return
	} else if !errors.Is(err, mongo.ErrNoDocuments) {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Database error checking existing user",
		})
		return
	}

	// 3. Hash password using bcrypt
	hashedPassword, err := HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to hash password",
		})
		return
	}

	now := time.Now().UTC()
	newUser := User{
		ID:        bson.NewObjectID(),
		Name:      name,
		Email:     email,
		Password:  hashedPassword,
		CreatedAt: now,
		UpdatedAt: now,
	}

	// 7. Store user in MongoDB users collection
	_, err = usersCollection.InsertOne(ctx, newUser)
	if err != nil {
		if mongo.IsDuplicateKeyError(err) {
			c.JSON(http.StatusConflict, gin.H{
				"error": "User with this email already exists",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create user",
		})
		return
	}

	// 5. Generate JWT token
	token, err := GenerateToken(newUser.ID.Hex(), newUser.Email, newUser.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "User created, but failed to generate token",
		})
		return
	}

	// 6. Return JWT on successful signup
	c.JSON(http.StatusCreated, AuthResponse{
		Message: "User registered successfully",
		Token:   token,
		User: UserResponse{
			ID:    newUser.ID.Hex(),
			Name:  newUser.Name,
			Email: newUser.Email,
		},
	})
}

// LoginHandler handles user authentication (POST /login)
func LoginHandler(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request payload: " + err.Error(),
		})
		return
	}

	email := strings.ToLower(strings.TrimSpace(req.Email))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Find user by email in MongoDB users collection
	var user User
	err := usersCollection.FindOne(ctx, bson.M{"email": email}).Decode(&user)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid email or password",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Database error",
		})
		return
	}

	// Verify password using bcrypt
	if !CheckPasswordHash(req.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid email or password",
		})
		return
	}

	// 5. Generate JWT token
	token, err := GenerateToken(user.ID.Hex(), user.Email, user.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to generate token",
		})
		return
	}

	// 6. Return JWT on successful login
	c.JSON(http.StatusOK, AuthResponse{
		Message: "Login successful",
		Token:   token,
		User: UserResponse{
			ID:    user.ID.Hex(),
			Name:  user.Name,
			Email: user.Email,
		},
	})
}
