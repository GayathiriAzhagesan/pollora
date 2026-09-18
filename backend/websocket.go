package main

import (
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow cross-origin connections from React dev server
	},
}

// WSHub maintains active WebSocket connections grouped by poll ID
type WSHub struct {
	mu      sync.RWMutex
	clients map[string]map[*websocket.Conn]bool
}

var wsHub = &WSHub{
	clients: make(map[string]map[*websocket.Conn]bool),
}

// Register adds a connection to a specific poll channel
func (h *WSHub) Register(pollID string, conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if _, exists := h.clients[pollID]; !exists {
		h.clients[pollID] = make(map[*websocket.Conn]bool)
	}
	h.clients[pollID][conn] = true
	log.Printf("🔌 WebSocket client connected for poll [%s]. Total active for poll: %d", pollID, len(h.clients[pollID]))
}

// Unregister removes a connection from a specific poll channel
func (h *WSHub) Unregister(pollID string, conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if conns, exists := h.clients[pollID]; exists {
		if _, ok := conns[conn]; ok {
			delete(conns, conn)
			conn.Close()
			log.Printf("🔌 WebSocket client disconnected for poll [%s]. Remaining active: %d", pollID, len(conns))
		}
		if len(conns) == 0 {
			delete(h.clients, pollID)
		}
	}
}

// BroadcastToPoll sends a message to all connected clients viewing the specified poll
func (h *WSHub) BroadcastToPoll(pollID string, message []byte) {
	h.mu.RLock()
	connsMap, exists := h.clients[pollID]
	if !exists || len(connsMap) == 0 {
		h.mu.RUnlock()
		return
	}

	// Make a snapshot of connections to avoid holding read lock during I/O
	conns := make([]*websocket.Conn, 0, len(connsMap))
	for conn := range connsMap {
		conns = append(conns, conn)
	}
	h.mu.RUnlock()

	for _, conn := range conns {
		_ = conn.SetWriteDeadline(time.Now().Add(5 * time.Second))
		err := conn.WriteMessage(websocket.TextMessage, message)
		if err != nil {
			log.Printf("⚠️ WebSocket write error for poll [%s]: %v. Closing connection.", pollID, err)
			h.Unregister(pollID, conn)
		}
	}
}

// WsPollHandler handles GET /ws/polls/:id
func WsPollHandler(c *gin.Context) {
	pollID := strings.TrimSpace(c.Param("id"))
	if pollID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Poll ID is required"})
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("❌ Failed to upgrade WebSocket connection: %v", err)
		return
	}

	wsHub.Register(pollID, conn)
	defer wsHub.Unregister(pollID, conn)

	// Keep-alive configuration
	conn.SetReadLimit(512)
	_ = conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	conn.SetPongHandler(func(string) error {
		_ = conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	// Read loop: keeps connection alive and detects disconnections
	for {
		messageType, _, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("ℹ️ WebSocket connection closed: %v", err)
			}
			break
		}
		// Echo ping if client sends ping
		if messageType == websocket.PingMessage {
			_ = conn.WriteMessage(websocket.PongMessage, nil)
		}
	}
}
