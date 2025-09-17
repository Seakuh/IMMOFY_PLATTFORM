const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  // Get auth token from localStorage if available
  const authStorage = localStorage.getItem('auth-storage');
  let token = null;

  if (authStorage) {
    try {
      const parsedAuth = JSON.parse(authStorage);
      token = parsedAuth.state?.token;
    } catch {
      // Ignore parsing errors
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Add Authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `Request failed: ${response.statusText}`
    );
  }

  return response.json();
}
