import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMessagesStore } from '@/features/messages/store';
import { MessageCircle, Send, ArrowLeft, User, Clock } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import Loader from '@/components/Loader';

export default function Messages() {
  const {
    conversations,
    currentThread,
    isLoading,
    error,
    fetchConversations,
    fetchThreadMessages,
    replyToCurrentThread,
    markAsRead,
    clearCurrentThread
  } = useMessagesStore();

  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleSelectConversation = async (threadId: string) => {
    setSelectedThreadId(threadId);
    await fetchThreadMessages(threadId);
    await markAsRead(threadId);
  };

  const handleBackToList = () => {
    setSelectedThreadId(null);
    clearCurrentThread();
    fetchConversations(); // Refresh to update unread counts
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedThreadId || sendingMessage) return;

    setSendingMessage(true);
    try {
      await replyToCurrentThread(selectedThreadId, messageInput.trim());
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading && conversations.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Fehler beim Laden der Nachrichten
        </h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => fetchConversations()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  // Mobile view: show either conversation list or thread
  const isMobile = window.innerWidth < 768;

  if (isMobile && selectedThreadId) {
    const currentConversation = conversations.find(c => c.threadId === selectedThreadId);
    const otherParticipant = currentConversation?.participants.find(p => p.id !== 'current-user-id'); // Replace with actual user ID

    return (
      <div className="flex flex-col h-[calc(100vh-140px)]">
        {/* Thread Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center">
          <button
            onClick={handleBackToList}
            className="mr-3 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center">
            {otherParticipant?.avatarUrl ? (
              <img
                src={otherParticipant.avatarUrl}
                alt={otherParticipant.name}
                className="w-8 h-8 rounded-full mr-3"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                <User className="w-4 h-4 text-gray-600" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">
                {otherParticipant?.name || 'Unbekannt'}
              </h3>
              {currentConversation?.relatedListing && (
                <p className="text-xs text-gray-500">
                  Bezüglich: {currentConversation.relatedListing.title}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentThread.map((message) => {
            const isOwnMessage = message.senderId === 'current-user-id'; // Replace with actual user ID
            
            return (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  isOwnMessage ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[70%] px-4 py-2 rounded-lg",
                    isOwnMessage
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={cn(
                      "text-xs mt-1",
                      isOwnMessage ? "text-blue-100" : "text-gray-500"
                    )}
                  >
                    {formatDate(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nachricht schreiben..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={sendingMessage}
            />
            <button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || sendingMessage}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Nachrichten
        </h1>
        <p className="text-gray-600 mt-1">
          Deine Unterhaltungen
        </p>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Noch keine Nachrichten
          </h3>
          <p className="text-gray-600 mb-6">
            Starte eine Unterhaltung mit Vermietern oder anderen Nutzern.
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Nachrichten senden
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {conversations.map((conversation) => {
            const otherParticipant = conversation.participants.find(p => p.id !== 'current-user-id'); // Replace with actual user ID
            const hasUnread = conversation.unreadCount > 0;

            return (
              <div
                key={conversation.threadId}
                onClick={() => handleSelectConversation(conversation.threadId)}
                className={cn(
                  "bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-all",
                  hasUnread && "border-blue-200 bg-blue-50"
                )}
              >
                <div className="flex items-start space-x-3">
                  {otherParticipant?.avatarUrl ? (
                    <img
                      src={otherParticipant.avatarUrl}
                      alt={otherParticipant.name}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-600" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={cn(
                        "font-medium truncate",
                        hasUnread ? "text-blue-900" : "text-gray-900"
                      )}>
                        {otherParticipant?.name || 'Unbekannt'}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {hasUnread && (
                          <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                          </span>
                        )}
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDate(conversation.lastMessage.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    <p className={cn(
                      "text-sm truncate mt-1",
                      hasUnread ? "text-blue-700 font-medium" : "text-gray-600"
                    )}>
                      {conversation.lastMessage.content}
                    </p>
                    
                    {conversation.relatedListing && (
                      <p className="text-xs text-gray-500 mt-1">
                        Bezüglich: {conversation.relatedListing.title}
                      </p>
                    )}
                    
                    {conversation.relatedHousingRequest && (
                      <p className="text-xs text-gray-500 mt-1">
                        Bezüglich: {conversation.relatedHousingRequest.title}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}