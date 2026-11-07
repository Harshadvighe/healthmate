import { apiRequest } from './client';

export const authApi = {
  register: (payload) => apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  login: (payload) => apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  getMe: () => apiRequest('/api/auth/me', {
    method: 'GET',
  }),
};

