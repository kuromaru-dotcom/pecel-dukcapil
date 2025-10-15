import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

interface WebSocketContextType {
  isConnected: boolean;
  sendMessage: (message: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children, userId, username, role }: { 
  children: ReactNode; 
  userId?: string;
  username?: string;
  role?: string;
}) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    function connect() {
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('[WS] Connected to server');
          setIsConnected(true);

          // Send authentication if user is logged in
          if (userId) {
            ws.send(JSON.stringify({
              type: 'auth',
              userId,
              username,
              role
            }));
          }
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log('[WS] Received:', message);

            switch (message.type) {
              case 'connected':
                console.log('[WS]', message.message);
                break;

              case 'auth_success':
                console.log('[WS] Authentication successful');
                break;

              case 'document_update':
                // Trigger UI refresh via custom event
                window.dispatchEvent(new CustomEvent('document_updated', { 
                  detail: message.data 
                }));
                break;

              case 'notification':
                // Show toast notification
                const notification = message.data;
                if (notification.type === 'status_change') {
                  toast({
                    title: "Status Dokumen Berubah",
                    description: notification.message,
                  });
                }
                break;
            }
          } catch (error) {
            console.error('[WS] Error parsing message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('[WS] Error:', error);
        };

        ws.onclose = () => {
          console.log('[WS] Disconnected from server');
          setIsConnected(false);

          // Attempt to reconnect after 3 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('[WS] Attempting to reconnect...');
            connect();
          }, 3000);
        };
      } catch (error) {
        console.error('[WS] Failed to connect:', error);
      }
    }

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [userId, username, role, toast]);

  const sendMessage = (message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('[WS] Cannot send message - not connected');
    }
  };

  return (
    <WebSocketContext.Provider value={{ isConnected, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
}
