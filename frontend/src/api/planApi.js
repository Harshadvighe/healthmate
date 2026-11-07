import { apiRequest } from './client';

export const planApi = {
  generate: (payload = {}) => apiRequest('/api/plans/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  getPlans: () => apiRequest('/api/plans'),

  getPlanById: (planId) => apiRequest(`/api/plans/${planId}`),

  updatePlan: (planId, payload) => apiRequest(`/api/plans/${planId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
};

