# 📘 nube1.md — ¿Por qué hicimos cada cosa? Explicación Detallada del Despliegue en Azure

> Este documento es el complemento de `nube.md`. Mientras que `nube.md` muestra **qué** comandos ejecutar, este archivo explica **por qué** tomamos cada decisión, cómo funciona por dentro, y qué responder si el ingeniero (docente/evaluador) te pregunta sobre algún punto concreto.

---

## 🧠 Concepto General: ¿Qué es Azure Container Apps y por qué lo usamos?

**Azure Container Apps** es un servicio de Azure (la nube de Microsoft) que permite ejecutar aplicaciones empaquetadas en contenedores Docker **sin tener que administrar servidores**. Es lo que se llama un servicio **PaaS (Platform as a Service)** o incluso **serverless para contenedores**.

### ¿Por qué elegimos Azure Container Apps y no otra opción?

| Alternativa | Por qué no la usamos |
|---|---|
| **Azure VM (máquina virtual)** | Requiere instalar y configurar todo manualmente (SO, Java, Node, etc.). Demasiado trabajo de infraestructura. |
| **Azure Kubernetes Service (AKS)** | Es muy potente pero excesivamente complejo para este proyecto. Requiere conocer Kubernetes a fondo. |
| **Azure App Service** | Buena opción, pero no maneja fácilmente múltiples contenedores relacionados (backend + BD + monitoreo juntos). |
| **Azure Container Apps ✅** | Diseñado exactamente para esto: correr varios contenedores relacionados con red interna, escalado automático, sin administrar servidores. |

En resumen: **Azure Container Apps nos da la potencia de Kubernetes sin su complejidad**, ideal para un proyecto académico con múltiples servicios.

---

## 🏗️ ¿Qué es un "Entorno" (Environment) en Azure Container Apps?

Cuando creamos el entorno con:
```powershell
az containerapp env create --name env-sport --resource-group DefaultResourceGroup-SCUS --location southcentralus --logs-destination none
```

Estamos creando una **red privada virtual** en la nube de Azure. Todos los contenedores que desplegamos dentro de este entorno (`env-sport`) pueden **hablar entre sí por nombre**, como si estuvieran en la misma red local, sin necesidad de exponer puertos al internet público.

**Analogía**: Imagina que el entorno es como una oficina con su propia red interna de WiFi. Las computadoras dentro de la oficina (los contenedores) se comunican entre sí libremente, pero desde afuera (internet) solo pueden acceder si tienen una puerta habilitada (ingress externo).

### ¿Por qué `--logs-destination none`?

Azure normalmente requiere crear un workspace de **Log Analytics** para guardar los logs de los contenedores. Esto implica costos adicionales y en algunas cuentas universitarias con **políticas de Azure restrictivas**, la creación de Log Analytics está bloqueada. Al poner `none`, le decimos a Azure: *"no guardes logs en ningún servicio externo"*, evitando errores de permisos y costos innecesarios. Los logs aún los podemos ver en tiempo real con `az containerapp logs show`.

---

## 📦 ¿Qué son los Proveedores de Azure y por qué los registramos?

```powershell
az provider register -n Microsoft.OperationalInsights --wait
az provider register -n Microsoft.App --wait
```

Azure organiza sus servicios en **"proveedores de recursos"**. Antes de usar un servicio por primera vez, Azure exige que lo "registres" en tu suscripción. Es como activar un módulo antes de usarlo.

- **`Microsoft.App`**: Es el proveedor de Azure Container Apps. Sin registrarlo, el comando de crear el entorno falla.
- **`Microsoft.OperationalInsights`**: Es el proveedor de Log Analytics (monitoreo de Azure). Aunque no lo usamos activamente, Azure Container Apps lo referencia internamente y puede fallar si no está registrado.
- **`--wait`**: Le decimos al comando que espere a que el registro termine antes de continuar. El registro puede tardar 1-2 minutos.

---

## 🗄️ Paso 2: ¿Por qué la Base de Datos usa TCP y no HTTP?

Esta es una de las preguntas más comunes. Cuando desplegamos PostgreSQL:

