import axios from 'axios';

// API base configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:8000' 
    : 'https://chainfly-backend.onrender.com'); // Default to Render backend for production

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Tender API endpoints
export const tenderAPI = {
  // Search tenders
  search: async (params?: any) => {
    const response = await api.get('/tenders/search', { params });
    return response.data;
  },

  // Get all tenders (placeholder for future implementation)
  getAll: async () => {
    const response = await api.get('/tenders');
    return response.data;
  },

  // Get tender by ID (placeholder for future implementation)
  getById: async (id: string) => {
    const response = await api.get(`/tenders/${id}`);
    return response.data;
  },

  // Create new tender (placeholder for future implementation)
  create: async (tenderData: any) => {
    const response = await api.post('/tenders', tenderData);
    return response.data;
  },

  // Update tender (placeholder for future implementation)
  update: async (id: string, tenderData: any) => {
    const response = await api.put(`/tenders/${id}`, tenderData);
    return response.data;
  },

  // Delete tender (placeholder for future implementation)
  delete: async (id: string) => {
    const response = await api.delete(`/tenders/${id}`);
    return response.data;
  },
};

// Document API endpoints
export const documentAPI = {
  // Upload document
  upload: async (formData: FormData) => {
    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get all documents from uploads folder
  getAll: async () => {
    const response = await api.get('/documents/list');
    return response.data;
  },

  // Get document by ID (placeholder for future implementation)
  getById: async (id: string) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  // Delete document (placeholder for future implementation)
  delete: async (id: string) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },

  // Download history endpoints
  addDownloadHistory: async (downloadData: {
    zip_name: string;
    download_date: string;
    documents: any[];
  }) => {
    const response = await api.post('/documents/download-history', downloadData);
    return response.data;
  },

  getDownloadHistory: async () => {
    const response = await api.get('/documents/download-history');
    return response.data;
  },

  clearDownloadHistory: async () => {
    const response = await api.delete('/documents/download-history');
    return response.data;
  },
};

// Reminder API endpoints
export const reminderAPI = {
  // Set reminder
  set: async (reminderData: {
    tender_id: string;
    reminder_type: string;
    due_date: string;
    email: string;
  }, test: boolean = false) => {
    const response = await api.post('/reminders/set', reminderData, {
      params: { test },
    });
    return response.data;
  },

  // Get all reminders from database
  getAll: async () => {
    const response = await api.get('/reminders/list');
    return response.data;
  },

  // Get reminder by ID (placeholder for future implementation)
  getById: async (id: string) => {
    const response = await api.get(`/reminders/${id}`);
    return response.data;
  },

  // Update reminder (placeholder for future implementation)
  update: async (id: string, reminderData: any) => {
    const response = await api.put(`/reminders/${id}`, reminderData);
    return response.data;
  },

  // Delete reminder from database
  delete: async (id: string) => {
    const response = await api.delete(`/reminders/${id}`);
    return response.data;
  },

  // Reminder history endpoints
  addHistory: async (historyData: {
    reminder_id: string;
    action: string;
    timestamp: string;
    details: any;
  }) => {
    const response = await api.post('/reminders/history', historyData);
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/reminders/history');
    return response.data;
  },

  clearHistory: async () => {
    const response = await api.delete('/reminders/history');
    return response.data;
  },
};

// Utility functions
export const apiUtils = {
  // Format error message
  formatError: (error: any): string => {
    if (error.response?.data?.detail) {
      return error.response.data.detail;
    }
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  },

  // Check if server is running
  checkServerStatus: async (): Promise<boolean> => {
    try {
      await api.get('/');
      return true;
    } catch (error) {
      return false;
    }
  },

  // Retry function with exponential backoff
  retry: async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> => {
    let lastError: any;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    }
    
    throw lastError;
  },
};

export default api; 