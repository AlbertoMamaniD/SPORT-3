# 📁 CONTEXT.md — Descripción de la estructura del proyecto SPORT

Este documento describe la organización de carpetas y el contenido de cada una dentro del proyecto **SPORT** (Sistema de Reservas de Canchas Deportivas).

---

## 🗂 Estructura General

```
SPORT-3/
├── backend/                  → API REST (Spring Boot 3 / Java 21)
├── frontend/                 → Interfaz de usuario (React 19 + TypeScript + Vite)
├── uml/                      → Diagramas UML del sistema (PlantUML)
├── docker-compose.yml        → Orquestación de contenedores (DB + Backend + Frontend)
├── Sport.sql                 → Script SQL de referencia (esquema inicial)
├── .env.example              → Plantilla de variables de entorno
├── README.md                 → Instrucciones de instalación y ejecución
└── CONTEXT.md                → Este archivo — descripción de la estructura
```

---

## 🔧 `/backend`

API REST construida con **Spring Boot 3.4.1** y **Java 21**, siguiendo una **arquitectura hexagonal (Ports & Adapters)** con principios de **Domain-Driven Design (DDD)**.

```
backend/
├── Dockerfile                → Imagen Docker del backend (JDK 21)
├── pom.xml                   → Dependencias Maven (Spring Boot, JPA, Flyway, JWT, Twilio)
├── mvnw / mvnw.cmd           → Maven Wrapper para ejecutar sin instalar Maven
└── src/
    └── main/
        ├── java/bo/ucb/sport/
        │   ├── SportApplication.java         → Punto de entrada Spring Boot
        │   │
        │   ├── interfaces/                   → Capa de Interfaz (Adaptadores Primarios)
        │   │   ├── rest/                     → Controladores REST HTTP
        │   │   │   ├── CanchaController.java     → GET /api/canchas, GET /api/canchas/{id}/disponibilidad
        │   │   │   ├── ReservaController.java    → POST/GET/PUT/DELETE /api/reservas
        │   │   │   ├── PagoController.java       → POST /api/pagos/online|presencial|{id}/comprobante
        │   │   │   ├── AdminController.java      → /api/admin/** (dashboard, canchas, precios, reservas)
        │   │   │   └── AuthController.java       → POST /api/auth/register|verify-otp
        │   │   ├── dto/
        │   │   │   ├── request/              → DTOs de entrada (CrearReservaRequest, etc.)
        │   │   │   └── response/             → DTOs de salida (ReservaResponse, CanchaResponse, etc.)
        │   │   └── exception/
        │   │       └── GlobalExceptionHandler.java  → Manejo centralizado de errores (@RestControllerAdvice)
        │   │
        │   ├── application/                  → Capa de Aplicación (Casos de Uso)
        │   │   ├── command/                  → Objetos de comando (CrearReservaCommand, etc.)
        │   │   ├── port/                     → Puertos de salida (interfaces hacia infraestructura)
        │   │   │   ├── SmsPort.java              → Contrato para envío de SMS
        │   │   │   └── PagoOnlinePort.java        → Contrato para pasarela de pago
        │   │   └── usecase/                  → Casos de uso organizados por dominio
        │   │       ├── reserva/              → Crear, Ampliar, Cancelar, Historial, Disponibilidad
        │   │       ├── cancha/               → Crear, Editar, Desactivar
        │   │       ├── precio/               → Configurar precio
        │   │       └── pago/                 → Pago online, presencial, subir comprobante
        │   │
        │   ├── domain/                       → Núcleo de Dominio (sin dependencias externas)
        │   │   ├── model/                    → Entidades y value objects del dominio
        │   │   │   ├── reserva/              → Reserva (Agregado Raíz), ReservaId, FranjaHoraria, EstadoReserva
        │   │   │   ├── cancha/               → Cancha, TipoCancha
        │   │   │   ├── precio/               → Precio, DiaSemana
        │   │   │   ├── pago/                 → Pago, EstadoPago, ConceptoPago
        │   │   │   └── usuario/              → Usuario, Telefono, OtpToken, RolUsuario
        │   │   ├── repository/               → Puertos de dominio (interfaces de repositorio)
        │   │   │   ├── ReservaRepository.java
        │   │   │   ├── CanchaRepository.java
        │   │   │   ├── PrecioRepository.java
        │   │   │   ├── PagoRepository.java
        │   │   │   ├── UsuarioRepository.java
        │   │   │   └── OtpTokenRepository.java
        │   │   ├── service/                  → Servicios de dominio puros
        │   │   │   ├── CalculadorPrecioService.java  → Calcula monto según tarifa (feriado > día > general)
        │   │   │   └── DisponibilidadService.java    → Detecta conflictos de horario
        │   │   └── exception/                → Excepciones de dominio (CanchaNoDisponible, etc.)
        │   │
        │   └── infrastructure/               → Capa de Infraestructura (Adaptadores Secundarios)
        │       ├── persistence/              → Implementación JPA de los repositorios
        │       │   ├── entity/               → Entidades JPA (@Entity): CanchaJpa, ReservaJpa, etc.
        │       │   ├── jpa/                  → Repositorios Spring Data (extends JpaRepository)
        │       │   ├── mapper/               → Conversores entre entidades JPA y modelos de dominio
        │       │   └── repository/           → Implementaciones concretas de los puertos de dominio
        │       ├── sms/                      → Adaptadores de SMS y pago
        │       │   ├── ConsoleSmsAdapter.java    → Implementación dev: imprime OTP en consola
        │       │   ├── TwilioSmsAdapter.java     → Implementación prod: envía SMS real vía Twilio
        │       │   └── PagoOnlineAdapter.java    → Stub de pasarela de pago online
        │       ├── security/                 → Configuración JWT (JwtTokenProvider, JwtFilter, SecurityConfig)
        │       └── config/                   → Beans de Spring (WebConfig CORS, DomainConfig)
        │
        └── resources/
            ├── application.yml               → Configuración principal (perfiles dev/prod)
            └── db/migration/                 → Scripts Flyway (migraciones automáticas de BD)
```