```powershell
az containerapp create `
  --name sport-db `
  --target-port 5432 `
  --ingress internal `
  ...
```

**PostgreSQL NO habla HTTP**. Es una base de datos relacional que usa su propio protocolo de comunicación llamado **PostgreSQL Wire Protocol**, que funciona sobre **TCP (Transmission Control Protocol)** en el puerto `5432`.

### ¿Qué diferencia hay entre TCP y HTTP?

| Característica | TCP | HTTP |
|---|---|---|
| **Nivel** | Capa de transporte (nivel bajo) | Capa de aplicación (nivel alto, construido sobre TCP) |
| **Uso típico** | Bases de datos, transferencia de archivos, protocolos propietarios | APIs web, páginas web, servicios REST |
| **Conexión** | Persistente (se mantiene abierta) | Usualmente sin estado (cada petición es independiente) |
| **Overhead** | Muy bajo, eficiente | Mayor overhead por cabeceras HTTP |

**HTTP en realidad viaja SOBRE TCP**, pero tiene un protocolo adicional encima. PostgreSQL usa TCP puro porque necesita una **conexión persistente y de baja latencia** para ejecutar consultas SQL con rapidez. No necesita el overhead de HTTP.

### ¿Por qué `--ingress internal`?

`internal` significa que este contenedor **NO tiene IP pública**. No se puede acceder desde internet. Solo los demás contenedores dentro del mismo entorno `env-sport` pueden conectarse a él.

**¿Por qué esto es importante?** **Seguridad**. La base de datos nunca debería estar expuesta al internet público. Si alguien externo pudiera conectarse directamente a `sport-db:5432` con las credenciales correctas, podría robar, borrar o modificar todos los datos. Al ser `internal`, solo el backend puede hablar con ella.

### ¿Por qué `--min-replicas 1 --max-replicas 1`?

Le decimos a Azure: "siempre mantén exactamente **1 instancia** de la base de datos corriendo". Las bases de datos **no se pueden escalar horizontalmente** de forma simple (no puedes tener 3 instancias de PostgreSQL con los mismos datos sin una configuración de replicación avanzada). Por eso fijamos el mínimo y máximo en 1.

---

## ⚙️ Paso 3: ¿Por qué el Backend necesita `stringtype=unspecified`?

En la URL de conexión del backend:
```
jdbc:postgresql://sport-db:5432/sport_db?stringtype=unspecified
```

El parámetro `stringtype=unspecified` le dice al **driver JDBC de PostgreSQL** (la librería Java que habla con la BD) que cuando envíe un String de Java a la base de datos, **no especifique el tipo de dato** en la comunicación.

### ¿Por qué esto importa?

Nuestra aplicación usa **tipos Enum** en Java (por ejemplo, `EstadoReserva.PENDIENTE`). En PostgreSQL, también creamos tipos Enum a nivel de base de datos. El problema surge así:

1. Java tiene un `String` con valor `"PENDIENTE"`.
2. El driver JDBC por defecto envía ese String como tipo `text` o `varchar` de PostgreSQL.
3. PostgreSQL tiene una columna de tipo `enum_estado_reserva` (un Enum propio).
4. PostgreSQL **rechaza** comparar o insertar un `varchar` en una columna de tipo Enum → **error de tipo incompatible**.

Con `stringtype=unspecified`, el driver envía el valor `"PENDIENTE"` **sin indicar el tipo**. Así PostgreSQL hace la conversión (coerción) automáticamente: ve el valor, ve que la columna es un Enum, y lo convierte solo. ✅

---

## 🌐 Paso 3: ¿Por qué el Backend es `--ingress external`?

A diferencia de la base de datos, el backend **sí necesita ser accesible desde internet**, porque:

1. El **frontend** (que corre en el navegador del usuario, no en el servidor) necesita hacer peticiones HTTP a la API REST del backend.
2. Nosotros (los desarrolladores) necesitamos poder llamar al backend directamente para probar endpoints.

Al poner `--ingress external`, Azure nos da una **URL pública HTTPS** (por ejemplo `https://sport-backend.whitebay-232ffa18.southcentralus.azurecontainerapps.io`) con certificado SSL gratuito incluido.

