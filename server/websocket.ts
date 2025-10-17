import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";

interface Client {
  ws: WebSocket;
  userId?: string;
  username?: string;
  role?: string;
}

class WSManager {
  private wss: WebSocketServer | null = null;
  private clients: Set<Client> = new Set();

  init(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws'
    });

    this.wss.on('connection', (ws: WebSocket) => {
      const client: Client = { ws };
      this.clients.add(client);
      
      console.log('[WS] Client connected. Total clients:', this.clients.size);

      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          
          // Handle authentication message
          if (message.type === 'auth' && message.userId) {
            client.userId = message.userId;
            client.username = message.username;
            client.role = message.role;
            
            ws.send(JSON.stringify({
              type: 'auth_success',
              message: 'Authenticated successfully'
            }));
            
            console.log('[WS] Client authenticated:', client.username, client.role);
          }
        } catch (error) {
          console.error('[WS] Error parsing message:', error);
        }
      });

      ws.on('close', () => {
        this.clients.delete(client);
        console.log('[WS] Client disconnected. Total clients:', this.clients.size);
      });

      ws.on('error', (error) => {
        console.error('[WS] WebSocket error:', error);
        this.clients.delete(client);
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'Connected to PECEL DUKCAPIL WebSocket server'
      }));
    });

    console.log('[WS] WebSocket server initialized on path /ws');
  }

  /**
   * Broadcast document status update to all connected clients
   */
  broadcastDocumentUpdate(document: any) {
    const message = JSON.stringify({
      type: 'document_update',
      data: document,
      timestamp: new Date().toISOString()
    });

    this.clients.forEach(client => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    });

    console.log(`[WS] Broadcasted document update for doc #${document.id}`);
  }

  /**
   * Send notification to specific user
   */
  notifyUser(userId: string, notification: any) {
    const message = JSON.stringify({
      type: 'notification',
      data: notification,
      timestamp: new Date().toISOString()
    });

    this.clients.forEach(client => {
      if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    });

    console.log(`[WS] Sent notification to user ${userId}`);
  }

  /**
   * Broadcast to users with specific role
   */
  broadcastToRole(role: string, message: any) {
    const payload = JSON.stringify({
      ...message,
      timestamp: new Date().toISOString()
    });

    this.clients.forEach(client => {
      if (client.role === role && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(payload);
      }
    });

    console.log(`[WS] Broadcasted message to role: ${role}`);
  }
}

export const wsManager = new WSManager();
