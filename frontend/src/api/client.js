const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const token = localStorage.getItem('healthmate_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // If token expired or invalid on protected endpoint
    if (!endpoint.includes('/api/auth/login') && !endpoint.includes('/api/auth/register')) {
      localStorage.removeItem('healthmate_token');
      localStorage.removeItem('healthmate_user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
  }

  const contentType = response.headers.get('content-type');
  let data = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    let errorMsg = (data && data.detail);
    if (!errorMsg) {
      if (response.status === 404) {
        errorMsg = 'Backend API server unreachable (404). Please verify that your backend service is deployed and running on Render.';
      } else if (response.status === 502 || response.status === 503 || response.status === 504) {
        errorMsg = 'Backend server is waking up or temporarily unavailable. Please retry in 30 seconds.';
      } else {
        errorMsg = response.statusText || 'Request failed';
      }
    }
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

