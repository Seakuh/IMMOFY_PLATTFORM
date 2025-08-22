import { apiRequest } from '@/lib/apiClient';

export interface Message {
  id: string;
  content: string;
  senderId: string;
  recipientId: string;
  threadId: string;
  relatedListingId?: string;
  relatedHousingRequestId?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  recipient?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

export interface Conversation {
  threadId: string;
  participants: {
    id: string;
    name: string;
    avatarUrl?: string;
  }[];
  lastMessage: Message;
  unreadCount: number;
  relatedListing?: {
    id: string;
    title: string;
  };
  relatedHousingRequest?: {
    id: string;
    title: string;
  };
}

export interface CreateMessageDto {
  recipientId?: string;
  content: string;
  relatedListingId?: string;
  relatedHousingRequestId?: string;
}

/**
 * Send a new message
 */
export async function sendMessage(data: CreateMessageDto): Promise<Message> {
  try {
    const response = await apiRequest('/messages/send', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return (response as any).message;
  } catch (error) {
    console.error('Failed to send message:', error);
    throw error;
  }
}

/**
 * Reply to a thread
 */
export async function replyToThread(threadId: string, content: string): Promise<Message> {
  try {
    const response = await apiRequest(`/messages/thread/${threadId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
    return (response as any).reply;
  } catch (error) {
    console.error('Failed to reply to thread:', error);
    throw error;
  }
}

/**
 * Get messages for a specific thread
 */
export async function getThreadMessages(threadId: string): Promise<Message[]> {
  try {
    const response = await apiRequest(`/messages/thread/${threadId}`);
    return (response as any).messages;
  } catch (error) {
    console.error('Failed to fetch thread messages:', error);
    throw error;
  }
}

/**
 * Get all conversations for the current user
 */
export async function getConversations(): Promise<Conversation[]> {
  try {
    const response = await apiRequest('/messages/conversations');
    return (response as any).conversations;
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    throw error;
  }
}

/**
 * Send message for a specific listing
 */
export async function sendMessageForListing(listingId: string, content: string): Promise<Message> {
  try {
    const response = await apiRequest(`/messages/listing/${listingId}`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
    return (response as any).message;
  } catch (error) {
    console.error('Failed to send message for listing:', error);
    throw error;
  }
}

/**
 * Send message for a specific housing request
 */
export async function sendMessageForHousingRequest(housingRequestId: string, content: string): Promise<Message> {
  try {
    const response = await apiRequest(`/messages/housing-request/${housingRequestId}`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
    return (response as any).message;
  } catch (error) {
    console.error('Failed to send message for housing request:', error);
    throw error;
  }
}

/**
 * Get unread messages count
 */
export async function getUnreadCount(): Promise<number> {
  try {
    const response = await apiRequest('/messages/unread-count');
    return (response as any).unreadCount;
  } catch (error) {
    console.error('Failed to fetch unread count:', error);
    return 0;
  }
}

/**
 * Mark thread messages as read
 */
export async function markThreadAsRead(threadId: string): Promise<void> {
  try {
    await apiRequest(`/messages/thread/${threadId}/mark-read`, {
      method: 'POST'
    });
  } catch (error) {
    console.error('Failed to mark thread as read:', error);
    throw error;
  }
}