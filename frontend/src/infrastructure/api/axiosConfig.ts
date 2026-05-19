import axios from 'axios';

// Leer la URL base del backend desde la variable de entorno
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Configurar instancia base de Axios
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar automáticamente el JWT si existe en localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor de respuesta para manejar token expirado (401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Limpiar datos del almacenamiento
      localStorage.removeItem('token');
      localStorage.removeItem('rol');
      localStorage.removeItem('nombre');
      localStorage.removeItem('telefono');
      // Recargar la página para volver al login
      window.location.reload();
    }
    return Promise.reject(error);
  }
);
