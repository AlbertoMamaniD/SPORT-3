import { api } from './axiosConfig';
import type {
  CanchaResponse,
  CanchaRequest,
  ReservaResponse,
  PrecioResponse,
  ConfigurarPrecioRequest,
  DashboardStats,
} from '../../domain/model/types';

export const adminService = {
  // ── Dashboard ──────────────────────────────────────────────────────────────
  obtenerDashboard: async (): Promise<DashboardStats> => {
    try {
      const response = await api.get('/api/admin/dashboard');
      return response.data;
    } catch {
      // Fallback: calcular stats desde las reservas si el endpoint no existe aún
      const reservasResp = await api.get('/api/admin/reservas');
      const reservas: ReservaResponse[] = reservasResp.data ?? [];
      const hoy = new Date().toISOString().split('T')[0];
      const hoy_reservas = reservas.filter((r) => r.fecha === hoy);
      return {
        totalReservasHoy: hoy_reservas.length,
        ingresosHoy: hoy_reservas
          .filter((r) => r.estado !== 'CANCELADA')
          .reduce((acc, r) => acc + (r.montoTotal ?? 0), 0),
        canchasActivas: 0,
        reservasPendientesPago: reservas.filter(
          (r) => r.estadoPago === 'PENDIENTE' && r.estado !== 'CANCELADA'
        ).length,
        reservasRecientes: reservas.slice(0, 10),
      };
    }
  },

  // ── Reservas (vista admin — todas) ─────────────────────────────────────────
  listarTodasReservas: async (): Promise<ReservaResponse[]> => {
    const response = await api.get('/api/admin/reservas');
    return response.data;
  },

  cancelarReservaAdmin: async (id: number): Promise<void> => {
    await api.delete(`/api/admin/reservas/${id}`);
  },

  // ── Canchas ────────────────────────────────────────────────────────────────
  listarTodasCanchas: async (): Promise<CanchaResponse[]> => {
    const response = await api.get('/api/canchas');
    return response.data;
  },

  crearCancha: async (data: CanchaRequest): Promise<CanchaResponse> => {
    const response = await api.post('/api/admin/canchas', data);
    return response.data;
  },

  editarCancha: async (id: number, data: CanchaRequest): Promise<CanchaResponse> => {
    const response = await api.put(`/api/admin/canchas/${id}`, data);
    return response.data;
  },

  desactivarCancha: async (id: number): Promise<void> => {
    await api.delete(`/api/admin/canchas/${id}`);
  },

  // ── Precios ────────────────────────────────────────────────────────────────
  listarPrecios: async (): Promise<PrecioResponse[]> => {
    const response = await api.get('/api/admin/precios');
    return response.data;
  },

  configurarPrecio: async (data: ConfigurarPrecioRequest): Promise<PrecioResponse> => {
    const response = await api.post('/api/admin/precios', data);
    return response.data;
  },

  eliminarPrecio: async (id: number): Promise<void> => {
    await api.delete(`/api/admin/precios/${id}`);
  },

  // ── Pagos ──────────────────────────────────────────────────────────────────
  registrarPagoPresencial: async (reservaId: number): Promise<{ estado: string }> => {
    const response = await api.post(`/api/pagos/presencial?reservaId=${reservaId}`);
    return response.data;
  },

  aprobarComprobante: async (reservaId: number, concepto: string): Promise<{ estado: string }> => {
    const response = await api.post(`/api/pagos/${reservaId}/comprobante/aprobar?concepto=${concepto}`);
    return response.data;
  },

  rechazarComprobante: async (reservaId: number, concepto: string): Promise<{ estado: string }> => {
    const response = await api.post(`/api/pagos/${reservaId}/comprobante/rechazar?concepto=${concepto}`);
    return response.data;
  },
};
