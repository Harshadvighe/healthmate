import { apiRequest } from './client';

export const chatApi = {
  sendMessage: (message, conversationId = null) => apiRequest('/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      message,
      conversation_id: conversationId,
    }),
  }),

  getConversations: () => apiRequest('/api/chat/conversations'),

  getConversation: (conversationId) => apiRequest(`/api/chat/conversations/${conversationId}`),

  deleteConversation: (conversationId) => apiRequest(`/api/chat/conversations/${conversationId}`, {
    method: 'DELETE',
  }),
};

