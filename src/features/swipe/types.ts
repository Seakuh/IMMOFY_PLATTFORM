export interface SwipeAction {
  seekerId: string;
  action: 'like' | 'pass';
  timestamp: string;
}

export interface SwipeMatch {
  seekerId: string;
  matchedAt: string;
  mutual: boolean;
}

export interface SwipeResponse {
  success: boolean;
  match?: SwipeMatch;
  message?: string;
}

export interface SwipeState {
  history: SwipeAction[];
  matches: SwipeMatch[];
  isLoading: boolean;
  error: string | null;
}