### ¿Por qué `--target-port 8080`?

Spring Boot por defecto escucha peticiones HTTP en el puerto `8080`. Le decimos a Azure: *"el tráfico que llegue a la URL pública, envíalo al puerto 8080 del contenedor"*.

**Nota interna**: Dentro de la red del entorno de Azure, los servicios con ingress se exponen automáticamente en el **puerto 80** (sin importar el `target-port`). Por eso Prometheus apunta a `sport-backend:80` y no a `sport-backend:8080`.

---

## 🖥️ Paso 4: ¿Por qué el Frontend se compila con la URL del Backend?

Esta es una diferencia fundamental entre un backend y un frontend:

### Backend (Spring Boot)
- Corre **en el servidor** (en Azure, en un contenedor).
- Puede leer variables de entorno en tiempo de ejecución.
- Cuando arranca, lee `SPRING_DATASOURCE_URL` del entorno → se conecta a la BD. ✅

### Frontend (React + Vite)
- El código JavaScript se compila a archivos estáticos (`.js`, `.html`, `.css`).
- Estos archivos se descargan al **navegador del usuario** (tu computadora, tu celular).
- El navegador NO tiene acceso a las variables de entorno del servidor.
- Las variables `VITE_API_URL` se **inyectan físicamente en el código JS durante la compilación** con Vite.

Por eso debemos:
1. Poner la URL del backend en `frontend/.env.production`.
2. Compilar (`docker build`) → en ese momento Vite reemplaza `import.meta.env.VITE_API_URL` por el valor real de la URL.
3. El JS resultante tiene la URL "hardcodeada" dentro.

**Conclusión**: Si el backend cambia de URL, debemos **recompilar y redesplegar el frontend** sí o sí. No basta con cambiar variables de entorno en Azure para el frontend.

### ¿Por qué `docker build --no-cache`?

Docker guarda en caché cada "capa" del Dockerfile para acelerar compilaciones futuras. Sin embargo, si solo cambiamos el archivo `.env.production` (que se copia con `COPY`), Docker podría usar la capa vieja en caché y NO incluir el nuevo valor de la URL. Con `--no-cache` forzamos que se reconstruya todo desde cero, garantizando que la URL más nueva quede grabada en la imagen.

---

## 📊 Paso 6: ¿Por qué implementamos Prometheus y Grafana?

### ¿Qué es Prometheus?

Prometheus es una herramienta de **monitoreo y recolección de métricas**. Funciona con un modelo **"pull"**: cada cierto tiempo (en nuestro caso cada 10 segundos), Prometheus va al backend y le pide (scraping) todos sus datos de rendimiento consultando el endpoint `/actuator/prometheus`.

Spring Boot con la dependencia `spring-boot-actuator` + `micrometer-registry-prometheus` expone automáticamente métricas como:
- Uso de memoria RAM (Heap y non-Heap de la JVM)
- Uso de CPU
- Número de peticiones HTTP y sus tiempos de respuesta
- Estado del pool de conexiones a la BD (HikariCP)

### ¿Qué es Grafana?

Grafana es una herramienta de **visualización de métricas**. Se conecta a Prometheus como fuente de datos y muestra la información en dashboards (paneles de control) con gráficos en tiempo real. También configuramos **alertas automáticas** que se disparan si algo supera umbrales críticos.

### ¿Por qué Prometheus es `--ingress internal`?

Prometheus no necesita ser accedido desde internet. Solo Grafana necesita consultarlo. Al ponerlo como `internal`:
1. No queda expuesto a internet (seguridad).
2. Grafana lo puede consultar internamente usando la URL `http://sport-prometheus` (dentro del mismo entorno).

### ¿Por qué Grafana sí es `--ingress external`?

Grafana es la **interfaz visual** que nosotros (los administradores/docentes) vemos en el navegador. Necesita ser accesible desde internet para poder visualizar los dashboards. Por eso es `external`.

### ¿Por qué usamos tags versionados para Grafana (`:v2`, `:v3`)?

