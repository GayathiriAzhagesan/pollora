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

func connectDB() {
	uri := os.Getenv("MONGO_URI")
	if uri == "" {
		uri = "mongodb+srv://gayathrig12001_db_user:gayathiri1719@live-poll-cluster.rebwgqc.mongodb.net/?appName=live-poll-cluster"
	}

	var err error
	client, err = mongo.Connect(options.Client().ApplyURI(uri))
	if err != nil {
		panic(err)
	}

	pingCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err = client.Ping(pingCtx, nil)
	if err != nil {
		panic(err)
	}

	// Select database
	db = client.Database("livepoll")
	usersCollection = db.Collection("users")

	fmt.Println("✅ Connected to MongoDB Atlas")
	fmt.Println("✅ Using Database: livepoll")
	fmt.Println("✅ Using Collection: users")

	ensureIndexes()
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

