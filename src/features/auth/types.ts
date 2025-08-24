export interface User {
  id: string;
  email: string;
  name?: string;
  headline?: string;
  bio?: string;
  avatarUrl?: string;
  budgetMin?: number;
  budgetMax?: number;
  locations: string[];
  moveInFrom?: string;
  roomsMin?: number;
  pets?: boolean;
  tags?: string[];
  package: 'basic' | 'premium' | 'pro';
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  lastLoginAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AlternativeLoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  package: 'basic' | 'premium' | 'pro';
}

export interface NewUserProcessRequest {
  email: string;
  prompt: string;
  packageId: 'basic' | 'premium' | 'pro';
}

export interface LoginResponse {
  token: string;
  user: User;
  expiresIn: number;
}

export interface ProfileUpdateRequest {
  name?: string;
  headline?: string;
  bio?: string;
  budgetMin?: number;
  budgetMax?: number;
  locations?: string[];
  pets?: boolean;
  tags?: string[];
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdatePackageRequest {
  email: string;
  package: 'basic' | 'premium' | 'pro';
}

export interface AccountInfo {
  id: string;
  email: string;
  package: string;
  isVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthError {
  message: string;
  code?: string;
  field?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: AuthError | null;
}

// JWT Token payload interface
export interface JWTPayload {
  sub: string; // user id
  email: string;
  iat: number; // issued at
  exp: number; // expires at
  package?: string;
}