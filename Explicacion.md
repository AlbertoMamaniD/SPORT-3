# Arquitectura del Backend - SPORT 3 (Explicación Detallada)

Este documento ofrece un desglose profundo y exhaustivo de la arquitectura de software, los principios de diseño y los patrones aplicados en el backend de SPORT 3. Está basado 100% en el código fuente actual.

---

## 1. El Concepto Central: Arquitectura Hexagonal y Clean Architecture

El proyecto no utiliza la clásica (y anticuada) arquitectura de 3 capas (Controlador -> Servicio -> Repositorio). En su lugar, utiliza **Arquitectura Hexagonal (Puertos y Adaptadores)** junto con **Domain-Driven Design (DDD)**. 

La regla de oro de esta arquitectura es la **Regla de Dependencia**: El código de las capas internas no debe saber absolutamente nada de las capas externas. El dominio es sagrado y no tiene dependencias de Spring Boot, bases de datos, ni frameworks.

El código está organizado en 4 anillos o capas concéntricas:

### A) Capa de Dominio (`domain`) - *El Núcleo Sagrado*
Aquí viven las reglas de negocio puras. Si mañana cambias PostgreSQL por MongoDB, o Spring Boot por otro framework, esta capa **no debería sufrir ningún cambio**.
* **`model`**: Son las entidades reales del negocio (ej. `Usuario`, `Reserva`). Si revisas estas clases, verás que **no tienen** anotaciones como `@Entity`, `@Table` o `@Id`. Son clases de Java puro (POJOs) que contienen lógica de validación interna.
* **`service`**: Los "Servicios de Dominio" (ej. `CalculadorPrecioService`, `DisponibilidadService`). Encapsulan reglas de negocio complejas que involucran a múltiples entidades al mismo tiempo (ej. calcular el precio total cruzando la duración de una reserva, el precio base de la cancha y si es día feriado).
* **`repository`**: Aquí se definen las **interfaces** de los repositorios (ej. `UsuarioRepository`). En el dominio nosotros dictamos *el contrato* ("necesito un método para guardar un usuario"), pero no nos importa *cómo* se implementa.
* **`exception`**: Excepciones que hablan en lenguaje de negocio, no en lenguaje técnico (ej. `CanchaNoDisponibleException` en lugar de `SQLException`).

### B) Capa de Aplicación (`application`) - *El Orquestador*
Coordina el flujo de las operaciones utilizando los modelos del dominio. Sabe "qué" hay que hacer, pero delega el "cómo" a la infraestructura.
* **`usecase`**: Reemplaza a los clásicos "Services" gigantes. Sigue el Principio de Responsabilidad Única. Por ejemplo, en lugar de un `UsuarioService` con 20 métodos, tenemos `IniciarSesionUseCase`, `ValidarOtpUseCase`. Una clase = Una acción.
* **`command`**: Contiene objetos inmutables de transporte (ej. `CrearReservaCommand`). Empaquetan los datos de entrada para que el Caso de Uso los procese, separando los datos crudos del exterior de la lógica del núcleo.
* **`port`**: Son los "Puertos de Salida" (Outbound Ports). Son interfaces que definen cómo la aplicación quiere comunicarse con el mundo exterior (ej. `SmsPort`, `PagoOnlinePort`).

### C) Capa de Infraestructura (`infrastructure`) - *Los Detalles Técnicos*
Aquí vive todo el código que interactúa con el "mundo real" (bases de datos, APIs de terceros, seguridad de Spring).
* **`persistence`**:
  * **`entity`**: Entidades mapeadas para Hibernate (`UsuarioEntity`). Aquí sí están las anotaciones `@Table` y `@Column`.
  * **`jpa`**: Interfaces mágicas de Spring Data (`UsuarioJpaRepository`).
  * **`mapper`**: Clases súper importantes que traducen entre el mundo de la Base de Datos (`Entity`) y el mundo del Negocio (`Model`).
  * **`repository`**: Los "Adaptadores de Salida". Clases reales (`UsuarioRepositoryImpl`) que implementan las interfaces de la capa de Dominio.