---

## 🖥 `/frontend`

Interfaz de usuario construida con **React 19 + TypeScript + Vite**, también siguiendo una arquitectura por capas inspirada en hexagonal.

```
frontend/
├── index.html                → Punto de entrada HTML
├── vite.config.ts            → Configuración de Vite
├── package.json              → Dependencias npm (React, Axios, React Router)
└── src/
    ├── App.tsx               → Componente raíz con rutas (React Router)
    ├── main.tsx              → Punto de entrada React
    ├── index.css             → Estilos globales
    │
    ├── domain/
    │   └── model/
    │       └── types.ts      → Tipos TypeScript del dominio (interfaces y enums compartidos)
    │                           CanchaResponse, ReservaResponse, PrecioResponse,
    │                           EstadoReserva, MetodoPago, EstadoPago, DiaSemana, etc.
    │
    ├── infrastructure/
    │   └── api/              → Adaptadores HTTP (Axios)
    │       ├── axiosConfig.ts        → Instancia Axios con interceptor JWT automático
    │       ├── authService.ts        → Registro, verificación OTP
    │       ├── canchaService.ts      → Listar canchas, consultar disponibilidad
    │       ├── reservaService.ts     → Crear, ampliar, cancelar reservas, historial
    │       ├── adminService.ts       → Dashboard, gestión canchas/precios/reservas (admin)
    │       └── sportApi.ts           → Cliente genérico adicional
    │
    └── ui/
        ├── components/       → Componentes reutilizables globales
        │   └── SportsBalls/  → Animación decorativa de pelotas deportivas
        │
        └── pages/            → Páginas de la aplicación
            ├── Login/        → Pantalla de inicio de sesión (teléfono + OTP)
            ├── Register/     → Pantalla de registro de usuario
            ├── Dashboard/    → Panel principal del usuario
            │   └── components/
            │       ├── TabHome.tsx           → Vista de bienvenida
            │       ├── TabCanchas.tsx        → Explorar canchas y disponibilidad
            │       ├── TabReservas.tsx       → Historial de reservas del usuario
            │       ├── BookingModal.tsx      → Modal para crear nueva reserva
            │       ├── ExtendModal.tsx       → Modal para ampliar una reserva activa
            │       └── DashboardNavbar.tsx   → Barra de navegación del dashboard
            └── admin/        → Panel de administración
                ├── AdminDashboard/       → Vista principal del admin con estadísticas
                │   └── components/
                │       ├── StatsCard.tsx             → Tarjeta de métrica (ingresos, reservas, etc.)
                │       ├── ReservasAdminTable.tsx     → Tabla de todas las reservas con acciones
                │       └── QuickActions.tsx           → Acciones rápidas del admin
                ├── GestionCanchas/       → CRUD de canchas deportivas
                │   └── components/
                │       ├── CanchaTable.tsx        → Listado de canchas
                │       ├── CanchaFormModal.tsx    → Formulario crear/editar cancha
                │       └── ConfirmModal.tsx        → Modal de confirmación de eliminación
                └── GestionPrecios/       → Gestión de tarifas por cancha y día
                    └── components/
                        ├── PrecioTable.tsx        → Listado de precios configurados
                        └── PrecioFormModal.tsx    → Formulario de nueva tarifa
```

---

## 📐 `/uml`

Diagramas del sistema en formato **PlantUML** (`.puml`), listos para renderizar en [plantuml.com](https://www.plantuml.com/plantuml/uml/).

```
uml/
├── despliegue.puml     → Diagrama de Despliegue: nodos Docker, servicios externos, puertos
├── componentes.puml    → Diagrama de Componentes: arquitectura hexagonal completa (backend + frontend)
└── secuencia.puml      → Diagrama de Secuencia: flujo completo de reserva y pago
```

---

## 📄 Archivos en la raíz

| Archivo | Descripción |
|---|---|
| `README.md` | Instrucciones completas de instalación y ejecución (manual + Docker) |
| `CONTEXT.md` | Este archivo — descripción de carpetas y su contenido |
| `docker-compose.yml` | Orquesta 3 servicios: `db` (PostgreSQL), `app` (Spring Boot), `web` (React/nginx) |
| `Sport.sql` | Script SQL de referencia del esquema de base de datos |
| `.env.example` | Variables de entorno necesarias (DB, JWT, Twilio, Cloudinary) |
| `.gitignore` | Archivos excluidos del repositorio Git |
| `Implementacion.md` | Notas internas de implementación del proyecto |
| `QA_TEST_CASES.md` | Casos de prueba del sistema |
