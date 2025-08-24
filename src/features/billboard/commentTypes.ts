export interface BillboardComment {
  id: string;
  listingId: string;
  userId?: string;
  userName: string;
  userAvatar?: string;
  comment: string;
  parentId?: string; // For replies
  replies?: BillboardComment[];
  likesCount: number;
  isLiked?: boolean; // If current user has liked this comment
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
}

export interface CommentFormData {
  comment: string;
  parentId?: string; // For replies
}

export interface ReactionType {
  id: string;
  emoji: string;
  name: string;
  count: number;
}

export interface BillboardReaction {
  id: string;
  listingId: string;
  userId: string;
  reactionType: string; // emoji: '❤️', '😍', '👍', '😂', '😮', '😢', '😡'
  createdAt: string;
}

export interface CommentsResponse {
  comments: BillboardComment[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ReactionsResponse {
  reactions: ReactionType[];
  userReaction?: string; // Current user's reaction
  totalCount: number;
}

// Predefined reaction types
export const REACTION_TYPES = [
  { emoji: '❤️', name: 'love', label: 'Love' },
  { emoji: '😍', name: 'heart_eyes', label: 'Heart Eyes' },
  { emoji: '👍', name: 'like', label: 'Like' },
  { emoji: '😂', name: 'haha', label: 'Haha' },
  { emoji: '😮', name: 'wow', label: 'Wow' },
  { emoji: '😢', name: 'sad', label: 'Sad' },
  { emoji: '😡', name: 'angry', label: 'Angry' },
] as const;

export type ReactionName = typeof REACTION_TYPES[number]['name'];