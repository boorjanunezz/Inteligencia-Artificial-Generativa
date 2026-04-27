import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (username, password) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);
  const response = await api.post('/login', formData);
  return response.data;
};

export const register = async (username, password) => {
  const response = await api.post('/register', { username, password });
  return response.data;
};

export const ingestTextDocument = async (assistantId, filename, content) => {
  const response = await api.post(`/assistants/${assistantId}/documents/text`, { filename, content });
  return response.data;
};

export const setFeedback = async (messageId, feedback) => {
  const response = await api.put(`/chat/messages/${messageId}/feedback`, { feedback });
  return response.data;
};

export const clearFeedback = async (messageId) => {
  const response = await api.delete(`/chat/messages/${messageId}/feedback`);
  return response.data;
};

export default api;
