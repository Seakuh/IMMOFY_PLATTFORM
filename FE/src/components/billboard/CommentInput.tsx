import { useState } from "react";
import { Send, X } from "lucide-react";
import { billboardApi } from "@/features/billboard/api";
import { BillboardComment } from "@/features/billboard/commentTypes";
import { useAuthStore } from "@/features/auth/store";

interface CommentInputProps {
  listingId: string;
  onCommentAdded: (comment: BillboardComment) => void;
  parentId?: string;
  replyToUser?: string;
  onCancelReply?: () => void;
  placeholder?: string;
}

export default function CommentInput({ 
  listingId, 
  onCommentAdded, 
  parentId, 
  replyToUser, 
  onCancelReply,
  placeholder = "Add a comment..." 
}: CommentInputProps) {
  const [comment, setComment] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const { user, isAuthenticated } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) return;

    if (!isAuthenticated) {
      alert('Please login to comment');
      return;
    }

    setIsPosting(true);
    try {
      const newComment = await billboardApi.postComment(
        listingId, 
        { comment: comment.trim(), parentId },
        user?.id
      );
      
      onCommentAdded(newComment);
      setComment('');
      onCancelReply?.();
    } catch (error) {
      console.error('Failed to post comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-start space-x-3">
      {/* User Avatar */}
      <div className="flex-shrink-0">
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name || user.email}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-gray-600">
              {isAuthenticated ? (user?.name || user?.email || 'U').charAt(0).toUpperCase() : '?'}
            </span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex-1">
        {/* Reply indicator */}
        {replyToUser && (
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Replying to @{replyToUser}</span>
            <button
              type="button"
              onClick={onCancelReply}
              className="p-1 hover:text-gray-700"
            >
              <X size={12} />
            </button>
          </div>
        )}

        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-full resize-none focus:ring-blue-500 focus:border-blue-500"
              rows={1}
              maxLength={500}
              disabled={!isAuthenticated || isPosting}
            />
            {!isAuthenticated && (
              <p className="text-xs text-gray-500 mt-1">
                <button 
                  type="button"
                  onClick={() => window.location.href = '/login'}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Login
                </button> to comment
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!comment.trim() || !isAuthenticated || isPosting}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPosting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>

        {/* Character counter */}
        {comment.length > 400 && (
          <div className="text-xs text-right mt-1">
            <span className={comment.length > 500 ? 'text-red-500' : 'text-gray-500'}>
              {comment.length}/500
            </span>
          </div>
        )}
      </div>
    </form>
  );
}