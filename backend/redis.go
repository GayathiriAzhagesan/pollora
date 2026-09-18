package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/redis/go-redis/v9"
)

var (
	redisClient      *redis.Client
	isRedisAvailable bool
	redisMu          sync.RWMutex
	redisCtx         context.Context
	redisCancel      context.CancelFunc
)

// PollRealtimeEvent is the clean JSON event payload broadcast for poll updates
type PollRealtimeEvent struct {
	Type   string `json:"type"`
	PollID string `json:"pollId"`
}

// InitRedis initializes the Redis client using environment variables
// Gracefully degrades to in-memory fallback if Redis is unavailable
func InitRedis() {
	redisCtx, redisCancel = context.WithCancel(context.Background())

	redisURL := strings.TrimSpace(os.Getenv("REDIS_URL"))
	var opts *redis.Options

	if redisURL != "" {
		parsedOpts, err := redis.ParseURL(redisURL)
		if err != nil {
			log.Printf("⚠️ Invalid REDIS_URL format: %v. Falling back to default host/port.", err)
		} else {
			opts = parsedOpts
		}
	}

	if opts == nil {
		redisAddr := strings.TrimSpace(os.Getenv("REDIS_ADDR"))
		if redisAddr == "" {
			redisAddr = "localhost:6379"
		}

		redisPassword := os.Getenv("REDIS_PASSWORD")
		dbNum := 0
		if dbStr := os.Getenv("REDIS_DB"); dbStr != "" {
			if parsedDB, err := strconv.Atoi(dbStr); err == nil {
				dbNum = parsedDB
			}
		}

		opts = &redis.Options{
			Addr:         redisAddr,
			Password:     redisPassword,
			DB:           dbNum,
			DialTimeout:  2 * time.Second,
			ReadTimeout:  2 * time.Second,
			WriteTimeout: 2 * time.Second,
		}
	}

	redisClient = redis.NewClient(opts)

	// Verify connectivity with a short non-blocking ping
	pingCtx, cancel := context.WithTimeout(redisCtx, 2*time.Second)
	defer cancel()

	if err := redisClient.Ping(pingCtx).Err(); err != nil {
		redisMu.Lock()
		isRedisAvailable = false
		redisMu.Unlock()

		log.Printf("⚠️ Redis unavailable at %s: %v", opts.Addr, err)
		log.Println("ℹ️ Operating with in-memory WebSocket real-time fallback. The server will run normally.")
		log.Println("ℹ️ To enable Redis Pub/Sub, start a Redis instance on localhost:6379 or set REDIS_URL.")
	} else {
		redisMu.Lock()
		isRedisAvailable = true
		redisMu.Unlock()

		log.Printf("✅ Connected to Redis successfully at: %s", opts.Addr)
		go startRedisSubscriber()
	}
}

// startRedisSubscriber listens on Redis Pub/Sub channel pattern 'poll:*' and forwards to WebSocket hub
func startRedisSubscriber() {
	pubsub := redisClient.PSubscribe(redisCtx, "poll:*")
	defer pubsub.Close()

	log.Println("📡 Redis Pub/Sub subscriber listening on channel pattern 'poll:*'")

	ch := pubsub.Channel()
	for {
		select {
		case <-redisCtx.Done():
			log.Println("🛑 Redis Pub/Sub subscriber shutting down")
			return
		case msg, ok := <-ch:
			if !ok {
				log.Println("⚠️ Redis Pub/Sub channel closed")
				return
			}

			// Channel name is in format "poll:<pollID>"
			parts := strings.SplitN(msg.Channel, ":", 2)
			if len(parts) == 2 {
				pollID := parts[1]
				wsHub.BroadcastToPoll(pollID, []byte(msg.Payload))
			}
		}
	}
}

// PublishPollUpdate broadcasts a poll update event via Redis Pub/Sub (or local hub if Redis is offline)
func PublishPollUpdate(pollID string) {
	if pollID == "" {
		return
	}

	event := PollRealtimeEvent{
		Type:   "poll_results_updated",
		PollID: pollID,
	}

	eventJSON, err := json.Marshal(event)
	if err != nil {
		log.Printf("❌ Failed to marshal realtime poll event: %v", err)
		return
	}

	redisMu.RLock()
	available := isRedisAvailable
	redisMu.RUnlock()

	if available && redisClient != nil {
		channel := fmt.Sprintf("poll:%s", pollID)
		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()

		err := redisClient.Publish(ctx, channel, eventJSON).Err()
		if err != nil {
			log.Printf("⚠️ Failed to publish to Redis channel %s: %v. Falling back to local hub.", channel, err)
			wsHub.BroadcastToPoll(pollID, eventJSON)
		} else {
			log.Printf("📢 Published real-time update to Redis channel [%s]", channel)
		}
	} else {
		// Fallback when Redis is offline or not configured
		wsHub.BroadcastToPoll(pollID, eventJSON)
	}
}

// CloseRedis gracefully closes Redis connections and background workers
func CloseRedis() {
	if redisCancel != nil {
		redisCancel()
	}
	if redisClient != nil {
		_ = redisClient.Close()
	}
}