* **`sms`**: Adaptadores para enviar SMS (`TwilioSmsAdapter` y `ConsoleSmsAdapter`). Implementan el `SmsPort`.
* **`security`**: Filtros de autenticación como `JwtAuthenticationFilter` y configuraciones de Spring Security.

### D) Capa de Interfaces (`interfaces`) - *Los Puntos de Entrada*
Son los "Adaptadores de Entrada" (Inbound Adapters). Escuchan al mundo exterior.
* **`rest`**: Controladores HTTP (`AuthController`). Exponen los endpoints de la API REST.
* **`dto`**: Clases para recibir (Requests) y enviar (Responses) datos en formato JSON a los clientes (Postman, React).

---

## 2. ¿Cómo fluye la información? (Ejemplo Práctico)

Para entenderlo a la perfección, veamos qué pasa cuando un usuario crea una reserva:

1. **El Usuario (React)** envía un JSON (`POST /api/reservas`).
2. **La Capa de Interfaces** (`ReservaController`) recibe el JSON y lo mapea a un `CrearReservaRequest` (DTO).
3. El Controller transforma ese Request en un **Command** (`CrearReservaCommand`) y llama al **UseCase** (`CrearReservaUseCase`).
4. **La Capa de Aplicación** (`CrearReservaUseCase`) recibe el Command. Extrae los datos y llama a los **Domain Services** (`DisponibilidadService`) para aplicar las reglas de negocio.
5. El UseCase crea una nueva instancia del **Model** puro (`Reserva.crear()`).
6. El UseCase le dice al puerto del **Domain Repository**: `reservaRepository.save(reserva)`.
7. Mágicamente, Spring Boot inyecta el adaptador de **Infraestructura** (`ReservaRepositoryImpl`).
8. El `ReservaRepositoryImpl` usa un **Mapper** para convertir el modelo puro `Reserva` en un `ReservaEntity`.
9. Finalmente, usa el `ReservaJpaRepository` para hacer el `INSERT` real en PostgreSQL.

---

## 3. La Inversión de Dependencia (DIP) Detallada

La Inversión de Dependencia (la "D" de SOLID) es el pilar de esta arquitectura. 

**El Problema sin DIP:**
Normalmente, la lógica de negocio (Application) llama directamente a la base de datos (Infrastructure). Si la base de datos cambia, la lógica de negocio se rompe.

**La Solución en SPORT 3 (Ejemplos Reales):**

**Caso 1: El Repositorio de Base de Datos (`UsuarioRepository`)**
1. El **Dominio** declara una interfaz: `interface UsuarioRepository`.
2. La **Aplicación** (`IniciarSesionUseCase`) utiliza esa interfaz. No sabe qué hay detrás.
3. La **Infraestructura** (`UsuarioRepositoryImpl`) implementa esa interfaz usando Spring Data JPA.
*¿Para qué sirve la inversión aquí?* Para que el negocio no sepa qué motor de base de datos se usa. Si cambiamos PostgreSQL por MongoDB, la lógica del caso de uso queda intacta; la Infraestructura depende del Dominio y no al revés.

**Caso 2: El Servicio de Mensajería SMS (`SmsPort`)**
1. La **Aplicación** define un puerto: `interface SmsPort`.
2. Los **Casos de Uso** utilizan este puerto para enviar códigos OTP.
3. La **Infraestructura** implementa este puerto a través de adaptadores reales (`TwilioSmsAdapter` y `ConsoleSmsAdapter`).
*¿Para qué sirve la inversión aquí?* Para desacoplar el sistema de proveedores de terceros. Si en el futuro Twilio sube precios y usamos Amazon SNS, solo creamos un nuevo adaptador. La capa de aplicación ni se entera del cambio.

