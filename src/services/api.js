import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error de API:', error);
    return Promise.reject(error);
  }
);

// Servicio de Autenticación
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials)
};

// Servicio de Clientes
export const clientesService = {
  getAll: () => api.get('/clientes'),
  create: (cliente) => api.post('/clientes', cliente),
  update: (id, cliente) => api.put(`/clientes/${id}`, cliente),
  delete: (id) => api.delete(`/clientes/${id}`)
};

// Servicio de Órdenes de Trabajo
export const ordenesService = {
  getAll: () => api.get('/ordenes'),
  create: (orden) => api.post('/ordenes', orden),
  update: (id, orden) => api.put(`/ordenes/${id}`, orden),
  delete: (id) => api.delete(`/ordenes/${id}`)
};

// Servicio de Técnicos
export const tecnicosService = {
  getAll: () => api.get('/tecnicos'),
  create: (tecnico) => api.post('/tecnicos', tecnico),
  update: (id, tecnico) => api.put(`/tecnicos/${id}`, tecnico),
  delete: (id) => api.delete(`/tecnicos/${id}`)
};

// Servicio de Dashboard
export const dashboardService = {
  getStats: () => api.get('/dashboard/stats')
};

// Servicio de Health Check
export const healthService = {
  check: () => api.get('/health')
};

export default api;