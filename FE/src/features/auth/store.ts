import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  AuthState,
  LoginRequest,
  AlternativeLoginRequest,
  RegisterRequest,
  NewUserProcessRequest,
  ProfileUpdateRequest,
  ChangePasswordRequest,
  UpdatePackageRequest,
  AuthError,
  JWTPayload,
} from './types';
import { authApi } from './api';

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  alternativeLogin: (credentials: AlternativeLoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<{ message: string; userId?: string }>;
  newUserProcess: (data: NewUserProcessRequest) => Promise<{ message: string; userId?: string }>;
  logout: () => Promise<void>;
  getProfile: () => Promise<void>;
  updateProfile: (data: ProfileUpdateRequest) => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
  updatePackage: (data: UpdatePackageRequest) => Promise<void>;
  validateToken: () => Promise<boolean>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
  initialize: () => Promise<void>;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// JWT Helper functions
const parseJWT = (token: string): JWTPayload | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

const isTokenExpired = (token: string): boolean => {
  const payload = parseJWT(token);
  if (!payload) return true;
  
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
};

const isTokenExpiringSoon = (token: string, thresholdMinutes = 5): boolean => {
  const payload = parseJWT(token);
  if (!payload) return true;
  
  const now = Math.floor(Date.now() / 1000);
  const threshold = thresholdMinutes * 60;
  return payload.exp - now < threshold;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: async (credentials) => {
        set({ loading: true, error: null });
        
        try {
          const response = await authApi.login(credentials);
          
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            loading: false,
          });
        } catch (error) {
          const authError: AuthError = {
            message: error instanceof Error ? error.message : 'Login failed',
          };
          
          set({
            error: authError,
            loading: false,
          });
          throw error;
        }
      },

      alternativeLogin: async (credentials) => {
        set({ loading: true, error: null });
        
        try {
          const response = await authApi.alternativeLogin(credentials);
          
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            loading: false,
          });
        } catch (error) {
          const authError: AuthError = {
            message: error instanceof Error ? error.message : 'Login failed',
          };
          
          set({
            error: authError,
            loading: false,
          });
          throw error;
        }
      },

      register: async (data) => {
        set({ loading: true, error: null });
        
        try {
          const response = await authApi.register(data);
          set({ loading: false });
          return response;
        } catch (error) {
          const authError: AuthError = {
            message: error instanceof Error ? error.message : 'Registration failed',
          };
          
          set({
            error: authError,
            loading: false,
          });
          throw error;
        }
      },

      newUserProcess: async (data) => {
        set({ loading: true, error: null });
        
        try {
          const response = await authApi.newUserProcess(data);
          set({ loading: false });
          return response;
        } catch (error) {
          const authError: AuthError = {
            message: error instanceof Error ? error.message : 'User process failed',
          };
          
          set({
            error: authError,
            loading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        const { token } = get();
        
        if (token) {
          try {
            await authApi.logout(token);
          } catch {
            // Ignore logout errors
          }
        }
        
        set({
          ...initialState,
        });
      },

      getProfile: async () => {
        const { token } = get();
        if (!token) {
          throw new Error('No authentication token');
        }

        set({ loading: true, error: null });
        
        try {
          const user = await authApi.getProfile(token);
          set({ user, loading: false });
        } catch (error) {
          const authError: AuthError = {
            message: error instanceof Error ? error.message : 'Failed to fetch profile',
          };
          
          set({
            error: authError,
            loading: false,
          });
          throw error;
        }
      },

      updateProfile: async (data) => {
        const { token } = get();
        if (!token) {
          throw new Error('No authentication token');
        }

        set({ loading: true, error: null });
        
        try {
          const updatedUser = await authApi.updateProfile(token, data);
          set({ user: updatedUser, loading: false });
        } catch (error) {
          const authError: AuthError = {
            message: error instanceof Error ? error.message : 'Failed to update profile',
          };
          
          set({
            error: authError,
            loading: false,
          });
          throw error;
        }
      },

      changePassword: async (data) => {
        const { token } = get();
        if (!token) {
          throw new Error('No authentication token');
        }

        set({ loading: true, error: null });
        
        try {
          await authApi.changePassword(token, data);
          set({ loading: false });
        } catch (error) {
          const authError: AuthError = {
            message: error instanceof Error ? error.message : 'Failed to change password',
          };
          
          set({
            error: authError,
            loading: false,
          });
          throw error;
        }
      },

      updatePackage: async (data) => {
        set({ loading: true, error: null });
        
        try {
          await authApi.updatePackage(data);
          set({ loading: false });
        } catch (error) {
          const authError: AuthError = {
            message: error instanceof Error ? error.message : 'Failed to update package',
          };
          
          set({
            error: authError,
            loading: false,
          });
          throw error;
        }
      },

      validateToken: async () => {
        const { token } = get();
        if (!token) return false;

        if (isTokenExpired(token)) {
          get().logout();
          return false;
        }

        try {
          const isValid = await authApi.validateToken(token);
          if (!isValid) {
            get().logout();
            return false;
          }
          return true;
        } catch {
          get().logout();
          return false;
        }
      },

      refreshToken: async () => {
        const { token } = get();
        if (!token) {
          throw new Error('No authentication token');
        }

        try {
          const response = await authApi.refreshToken(token);
          set({
            user: response.user,
            token: response.token,
          });
        } catch (error) {
          get().logout();
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        set(initialState);
      },

      initialize: async () => {
        const { token } = get();
        
        if (!token) {
          return;
        }

        if (isTokenExpired(token)) {
          get().logout();
          return;
        }

        // If token is expiring soon, try to refresh it
        if (isTokenExpiringSoon(token)) {
          try {
            await get().refreshToken();
          } catch {
            get().logout();
            return;
          }
        }

        // Validate token and get user data
        try {
          await get().validateToken();
          if (!get().user) {
            await get().getProfile();
          }
        } catch {
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);