Azure Container Apps detecta si una imagen cambió comparando el tag. Si siempre usamos `:latest`, Azure puede no detectar el cambio y no redesplegar el contenedor con la configuración nueva. Usando tags incrementales (`:v2`, `:v3`...) forzamos que Azure entienda que es una imagen diferente y actualice el despliegue.

---

## 🐳 ¿Por qué usamos Docker Hub y no Azure Container Registry?

Subimos nuestras imágenes a **Docker Hub** (`docker push swidenx520/...`) en lugar de a **Azure Container Registry (ACR)** porque:

1. **Docker Hub es gratuito** para imágenes públicas. ACR tiene costo mensual.
2. **No requiere configuración adicional** de credenciales en Azure. Azure Container Apps puede descargar imágenes públicas de Docker Hub directamente sin autenticación.
3. **Simplicidad**: Con `docker login` en nuestra máquina ya podemos subir imágenes, sin necesitar crear recursos adicionales en Azure.

---

## 🔒 ¿Por qué usamos variables de entorno para las credenciales?

En el comando de creación del backend pasamos cosas como:
```
JWT_SECRET="W/+HN1A8..."
TWILIO_AUTH_TOKEN="11544da..."
POSTGRES_PASSWORD="DBA123"
```

**Nunca debemos escribir contraseñas o claves directamente en el código fuente** (ni en `application.properties`, ni en el `Dockerfile`). Si el repositorio se hace público, esas credenciales quedan expuestas.

El patrón correcto es: el código lee la variable de entorno (`System.getenv("JWT_SECRET")` o Spring lo hace automáticamente con `${JWT_SECRET}`), y el valor real se inyecta en el momento del despliegue. Así el código puede estar en GitHub sin problema.

---

## 🌍 ¿Por qué elegimos la región `southcentralus`?

Las regiones de Azure determinan **dónde físicamente** se alojan los servidores. Elegimos `southcentralus` (Sur Central de Estados Unidos) porque:
1. Es una región con **soporte completo** de Azure Container Apps (no todos los servicios están en todas las regiones).
2. Es geográficamente más cercana a Bolivia que las regiones europeas o asiáticas, reduciendo la **latencia** (tiempo de respuesta).
3. Es una región estable y ampliamente disponible para cuentas de estudiantes de Azure.

---

## ❓ Preguntas que te puede hacer el Ingeniero — y cómo responderlas

### 🔴 Preguntas Fundamentales de Arquitectura

---

**P: ¿Por qué usaron Azure Container Apps y no una máquina virtual?**

> R: Porque las máquinas virtuales requieren configurar y mantener el sistema operativo, instalar Java, Node, PostgreSQL manualmente y gestionar actualizaciones de seguridad. Azure Container Apps nos permite desplegar nuestros contenedores Docker directamente, delegando toda la gestión de infraestructura a Azure. Nos ahorra tiempo y reduce errores de configuración.

---

**P: ¿Qué es un contenedor Docker y por qué lo usaron?**

> R: Un contenedor es un paquete que incluye la aplicación y todas sus dependencias (Java, librerías, configuraciones) en un entorno aislado. La ventaja es que si funciona en mi máquina, funciona igual en cualquier servidor. Eliminamos el problema de "en mi máquina sí corre". Usamos Docker porque Azure Container Apps trabaja nativamente con contenedores.

---

**P: ¿Por qué la base de datos usa el puerto 5432 y por qué TCP?**

> R: El puerto 5432 es el puerto estándar de PostgreSQL por convención internacional (como el 80 es de HTTP y el 443 de HTTPS). PostgreSQL usa TCP porque necesita una conexión persistente y confiable para ejecutar consultas SQL. TCP garantiza que los paquetes de datos lleguen completos y en orden, lo cual es crítico para operaciones en una base de datos transaccional.

---

**P: ¿Por qué la base de datos tiene ingress interno y no externo?**

> R: Por seguridad. Una base de datos nunca debe estar expuesta directamente a internet. Si cualquier persona pudiera conectarse al puerto 5432 desde internet, podría intentar ataques de fuerza bruta sobre las credenciales o explotar vulnerabilidades de PostgreSQL. Al ser `internal`, solo el backend (dentro del mismo entorno de Azure) puede acceder a ella.

