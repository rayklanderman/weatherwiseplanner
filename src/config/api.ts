/**
 * API Configuration with automatic environment detection
 * - Development: Uses localhost:8000
 * - Production: Uses VITE_API_URL from environment variables
 * - Fallback: Attempts both local and production endpoints
 */

// Get base URL based on environment
const getBaseUrl = (): string => {
  // In production (Vercel), use environment variable
  if (import.meta.env.PROD && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In development, use localhost
  if (import.meta.env.DEV) {
    return 'http://localhost:8000';
  }
  
  // Fallback for production without env var
  return 'https://weatherwiseplanner-backend.onrender.com';
};

export const API_BASE_URL = getBaseUrl();

// Health check to verify backend is reachable
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    return response.ok;
  } catch (error) {
    console.warn('Backend health check failed:', error);
    return false;
  }
};

// Smart fetch with automatic fallback
export const apiFetch = async (
  endpoint: string,
  options?: RequestInit
): Promise<Response> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    console.error(`API request failed to ${url}:`, error);
    throw error;
  }
};

// Export configuration info for debugging
export const getApiConfig = () => ({
  baseUrl: API_BASE_URL,
  environment: import.meta.env.MODE,
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
});

// Log configuration on load (only in development)
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', getApiConfig());
}
