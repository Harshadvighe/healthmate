import { apiRequest } from './client';

export const profileApi = {
  getProfile: () => apiRequest('/api/profile', {
    method: 'GET',
  }),

  completeOnboarding: (data) => apiRequest('/api/profile/onboarding', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  updatePersonal: (data) => apiRequest('/api/profile/personal', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  updateHealth: (data) => apiRequest('/api/profile/health', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  updateLifestyle: (data) => apiRequest('/api/profile/lifestyle', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  updateGoals: (data) => apiRequest('/api/profile/goals', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  deleteAccountData: () => apiRequest('/api/profile/data', {
    method: 'DELETE',
  }),
};

