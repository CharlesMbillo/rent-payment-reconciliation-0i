import { useState, useEffect, useRef, useCallback } from 'react';

export interface WebSocketMessage {
  type: 'payment_update' | 'tenant_update' | 'system_status' | 'audit_log';
  data: any;
  timestamp: string;
}

export interface UseWebSocketOptions {
  url?: string;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

export interface UseWebSocketReturn {
  isConnected: boolean;
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastMessage: WebSocketMessage | null;
  sendMessage: (message: any) => void;
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    url = 'ws://localhost:3001/ws', // Default WebSocket URL for demo
    reconnectAttempts = 5,
    reconnectInterval = 3000,
    onMessage,
    onConnect,
    onDisconnect,
    onError
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const reconnectCount = useRef(0);
  const shouldReconnect = useRef(true);

  // Simulate WebSocket connection for demo purposes
  const simulateConnection = useCallback(() => {
    setConnectionState('connecting');
    
    // Simulate connection delay
    setTimeout(() => {
      setIsConnected(true);
      setConnectionState('connected');
      onConnect?.();
      
      // Simulate periodic messages
      const messageInterval = setInterval(() => {
        if (shouldReconnect.current) {
          const simulatedMessages: WebSocketMessage[] = [
            {
              type: 'payment_update',
              data: {
                unitId: `unit-A010${Math.floor(Math.random() * 9) + 1}`,
                status: Math.random() > 0.5 ? 'Paid' : 'Partial',
                amount: Math.random() > 0.5 ? 4500 : 8000,
                timestamp: new Date().toISOString()
              },
              timestamp: new Date().toISOString()
            },
            {
              type: 'system_status',
              data: {
                mode: 'Live IPN Feed',
                lastUpdate: new Date().toISOString(),
                activeConnections: Math.floor(Math.random() * 20) + 5
              },
              timestamp: new Date().toISOString()
            },
            {
              type: 'audit_log',
              data: {
                action: 'Payment Received',
                actor: 'System (Jenga PGW)',
                description: `Payment received for Unit A${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`,
                entityType: 'Payment'
              },
              timestamp: new Date().toISOString()
            }
          ];
          
          const randomMessage = simulatedMessages[Math.floor(Math.random() * simulatedMessages.length)];
          setLastMessage(randomMessage);
          onMessage?.(randomMessage);
        }
      }, 5000 + Math.random() * 10000); // Random interval between 5-15 seconds

      // Store interval reference for cleanup
      ws.current = { close: () => clearInterval(messageInterval) } as WebSocket;
    }, 1000);
  }, [onConnect, onMessage]);

  const connect = useCallback(() => {
    if (isConnected || connectionState === 'connecting') return;

    shouldReconnect.current = true;
    
    // For demo purposes, simulate WebSocket connection
    if (url.includes('localhost') || url.includes('demo')) {
      simulateConnection();
      return;
    }

    try {
      setConnectionState('connecting');
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        setIsConnected(true);
        setConnectionState('connected');
        reconnectCount.current = 0;
        onConnect?.();
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          onMessage?.(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = () => {
        setIsConnected(false);
        setConnectionState('disconnected');
        onDisconnect?.();
        
        // Attempt to reconnect if enabled
        if (shouldReconnect.current && reconnectCount.current < reconnectAttempts) {
          reconnectCount.current++;
          reconnectTimer.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      ws.current.onerror = (error) => {
        setConnectionState('error');
        onError?.(error);
      };
    } catch (error) {
      setConnectionState('error');
      console.error('WebSocket connection error:', error);
    }
  }, [url, isConnected, connectionState, reconnectAttempts, reconnectInterval, onConnect, onMessage, onDisconnect, onError, simulateConnection]);

  const disconnect = useCallback(() => {
    shouldReconnect.current = false;
    
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }

    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    
    setIsConnected(false);
    setConnectionState('disconnected');
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(() => {
      reconnectCount.current = 0;
      connect();
    }, 1000);
  }, [disconnect, connect]);

  const sendMessage = useCallback((message: any) => {
    if (ws.current && isConnected) {
      try {
        ws.current.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
      }
    }
  }, [isConnected]);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldReconnect.current = false;
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  return {
    isConnected,
    connectionState,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
    reconnect
  };
}
