import { api } from './axiosConfig';

export interface CanchaResponse {
  id: number;
  nombre: string;
  tipo: 'FUTBOL' | 'WALLY';
  capacidad: number;
  activa: boolean;
}

export interface SlotHorarioResponse {
  horaInicio: string;
  horaFin: string;
  disponible: boolean;
  precio: number;
  expirado?: boolean;
}

export const canchaService = {
  listarActivas: async (): Promise<CanchaResponse[]> => {
    const response = await api.get('/api/canchas');
    return response.data;
  },

  obtenerDisponibilidad: async (id: number, fecha: string): Promise<SlotHorarioResponse[]> => {
    const response = await api.get(`/api/canchas/${id}/disponibilidad`, {
      params: { fecha }
    });
    return response.data;
  }
};
