# 🏆 SPORT — Sistema de Reservas de Canchas Deportivas

¡Bienvenido al sistema **SPORT**! Este proyecto es una aplicación completa diseñada siguiendo principios de **Domain-Driven Design (DDD)** estricto en el backend y una interfaz dinámica y moderna en el frontend.

Este repositorio cuenta con la siguiente estructura:
- `/backend`: API REST construida con Spring Boot 3.4.1 y Java 21.
- `/frontend`: Interfaz de usuario interactiva construida con React 19 + TypeScript + Vite.

---

## 🛠️ Prerrequisitos

Antes de comenzar, asegúrate de tener instalado en tu máquina:
1. **Java Development Kit (JDK) 21** o superior.
2. **Node.js** (versión 18 o superior) junto con `npm` o `yarn`.
3. **PostgreSQL 15 o 16**.
4. *(Opcional)* **Docker** si deseas levantar todo con un solo comando.

---

## 🚀 Cómo correr el Backend (Spring Boot)

### 1. Preparar la Base de Datos
Asegúrate de que tu PostgreSQL local esté corriendo y crea una base de datos vacía llamada `sport`:
```sql
CREATE DATABASE sport;
```

### 2. Configurar las Credenciales
El archivo principal de configuración del backend está en `backend/src/main/resources/application.yml`.
De forma predeterminada, está configurado para desarrollo (`profiles.active: dev`) con los siguientes accesos de fallback:
- **Host / Puerto / BD:** `localhost:5432/sport`
- **Usuario:** `postgres`
- **Contraseña:** `DBA123` *(si tu contraseña es distinta, modifícala directamente en la línea 9 de `application.yml` o pásala como variable de entorno)*.

### 3. Levantar el Backend
Abre una terminal en la carpeta `/backend` y ejecuta:

```powershell
# En Windows (PowerShell)
cd backend
.\mvnw.cmd spring-boot:run

# En Linux o MacOS
cd backend
./mvnw spring-boot:run
```

> **💡 Nota de Desarrollo:** Como está activo el perfil `dev`, las migraciones de Flyway se aplicarán automáticamente cargando las tablas y las canchas por defecto, y los mensajes SMS de OTP no se enviarán a Twilio real. En su lugar, el sistema usará el **ConsoleSmsAdapter** e imprimirá los OTP en la consola del backend para que pruebes con cualquier número.

El backend estará escuchando en `http://localhost:8080`.

---

## 💻 Cómo correr el Frontend (React + Vite)

El frontend se comunica con el backend de forma dinámica. Para correrlo localmente:

### 1. Instalar las dependencias
Abre una terminal en la carpeta `/frontend` y ejecuta:

```bash
cd frontend
npm install
```

### 2. Iniciar el servidor de desarrollo
Una vez instaladas las dependencias, inicia la aplicación:

```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173`.

---

## 🐳 Método Alternativo: Correr todo con Docker Compose

Si tienes Docker instalado en tu máquina y prefieres levantar el ecosistema completo (Base de Datos + Backend + Frontend) sin configurar nada manualmente:

1. Renombra el archivo `.env.example` en la raíz a `.env` y edita las variables de entorno.
2. Abre la terminal en la raíz del proyecto (`c:/ARQUITECTURA`) y ejecuta:
```bash
docker-compose up --build
```
Docker se encargará de compilar, configurar e interconectar todo automáticamente.

---

## 🧪 Flujo Rápido de Prueba (Testing de Endpoints)

Para verificar que todo esté en orden, puedes usar un cliente HTTP (Postman, Bruno, DBeaver) o consola:

1. **Registrar un nuevo usuario:**
   Envía un `POST` a `http://localhost:8080/api/auth/register` con el body:
   ```json
   {
     "nombre": "Chango Perez",
     "telefono": "59170010020"
   }
   ```
2. **Obtener el OTP de la Consola:**
   Revisa los logs del backend y copia el código generado:
   ```log
   [DEV] OTP para 59170010020: XXXXXX
   ```
3. **Verificar el OTP:**
   Envía un `POST` a `http://localhost:8080/api/auth/verify-otp` con el body:
   ```json
   {
     "telefono": "59170010020",
     "codigo": "XXXXXX"
   }
   ```
   Recibirás el **JWT Token** que podrás enviar en el header `Authorization: Bearer <token>` para consumir los endpoints protegidos como `/api/canchas`.