---

**P: ¿Qué es el entorno de Azure Container Apps?**

> R: Es una red privada virtual aislada en la nube de Azure. Todos los contenedores dentro del mismo entorno se pueden comunicar entre sí por nombre de servicio (por ejemplo `sport-db`, `sport-backend`) sin necesidad de IPs públicas. Es similar a una red Docker local, pero gestionada por Azure en la nube.

---

**P: ¿Por qué el frontend necesita recompilarse si cambia la URL del backend?**

> R: Porque React con Vite compila todo el código JavaScript a archivos estáticos. Las variables de entorno como `VITE_API_URL` se inyectan durante la compilación, no en tiempo de ejecución. El resultado final es un archivo `.js` con la URL escrita dentro del código. El navegador descarga ese archivo estático y no tiene forma de leer variables de entorno del servidor de Azure.

---

**P: ¿Qué es `stringtype=unspecified` en la URL de conexión?**

> R: Es un parámetro del driver JDBC de PostgreSQL. Nuestro proyecto usa tipos Enum tanto en Java como en PostgreSQL. Sin este parámetro, el driver envía los valores String como tipo `varchar`, lo cual es incompatible con las columnas de tipo Enum de PostgreSQL. Con `stringtype=unspecified`, el driver no declara el tipo y PostgreSQL hace la conversión implícita automáticamente.

---

**P: ¿Por qué usaron Prometheus y Grafana en lugar del monitoreo nativo de Azure?**

> R: Prometheus y Grafana son herramientas de monitoreo **open source** ampliamente usadas en la industria, especialmente para aplicaciones Spring Boot. Spring Boot tiene integración nativa con Prometheus a través de Micrometer. Esto nos da control total sobre qué métricas monitorear y cómo visualizarlas, sin depender de un servicio propietario de Azure que tiene costo adicional.

---

**P: ¿Cómo funciona el scraping de Prometheus?**

> R: Prometheus funciona con un modelo "pull". Cada 10 segundos, Prometheus hace una petición HTTP GET al endpoint `/actuator/prometheus` del backend. Ese endpoint devuelve cientos de métricas en formato de texto plano (Prometheus text format). Prometheus almacena esos valores en su base de datos de series de tiempo y Grafana los consulta para graficarlos.

---

**P: ¿Por qué Prometheus apunta a `sport-backend:80` en lugar de `sport-backend:8080`?**

> R: Dentro del entorno de Azure Container Apps, todos los servicios con ingress (incluso `internal`) se exponen automáticamente en el **puerto 80** para comunicación interna, independientemente del `target-port` que configuramos. El `target-port 8080` indica a qué puerto del contenedor redirigir el tráfico, pero el nombre DNS interno siempre responde en el 80.

---

**P: ¿Qué son los proveedores de Azure y por qué los registran?**

> R: Son módulos de servicios de Azure que hay que habilitar explícitamente en tu suscripción antes de usar por primera vez. `Microsoft.App` es el proveedor de Container Apps y `Microsoft.OperationalInsights` es el de monitoreo. Sin registrarlos, los comandos de creación del entorno fallan con error de proveedor no encontrado.

---

**P: ¿Por qué usan `--min-replicas 1` y no dejan que escale a 0?**

> R: Porque servicios como la base de datos y el backend no pueden tener 0 réplicas. Si bajaran a 0, la aplicación estaría completamente caída. En Azure Container Apps, los servicios pueden escalar a 0 réplicas para ahorrar costos cuando no hay tráfico (serverless). Nosotros queremos que siempre haya al menos 1 instancia corriendo para garantizar disponibilidad.

---

**P: ¿Por qué suben las imágenes a Docker Hub y no a Azure Container Registry?**

> R: Docker Hub ofrece repositorios públicos gratuitos, mientras que Azure Container Registry tiene un costo mensual. Como nuestras imágenes no contienen secretos (las credenciales se pasan como variables de entorno, no se compilan dentro de la imagen), podemos hacer las imágenes públicas sin riesgo. Esto simplifica el proceso ya que Azure las descarga sin necesidad de autenticación adicional.

