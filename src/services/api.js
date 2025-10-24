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
  delete: (id) => api.delete(`/clientes/${id}`),
  buscarPorDNI: (dni) => api.get(`/clientes/dni/${dni}`)
};

// Servicio de Productos
export const productosService = {
  getAll: () => api.get('/productos'),
  create: (producto) => api.post('/productos', producto),
  update: (numeroSerie, producto) => api.put(`/productos/${numeroSerie}`, producto),
  delete: (numeroSerie) => api.delete(`/productos/${numeroSerie}`),
  buscarPorNumeroSerie: (numeroSerie) => api.get(`/productos/serie/${numeroSerie}`)
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
  update: (dni, tecnico) => api.put(`/tecnicos/${dni}`, tecnico),
  toggleEstado: (dni) => api.patch(`/tecnicos/${dni}/toggle-estado`)
};

// Servicio de Dashboard
export const dashboardService = {
  getStats: () => api.get('/dashboard/stats')
};

// Servicio de Health Check
export const healthService = {
  check: () => api.get('/health')
};

// Servicio de Órdenes para Agenda (filtros)
export const ordenesAgendaService = {
  list: (params = {}) => api.get('/ordenes-agenda', { params }),
};

// Servicio de Agenda (listar y programar)
export const agendaService = {
  list: (params = {}) => api.get('/agenda', { params }),
  create: (payload) => api.post('/agenda', payload),
};

export default api;