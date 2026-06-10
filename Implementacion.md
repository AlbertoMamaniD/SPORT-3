# SPORT — Sistema de Reservas de Canchas Deportivas

> **README técnico para agente de IA.** Este documento es la fuente de verdad para construir el sistema completo. Léelo íntegramente antes de generar cualquier código. Contiene arquitectura, estructura de carpetas, patrones, reglas de negocio, esquema de base de datos y contratos de API.

---

## Índice

1. [Visión del Producto](#1-visión-del-producto)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Arquitectura DDD — Capas y Responsabilidades](#3-arquitectura-ddd--capas-y-responsabilidades)
4. [Estructura de Carpetas](#4-estructura-de-carpetas)
5. [Dominio — Entidades, Value Objects y Agregados](#5-dominio--entidades-value-objects-y-agregados)
6. [Reglas de Negocio Invariantes](#6-reglas-de-negocio-invariantes)
7. [Casos de Uso (Application Layer)](#7-casos-de-uso-application-layer)
8. [Patrones de Diseño a Implementar](#8-patrones-de-diseño-a-implementar)
9. [Esquema de Base de Datos](#9-esquema-de-base-de-datos)
10. [Seguridad y Autenticación](#10-seguridad-y-autenticación)
11. [Contratos de API REST](#11-contratos-de-api-rest)
12. [Frontend — React SPA](#12-frontend--react-spa)
13. [Infraestructura y Despliegue](#13-infraestructura-y-despliegue)
14. [Orden de Implementación Recomendado](#14-orden-de-implementación-recomendado)

---

## 1. Visión del Producto

**SPORT** es una plataforma web full-stack para la gestión digital de reservas de un complejo deportivo ubicado en Tarija, Bolivia. El complejo cuenta con **3 canchas de fútbol** y **3 canchas de wally (vóleibol)**.

### Problema que resuelve

| Problema actual | Solución del sistema |
|---|---|
| Dobles reservas por gestión manual | Exclusión mutua a nivel de BD con `EXCLUDE USING GIST` |
| Sin visibilidad de disponibilidad | API de slots disponibles en tiempo real |
| Precios estáticos | Tarifas configurables por franja, día y feriado |
| Sin canal de confirmación | Notificaciones OTP y confirmación por SMS (Twilio) |
| Sin historial digital | Historial de reservas por usuario |

### Actores

- **Usuario (Cliente):** Se registra, verifica cuenta por SMS, consulta disponibilidad, crea/cancela/extiende reservas y paga.
- **Administrador:** Gestiona canchas, precios y reservas; registra pagos presenciales; accede al panel de control.
- **Sistema:** Envía OTP, confirma reservas por SMS, libera reservas expiradas.

---

## 2. Stack Tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Backend | Java + Spring Boot | Java 17, Spring Boot 3.x |
| Arquitectura | Domain-Driven Design (DDD) | — |
| ORM | Spring Data JPA + Hibernate | — |
| Base de datos | PostgreSQL | 15 |
| Migraciones BD | Flyway | — |
| Autenticación | JWT + Spring Security | — |
| SMS / OTP | Twilio (o AWS SNS como alternativa) | — |
| Frontend | React + Vite | React 18 |
| HTTP client (FE) | Axios | — |
| Contenedores | Docker + Docker Compose | — |
| Build | Maven | — |

---

## 3. Arquitectura DDD — Capas y Responsabilidades

El sistema implementa **cuatro capas DDD** estrictamente separadas. **La dependencia solo fluye hacia adentro**: Interfaces → Application → Domain ← Infrastructure.

```
┌─────────────────────────────────────────────────┐
│           INTERFACES (REST Controllers)         │  ← HTTP, JSON, DTOs de entrada/salida
├─────────────────────────────────────────────────┤
│           APPLICATION (Application Services)   │  ← Casos de uso, orquestación
├─────────────────────────────────────────────────┤
│           DOMAIN (Entities, Aggregates, VOs)    │  ← Lógica de negocio pura, sin frameworks
├─────────────────────────────────────────────────┤
│           INFRASTRUCTURE (JPA, SMS, etc.)       │  ← Implementaciones concretas
└─────────────────────────────────────────────────┘
```

### 3.1 Capa de Dominio (`domain/`)

- **No depende de ningún framework.** Cero imports de Spring, JPA o Hibernate aquí.
- Contiene: Entidades, Agregados, Value Objects, Domain Events, interfaces de Repositorios y excepciones de dominio.
- Es el núcleo que modela el negocio de reservas deportivas.

### 3.2 Capa de Aplicación (`application/`)

- Orquesta los casos de uso mediante **Application Services**.
- Llama a los repositorios (interfaces del dominio) y servicios del dominio.
- No contiene lógica de negocio; esa responsabilidad pertenece al dominio.
- Gestiona transacciones (`@Transactional`), coordinación de servicios externos (SMS, pagos).
- Expone **Commands** y **Queries** como objetos de entrada/salida.

### 3.3 Capa de Infraestructura (`infrastructure/`)

- Implementa las interfaces definidas en el dominio.
- Repositorios JPA con Spring Data, adaptadores de SMS (Twilio), adaptadores de pago.
- Contiene las entidades JPA (`@Entity`) y su mapeo a la BD; estas son distintas de las entidades de dominio.
- Configuraciones de Spring Security, JWT, CORS, Flyway.

### 3.4 Capa de Interfaces (`interfaces/`)

- Controllers REST (`@RestController`) con `@RequestMapping`.
- Reciben DTOs de request, delegan a Application Services, devuelven DTOs de response.
- **Cero lógica de negocio aquí.**
- Manejo global de excepciones mediante `@ControllerAdvice`.

---

## 4. Estructura de Carpetas

### 4.1 Raíz del repositorio

```
sport/
├── backend/                  # Spring Boot
├── frontend/                 # React + Vite
├── docker-compose.yml
├── .env                      # Variables de entorno (no commitear)
├── .env.example              # Plantilla de variables
└── README.md                 # Este archivo
```

### 4.2 Backend — estructura de paquetes

```
backend/
├── src/
│   └── main/
│       ├── java/bo/ucb/sport/
│       │   │
│       │   ├── domain/                          # CAPA DE DOMINIO (sin dependencias externas)
│       │   │   ├── model/
│       │   │   │   ├── usuario/
│       │   │   │   │   ├── Usuario.java          # Entidad de dominio (no @Entity JPA)
│       │   │   │   │   ├── OtpToken.java
│       │   │   │   │   ├── Telefono.java         # Value Object
│       │   │   │   │   └── RolUsuario.java       # Enum de dominio
│       │   │   │   ├── cancha/
│       │   │   │   │   ├── Cancha.java           # Entidad de dominio
│       │   │   │   │   ├── TipoCancha.java       # Enum de dominio
│       │   │   │   │   └── CanchaId.java         # Value Object (ID tipado)
│       │   │   │   ├── reserva/
│       │   │   │   │   ├── Reserva.java          # Agregado raíz
│       │   │   │   │   ├── FranjaHoraria.java    # Value Object (hora_inicio, hora_fin)
│       │   │   │   │   ├── EstadoReserva.java    # Enum de dominio
│       │   │   │   │   └── ReservaId.java        # Value Object (ID tipado)
│       │   │   │   └── precio/
│       │   │   │       ├── Precio.java           # Entidad de dominio
│       │   │   │       └── DiaSemana.java        # Enum de dominio
│       │   │   ├── repository/                  # INTERFACES (implementadas en infrastructure)
│       │   │   │   ├── UsuarioRepository.java
│       │   │   │   ├── OtpTokenRepository.java
│       │   │   │   ├── CanchaRepository.java
│       │   │   │   ├── ReservaRepository.java
│       │   │   │   └── PrecioRepository.java
│       │   │   ├── service/                     # Servicios de dominio puro
│       │   │   │   ├── DisponibilidadService.java
│       │   │   │   └── CalculadorPrecioService.java
│       │   │   ├── event/                       # Domain Events
│       │   │   │   ├── ReservaConfirmadaEvent.java
│       │   │   │   └── UsuarioVerificadoEvent.java
│       │   │   └── exception/                   # Excepciones de dominio
│       │   │       ├── CanchaNoDisponibleException.java
│       │   │       ├── OtpInvalidoException.java
│       │   │       ├── ReservaNoEncontradaException.java
│       │   │       └── UsuarioYaRegistradoException.java
│       │   │
│       │   ├── application/                     # CAPA DE APLICACIÓN
│       │   │   ├── usecase/
│       │   │   │   ├── auth/
│       │   │   │   │   ├── RegistrarUsuarioUseCase.java
│       │   │   │   │   ├── VerificarOtpUseCase.java
│       │   │   │   │   └── IniciarSesionUseCase.java
│       │   │   │   ├── reserva/
│       │   │   │   │   ├── CrearReservaUseCase.java
│       │   │   │   │   ├── AmpliarReservaUseCase.java
│       │   │   │   │   ├── CancelarReservaUseCase.java
│       │   │   │   │   ├── ConsultarDisponibilidadUseCase.java
│       │   │   │   │   └── ObtenerHistorialReservasUseCase.java
│       │   │   │   ├── cancha/
│       │   │   │   │   ├── CrearCanchaUseCase.java
│       │   │   │   │   ├── EditarCanchaUseCase.java
│       │   │   │   │   └── DesactivarCanchaUseCase.java
│       │   │   │   ├── precio/
│       │   │   │   │   └── ConfigurarPrecioUseCase.java
│       │   │   │   └── pago/
│       │   │   │       ├── RegistrarPagoPresencialUseCase.java
│       │   │   │       └── ProcesarPagoOnlineUseCase.java
│       │   │   ├── command/                     # Comandos de entrada (inmutables)
│       │   │   │   ├── RegistrarUsuarioCommand.java
│       │   │   │   ├── CrearReservaCommand.java
│       │   │   │   ├── AmpliarReservaCommand.java
│       │   │   │   └── ConfigurarPrecioCommand.java
│       │   │   ├── query/                       # Queries de lectura
│       │   │   │   ├── DisponibilidadQuery.java
│       │   │   │   └── HistorialReservasQuery.java
│       │   │   └── port/                        # Puertos de salida (interfaces de servicios externos)
│       │   │       ├── SmsPort.java              # Interface para SMS
│       │   │       └── PagoOnlinePort.java       # Interface para pasarela de pago
│       │   │
│       │   ├── infrastructure/                  # CAPA DE INFRAESTRUCTURA
│       │   │   ├── persistence/
│       │   │   │   ├── entity/                  # Entidades JPA (@Entity)
│       │   │   │   │   ├── UsuarioJpa.java
│       │   │   │   │   ├── OtpTokenJpa.java
│       │   │   │   │   ├── CanchaJpa.java
│       │   │   │   │   ├── PrecioJpa.java
│       │   │   │   │   ├── ReservaJpa.java
│       │   │   │   │   └── PagoJpa.java
│       │   │   │   ├── repository/              # Implementaciones JPA de los repos de dominio
│       │   │   │   │   ├── UsuarioRepositoryImpl.java
│       │   │   │   │   ├── CanchaRepositoryImpl.java
│       │   │   │   │   ├── ReservaRepositoryImpl.java
│       │   │   │   │   └── PrecioRepositoryImpl.java
│       │   │   │   ├── jpa/                     # Interfaces Spring Data JPA
│       │   │   │   │   ├── UsuarioJpaRepository.java
│       │   │   │   │   ├── CanchaJpaRepository.java
│       │   │   │   │   ├── ReservaJpaRepository.java
│       │   │   │   │   └── PrecioJpaRepository.java
│       │   │   │   └── mapper/                  # Mappers dominio ↔ JPA
│       │   │   │       ├── UsuarioMapper.java
│       │   │   │       ├── CanchaMapper.java
│       │   │   │       └── ReservaMapper.java
│       │   │   ├── sms/
│       │   │   │   ├── TwilioSmsAdapter.java    # Implementa SmsPort
│       │   │   │   └── TwilioConfig.java
│       │   │   └── security/
│       │   │       ├── JwtTokenProvider.java
│       │   │       ├── JwtAuthenticationFilter.java
│       │   │       └── SecurityConfig.java
│       │   │
│       │   └── interfaces/                      # CAPA DE INTERFACES (REST)
│       │       ├── rest/
│       │       │   ├── AuthController.java
│       │       │   ├── ReservaController.java
│       │       │   ├── CanchaController.java
│       │       │   ├── PrecioController.java
│       │       │   ├── PagoController.java
│       │       │   └── AdminController.java
│       │       ├── dto/
│       │       │   ├── request/
│       │       │   │   ├── RegistroUsuarioRequest.java
│       │       │   │   ├── VerificarOtpRequest.java
│       │       │   │   ├── LoginRequest.java
│       │       │   │   ├── CrearReservaRequest.java
│       │       │   │   ├── AmpliarReservaRequest.java
│       │       │   │   └── ConfigurarPrecioRequest.java
│       │       │   └── response/
│       │       │       ├── AuthResponse.java
│       │       │       ├── ReservaResponse.java
│       │       │       ├── CanchaResponse.java
│       │       │       ├── DisponibilidadResponse.java
│       │       │       ├── SlotHorarioResponse.java
│       │       │       └── ErrorResponse.java
│       │       └── exception/
│       │           └── GlobalExceptionHandler.java
│       │
│       └── resources/
│           ├── application.yml
│           ├── application-dev.yml
│           └── db/
│               └── migration/
│                   ├── V1__create_enums_and_tables.sql
│                   ├── V2__insert_admin_and_canchas.sql
│                   └── V3__insert_precios_base.sql
├── Dockerfile
└── pom.xml
```

### 4.3 Frontend — estructura de carpetas

```
frontend/
├── src/
│   ├── api/                      # Clientes Axios por recurso
│   │   ├── auth.api.js
│   │   ├── reservas.api.js
│   │   ├── canchas.api.js
│   │   └── admin.api.js
│   ├── components/               # Componentes reutilizables
│   │   ├── common/
│   │   │   ├── Navbar.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── reservas/
│   │   │   ├── CalendarioDisponibilidad.jsx
│   │   │   ├── SelectorFranja.jsx
│   │   │   └── TarjetaReserva.jsx
│   │   └── admin/
│   │       ├── PanelOcupacion.jsx
│   │       └── FormularioPrecio.jsx
│   ├── context/
│   │   └── AuthContext.jsx       # JWT en memoria (no localStorage)
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useDisponibilidad.js
│   │   └── useReservas.js
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── VerificarOtpPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── ReservarPage.jsx
│   │   ├── HistorialPage.jsx
│   │   └── admin/
│   │       ├── AdminDashboardPage.jsx
│   │       ├── GestionCanchasPage.jsx
│   │       └── GestionPreciosPage.jsx
│   ├── utils/
│   │   ├── dateHelpers.js
│   │   └── formatters.js
│   ├── App.jsx
│   └── main.jsx
├── vite.config.js
├── Dockerfile
└── package.json
```

---

## 5. Dominio — Entidades, Value Objects y Agregados

### 5.1 Mapa de Agregados

```
Agregado: Reserva (Aggregate Root)
  └── FranjaHoraria (Value Object)
  └── EstadoReserva (Enum)
  └── ReservaId (Value Object)

Agregado: Usuario
  └── Telefono (Value Object)
  └── RolUsuario (Enum)
  └── OtpToken (Entidad dentro del agregado)

Entidad: Cancha
  └── TipoCancha (Enum: FUTBOL, WALLY)
  └── CanchaId (Value Object)

Entidad: Precio
  └── FranjaHoraria (Value Object reutilizado)
  └── DiaSemana (Enum)
```

### 5.2 Entidades de Dominio (ejemplos de implementación esperada)

**`Reserva.java`** — Agregado raíz. Contiene la lógica de validación de duración mínima, bloques de 30 min y transición de estados.

```java
// bo/ucb/sport/domain/model/reserva/Reserva.java
public class Reserva {
    private ReservaId id;
    private Long usuarioId;
    private Long canchaId;
    private LocalDate fecha;
    private FranjaHoraria franja;         // Value Object
    private EstadoReserva estado;
    private BigDecimal montoTotal;

    // Constructor privado, factory method
    public static Reserva crear(Long usuarioId, Long canchaId,
                                 LocalDate fecha, FranjaHoraria franja,
                                 BigDecimal montoTotal) {
        validarFranja(franja);
        return new Reserva(null, usuarioId, canchaId, fecha, franja,
                           EstadoReserva.PENDIENTE, montoTotal);
    }

    public void confirmar() {
        if (this.estado != EstadoReserva.PENDIENTE)
            throw new IllegalStateException("Solo se puede confirmar una reserva PENDIENTE");
        this.estado = EstadoReserva.CONFIRMADA;
    }

    public void cancelar() {
        if (this.estado == EstadoReserva.CANCELADA)
            throw new IllegalStateException("La reserva ya está cancelada");
        this.estado = EstadoReserva.CANCELADA;
    }

    public Reserva ampliar(Duration extension, BigDecimal costoAdicional) {
        if (extension.toMinutes() % 30 != 0)
            throw new CanchaNoDisponibleException("La extensión debe ser en bloques de 30 minutos");
        FranjaHoraria nuevaFranja = franja.extender(extension);
        return new Reserva(this.id, usuarioId, canchaId, fecha, nuevaFranja,
                           estado, montoTotal.add(costoAdicional));
    }

    private static void validarFranja(FranjaHoraria franja) {
        if (franja.duracionEnMinutos() < 60)
            throw new IllegalArgumentException("Duración mínima es 1 hora");
        if (franja.duracionEnMinutos() % 30 != 0)
            throw new IllegalArgumentException("La duración debe ser en bloques de 30 minutos");
    }
}
```

**`FranjaHoraria.java`** — Value Object inmutable.

```java
// bo/ucb/sport/domain/model/reserva/FranjaHoraria.java
public record FranjaHoraria(LocalTime inicio, LocalTime fin) {
    public FranjaHoraria {
        Objects.requireNonNull(inicio);
        Objects.requireNonNull(fin);
        if (!fin.isAfter(inicio))
            throw new IllegalArgumentException("fin debe ser posterior a inicio");
    }

    public long duracionEnMinutos() {
        return Duration.between(inicio, fin).toMinutes();
    }

    public FranjaHoraria extender(Duration extra) {
        return new FranjaHoraria(inicio, fin.plus(extra));
    }

    public boolean seSolapa(FranjaHoraria otra) {
        return this.inicio.isBefore(otra.fin) && otra.inicio.isBefore(this.fin);
    }
}
```

**`Telefono.java`** — Value Object con validación.

```java
// bo/ucb/sport/domain/model/usuario/Telefono.java
public record Telefono(String valor) {
    public Telefono {
        if (valor == null || !valor.matches("^\\+?[0-9]{7,20}$"))
            throw new IllegalArgumentException("Número de teléfono inválido: " + valor);
    }
}
```

### 5.3 Interfaces de Repositorio (dominio)

```java
// bo/ucb/sport/domain/repository/ReservaRepository.java
public interface ReservaRepository {
    Reserva save(Reserva reserva);
    Optional<Reserva> findById(ReservaId id);
    List<Reserva> findByUsuarioId(Long usuarioId);
    List<Reserva> findActivasByCanchaIdAndFecha(Long canchaId, LocalDate fecha);
    boolean existeSolapamiento(Long canchaId, LocalDate fecha, FranjaHoraria franja);
}
```

```java
// bo/ucb/sport/domain/repository/UsuarioRepository.java
public interface UsuarioRepository {
    Optional<Usuario> findByTelefono(Telefono telefono);
    boolean existsByTelefono(Telefono telefono);
    Usuario save(Usuario usuario);
}
```

### 5.4 Servicio de Dominio

```java
// bo/ucb/sport/domain/service/CalculadorPrecioService.java
public class CalculadorPrecioService {
    public BigDecimal calcular(List<Precio> precios, LocalDate fecha,
                                FranjaHoraria franja) {
        // Lógica: precio base, variación por día de semana, variación por feriado
        // Prioridad: feriado > día de semana específico > precio base
    }
}
```

---

## 6. Reglas de Negocio Invariantes

Estas reglas **deben validarse en el dominio**, no en el controlador ni en el servicio de aplicación.

### Autenticación y Usuarios

| # | Regla |
|---|---|
| RN-01 | Un número de teléfono = una única cuenta. Validado con `UNIQUE` en BD y en `UsuarioRepository.existsByTelefono()`. |
| RN-02 | Todo usuario debe verificar su cuenta con OTP antes de iniciar sesión. |
| RN-03 | El código OTP es numérico de 6 dígitos. |
| RN-04 | El OTP expira en 5 minutos desde su creación (`expira_en = created_at + 5 min`). |
| RN-05 | Un OTP ya usado (`usado = TRUE`) no puede volver a utilizarse. |

### Reservas

| # | Regla |
|---|---|
| RN-06 | Duración mínima de reserva: **1 hora (60 minutos)**. |
| RN-07 | La duración debe ser en **múltiplos de 30 minutos** (1h, 1h30, 2h, …). |
| RN-08 | No se permiten solapamientos de reservas en la misma cancha y fecha. Validado con constraint `EXCLUDE USING GIST` en PostgreSQL Y en `DisponibilidadService.java`. |
| RN-09 | Solo canchas con `activa = TRUE` pueden reservarse. |
| RN-10 | Un usuario solo puede cancelar sus propias reservas (a menos que sea ADMIN). |
| RN-11 | La ampliación de reserva se realiza en bloques de **30 minutos** y solo si no hay solapamiento. |
| RN-12 | La franja horaria de operación es de **07:00 a 23:00**. |

### Precios

| # | Regla |
|---|---|
| RN-13 | Toda cancha debe tener al menos un precio base vigente. |
| RN-14 | Prioridad de precio: **feriado > día de semana específico > precio general**. |
| RN-15 | `precio_hora >= 0`. |

### Pagos

| # | Regla |
|---|---|
| RN-16 | Una reserva tiene exactamente un registro de pago (`UNIQUE` en `pago.reserva_id`). |
| RN-17 | Los métodos de pago son: `ONLINE` o `PRESENCIAL`. |
| RN-18 | Los estados de pago son: `PENDIENTE → COMPLETADO | RECHAZADO | REEMBOLSADO`. |

---

## 7. Casos de Uso (Application Layer)

Cada caso de uso es una clase con un único método público `execute(Command)`. Están anotadas con `@UseCase` (alias de `@Service`).

### 7.1 Autenticación

**`RegistrarUsuarioUseCase`**
1. Validar que el teléfono no exista → `UsuarioRepository.existsByTelefono()`
2. Crear entidad `Usuario` con `verificado = false`
3. Persistir con `UsuarioRepository.save()`
4. Generar OTP de 6 dígitos con expiración de 5 minutos
5. Persistir `OtpToken`
6. Enviar OTP vía `SmsPort.enviarOtp(telefono, codigo)`

**`VerificarOtpUseCase`**
1. Buscar OTP vigente y no usado para el `usuario_id`
2. Validar que `expira_en > NOW()` y `usado = false`
3. Comparar código ingresado
4. Marcar `usado = true`, marcar `usuario.verificado = true`
5. Retornar JWT con claims `{sub: userId, rol: USUARIO}`

**`IniciarSesionUseCase`**
1. Buscar usuario por teléfono
2. Verificar que `usuario.verificado = true` y `usuario.activo = true`
3. Generar y enviar nuevo OTP (login sin contraseña, solo OTP)
4. → Flujo continúa en `VerificarOtpUseCase`

### 7.2 Reservas

**`ConsultarDisponibilidadUseCase`**
- Input: `canchaId`, `fecha`
- Output: Lista de `SlotHorarioResponse` con estado DISPONIBLE/OCUPADO por cada bloque de 30 min entre 07:00 y 23:00
- Usa `ReservaRepository.findActivasByCanchaIdAndFecha()` y `CalculadorPrecioService`

**`CrearReservaUseCase`**
1. Obtener cancha; validar `activa = true`
2. Validar disponibilidad con `DisponibilidadService.verificar()`
3. Obtener precios vigentes y calcular `montoTotal` con `CalculadorPrecioService`
4. Crear `Reserva` vía factory method (valida reglas de dominio)
5. Persistir
6. Crear `Pago` en estado `PENDIENTE` con el método seleccionado
7. Publicar `ReservaConfirmadaEvent` → `SmsPort.enviarConfirmacion()`

**`AmpliarReservaUseCase`**
1. Obtener reserva; verificar que pertenece al usuario
2. Calcular nueva franja con la extensión solicitada
3. Verificar disponibilidad de la nueva franja
4. Llamar `reserva.ampliar(extension, costoAdicional)`
5. Persistir

**`CancelarReservaUseCase`**
1. Obtener reserva; verificar propietario (o rol ADMIN)
2. Llamar `reserva.cancelar()`
3. Persistir

### 7.3 Administración

**`ConfigurarPrecioUseCase`** — ADMIN only
- Crea o actualiza un registro en `precio` con franja, día de semana y/o flag de feriado

**`CrearCanchaUseCase`** / **`EditarCanchaUseCase`** / **`DesactivarCanchaUseCase`** — ADMIN only

**`RegistrarPagoPresencialUseCase`** — ADMIN only
1. Obtener pago por `reserva_id`
2. Actualizar `estado → COMPLETADO`, `metodo → PRESENCIAL`, `fecha_pago = NOW()`
3. Confirmar la reserva: `reserva.confirmar()`

---

## 8. Patrones de Diseño a Implementar

### 8.1 Repository Pattern

```java
// Interfaz en dominio:
public interface CanchaRepository {
    Optional<Cancha> findById(Long id);
    List<Cancha> findAllActivas();
    Cancha save(Cancha cancha);
}

// Implementación en infraestructura:
@Repository
public class CanchaRepositoryImpl implements CanchaRepository {
    private final CanchaJpaRepository jpa;
    private final CanchaMapper mapper;

    @Override
    public Optional<Cancha> findById(Long id) {
        return jpa.findById(id).map(mapper::toDomain);
    }
    // ...
}
```

### 8.2 Service Layer Pattern

```java
@Service                       // Spring gestiona ciclo de vida como Singleton
@Transactional
public class CrearReservaUseCase {
    private final ReservaRepository reservaRepository;
    private final CanchaRepository canchaRepository;
    private final DisponibilidadService disponibilidadService;
    private final CalculadorPrecioService calculadorPrecio;
    private final SmsPort smsPort;

    public ReservaResponse execute(CrearReservaCommand cmd) { ... }
}
```

### 8.3 DTO Pattern

- `*Request.java` → entrada desde el cliente. Validados con Bean Validation (`@NotNull`, `@NotBlank`, `@Pattern`, `@Future`, `@Size`).
- `*Response.java` → salida hacia el cliente. Nunca exponen entidades JPA directamente.
- `*Command.java` → entrada del controller al use case (inmutables, records).

### 8.4 Port & Adapter (Hexagonal para servicios externos)

```java
// Puerto (application layer):
public interface SmsPort {
    void enviarOtp(String telefono, String codigo);
    void enviarConfirmacion(String telefono, String mensaje);
}

// Adaptador (infrastructure layer):
@Component
public class TwilioSmsAdapter implements SmsPort {
    // Usa Twilio SDK
}
```

### 8.5 Global Exception Handler

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(CanchaNoDisponibleException.class)
    public ResponseEntity<ErrorResponse> handleCanchaNoDisponible(CanchaNoDisponibleException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(new ErrorResponse("CANCHA_NO_DISPONIBLE", ex.getMessage()));
    }

    @ExceptionHandler(OtpInvalidoException.class)
    public ResponseEntity<ErrorResponse> handleOtpInvalido(OtpInvalidoException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(new ErrorResponse("OTP_INVALIDO", ex.getMessage()));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleValidation(ConstraintViolationException ex) { ... }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) { ... }
}
```

### 8.6 Singleton Pattern (gestionado por Spring)

Todos los `@Service`, `@Repository`, `@Component` y `@Configuration` son Singletons por defecto. No instanciar manualmente con `new`. Usar inyección de constructor en todos los casos:

```java
// CORRECTO: inyección por constructor
public class MiServicio {
    private final OtroDependencia dep;
    public MiServicio(OtroDependencia dep) { this.dep = dep; }
}
// INCORRECTO: @Autowired en campo
```

### 8.7 Dependency Injection

Usar exclusivamente **inyección por constructor**. No usar `@Autowired` en campos. Declarar dependencias como `final`. Esto facilita las pruebas unitarias con mocks.

---

## 9. Esquema de Base de Datos

El script SQL definitivo está en `Sport.sql`. Flyway lo ejecuta en orden de versión. A continuación se describe el modelo para que el agente entienda el propósito de cada tabla.

### 9.1 Tipos ENUM de PostgreSQL

```sql
CREATE TYPE tipo_cancha    AS ENUM ('FUTBOL', 'WALLY');
CREATE TYPE rol_usuario    AS ENUM ('USUARIO', 'ADMIN');
CREATE TYPE estado_reserva AS ENUM ('PENDIENTE', 'CONFIRMADA', 'CANCELADA');
CREATE TYPE metodo_pago    AS ENUM ('ONLINE', 'PRESENCIAL');
CREATE TYPE estado_pago    AS ENUM ('PENDIENTE', 'COMPLETADO', 'RECHAZADO', 'REEMBOLSADO');
CREATE TYPE dia_semana     AS ENUM ('LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO','DOMINGO');
```

Mapear en JPA con `@Enumerated(EnumType.STRING)` y el tipo `PGEnum` cuando corresponda.

### 9.2 Tablas

| Tabla | Descripción clave |
|---|---|
| `usuario` | PK auto, `telefono` UNIQUE, `rol` enum, `verificado` bool |
| `otp_token` | FK → usuario, `codigo` CHAR(6), `expira_en` = now()+5min, `usado` bool |
| `cancha` | `nombre` UNIQUE, `tipo` enum, `activa` bool |
| `precio` | FK → cancha, `precio_hora`, franja horaria, `dia_semana` nullable, `es_feriado`, `vigente` |
| `reserva` | FK → usuario + cancha, `fecha` + `hora_inicio` + `hora_fin`, `estado` enum, constraint `no_solapamiento_reservas` con GIST |
| `pago` | FK → reserva UNIQUE (1:1), `metodo` enum, `estado` enum, `referencia` nullable |

### 9.3 Constraint crítico anti-solapamiento

```sql
CONSTRAINT no_solapamiento_reservas
    EXCLUDE USING GIST (
        cancha_id WITH =,
        fecha     WITH =,
        tsrange(
            fecha::TIMESTAMP + hora_inicio,
            fecha::TIMESTAMP + hora_fin,
            '[)'
        ) WITH &&
    ) WHERE (estado <> 'CANCELADA')
```

Este constraint garantiza **a nivel de base de datos** que no puedan existir dos reservas activas solapadas en la misma cancha. La capa de dominio también debe validarlo antes de intentar persistir (para dar un mensaje de error controlado).

### 9.4 Migraciones Flyway

```
db/migration/
├── V1__create_enums_and_tables.sql   # Tipos, extensiones, tablas, triggers, índices
├── V2__insert_admin_and_canchas.sql  # Admin inicial + 6 canchas
└── V3__insert_precios_base.sql       # Precios base + tarifas de fin de semana para fútbol
```

El contenido de V1, V2 y V3 se extrae directamente de `Sport.sql` dividiéndolo en secciones.

### 9.5 Datos iniciales (seeds)

```sql
-- Admin por defecto
INSERT INTO usuario (nombre, telefono, rol, verificado)
VALUES ('Administrador', '59100000000', 'ADMIN', TRUE);

-- 6 canchas
INSERT INTO cancha (nombre, tipo, capacidad) VALUES
    ('Fútbol 1', 'FUTBOL', 10), ('Fútbol 2', 'FUTBOL', 10), ('Fútbol 3', 'FUTBOL', 10),
    ('Wally 1', 'WALLY', 12), ('Wally 2', 'WALLY', 12), ('Wally 3', 'WALLY', 12);

-- Precio base: 50 Bs/hora para todas las canchas (07:00–23:00)
-- Precio fin de semana fútbol: 65 Bs/hora (SABADO y DOMINGO)
```

---

## 10. Seguridad y Autenticación

### 10.1 Flujo de autenticación

```
1. POST /api/auth/register   → crea usuario + envía OTP
2. POST /api/auth/verify-otp → valida OTP → devuelve JWT
3. POST /api/auth/login      → envía nuevo OTP
4. POST /api/auth/verify-otp → valida OTP → devuelve JWT
```

No existe contraseña. La autenticación es **100% OTP vía SMS**.

### 10.2 JWT

```yaml
# application.yml
jwt:
  secret: ${JWT_SECRET}          # Variable de entorno, mínimo 256 bits
  expiration-ms: 86400000        # 24 horas
```

Claims del token:
```json
{
  "sub": "42",
  "rol": "USUARIO",
  "iat": 1700000000,
  "exp": 1700086400
}
```

### 10.3 Endpoints protegidos

| Rol | Acceso |
|---|---|
| Público | `POST /api/auth/**` |
| `USUARIO` | `GET /api/canchas/**`, `GET /api/reservas/**`, `POST /api/reservas`, `DELETE /api/reservas/{id}`, `PUT /api/reservas/{id}/ampliar`, `POST /api/pagos/online` |
| `ADMIN` | Todo lo anterior + `POST/PUT/DELETE /api/admin/**`, `POST /api/pagos/presencial` |

### 10.4 Spring Security Config

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            );
        return http.build();
    }
}
```

---

## 11. Contratos de API REST

Base URL: `http://localhost:8080/api`

### 11.1 Autenticación

```
POST /auth/register
Body: { "nombre": "string", "telefono": "string" }
Response 201: { "mensaje": "OTP enviado al número registrado" }

POST /auth/verify-otp
Body: { "telefono": "string", "codigo": "string" }
Response 200: { "token": "JWT", "rol": "USUARIO|ADMIN", "nombre": "string" }

POST /auth/login
Body: { "telefono": "string" }
Response 200: { "mensaje": "OTP enviado" }
```

### 11.2 Canchas

```
GET  /canchas                      → Lista todas las canchas activas
GET  /canchas/{id}/disponibilidad?fecha=YYYY-MM-DD
     → Lista de slots cada 30min: [{hora, disponible, precio}]
```

### 11.3 Reservas

```
POST   /reservas
Body: { "canchaId": long, "fecha": "YYYY-MM-DD", "horaInicio": "HH:mm",
        "horaFin": "HH:mm", "metodoPago": "ONLINE|PRESENCIAL" }
Response 201: ReservaResponse

GET    /reservas/historial          → Reservas del usuario autenticado
PUT    /reservas/{id}/ampliar
Body: { "minutosExtra": 30 }
Response 200: ReservaResponse

DELETE /reservas/{id}               → Cancelar reserva propia
Response 204
```

### 11.4 Pagos

```
POST /pagos/online
Body: { "reservaId": long, "referencia": "string" }
Response 200: { "estado": "COMPLETADO" }

POST /pagos/presencial            [ADMIN]
Body: { "reservaId": long }
Response 200: { "estado": "COMPLETADO" }
```

### 11.5 Admin

```
GET    /admin/dashboard              → Estadísticas de ocupación
POST   /admin/canchas                → Crear cancha
PUT    /admin/canchas/{id}           → Editar cancha
DELETE /admin/canchas/{id}           → Desactivar cancha
POST   /admin/precios                → Configurar precio
PUT    /admin/reservas/{id}          → Editar cualquier reserva
DELETE /admin/reservas/{id}          → Cancelar cualquier reserva
```

### 11.6 Formato de error estándar

```json
{
  "codigo": "CANCHA_NO_DISPONIBLE",
  "mensaje": "La cancha Fútbol 1 ya tiene una reserva en el horario 18:00-19:00",
  "timestamp": "2026-04-15T18:23:00Z"
}
```

Códigos de error:
- `USUARIO_YA_REGISTRADO` → 409
- `OTP_INVALIDO` / `OTP_EXPIRADO` → 401
- `CANCHA_NO_DISPONIBLE` → 409
- `RESERVA_NO_ENCONTRADA` → 404
- `ACCESO_DENEGADO` → 403
- `VALIDACION_ERROR` → 400

---

## 12. Frontend — React SPA

### 12.1 Rutas

```jsx
<Routes>
  <Route path="/login"      element={<LoginPage />} />
  <Route path="/register"   element={<RegisterPage />} />
  <Route path="/verify-otp" element={<VerificarOtpPage />} />

  {/* Protegidas: requieren JWT */}
  <Route element={<ProtectedRoute />}>
    <Route path="/"          element={<DashboardPage />} />
    <Route path="/reservar"  element={<ReservarPage />} />
    <Route path="/historial" element={<HistorialPage />} />
  </Route>

  {/* Solo ADMIN */}
  <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
    <Route path="/admin"          element={<AdminDashboardPage />} />
    <Route path="/admin/canchas"  element={<GestionCanchasPage />} />
    <Route path="/admin/precios"  element={<GestionPreciosPage />} />
  </Route>
</Routes>
```

### 12.2 AuthContext

```jsx
// Almacenar JWT en memoria (no localStorage por seguridad XSS)
// Usar httpOnly cookies o estado React en memoria con refresh silencioso
const AuthContext = createContext();
export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);  // { id, nombre, rol }
  // ...
}
```

### 12.3 Configuración Axios

```js
// api/axiosClient.js
const client = axios.create({ baseURL: import.meta.env.VITE_API_URL });
client.interceptors.request.use(cfg => {
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
client.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) { /* redirigir a login */ }
    return Promise.reject(err);
  }
);
```

### 12.4 Variables de entorno

```
VITE_API_URL=http://localhost:8080/api
```

---

## 13. Infraestructura y Despliegue

### 13.1 `docker-compose.yml`

```yaml
version: '3.9'
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: sport
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d sport"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build: ./backend
    depends_on:
      db:
        condition: service_healthy
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/sport
      SPRING_DATASOURCE_USERNAME: ${DB_USER}
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      TWILIO_ACCOUNT_SID: ${TWILIO_ACCOUNT_SID}
      TWILIO_AUTH_TOKEN: ${TWILIO_AUTH_TOKEN}
      TWILIO_PHONE_NUMBER: ${TWILIO_PHONE_NUMBER}
    ports:
      - "8080:8080"

  web:
    build: ./frontend
    depends_on:
      - app
    ports:
      - "80:80"

volumes:
  pgdata:
```

### 13.2 `.env.example`

```env
DB_USER=sport_user
DB_PASSWORD=change_me_in_production
JWT_SECRET=change_me_min_256_bits_random_string
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+15017122661
```

### 13.3 `application.yml` (backend)

```yaml
spring:
  datasource:
    url: ${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/sport}
    username: ${SPRING_DATASOURCE_USERNAME:postgres}
    password: ${SPRING_DATASOURCE_PASSWORD:postgres}
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: validate          # Flyway gestiona el esquema; Hibernate solo valida
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true

jwt:
  secret: ${JWT_SECRET}
  expiration-ms: 86400000

twilio:
  account-sid: ${TWILIO_ACCOUNT_SID}
  auth-token: ${TWILIO_AUTH_TOKEN}
  phone-number: ${TWILIO_PHONE_NUMBER}

server:
  port: 8080
```

### 13.4 `pom.xml` — dependencias clave

```xml
<dependencies>
  <!-- Spring Boot Starters -->
  <dependency>org.springframework.boot:spring-boot-starter-web</dependency>
  <dependency>org.springframework.boot:spring-boot-starter-data-jpa</dependency>
  <dependency>org.springframework.boot:spring-boot-starter-security</dependency>
  <dependency>org.springframework.boot:spring-boot-starter-validation</dependency>

  <!-- PostgreSQL -->
  <dependency>org.postgresql:postgresql</dependency>

  <!-- Flyway -->
  <dependency>org.flywaydb:flyway-core</dependency>
  <dependency>org.flywaydb:flyway-database-postgresql</dependency>

  <!-- JWT -->
  <dependency>io.jsonwebtoken:jjwt-api:0.12.3</dependency>
  <dependency>io.jsonwebtoken:jjwt-impl:0.12.3</dependency>
  <dependency>io.jsonwebtoken:jjwt-jackson:0.12.3</dependency>

  <!-- Twilio SDK -->
  <dependency>com.twilio.sdk:twilio:10.1.0</dependency>

  <!-- Lombok (opcional, para reducir boilerplate en entidades JPA) -->
  <dependency>org.projectlombok:lombok</dependency>

  <!-- Test -->
  <dependency>org.springframework.boot:spring-boot-starter-test</dependency>
  <dependency>org.springframework.security:spring-security-test</dependency>
</dependencies>
```

---

## 14. Orden de Implementación Recomendado

El agente debe seguir este orden para garantizar que cada capa esté lista antes de ser consumida por la siguiente.

```
FASE 1 — Infraestructura base
  1.1 Configurar proyecto Spring Boot (pom.xml, application.yml)
  1.2 Crear docker-compose.yml y levantar PostgreSQL
  1.3 Crear migraciones Flyway (V1, V2, V3) desde Sport.sql
  1.4 Verificar que el esquema se crea correctamente

FASE 2 — Dominio (sin dependencias de framework)
  2.1 Crear Value Objects: Telefono, FranjaHoraria, ReservaId, CanchaId
  2.2 Crear Enums de dominio: TipoCancha, RolUsuario, EstadoReserva, MetodoPago, EstadoPago, DiaSemana
  2.3 Crear Entidades de dominio: Usuario, OtpToken, Cancha, Precio, Reserva
  2.4 Crear excepciones de dominio
  2.5 Crear interfaces de Repositorios
  2.6 Crear Servicios de dominio: CalculadorPrecioService, DisponibilidadService

FASE 3 — Infraestructura de persistencia
  3.1 Crear entidades JPA (@Entity) en infrastructure/persistence/entity/
  3.2 Crear interfaces Spring Data JPA
  3.3 Crear Mappers (dominio ↔ JPA)
  3.4 Implementar los Repository interfaces del dominio

FASE 4 — Seguridad
  4.1 JwtTokenProvider (generar y validar tokens)
  4.2 JwtAuthenticationFilter
  4.3 SecurityConfig
  4.4 Port SmsPort + Adaptador TwilioSmsAdapter

FASE 5 — Capa de Aplicación (Use Cases)
  5.1 Auth: RegistrarUsuarioUseCase, VerificarOtpUseCase, IniciarSesionUseCase
  5.2 Reservas: ConsultarDisponibilidadUseCase, CrearReservaUseCase
  5.3 Reservas: AmpliarReservaUseCase, CancelarReservaUseCase, ObtenerHistorialReservasUseCase
  5.4 Admin: CrearCanchaUseCase, EditarCanchaUseCase, DesactivarCanchaUseCase
  5.5 Precios: ConfigurarPrecioUseCase
  5.6 Pagos: RegistrarPagoPresencialUseCase, ProcesarPagoOnlineUseCase

FASE 6 — Capa de Interfaces (REST)
  6.1 DTOs Request y Response
  6.2 AuthController
  6.3 CanchaController + ReservaController
  6.4 PagoController
  6.5 AdminController
  6.6 GlobalExceptionHandler

FASE 7 — Frontend React
  7.1 Setup Vite + dependencias (axios, react-router-dom)
  7.2 AuthContext + axiosClient con interceptores
  7.3 Páginas de autenticación (Login, Register, VerificarOtp)
  7.4 DashboardPage + CalendarioDisponibilidad
  7.5 ReservarPage con selección de franja y pago
  7.6 HistorialPage
  7.7 Páginas de Admin (Dashboard, Canchas, Precios)

FASE 8 — Integración y Dockerización
  8.1 Dockerfile backend (multi-stage: build Maven → run JRE)
  8.2 Dockerfile frontend (build Vite → serve con nginx)
  8.3 nginx.conf con proxy_pass al backend para /api/*
  8.4 docker-compose.yml final con health checks
  8.5 Pruebas de integración end-to-end
```

---

## Notas finales para el agente

- **El dominio nunca importa Spring, JPA o Twilio.** Cualquier import de `org.springframework` o `jakarta.persistence` en el paquete `domain/` es un error de arquitectura.
- **Usar inyección por constructor en todos los componentes** Spring. No usar `@Autowired` en campos.
- **Flyway gestiona el esquema.** `spring.jpa.hibernate.ddl-auto` debe ser `validate`, nunca `create` ni `update` en ningún entorno.
- **El constraint GIST en PostgreSQL** es la última línea de defensa contra solapamientos. La capa de dominio también debe validarlo para dar mensajes de error amigables antes de que la BD rechace la transacción.
- **Los OTPs se generan con `SecureRandom`**, nunca con `Random`.
- **El JWT_SECRET nunca va en el código fuente.** Solo en variables de entorno.
- **Un número de teléfono = una cuenta.** Validar tanto en la lógica de dominio (`UsuarioRepository.existsByTelefono`) como en el constraint `UNIQUE` de la BD.
- **Para pruebas locales sin Twilio:** implementar un `ConsoleSmsAdapter` que loguea el OTP en consola, seleccionable por perfil Spring (`@Profile("dev")`).
