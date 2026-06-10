import { adminService } from '../../../../infrastructure/api/adminService';
import type { PrecioResponse, ConfigurarPrecioRequest } from '../../../../domain/model/types';

export async function fetchPrecios(): Promise<PrecioResponse[]> {
  return await adminService.listarPrecios();
}

export async function handleConfigurarPrecio(
  data: ConfigurarPrecioRequest,
  onSuccess: (msg: string) => void,
  onError: (msg: string) => void,
): Promise<boolean> {
  try {
    await adminService.configurarPrecio(data);
    onSuccess('Precio configurado correctamente.');
    return true;
  } catch (err) {
    onError((err as { response?: { data?: { mensaje?: string } } }).response?.data?.mensaje ?? 'Error al configurar el precio.');
    return false;
  }
}

export async function handleEliminarPrecio(
  id: number,
  onSuccess: (msg: string) => void,
  onError: (msg: string) => void,
): Promise<boolean> {
  try {
    await adminService.eliminarPrecio(id);
    onSuccess('Precio eliminado correctamente.');
    return true;
  } catch (err) {
    onError((err as { response?: { data?: { mensaje?: string } } }).response?.data?.mensaje ?? 'Error al eliminar el precio.');
    return false;
  }
}
