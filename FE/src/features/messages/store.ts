import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Message, 
  Conversation, 
  CreateMessageDto,
  getConversations,
  getThreadMessages,
  sendMessage,
  replyToThread,
  getUnreadCount,
  markThreadAsRead
} from './api';

interface MessagesState {
  conversations: Conversation[];
  currentThread: Message[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchConversations: () => Promise<void>;
  fetchThreadMessages: (threadId: string) => Promise<void>;
  sendNewMessage: (data: CreateMessageDto) => Promise<void>;
  replyToCurrentThread: (threadId: string, content: string) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (threadId: string) => Promise<void>;
  clearCurrentThread: () => void;
  addMessageToThread: (message: Message) => void;
}

export const useMessagesStore = create<MessagesState>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentThread: [],
      unreadCount: 0,
      isLoading: false,
      error: null,

      fetchConversations: async () => {
        set({ isLoading: true, error: null });
        try {
          const conversations = await getConversations();
          set({ conversations, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch conversations',
            isLoading: false 
          });
        }
      },

      fetchThreadMessages: async (threadId: string) => {
        set({ isLoading: true, error: null });
        try {
          const messages = await getThreadMessages(threadId);
          set({ currentThread: messages, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch thread messages',
            isLoading: false 
          });
        }
      },

      sendNewMessage: async (data: CreateMessageDto) => {
        set({ isLoading: true, error: null });
        try {
          const message = await sendMessage(data);
          // Add to current thread if it's the same thread
          const currentThread = get().currentThread;
          if (currentThread.length > 0 && currentThread[0].threadId === message.threadId) {
            set({ currentThread: [...currentThread, message] });
          }
          // Refresh conversations to update last message
          get().fetchConversations();
          set({ isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to send message',
            isLoading: false 
          });
        }
      },

      replyToCurrentThread: async (threadId: string, content: string) => {
        set({ isLoading: true, error: null });
        try {
          const reply = await replyToThread(threadId, content);
          const currentThread = get().currentThread;
          set({ 
            currentThread: [...currentThread, reply],
            isLoading: false 
          });
          // Refresh conversations to update last message
          get().fetchConversations();
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to reply to thread',
            isLoading: false 
          });
        }
      },

      fetchUnreadCount: async () => {
        try {
          const count = await getUnreadCount();
          set({ unreadCount: count });
        } catch (error) {
          console.error('Failed to fetch unread count:', error);
        }
      },

      markAsRead: async (threadId: string) => {
        try {
          await markThreadAsRead(threadId);
          // Update local state
          const conversations = get().conversations.map(conv => 
            conv.threadId === threadId 
              ? { ...conv, unreadCount: 0 }
              : conv
          );
          set({ conversations });
          // Refresh unread count
          get().fetchUnreadCount();
        } catch (error) {
          console.error('Failed to mark as read:', error);
        }
      },

      clearCurrentThread: () => {
        set({ currentThread: [] });
      },

      addMessageToThread: (message: Message) => {
        const currentThread = get().currentThread;
        set({ currentThread: [...currentThread, message] });
      }
    }),
    {
      name: 'immofy-messages-store',
      partialize: (state) => ({ 
        conversations: state.conversations,
        unreadCount: state.unreadCount 
      })
    }
  )
);