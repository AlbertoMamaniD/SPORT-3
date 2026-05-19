# 📘 Guía de Integración Frontend — SPORT ACADEMY

Estimado desarrollador frontend del equipo de **SPORT ACADEMY**,

En esta guía se documenta detalladamente cómo implementar e integrar los dos flujos críticos del cliente con el backend de Spring Boot (DDD) utilizando las credenciales configuradas y validadas de producción del cliente:
1. **Subida Directa a Cloudinary (Unsigned) desde el Navegador** (para capturas de comprobantes de pago simple QR).
2. **Selección Múltiple de Franjas Contiguas (Garantía de 1 Hora Mínima)**.

---

## ☁️ 1. Subida Directa a Cloudinary (Client-Side Upload)

Para evitar sobrecargar el backend de Spring Boot con archivos binarios multipartes pesados, la arquitectura utiliza una carga directa no firmada (**Unsigned Upload**) desde el navegador a la cuenta de Cloudinary.

Una vez completada la subida, la API de Cloudinary te devolverá un enlace HTTPS (URL). Este enlace es el que debes enviar en el JSON de confirmación al backend en el campo `referencia`.

### 🔑 Credenciales del Cliente:
* **Cloud Name:** `djtmcf7xg`
* **Upload Preset (Unsigned):** `sport_preset`
* **Cloudinary Upload API URL:** `https://api.cloudinary.com/v1_1/djtmcf7xg/image/upload`

### 💻 Ejemplo de Implementación (TypeScript / Axios):

```typescript
import axios from 'axios';

/**
 * Sube un archivo de imagen directamente a la cuenta de Cloudinary del cliente.
 * @param file Objeto File obtenido de un input HTML <input type="file" />
 * @returns Promesa que resuelve a la URL pública HTTPS de la imagen
 */
export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'sport_preset'); // Preset no firmado configurado

  const response = await axios.post(
    'https://api.cloudinary.com/v1_1/djtmcf7xg/image/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  // Retorna la URL segura de la imagen (Ej. https://res.cloudinary.com/...)
  return response.data.secure_url;
};
```

---

## 📅 2. Lógica de Selección Múltiple y Contigua (Mínimo 1 Hora)

El backend de negocio exige por regla estricta que **toda reserva tenga una duración mínima de 1 hora (60 minutos)**. 
Como las franjas horarias devueltas por la disponibilidad del backend pueden venir divididas en bloques (ej. de 30 minutos), el frontend debe permitir la selección de **múltiples celdas que sean contiguas en el tiempo**.

### ⚙️ Algoritmo de Selección (React State):

```typescript
interface Slot {
  horaInicio: string; // Formato "HH:mm" (ej. "08:00")
  horaFin: string;    // Formato "HH:mm" (ej. "08:30")
  precio: number;
  disponible: boolean;
}

// 1. Declarar el estado en tu componente de reservas
const [selectedSlots, setSelectedSlots] = useState<Slot[]>([]);

// 2. Manejador de click de cada franja horaria
const handleSlotClick = (s: Slot) => {
  if (!s.disponible) return;

  const isAlreadySelected = selectedSlots.some(x => x.horaInicio === s.horaInicio);

  if (isAlreadySelected) {
    // Si hace click en una ya seleccionada, limpia la selección para reiniciar fácilmente
    setSelectedSlots([]);
  } else if (selectedSlots.length === 0) {
    // Primera celda seleccionada
    setSelectedSlots([s]);
  } else {
    // Comprobar si la nueva celda hace frontera/contigüidad con alguna ya seleccionada
    const isContiguous = selectedSlots.some(
      x => x.horaFin === s.horaInicio || x.horaInicio === s.horaFin
    );

    if (isContiguous) {
      // Si es contigua, se añade a la selección y se ordena cronológicamente por hora de inicio
      setSelectedSlots([...selectedSlots, s].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio)));
    } else {
      // Si no es contigua, la toma como la nueva única celda inicial de selección
      setSelectedSlots([s]);
    }
  }
};
```

### ⏱️ Validación de la Duración de 1 Hora (Antes del Submit):

Para evitar que el backend de Spring Boot rechace la solicitud, calcula el rango total seleccionado y valida la diferencia:

```typescript
// Ordenar para extraer límites
const sorted = [...selectedSlots].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
const horaInicio = sorted[0].horaInicio;
const horaFin = sorted[sorted.length - 1].horaFin;
const totalPrecio = sorted.reduce((sum, s) => sum + s.precio, 0);

// Helper para convertir "HH:mm" a minutos totales del día
const parseTimeToMin = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

const duracionMinutos = parseTimeToMin(horaFin) - parseTimeToMin(horaInicio);
const esValido = duracionMinutos >= 60; // true si cubre 1 hora o más
```

---

## 📡 3. Integración de Endpoints del Backend

El flujo completo de reservas consta de los siguientes endpoints:

### Paso A: Crear Reserva (Estado Inicial: `PENDIENTE_PAGO`)
* **Endpoint:** `POST /api/reservas`
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Payload:**
```json
{
  "canchaId": 1,
  "fecha": "2026-05-18",
  "horaInicio": "08:00",
  "horaFin": "09:00",
  "metodoPago": "ONLINE"
}
```
* **Respuesta Exitosa (201):**
```json
{
  "id": 42,
  "canchaId": 1,
  "fecha": "2026-05-18",
  "horaInicio": "08:00",
  "horaFin": "09:00",
  "estado": "PENDIENTE_PAGO",
  "montoTotal": 120.0
}
```

### Paso B: Confirmar Pago Online con URL de Cloudinary
Si el usuario eligió `ONLINE`, debes subir el comprobante a Cloudinary primero, obtener la URL, y después invocar:
* **Endpoint:** `POST /api/pagos/online/confirmar`
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Payload:**
```json
{
  "reservaId": 42,
  "referencia": "https://res.cloudinary.com/djtmcf7xg/image/upload/v1234567/sport_preset/mi_comprobante.png"
}
```
* **Respuesta Exitosa (200):** Modifica el estado de la reserva. Queda lista para ser aprobada o rechazada por el administrador desde el panel de control.

---

### 🛡️ Pruebas QA Rápidas:
* Para validar el SMS OTP de registro/login de forma real, puedes usar el número verificado del encargado: **`+59168699904`**.
* Al solicitar OTP en la interfaz, se gatillará el servicio real de **Twilio SMS** enviando el código numérico de 6 dígitos a su celular.
