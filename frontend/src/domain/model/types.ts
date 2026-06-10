// ─── Enums de Dominio ────────────────────────────────────────────────────────

export type TipoCancha = 'FUTBOL' | 'WALLY';
export type RolUsuario = 'USUARIO' | 'ADMIN';
export type EstadoReserva = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA';
export type MetodoPago = 'ONLINE' | 'PRESENCIAL';
export type EstadoPago = 'PENDIENTE' | 'COMPLETADO' | 'RECHAZADO' | 'REEMBOLSADO';
export type DiaSemana = 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO' | 'DOMINGO';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface UserSession {
  nombre: string;
  telefono: string;
  rol: RolUsuario;
}

export interface AuthResponse {
  token: string;
  rol: RolUsuario;
  nombre: string;
}

// ─── Cancha ───────────────────────────────────────────────────────────────────

export interface CanchaResponse {
  id: number;
  nombre: string;
  tipo: TipoCancha;
  capacidad: number;
  activa: boolean;
}

export interface CanchaRequest {
  nombre: string;
  tipo: TipoCancha;
  capacidad: number;
}

// ─── Slots de Disponibilidad ──────────────────────────────────────────────────

export interface SlotHorarioResponse {
  horaInicio: string;  // "HH:mm:ss"
  horaFin: string;
  disponible: boolean;
  precio: number;
  expirado?: boolean;
}

// ─── Reserva ──────────────────────────────────────────────────────────────────

export interface PagoAdminDTO {
  concepto: string;
  estado: EstadoPago;
  urlComprobante?: string;
  fechaSubida?: string;
}

export interface ReservaResponse {
  id: number | null;
  canchaId: number;
  usuarioId: number;
  nombreUsuario?: string;
  fecha: string;          // "YYYY-MM-DD"
  horaInicio: string;     // "HH:mm:ss"
  horaFin: string;
  estado: EstadoReserva;
  montoTotal: number;
  metodoPago?: MetodoPago;
  estadoPago?: EstadoPago;
  pagos?: PagoAdminDTO[];
  urlComprobante?: string;
}

export interface CrearReservaRequest {
  canchaId: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  metodoPago: MetodoPago;
}

// ─── Precio ───────────────────────────────────────────────────────────────────

export interface PrecioResponse {
  id: number;
  canchaId: number;
  precioHora: number;
  horaInicio: string;
  horaFin: string;
  diaSemana?: DiaSemana;
  esFeriado: boolean;
  vigente: boolean;
}

export interface ConfigurarPrecioRequest {
  canchaId: number;
  precioHora: number;
  horaInicio: string;
  horaFin: string;
  diaSemana?: DiaSemana;
  esFeriado?: boolean;
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

export interface DashboardStats {
  totalReservasHoy: number;
  ingresosHoy: number;
  canchasActivas: number;
  reservasPendientesPago: number;
  reservasRecientes: ReservaResponse[];
}
