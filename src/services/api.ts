import axios from 'axios';
import {
  ChatRequestInterface,
  ChatResponseInterface,
  DocumentUploadInterface,
  DocumentSearchResultInterface,
  AuthRequestInterface,
  AuthResponseInterface,
  CategoryQueryInterface,
  CategoryResponseInterface,
  SessionInfoInterface,
} from '@/types/chat';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const chatAPI = {
  sendMessage: async (request: ChatRequestInterface): Promise<ChatResponseInterface> => {
    const response = await api.post('/chat/message', request);
    return response.data;
  },

  getConversationHistory: async (conversationId: string) => {
    const response = await api.get(`/chat/conversation/${conversationId}`);
    return response.data;
  },

  clearConversation: async (conversationId: string) => {
    const response = await api.delete(`/chat/conversation/${conversationId}`);
    return response.data;
  },

  healthCheck: async () => {
    const response = await api.get('/chat/health');
    return response.data;
  }
};

export const documentsAPI = {
  uploadDocument: async (document: DocumentUploadInterface) => {
    const response = await api.post('/documents/upload', document);
    return response.data;
  },

  uploadFile: async (file: File, title?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (title) {
      formData.append('title', title);
    }

    const response = await api.post('/documents/upload-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  searchDocuments: async (query: string, topK: number = 5): Promise<{ query: string; results: DocumentSearchResultInterface[]; count: number }> => {
    const response = await api.get('/documents/search', {
      params: { query, top_k: topK }
    });
    return response.data;
  },

  deleteDocument: async (documentId: string) => {
    const response = await api.delete(`/documents/${documentId}`);
    return response.data;
  }
};

export const authAPI = {
  login: async (credentials: AuthRequestInterface): Promise<AuthResponseInterface> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  createAnonymousSession: async (): Promise<AuthResponseInterface> => {
    const response = await api.post('/auth/anonymous');
    return response.data;
  },

  getSession: async (): Promise<SessionInfoInterface> => {
    const response = await api.get('/auth/session');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getDemoCredentials: async () => {
    const response = await api.get('/auth/demo-credentials');
    return response.data;
  }
};

export const fintechAPI = {
  getCategories: async () => {
    const response = await api.get('/fintech/categories');
    return response.data;
  },

  askByCategory: async (query: CategoryQueryInterface): Promise<CategoryResponseInterface> => {
    const response = await api.post('/fintech/ask-by-category', query);
    return response.data;
  },

  searchByCategory: async (category: string, query: string, limit: number = 5) => {
    const response = await api.get(`/fintech/search-by-category/${category}`, {
      params: { query, limit }
    });
    return response.data;
  },

  getCategoryStats: async (category: string) => {
    const response = await api.get(`/fintech/category-stats/${category}`);
    return response.data;
  }
};

export const generalAPI = {
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },

  getApiInfo: async () => {
    const response = await api.get('/');
    return response.data;
  }
};

export default api;
