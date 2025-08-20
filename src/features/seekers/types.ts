export interface Seeker {
  id: string;
  name: string;
  headline?: string;
  avatarUrl?: string;
  images?: string[];
  budgetMin?: number;
  budgetMax?: number;
  locations: string[];
  moveInFrom?: string;
  roomsMin?: number;
  pets?: boolean;
  tags?: string[];
  bio?: string;
  createdAt: string;
}

export interface SearchFilters {
  search?: string;
  locations?: string[];
  budgetMin?: number;
  budgetMax?: number;
  roomsMin?: number;
  pets?: boolean;
  moveInFrom?: string;
  sort?: "newest" | "budget_asc" | "budget_desc" | "relevance";
  page?: number;
  limit?: number;
}

export interface SeekersResponse {
  seekers: Seeker[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface FavoriteItem {
  seekerId: string;
  addedAt: string;
}

export interface HistoryItem {
  seekerId: string;
  viewedAt: string;
}
