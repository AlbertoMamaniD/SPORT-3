import { api } from './axiosConfig';

export const authService = {
  // Registrar un nuevo usuario (Gatilla envío de OTP)
  register: async (nombre: string, telefono: string): Promise<{ mensaje: string }> => {
    const response = await api.post('/api/auth/register', { nombre, telefono });
    return response.data;
  },

  // Iniciar sesión (Gatilla envío de OTP si ya existe)
  login: async (telefono: string): Promise<{ mensaje: string }> => {
    const response = await api.post('/api/auth/login', { telefono });
    return response.data;
  },

  // Verificar el OTP recibido
  verifyOtp: async (telefono: string, codigo: string): Promise<{ token: string, rol: string, nombre: string }> => {
    const response = await api.post('/api/auth/verify-otp', { telefono, codigo });
    return response.data;
  }
};
