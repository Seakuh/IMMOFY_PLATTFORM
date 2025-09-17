import { apiRequest } from '@/lib/apiClient';

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

/**
 * Records a swipe action (like or pass) for a seeker
 */
export async function recordSwipeAction(
  seekerId: string, 
  action: 'like' | 'pass'
): Promise<SwipeResponse> {
  try {
    const swipeData: SwipeAction = {
      seekerId,
      action,
      timestamp: new Date().toISOString()
    };

    const response = await apiRequest('/swipe/action', {
      method: 'POST',
      body: JSON.stringify(swipeData)
    });
    
    return {
      success: true,
      match: (response as any).match,
      message: (response as any).message
    };
  } catch (error) {
    console.error('Failed to record swipe action:', error);
    return {
      success: false,
      message: 'Failed to record swipe action'
    };
  }
}

/**
 * Gets the current user's swipe history
 */
export async function getSwipeHistory(): Promise<SwipeAction[]> {
  try {
    const response = await apiRequest('/swipe/history');
    return (response as any).history || [];
  } catch (error) {
    console.error('Failed to fetch swipe history:', error);
    return [];
  }
}

/**
 * Gets seekers that haven't been swiped yet
 */
export async function getUnswipedSeekers(limit: number = 20): Promise<any[]> {
  try {
    const response = await apiRequest(`/swipe/candidates?limit=${limit}`);
    return (response as any).seekers || [];
  } catch (error) {
    console.error('Failed to fetch unswiped seekers:', error);
    return [];
  }
}

/**
 * Gets matches for the current user
 */
export async function getMatches(): Promise<SwipeMatch[]> {
  try {
    const response = await apiRequest('/swipe/matches');
    return (response as any).matches || [];
  } catch (error) {
    console.error('Failed to fetch matches:', error);
    return [];
  }
}

/**
 * Removes a match (unmatch)
 */
export async function removeMatch(seekerId: string): Promise<boolean> {
  try {
    await apiRequest(`/swipe/matches/${seekerId}`, {
      method: 'DELETE'
    });
    return true;
  } catch (error) {
    console.error('Failed to remove match:', error);
    return false;
  }
}