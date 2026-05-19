import { api } from './axiosConfig';

export interface ReservaResponse {
  id: number | null;
  canchaId: number;
  usuarioId: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA';
  montoTotal: number;
}

export const reservaService = {
  crear: async (canchaId: number, fecha: string, horaInicio: string, horaFin: string, metodoPago: 'ONLINE' | 'PRESENCIAL'): Promise<ReservaResponse> => {
    const response = await api.post('/api/reservas', {
      canchaId,
      fecha,
      horaInicio,
      horaFin,
      metodoPago
    });
    return response.data;
  },

  obtenerHistorial: async (): Promise<ReservaResponse[]> => {
    const response = await api.get('/api/reservas/historial');
    return response.data;
  },

  ampliar: async (id: number, minutosExtra: number): Promise<ReservaResponse> => {
    const response = await api.put(`/api/reservas/${id}/ampliar`, {
      minutosExtra
    });
    return response.data;
  },

  cancelar: async (id: number): Promise<void> => {
    await api.delete(`/api/reservas/${id}`);
  },

  subirComprobante: async (reservaId: number, file: File, concepto: 'RESERVA_INICIAL' | 'AMPLIACION'): Promise<{ estado: string, urlComprobante: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('concepto', concepto);

    const response = await api.post(`/api/pagos/${reservaId}/comprobante`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};
