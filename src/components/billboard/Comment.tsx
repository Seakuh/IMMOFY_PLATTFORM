import { useState } from "react";
import { Heart, MoreHorizontal, Edit, Trash2, Reply } from "lucide-react";
import { BillboardComment } from "@/features/billboard/commentTypes";
import { billboardApi } from "@/features/billboard/api";
import { useAuthStore } from "@/features/auth/store";

interface CommentProps {
  comment: BillboardComment;
  onUpdate: (updatedComment: BillboardComment) => void;
  onDelete: (commentId: string) => void;
  onReply: (parentId: string, userName: string) => void;
  isReply?: boolean;
}

export default function Comment({ comment, onUpdate, onDelete, onReply, isReply = false }: CommentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.comment);
  const [isLiking, setIsLiking] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const { user, isAuthenticated } = useAuthStore();
  const isOwner = isAuthenticated && comment.userId === user?.id;
  const canEdit = isOwner && !isReply; // Only allow editing main comments

  const handleLike = async () => {
    if (!isAuthenticated || isLiking) return;
    
    setIsLiking(true);
    try {
      const result = await billboardApi.toggleCommentLike(comment.id, user!.id);
      onUpdate({
        ...comment,
        likesCount: result.likeCount,
        isLiked: result.liked,
      });
    } catch (error) {
      console.error('Failed to like comment:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleEdit = async () => {
    if (!editText.trim()) return;
    
    try {
      const updatedComment = await billboardApi.updateComment(comment.id, editText, user?.id);
      onUpdate(updatedComment);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this comment?')) return;
    
    try {
      await billboardApi.deleteComment(comment.id, user?.id);
      onDelete(comment.id);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`flex space-x-3 ${isReply ? 'ml-8 mt-2' : 'mt-4'}`}>
      {/* User Avatar */}
      <div className="flex-shrink-0">
        {comment.userAvatar ? (
          <img
            src={comment.userAvatar}
            alt={comment.userName}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-gray-600">
              {comment.userName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Comment Content */}
      <div className="flex-1">
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm text-gray-900">
              {comment.userName}
            </span>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <span>{formatTimeAgo(comment.createdAt)}</span>
              {comment.isEdited && <span>• edited</span>}
              {isOwner && (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <MoreHorizontal size={12} />
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 top-6 bg-white border rounded-lg shadow-lg py-1 z-10">
                      {canEdit && (
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setShowMenu(false);
                          }}
                          className="flex items-center space-x-2 px-3 py-1 text-sm hover:bg-gray-100 w-full"
                        >
                          <Edit size={12} />
                          <span>Edit</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          handleDelete();
                          setShowMenu(false);
                        }}
                        className="flex items-center space-x-2 px-3 py-1 text-sm text-red-600 hover:bg-gray-100 w-full"
                      >
                        <Trash2 size={12} />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {isEditing ? (
            <div className="mt-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full px-2 py-1 border rounded text-sm resize-none"
                rows={2}
                maxLength={500}
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEdit}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-800 mt-1">{comment.comment}</p>
          )}
        </div>

        {/* Comment Actions */}
        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
          <button
            onClick={handleLike}
            disabled={!isAuthenticated || isLiking}
            className={`flex items-center space-x-1 hover:text-red-500 transition-colors ${
              comment.isLiked ? 'text-red-500' : ''
            } disabled:opacity-50`}
          >
            <Heart size={12} className={comment.isLiked ? 'fill-current' : ''} />
            <span>{comment.likesCount || 0}</span>
          </button>
          
          {!isReply && (
            <button
              onClick={() => onReply(comment.id, comment.userName)}
              disabled={!isAuthenticated}
              className="flex items-center space-x-1 hover:text-blue-500 transition-colors disabled:opacity-50"
            >
              <Reply size={12} />
              <span>Reply</span>
            </button>
          )}
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map((reply) => (
              <Comment
                key={reply.id}
                comment={reply}
                onUpdate={(updatedReply) => {
                  const updatedReplies = comment.replies!.map(r => 
                    r.id === updatedReply.id ? updatedReply : r
                  );
                  onUpdate({ ...comment, replies: updatedReplies });
                }}
                onDelete={(replyId) => {
                  const updatedReplies = comment.replies!.filter(r => r.id !== replyId);
                  onUpdate({ ...comment, replies: updatedReplies });
                }}
                onReply={onReply}
                isReply={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}