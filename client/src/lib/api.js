/**
 * API Client with Clerk Authentication
 * 
 * Automatically includes Clerk session token in all requests
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Make an authenticated API request
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get Clerk token if available
  let token = null;
  if (window.Clerk) {
    try {
      token = await window.Clerk.session?.getToken();
    } catch (err) {
      console.warn('Failed to get Clerk token:', err);
    }
  }

  const headers = {
    ...options.headers,
  };

  // Add auth header if token is available
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Add content-type for JSON requests
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
    body: options.body instanceof FormData 
      ? options.body 
      : options.body 
        ? JSON.stringify(options.body) 
        : undefined
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `Request failed: ${response.status}`);
  }

  return response.json();
}

/**
 * API methods
 */
export const api = {
  // Health check
  health: () => apiRequest('/api/health'),

  // Assets
  uploadAsset: (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return apiRequest('/api/assets/upload', {
      method: 'POST',
      body: formData
    });
  },

  listAssets: (type) => {
    const query = type ? `?type=${type}` : '';
    return apiRequest(`/api/assets${query}`);
  },

  deleteAsset: (id) => apiRequest(`/api/assets/${id}`, {
    method: 'DELETE'
  }),

  // Video generation
  generateVideo: (config) => apiRequest('/api/video/generate', {
    method: 'POST',
    body: config
  }),

  // User data (future)
  getUserData: () => apiRequest('/api/user'),
  
  updateUserSettings: (settings) => apiRequest('/api/user/settings', {
    method: 'PATCH',
    body: settings
  })
};
