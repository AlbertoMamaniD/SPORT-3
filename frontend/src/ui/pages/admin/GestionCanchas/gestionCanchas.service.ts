import { adminService } from '../../../../infrastructure/api/adminService';
import type { CanchaRequest, CanchaResponse } from '../../../../domain/model/types';

export async function fetchCanchas(): Promise<CanchaResponse[]> {
  return await adminService.listarTodasCanchas();
}

export async function handleCrearCancha(
  data: CanchaRequest,
  onSuccess: (msg: string) => void,
  onError: (msg: string) => void,
): Promise<boolean> {
  try {
    await adminService.crearCancha(data);
    onSuccess(`Cancha "${data.nombre}" creada correctamente.`);
    return true;
  } catch (err) {
    onError((err as { response?: { data?: { mensaje?: string } } }).response?.data?.mensaje ?? 'Error al crear la cancha.');
    return false;
  }
}

export async function handleEditarCancha(
  id: number,
  data: CanchaRequest,
  onSuccess: (msg: string) => void,
  onError: (msg: string) => void,
): Promise<boolean> {
  try {
    await adminService.editarCancha(id, data);
    onSuccess(`Cancha "${data.nombre}" actualizada correctamente.`);
    return true;
  } catch (err) {
    onError((err as { response?: { data?: { mensaje?: string } } }).response?.data?.mensaje ?? 'Error al actualizar la cancha.');
    return false;
  }
}

export async function handleDesactivarCancha(
  id: number,
  nombre: string,
  onSuccess: (msg: string) => void,
  onError: (msg: string) => void,
): Promise<boolean> {
  try {
    await adminService.desactivarCancha(id);
    onSuccess(`Cancha "${nombre}" desactivada correctamente.`);
    return true;
  } catch (err) {
    onError((err as { response?: { data?: { mensaje?: string } } }).response?.data?.mensaje ?? 'Error al desactivar la cancha.');
    return false;
  }
}
