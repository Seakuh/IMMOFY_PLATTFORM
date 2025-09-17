import { useEffect, useRef } from 'react';
import { webSocketService, WebSocketEvents } from '@/services/websocket';
import { useAuthStore } from '@/features/auth/store';

// Hook for subscribing to WebSocket events
export function useWebSocketEvent<K extends keyof WebSocketEvents>(
  event: K,
  handler: WebSocketEvents[K],
  dependencies: any[] = []
) {
  const handlerRef = useRef(handler);

  // Update the handler ref when dependencies change
  useEffect(() => {
    handlerRef.current = handler;
  }, dependencies);

  useEffect(() => {
    const stableHandler = (...args: Parameters<WebSocketEvents[K]>) => {
      handlerRef.current(...args);
    };

    webSocketService.on(event, stableHandler as WebSocketEvents[K]);

    return () => {
      webSocketService.off(event, stableHandler as WebSocketEvents[K]);
    };
  }, [event]);
}

// Hook for billboard-specific notifications
export function useBillboardNotifications(billboardId?: string) {
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!billboardId || !isAuthenticated || !user) return;

    // Join billboard channel for real-time updates
    webSocketService.joinBillboard(billboardId);

    return () => {
      webSocketService.leaveBillboard(billboardId);
    };
  }, [billboardId, isAuthenticated, user?.id]);
}

// Hook for user-specific notifications
export function useUserNotifications() {
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    // Join user channel for personal notifications
    webSocketService.joinUserChannel(user.id);

    return () => {
      webSocketService.leaveUserChannel(user.id);
    };
  }, [isAuthenticated, user?.id]);
}

// Hook for connection status
export function useWebSocketConnection() {
  const isConnected = webSocketService.isConnectedToServer();

  const reconnect = () => {
    webSocketService.reconnect();
  };

  return { isConnected, reconnect };
}

// Hook for billboard creator notifications
export function useBillboardCreatorNotifications(
  onNewApplication?: (data: { billboardId: string; applicantId: string; applicantName: string; applicantAvatar?: string }) => void,
  onApplicationUpdate?: (data: { applicationId: string; status: 'accepted' | 'rejected'; billboardId: string }) => void
) {
  useWebSocketEvent('billboard:new_application', (data) => {
    onNewApplication?.(data);
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification('New Application Received', {
        body: `${data.applicantName} applied to your listing`,
        icon: '/favicon.ico'
      });
    }
  }, [onNewApplication]);

  useWebSocketEvent('billboard:application_status', (data) => {
    onApplicationUpdate?.(data);
  }, [onApplicationUpdate]);
}

// Hook for billboard applicant notifications
export function useBillboardApplicantNotifications(
  onInvitationReceived?: (data: { billboardId: string; billboardTitle: string; creatorName: string }) => void,
  onStatusUpdate?: (data: { applicationId: string; status: 'accepted' | 'rejected'; billboardId: string }) => void
) {
  useWebSocketEvent('billboard:invitation_received', (data) => {
    onInvitationReceived?.(data);
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification('Invitation Received', {
        body: `${data.creatorName} sent you an invitation for: ${data.billboardTitle}`,
        icon: '/favicon.ico'
      });
    }
  }, [onInvitationReceived]);

  useWebSocketEvent('billboard:application_status', (data) => {
    onStatusUpdate?.(data);
    // Show browser notification for status updates
    if (Notification.permission === 'granted') {
      const message = data.status === 'accepted'
        ? 'Your application was accepted!'
        : 'Your application was rejected.';
      new Notification('Application Update', {
        body: message,
        icon: '/favicon.ico'
      });
    }
  }, [onStatusUpdate]);
}

// Hook for requesting notification permissions
export function useNotificationPermission() {
  useEffect(() => {
    // Request notification permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return Notification.permission;
}