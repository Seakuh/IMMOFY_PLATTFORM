import {
  LoginRequest,
  AlternativeLoginRequest,
  RegisterRequest,
  NewUserProcessRequest,
  LoginResponse,
  User,
  ProfileUpdateRequest,
  ChangePasswordRequest,
  UpdatePackageRequest,
  AccountInfo,
} from './types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class AuthApiError extends Error {
  constructor(message: string, public status?: number, public code?: string) {
    super(message);
    this.name = 'AuthApiError';
  }
}

const getAuthHeader = (token: string) => ({
  'Authorization': `Bearer ${token}`,
});

export const authApi = {
  // 1. User Login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Login failed' }));
      throw new AuthApiError(error.message || 'Login failed', response.status, error.code);
    }

    return response.json();
  },

  // 2. Alternative Login
  alternativeLogin: async (credentials: AlternativeLoginRequest): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Login failed' }));
      throw new AuthApiError(error.message || 'Login failed', response.status, error.code);
    }

    return response.json();
  },

  // 3. User Registration
  register: async (data: RegisterRequest): Promise<{ message: string; userId?: string }> => {
    const response = await fetch(`${API_BASE}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Registration failed' }));
      throw new AuthApiError(error.message || 'Registration failed', response.status, error.code);
    }

    return response.json();
  },

  // 4. Get Profile
  getProfile: async (token: string): Promise<User> => {
    const response = await fetch(`${API_BASE}/users/profile`, {
      method: 'GET',
      headers: {
        ...getAuthHeader(token),
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch profile' }));
      throw new AuthApiError(error.message || 'Failed to fetch profile', response.status, error.code);
    }

    return response.json();
  },

  // 5. Edit Profile
  updateProfile: async (token: string, data: ProfileUpdateRequest): Promise<User> => {
    const response = await fetch(`${API_BASE}/users/profile`, {
      method: 'PUT',
      headers: {
        ...getAuthHeader(token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update profile' }));
      throw new AuthApiError(error.message || 'Failed to update profile', response.status, error.code);
    }

    return response.json();
  },

  // 6. Change Password
  changePassword: async (token: string, data: ChangePasswordRequest): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE}/users/change-password`, {
      method: 'PUT',
      headers: {
        ...getAuthHeader(token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to change password' }));
      throw new AuthApiError(error.message || 'Failed to change password', response.status, error.code);
    }

    return response.json();
  },

  // 7. Get Account Info
  getAccountInfo: async (token: string): Promise<AccountInfo> => {
    const response = await fetch(`${API_BASE}/users/account-info`, {
      method: 'GET',
      headers: {
        ...getAuthHeader(token),
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch account info' }));
      throw new AuthApiError(error.message || 'Failed to fetch account info', response.status, error.code);
    }

    return response.json();
  },

  // 8. Auth Profile (Alternative)
  getAuthProfile: async (token: string): Promise<User> => {
    const response = await fetch(`${API_BASE}/auth/profile`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(token),
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch auth profile' }));
      throw new AuthApiError(error.message || 'Failed to fetch auth profile', response.status, error.code);
    }

    return response.json();
  },

  // 9. Update Package
  updatePackage: async (data: UpdatePackageRequest): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE}/users/update-package`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update package' }));
      throw new AuthApiError(error.message || 'Failed to update package', response.status, error.code);
    }

    return response.json();
  },

  // 10. New User Process
  newUserProcess: async (data: NewUserProcessRequest): Promise<{ message: string; userId?: string }> => {
    const response = await fetch(`${API_BASE}/users/new-user-process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to process new user' }));
      throw new AuthApiError(error.message || 'Failed to process new user', response.status, error.code);
    }

    return response.json();
  },

  // JWT Token Validation
  validateToken: async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/auth/validate`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(token),
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  },

  // Refresh Token
  refreshToken: async (token: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(token),
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to refresh token' }));
      throw new AuthApiError(error.message || 'Failed to refresh token', response.status, error.code);
    }

    return response.json();
  },

  // Logout
  logout: async (token: string): Promise<void> => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(token),
          'Content-Type': 'application/json',
        },
      });
    } catch {
      // Ignore logout errors - clear local state anyway
    }
  },
};