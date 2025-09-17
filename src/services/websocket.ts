import { io, Socket } from 'socket.io-client';

interface WebSocketEvents {
  // Server to Client Events
  'billboard:new_application': (data: { billboardId: string; applicantId: string; applicantName: string; applicantAvatar?: string }) => void;
  'billboard:application_status': (data: { applicationId: string; status: 'accepted' | 'rejected'; billboardId: string }) => void;
  'billboard:new_comment': (data: { billboardId: string; commentId: string; authorName: string }) => void;
  'billboard:new_like': (data: { billboardId: string; userId: string; userName: string }) => void;
  'billboard:invitation_received': (data: { billboardId: string; billboardTitle: string; creatorName: string }) => void;
  'billboard:deadline_reminder': (data: { billboardId: string; billboardTitle: string; hoursRemaining: number }) => void;

  // Client to Server Events
  'join_billboard': (billboardId: string) => void;
  'leave_billboard': (billboardId: string) => void;
  'join_user_channel': (userId: string) => void;
  'leave_user_channel': (userId: string) => void;
}

class WebSocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private eventHandlers = new Map<string, Function[]>();

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      // Use environment variable for WebSocket URL, fallback to default
      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

      this.socket = io(wsUrl, {
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling'],
      });

      this.socket.on('connect', () => {
        console.log('WebSocket connected');
        this.isConnected = true;
      });

      this.socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        this.isConnected = false;
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log('WebSocket reconnected after', attemptNumber, 'attempts');
        this.isConnected = true;
      });

    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }

  // Subscribe to a specific event
  on<K extends keyof WebSocketEvents>(event: K, handler: WebSocketEvents[K]) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);

    if (this.socket) {
      this.socket.on(event, handler);
    }
  }

  // Unsubscribe from a specific event
  off<K extends keyof WebSocketEvents>(event: K, handler?: WebSocketEvents[K]) {
    if (handler) {
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }

      if (this.socket) {
        this.socket.off(event, handler);
      }
    } else {
      // Remove all handlers for this event
      this.eventHandlers.delete(event);
      if (this.socket) {
        this.socket.off(event);
      }
    }
  }

  // Emit events to server
  emit<K extends keyof WebSocketEvents>(event: K, ...args: Parameters<WebSocketEvents[K]>) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, ...args);
    } else {
      console.warn('WebSocket not connected, cannot emit event:', event);
    }
  }

  // Join a billboard channel to receive updates
  joinBillboard(billboardId: string) {
    this.emit('join_billboard', billboardId);
  }

  // Leave a billboard channel
  leaveBillboard(billboardId: string) {
    this.emit('leave_billboard', billboardId);
  }

  // Join user channel for personal notifications
  joinUserChannel(userId: string) {
    this.emit('join_user_channel', userId);
  }

  // Leave user channel
  leaveUserChannel(userId: string) {
    this.emit('leave_user_channel', userId);
  }

  // Get connection status
  isConnectedToServer(): boolean {
    return this.isConnected && this.socket?.connected || false;
  }

  // Manually reconnect
  reconnect() {
    if (this.socket) {
      this.socket.connect();
    }
  }

  // Disconnect and cleanup
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.eventHandlers.clear();
  }
}

// Create singleton instance
export const webSocketService = new WebSocketService();

// Export types for use in components
export type { WebSocketEvents };
export default webSocketService;