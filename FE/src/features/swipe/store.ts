import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SwipeAction, SwipeState } from './types';
import { recordSwipeAction, getSwipeHistory, getMatches } from './api';

interface SwipeStore extends SwipeState {
  recordSwipe: (seekerId: string, action: 'like' | 'pass') => Promise<boolean>;
  fetchHistory: () => Promise<void>;
  fetchMatches: () => Promise<void>;
  clearHistory: () => void;
  hasSwipedSeeker: (seekerId: string) => boolean;
  getLastSwipeAction: (seekerId: string) => SwipeAction | null;
}

export const useSwipeStore = create<SwipeStore>()(
  persist(
    (set, get) => ({
      history: [],
      matches: [],
      isLoading: false,
      error: null,

      recordSwipe: async (seekerId: string, action: 'like' | 'pass') => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await recordSwipeAction(seekerId, action);
          
          if (response.success) {
            const newAction: SwipeAction = {
              seekerId,
              action,
              timestamp: new Date().toISOString()
            };
            
            set(state => ({
              history: [...state.history, newAction],
              matches: response.match 
                ? [...state.matches, response.match] 
                : state.matches,
              isLoading: false
            }));
            
            return true;
          } else {
            set({ 
              error: response.message || 'Failed to record swipe',
              isLoading: false 
            });
            return false;
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false 
          });
          return false;
        }
      },

      fetchHistory: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const history = await getSwipeHistory();
          set({ history, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch history',
            isLoading: false 
          });
        }
      },

      fetchMatches: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const matches = await getMatches();
          set({ matches, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch matches',
            isLoading: false 
          });
        }
      },

      clearHistory: () => {
        set({ history: [], matches: [] });
      },

      hasSwipedSeeker: (seekerId: string) => {
        return get().history.some(action => action.seekerId === seekerId);
      },

      getLastSwipeAction: (seekerId: string) => {
        const actions = get().history.filter(action => action.seekerId === seekerId);
        return actions.length > 0 ? actions[actions.length - 1] : null;
      }
    }),
    {
      name: 'immofy-swipe-store',
      partialize: (state) => ({ 
        history: state.history,
        matches: state.matches 
      })
    }
  )
);