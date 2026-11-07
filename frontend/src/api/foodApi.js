import { apiRequest } from './client';

export const foodApi = {
  search: (query, category = '', limit = 15) => {
    const params = new URLSearchParams({ q: query, limit: String(limit) });
    if (category) params.append('category', category);
    return apiRequest(`/api/foods/search?${params.toString()}`);
  },

  getDetail: (foodId) => apiRequest(`/api/foods/${encodeURIComponent(foodId)}`),

  checkFood: (query) => apiRequest('/api/foods/check', {
    method: 'POST',
    body: JSON.stringify({ query }),
  }),

  getValidationReport: () => apiRequest('/api/foods/validation/report'),

  getRecentHistory: (limit = 6) => apiRequest(`/api/foods/user/history?limit=${limit}`),
};