**Caso 3: La Pasarela de Pagos (`PagoOnlinePort`)**
1. La **Aplicación** define el contrato: `interface PagoOnlinePort`.
2. Los **Casos de Uso** lo utilizan para dar la orden de procesar cobros.
3. La **Infraestructura** lo implementa a través de `PagoOnlineAdapter`.
*¿Para qué sirve la inversión aquí?* Para evitar que la lógica financiera se contamine con detalles técnicos (como URLs REST o llaves secretas de Stripe/PayPal). El caso de uso solo dice "cóbramelo" y delega el trabajo sucio a la infraestructura.

---

## 4. Patrones de Diseño Utilizados (A profundidad)

En todo el flujo mencionado, se aplican rigurosamente 7 patrones de diseño:

### 1. Factory Method (Método Fábrica)
* **Dónde está:** En los modelos de dominio (ej. `Usuario.registrar()`, `Usuario.reconstituir()`, `OtpToken.generar()`).
* **Para qué sirve:** En lugar de hacer un simple `new Usuario()` público, obligamos a usar métodos estáticos descriptivos. Esto permite aislar y validar reglas de negocio en el preciso instante en que "nace" el objeto. Además, separa semánticamente la "creación de un usuario nuevo en el sistema" de "la reconstrucción de un usuario que ya existía y fue sacado de la base de datos".

### 2. Repository Pattern (Patrón Repositorio)
* **Dónde está:** En `domain/repository` (las interfaces) y `infrastructure/persistence/repository` (las implementaciones).
* **Para qué sirve:** Crea una ilusión de que la base de datos es simplemente una colección de objetos en memoria. Evita que la capa de Aplicación tenga que escribir consultas SQL o se acople a métodos de Hibernate.

### 3. Adapter Pattern (Patrón Adaptador)
* **Dónde está:** En los puertos y sus implementaciones (ej. `TwilioSmsAdapter`).
* **Para qué sirve:** Convierte una interfaz incompatible en otra que el sistema espera. Twilio tiene su propia forma de enviar mensajes (`Message.creator(...)`). El adaptador envuelve esa lógica compleja de Twilio y la disfraza para que cumpla con nuestra simple interfaz interna `SmsPort`.

### 4. Mapper Pattern (Patrón Mapeador)
* **Dónde está:** En `infrastructure/persistence/mapper/`.
* **Para qué sirve:** Evita la contaminación de capas. Convierte un Objeto A en un Objeto B. Traduce el `Usuario` (Modelo limpio del negocio) en un `UsuarioEntity` (Modelo sucio de la base de datos con anotaciones JPA) sin que el negocio se entere.

### 5. Use Case Pattern / Command Pattern (Patrón Comando)
* **Dónde está:** En `application/usecase/` y `application/command/`.
* **Para qué sirve:** Garantiza el *Principio de Responsabilidad Única*. En vez de tener un "Servicio de Reservas" con 5000 líneas de código que hace de todo, tenemos objetos comando (`CrearReservaCommand`) que transportan la orden, hacia clases de uso específico (`CrearReservaUseCase`, `CancelarReservaUseCase`). Es fácil de leer, testear y mantener.

### 6. Strategy Pattern (Patrón Estrategia - vía Profiles)
* **Dónde está:** En la inyección de dependencias de `SmsPort` usando `@Profile("dev")` y `@Profile("!dev")`.
* **Para qué sirve:** Permite cambiar el comportamiento del sistema dinámicamente sin alterar el código que lo usa. El caso de uso siempre llama a `SmsPort.enviarOtp()`. Si arrancamos el servidor en `dev`, la estrategia inyectada imprime el SMS en consola (`ConsoleSmsAdapter`). Si arrancamos en `prod`, la estrategia inyectada envía el SMS real por red (`TwilioSmsAdapter`).

### 7. Data Transfer Object (DTO)
* **Dónde está:** En `interfaces/dto/` (ej. `LoginRequest`, `LoginResponse`).
* **Para qué sirve:** Son objetos "tontos" sin lógica que solo transportan datos. Sirven de barrera de protección: aseguran que nunca expongamos accidentalmente propiedades sensibles del modelo de base de datos (como contraseñas encriptadas o IDs internos) hacia el cliente web, y aseguran que solo aceptamos los campos exactos que nuestra API requiere.
