package main

import (
	"bufio"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

// loadEnv reads .env file if present and populates environment variables
func loadEnv() {
	file, err := os.Open(".env")
	if err != nil {
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) == 2 {
			key := strings.TrimSpace(parts[0])
			val := strings.Trim(strings.TrimSpace(parts[1]), "\"'")
			if os.Getenv(key) == "" {
				os.Setenv(key, val)
			}
		}
	}
}

// corsMiddleware enables CORS for web frontend clients
func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

func main() {
	loadEnv()
	connectDB()
	InitRedis()

	r := gin.Default()
	r.Use(corsMiddleware())

	// Health check
	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Backend Running",
			"status":  "healthy",
		})
	})

	// Authentication routes
	r.POST("/signup", SignupHandler)
	r.POST("/login", LoginHandler)
	r.GET("/auth/providers", AuthProvidersHandler)
	r.GET("/auth/google", GoogleAuthHandler)
	r.GET("/auth/google/callback", GoogleCallbackHandler)
	r.GET("/auth/microsoft", MicrosoftAuthHandler)
	r.GET("/auth/microsoft/callback", MicrosoftCallbackHandler)

	// Poll routes
	r.POST("/polls", AuthMiddleware(), CreatePollHandler)
	r.GET("/polls", GetPollsHandler)
	r.GET("/polls/:id", GetPollHandler)
	r.PATCH("/polls/:id/vote", VotePollHandler)
	r.DELETE("/polls/:id", AuthMiddleware(), DeletePollHandler)

	// Real-time WebSocket endpoint for live poll updates
	r.GET("/ws/polls/:id", WsPollHandler)

	r.Run(":8080")
}
