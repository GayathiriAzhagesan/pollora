package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

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
	connectDB()

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

	r.Run(":8080")
}