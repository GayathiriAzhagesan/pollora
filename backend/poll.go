package main

import (
"context"
"fmt"
"net/http"
"strings"
"time"

"github.com/gin-gonic/gin"
"go.mongodb.org/mongo-driver/v2/bson"
)

// CreatePollHandler handles POST /polls
func CreatePollHandler(c *gin.Context) {
userIDVal, exists := c.Get("userID")
if !exists {
c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: user not authenticated"})
return
}

userID, ok := userIDVal.(string)
if !ok || userID == "" {
c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: invalid user context"})
return
}

var req CreatePollRequest
if err := c.ShouldBindJSON(&req); err != nil {
c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload: " + err.Error()})
return
}

question := strings.TrimSpace(req.Question)
if question == "" {
c.JSON(http.StatusBadRequest, gin.H{"error": "Question is required"})
return
}

if len(req.Options) < 2 {
c.JSON(http.StatusBadRequest, gin.H{"error": "Poll must contain at least 2 options"})
return
}

formattedOptions := make([]PollOption, 0, len(req.Options))

for i, opt := range req.Options {
trimmed := strings.TrimSpace(opt)

if trimmed == "" {
c.JSON(http.StatusBadRequest, gin.H{
"error": fmt.Sprintf("Option #%d cannot be empty", i+1),
})
return
}

formattedOptions = append(formattedOptions, PollOption{
ID:    fmt.Sprintf("opt-%d", i+1),
Text:  trimmed,
Votes: 0,
})
}

now := time.Now().UTC()

newPoll := Poll{
ID:        bson.NewObjectID(),
Question:  question,
Options:   formattedOptions,
CreatedBy: userID,
CreatedAt: now,
UpdatedAt: now,
}

ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
defer cancel()

coll := getPollsCollection()
if coll == nil {
c.JSON(http.StatusInternalServerError, gin.H{
"error": "Database not initialized",
})
return
}

_, err := coll.InsertOne(ctx, newPoll)
if err != nil {
c.JSON(http.StatusInternalServerError, gin.H{
"error": "Failed to save poll: " + err.Error(),
})
return
}

c.JSON(http.StatusCreated, PollResponse{
ID:        newPoll.ID.Hex(),
Question:  newPoll.Question,
Options:   newPoll.Options,
CreatedBy: newPoll.CreatedBy,
CreatedAt: newPoll.CreatedAt,
UpdatedAt: newPoll.UpdatedAt,
})
}

// GetPollsHandler handles GET /polls
func GetPollsHandler(c *gin.Context) {
coll := getPollsCollection()
if coll == nil {
c.JSON(http.StatusInternalServerError, gin.H{"error": "Database not initialized"})
return
}

ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
defer cancel()

cursor, err := coll.Find(ctx, bson.M{})
if err != nil {
c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch polls: " + err.Error()})
return
}
defer cursor.Close(ctx)

var polls []Poll
if err := cursor.All(ctx, &polls); err != nil {
c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode polls: " + err.Error()})
return
}

responses := make([]PollResponse, 0, len(polls))

for _, poll := range polls {
responses = append(responses, PollResponse{
ID:        poll.ID.Hex(),
Question:  poll.Question,
Options:   poll.Options,
CreatedBy: poll.CreatedBy,
CreatedAt: poll.CreatedAt,
UpdatedAt: poll.UpdatedAt,
})
}

c.JSON(http.StatusOK, responses)
}

// GetPollHandler handles GET /polls/:id
func GetPollHandler(c *gin.Context) {
pollID := strings.TrimSpace(c.Param("id"))

objectID, err := bson.ObjectIDFromHex(pollID)
if err != nil {
c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid poll ID"})
return
}

coll := getPollsCollection()
if coll == nil {
c.JSON(http.StatusInternalServerError, gin.H{"error": "Database not initialized"})
return
}

ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
defer cancel()

var poll Poll

err = coll.FindOne(ctx, bson.M{"_id": objectID}).Decode(&poll)
if err != nil {
c.JSON(http.StatusNotFound, gin.H{"error": "Poll not found"})
return
}

c.JSON(http.StatusOK, PollResponse{
ID:        poll.ID.Hex(),
Question:  poll.Question,
Options:   poll.Options,
CreatedBy: poll.CreatedBy,
CreatedAt: poll.CreatedAt,
UpdatedAt: poll.UpdatedAt,
})
}

// VotePollHandler handles PATCH /polls/:id/vote
func VotePollHandler(c *gin.Context) {
pollID := strings.TrimSpace(c.Param("id"))

objectID, err := bson.ObjectIDFromHex(pollID)
if err != nil {
c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid poll ID"})
return
}

var req VotePollRequest

if err := c.ShouldBindJSON(&req); err != nil {
c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid vote request"})
return
}

optionID := req.OptionID
if optionID == "" {
optionID = req.OptionId
}

if optionID == "" {
c.JSON(http.StatusBadRequest, gin.H{"error": "Option ID is required"})
return
}

coll := getPollsCollection()
if coll == nil {
c.JSON(http.StatusInternalServerError, gin.H{"error": "Database not initialized"})
return
}

ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
defer cancel()

result, err := coll.UpdateOne(
ctx,
bson.M{
"_id":        objectID,
"options.id": optionID,
},
bson.M{
"$inc": bson.M{"options.$.votes": 1},
"$set": bson.M{"updated_at": time.Now().UTC()},
},
)

if err != nil {
c.JSON(http.StatusInternalServerError, gin.H{
"error": "Failed to record vote: " + err.Error(),
})
return
}

if result.MatchedCount == 0 {
c.JSON(http.StatusNotFound, gin.H{"error": "Poll or option not found"})
return
}

// Broadcast update through Redis Pub/Sub in real-time
go PublishPollUpdate(pollID)

c.JSON(http.StatusOK, gin.H{"message": "Vote recorded successfully"})
}

// DeletePollHandler handles DELETE /polls/:id
func DeletePollHandler(c *gin.Context) {
pollID := strings.TrimSpace(c.Param("id"))

objectID, err := bson.ObjectIDFromHex(pollID)
if err != nil {
c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid poll ID"})
return
}

coll := getPollsCollection()
if coll == nil {
c.JSON(http.StatusInternalServerError, gin.H{"error": "Database not initialized"})
return
}

ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
defer cancel()

result, err := coll.DeleteOne(ctx, bson.M{"_id": objectID})
if err != nil {
c.JSON(http.StatusInternalServerError, gin.H{
"error": "Failed to delete poll: " + err.Error(),
})
return
}

if result.DeletedCount == 0 {
c.JSON(http.StatusNotFound, gin.H{"error": "Poll not found"})
return
}

c.JSON(http.StatusOK, gin.H{"message": "Poll deleted successfully"})
}
