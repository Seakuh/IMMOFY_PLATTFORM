import { create } from 'zustand';
import { BulletinListing, BulletinFilters } from './types';
import { bulletinApi } from './api';

interface BulletinStore {
  listings: BulletinListing[];
  currentListing: BulletinListing | null;
  loading: boolean;
  error: string | null;
  filters: BulletinFilters;
  hasMore: boolean;
  page: number;
  total: number;

  // Actions
  setFilters: (filters: Partial<BulletinFilters>) => void;
  clearFilters: () => void;
  fetchListings: (reset?: boolean) => Promise<void>;
  fetchListing: (id: string) => Promise<void>;
  createListing: (data: any) => Promise<BulletinListing>;
  updateListing: (id: string, data: any) => Promise<BulletinListing>;
  deleteListing: (id: string) => Promise<void>;
  incrementViews: (id: string) => Promise<void>;
  markInterested: (id: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  listings: [],
  currentListing: null,
  loading: false,
  error: null,
  filters: {},
  hasMore: true,
  page: 1,
  total: 0,
};

export const useBulletinStore = create<BulletinStore>((set, get) => ({
  ...initialState,

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      page: 1,
    }));
  },

  clearFilters: () => {
    set({ filters: {}, page: 1 });
  },

  fetchListings: async (reset = false) => {
    const { filters, page, listings } = get();
    
    set({ loading: true, error: null });
    
    try {
      const currentPage = reset ? 1 : page;
      const response = await bulletinApi.getListings({
        ...filters,
        page: currentPage,
        limit: 20,
      });

      set({
        listings: reset ? response.listings : [...listings, ...response.listings],
        hasMore: response.hasMore,
        page: currentPage + 1,
        total: response.total,
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch listings',
        loading: false,
      });
    }
  },

  fetchListing: async (id) => {
    set({ loading: true, error: null });
    
    try {
      const listing = await bulletinApi.getListing(id);
      set({ currentListing: listing, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch listing',
        loading: false,
      });
    }
  },

  createListing: async (data) => {
    set({ loading: true, error: null });
    
    try {
      const newListing = await bulletinApi.createListing(data);
      
      set((state) => ({
        listings: [newListing, ...state.listings],
        total: state.total + 1,
        loading: false,
      }));
      
      return newListing;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create listing',
        loading: false,
      });
      throw error;
    }
  },

  updateListing: async (id, data) => {
    set({ loading: true, error: null });
    
    try {
      const updatedListing = await bulletinApi.updateListing(id, data);
      
      set((state) => ({
        listings: state.listings.map(listing =>
          listing.id === id ? updatedListing : listing
        ),
        currentListing: state.currentListing?.id === id ? updatedListing : state.currentListing,
        loading: false,
      }));
      
      return updatedListing;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update listing',
        loading: false,
      });
      throw error;
    }
  },

  deleteListing: async (id) => {
    set({ loading: true, error: null });
    
    try {
      await bulletinApi.deleteListing(id);
      
      set((state) => ({
        listings: state.listings.filter(listing => listing.id !== id),
        total: Math.max(0, state.total - 1),
        currentListing: state.currentListing?.id === id ? null : state.currentListing,
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete listing',
        loading: false,
      });
      throw error;
    }
  },

  incrementViews: async (id) => {
    try {
      await bulletinApi.incrementViews(id);
      
      set((state) => ({
        listings: state.listings.map(listing =>
          listing.id === id ? { ...listing, views: listing.views + 1 } : listing
        ),
        currentListing: state.currentListing?.id === id 
          ? { ...state.currentListing, views: state.currentListing.views + 1 }
          : state.currentListing,
      }));
    } catch (error) {
      // Silently fail for view tracking
      console.error('Failed to increment views:', error);
    }
  },

  markInterested: async (id) => {
    try {
      await bulletinApi.markInterested(id);
      
      set((state) => ({
        listings: state.listings.map(listing =>
          listing.id === id ? { ...listing, interested_count: listing.interested_count + 1 } : listing
        ),
        currentListing: state.currentListing?.id === id 
          ? { ...state.currentListing, interested_count: state.currentListing.interested_count + 1 }
          : state.currentListing,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to mark interest',
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set(initialState);
  },
}));