---

**P: ¿Qué garantiza el JWT en la autenticación?**

> R: JWT (JSON Web Token) es un token firmado digitalmente. Cuando el usuario hace login, el backend genera un JWT firmado con la clave `JWT_SECRET`. En cada petición posterior, el cliente envía ese token en el header `Authorization`. El backend verifica la firma con la misma clave sin consultar la base de datos, lo que hace la autenticación sin estado y escalable.

---

**P: ¿Qué hace Twilio en el proyecto?**

> R: Twilio es un servicio de comunicaciones. Lo usamos para implementar **OTP (One-Time Password)** por SMS en el registro de usuarios. Cuando un usuario se registra, el backend genera un código de 6 dígitos, lo almacena temporalmente y usa la API de Twilio para enviar un SMS al número del usuario. El usuario debe ingresar ese código para verificar su número real.

---

### 🟡 Preguntas de Decisiones de Diseño

---

**P: ¿Por qué eligieron microservicios en contenedores y no un monolito tradicional?**

> R: La arquitectura en contenedores permite desplegar, actualizar y escalar cada componente de forma independiente. Podemos actualizar el frontend sin tocar el backend, o escalar el backend sin cambiar la base de datos. Además, los contenedores garantizan portabilidad: la misma imagen funciona en desarrollo local y en Azure.

---

**P: ¿Cómo manejaron los datos persistentes de PostgreSQL en la nube?**

> R: Azure Container Apps gestiona el almacenamiento de los contenedores. Sin embargo, para producción real se recomendaría usar **Azure Database for PostgreSQL** (un servicio gestionado de BD) para garantizar respaldos automáticos y alta disponibilidad. En nuestro caso académico, los datos de PostgreSQL viven en el almacenamiento del contenedor que Azure gestiona.

---

**P: ¿Cómo aseguraron que el backend no arranque antes que la base de datos?**

> R: En el entorno local con Docker Compose usamos `depends_on` con `condition: service_healthy` y un healthcheck de PostgreSQL. En Azure Container Apps, el backend está configurado para reintentar la conexión a la BD con `restart: on-failure`. Si la BD tarda en iniciar, el backend fallará y Azure lo reiniciará automáticamente hasta que la BD esté lista.

---

**P: ¿Por qué usaron `--logs-destination none` al crear el entorno?**

> R: Azure normalmente crea un workspace de Log Analytics para centralizar logs, pero en algunas suscripciones universitarias de Azure hay políticas que restringen la creación de estos recursos. Al usar `none`, evitamos ese bloqueo. Los logs siguen siendo accesibles en tiempo real con `az containerapp logs show`, simplemente no se persisten en Log Analytics.

---

## 📋 Resumen de Decisiones Clave

| Decisión | Alternativa | ¿Por qué elegimos esto? |
|---|---|---|
| Azure Container Apps | VM / AKS / App Service | Equilibrio entre simplicidad y potencia, sin gestionar infraestructura |
| PostgreSQL interno (TCP 5432) | BD expuesta públicamente | Seguridad: la BD nunca debe estar en internet |
| Docker Hub | Azure Container Registry | Gratuito, simple, no requiere configuración extra |
| Frontend recompilado por URL | Variables de entorno en runtime | React/Vite compila a estáticos; las vars se inyectan en build time |
| `stringtype=unspecified` | Sin el parámetro | Compatibilidad entre Enums de Java y PostgreSQL |
| Prometheus + Grafana | Azure Monitor | Open source, integración nativa con Spring Boot, sin costo adicional |
| Prometheus interno | Prometheus externo | Solo Grafana necesita verlo; no hace falta exposición pública |
| `--logs-destination none` | Log Analytics | Evitar restricciones de políticas en cuentas universitarias |
| Tags versionados en Grafana | Tag `:latest` siempre | Forzar que Azure detecte el cambio y redespliegue |
| `min-replicas 1` | Escalar a 0 | Garantizar disponibilidad constante del servicio |
