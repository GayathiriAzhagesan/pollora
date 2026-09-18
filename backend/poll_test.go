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

func setupPollTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.POST("/polls", AuthMiddleware(), CreatePollHandler)
	return r
}

func TestCreatePollEndpoint(t *testing.T) {
	connectDB()
	if pollsCollection == nil {
		t.Fatalf("MongoDB pollsCollection is not initialized")
	}

	router := setupPollTestRouter()

	testUserID := "64a0f123456789abcdef0123"
	testEmail := "pollcreator@example.com"
	testName := "Poll Creator"

	token, err := GenerateToken(testUserID, testEmail, testName)
	if err != nil {
		t.Fatalf("Failed to generate test token: %v", err)
	}

	// Case 1: Unauthenticated request (no Authorization header)
	pollPayload := map[string]interface{}{
		"question": "Favorite Programming Language?",
		"options":  []string{"Java", "Python", "JavaScript"},
	}
	body, _ := json.Marshal(pollPayload)

	reqNoAuth, _ := http.NewRequest(http.MethodPost, "/polls", bytes.NewBuffer(body))
	reqNoAuth.Header.Set("Content-Type", "application/json")
	wNoAuth := httptest.NewRecorder()
	router.ServeHTTP(wNoAuth, reqNoAuth)

	if wNoAuth.Code != http.StatusUnauthorized {
		t.Errorf("Expected 401 Unauthorized for missing token, got %d", wNoAuth.Code)
	}

	// Case 2: Invalid Bearer token
	reqInvalidToken, _ := http.NewRequest(http.MethodPost, "/polls", bytes.NewBuffer(body))
	reqInvalidToken.Header.Set("Content-Type", "application/json")
	reqInvalidToken.Header.Set("Authorization", "Bearer invalid-token-string")
	wInvalidToken := httptest.NewRecorder()
	router.ServeHTTP(wInvalidToken, reqInvalidToken)

	if wInvalidToken.Code != http.StatusUnauthorized {
		t.Errorf("Expected 401 Unauthorized for invalid token, got %d", wInvalidToken.Code)
	}

	// Case 3: Validation failure - less than 2 options
	invalidPayload := map[string]interface{}{
		"question": "Only one option?",
		"options":  []string{"Java"},
	}
	invalidBody, _ := json.Marshal(invalidPayload)
	reqInvalidBody, _ := http.NewRequest(http.MethodPost, "/polls", bytes.NewBuffer(invalidBody))
	reqInvalidBody.Header.Set("Content-Type", "application/json")
	reqInvalidBody.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	wInvalidBody := httptest.NewRecorder()
	router.ServeHTTP(wInvalidBody, reqInvalidBody)

	if wInvalidBody.Code != http.StatusBadRequest {
		t.Errorf("Expected 400 Bad Request for <2 options, got %d", wInvalidBody.Code)
	}

	// Case 4: Successful poll creation with valid JWT
	reqValid, _ := http.NewRequest(http.MethodPost, "/polls", bytes.NewBuffer(body))
	reqValid.Header.Set("Content-Type", "application/json")
	reqValid.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	wValid := httptest.NewRecorder()
	router.ServeHTTP(wValid, reqValid)

	if wValid.Code != http.StatusCreated {
		t.Fatalf("Expected 201 Created for valid poll creation, got %d: %s", wValid.Code, wValid.Body.String())
	}

	var createdPoll Poll
	if err := json.Unmarshal(wValid.Body.Bytes(), &createdPoll); err != nil {
		t.Fatalf("Failed to decode poll response: %v", err)
	}

	if createdPoll.Question != "Favorite Programming Language?" {
		t.Errorf("Expected question 'Favorite Programming Language?', got '%s'", createdPoll.Question)
	}
	if createdPoll.CreatedBy != testUserID {
		t.Errorf("Expected createdBy '%s', got '%s'", testUserID, createdPoll.CreatedBy)
	}
	if len(createdPoll.Options) != 3 {
		t.Fatalf("Expected 3 options, got %d", len(createdPoll.Options))
	}
	if createdPoll.Options[0].Text != "Java" || createdPoll.Options[0].Votes != 0 {
		t.Errorf("Option 1 mismatch: %+v", createdPoll.Options[0])
	}
	if createdPoll.Options[1].Text != "Python" || createdPoll.Options[1].Votes != 0 {
		t.Errorf("Option 2 mismatch: %+v", createdPoll.Options[1])
	}
	if createdPoll.Options[2].Text != "JavaScript" || createdPoll.Options[2].Votes != 0 {
		t.Errorf("Option 3 mismatch: %+v", createdPoll.Options[2])
	}

	// Cleanup created poll from MongoDB
	defer func() {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		pollsCollection.DeleteOne(ctx, bson.M{"_id": createdPoll.ID})
	}()
}
