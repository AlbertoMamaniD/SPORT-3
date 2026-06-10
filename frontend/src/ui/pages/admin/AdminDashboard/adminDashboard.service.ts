import { adminService } from '../../../../infrastructure/api/adminService';
import type { DashboardStats } from '../../../../domain/model/types';

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const stats = await adminService.obtenerDashboard();
  if (stats.canchasActivas === 0) {
    try {
      const canchas = await adminService.listarTodasCanchas();
      stats.canchasActivas = canchas.filter((c) => c.activa).length;
    } catch {
      // ignore fallback error
    }
  }
  return stats;
}

export async function handleRegistrarPago(
  reservaId: number,
  onSuccess: (msg: string) => void,
  onError: (msg: string) => void
): Promise<void> {
  try {
    await adminService.registrarPagoPresencial(reservaId);
    onSuccess('Pago presencial registrado correctamente. Reserva confirmada.');
  } catch (err) {
    const msg =
      (err as { response?: { data?: { mensaje?: string } } }).response?.data?.mensaje || 'No se pudo registrar el pago presencial.';
    onError(msg);
  }
}

export async function handleCancelarReservaAdmin(
  reservaId: number,
  onSuccess: (msg: string) => void,
  onError: (msg: string) => void
): Promise<void> {
  try {
    await adminService.cancelarReservaAdmin(reservaId);
    onSuccess('Reserva cancelada correctamente.');
  } catch (err) {
    const msg =
      (err as { response?: { data?: { mensaje?: string } } }).response?.data?.mensaje || 'No se pudo cancelar la reserva.';
    onError(msg);
  }
}

export async function handleAprobarPagoOnline(
  reservaId: number,
  concepto: string,
  onSuccess: (msg: string) => void,
  onError: (msg: string) => void
): Promise<void> {
  try {
    await adminService.aprobarComprobante(reservaId, concepto);
    onSuccess(`Comprobante (${concepto}) aprobado. Reserva confirmada.`);
  } catch (err) {
    const msg =
      (err as { response?: { data?: { mensaje?: string } } }).response?.data?.mensaje || 'No se pudo aprobar el comprobante.';
    onError(msg);
  }
}

export async function handleRechazarPagoOnline(
  reservaId: number,
  concepto: string,
  onSuccess: (msg: string) => void,
  onError: (msg: string) => void
): Promise<void> {
  try {
    await adminService.rechazarComprobante(reservaId, concepto);
    onSuccess(`Comprobante (${concepto}) rechazado.`);
  } catch (err) {
    const msg =
      (err as { response?: { data?: { mensaje?: string } } }).response?.data?.mensaje || 'No se pudo rechazar el comprobante.';
    onError(msg);
  }
}
