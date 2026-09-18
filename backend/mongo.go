package main

import (
	"context"
	"fmt"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

var client *mongo.Client
var db *mongo.Database
var usersCollection *mongo.Collection
var pollsCollection *mongo.Collection

func connectDB() {
	uri := os.Getenv("MONGO_URI")
	if uri == "" {
		uri = "mongodb+srv://gayathrig12001_db_user:Gayathiri1719@live-poll-cluster.rebwgqc.mongodb.net/?appName=live-poll-cluster"
	}

	var err error
	client, err = mongo.Connect(options.Client().ApplyURI(uri))
	if err != nil {
		fmt.Printf("❌ MongoDB initialization error: %v\n", err)
		return
	}

	// Select database and collections
	db = client.Database("livepoll")
	usersCollection = db.Collection("users")
	pollsCollection = db.Collection("polls")

	fmt.Println("✅ Configured Database: livepoll")
	fmt.Println("✅ Configured Collection: users")
	fmt.Println("✅ Configured Collection: polls")

	// Verify connectivity with ping
	pingCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err = client.Ping(pingCtx, nil); err != nil {
		fmt.Printf("⚠️ Warning: Initial MongoDB Atlas ping failed: %v\n", err)
		fmt.Println("ℹ️ Note: If Atlas blocks the connection, verify your IP is allowed in MongoDB Atlas > Network Access (or allow 0.0.0.0/0).")
	} else {
		fmt.Println("✅ Connected to MongoDB Atlas successfully")
		ensureIndexes()
	}
}

func ensureIndexes() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	indexModel := mongo.IndexModel{
		Keys:    bson.D{{Key: "email", Value: 1}},
		Options: options.Index().SetUnique(true),
	}

	_, err := usersCollection.Indexes().CreateOne(ctx, indexModel)
	if err != nil {
		fmt.Printf("ℹ️ Note on unique email index: %v\n", err)
	} else {
		fmt.Println("✅ Unique index on users.email verified")
	}
}

// getPollsCollection returns the initialized polls collection
func getPollsCollection() *mongo.Collection {
	if pollsCollection == nil && db != nil {
		pollsCollection = db.Collection("polls")
	}
	return pollsCollection
}


