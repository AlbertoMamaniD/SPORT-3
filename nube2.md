# 📗 nube2.md — Cada Comando Explicado + Por Qué Esas Métricas y Alertas

> Complemento técnico de `nube.md` y `nube1.md`. Aquí se disecciona **cada parámetro de cada comando** usado en el despliegue y se explica en detalle **qué mide cada métrica y por qué pusimos cada alerta**.

---

## 📌 PARTE 1 — Explicación Línea a Línea de Cada Comando

---

### 🔑 Iniciar sesión

```powershell
docker login
```
| Parte | Qué hace |
|---|---|
| `docker` | Invoca la CLI de Docker instalada en tu máquina |
| `login` | Abre un prompt para ingresar usuario y contraseña de Docker Hub. Una vez autenticado, Docker guarda un token en tu máquina para que los próximos `push` funcionen sin pedir contraseña otra vez |

```powershell
az login
```
| Parte | Qué hace |
|---|---|
| `az` | Invoca la CLI de Azure (Azure Command Line Interface) |
| `login` | Abre el navegador para que inicies sesión con tu cuenta Microsoft/Azure. Luego guarda un token de sesión localmente. Sin esto, todos los comandos `az ...` fallarán con "no autenticado" |

---

### 📋 Paso 1 — Registrar Proveedores y Crear el Entorno

```powershell
az provider register -n Microsoft.OperationalInsights --wait
az provider register -n Microsoft.App --wait
```

| Parte | Qué hace |
|---|---|
| `az provider register` | Activa un servicio de Azure en tu suscripción. Es como "habilitar un módulo" antes de poder usarlo |
| `-n Microsoft.OperationalInsights` | El nombre del proveedor a registrar. Este es el servicio de Log Analytics (monitoreo de Azure). Se registra aunque no lo usemos activamente porque Container Apps lo referencia internamente |
| `-n Microsoft.App` | El proveedor de Azure Container Apps. Sin registrar esto, el entorno no se puede crear |
| `--wait` | Bloquea el terminal y espera a que el registro termine (puede tardar 1-2 min) antes de continuar. Sin esto, el siguiente comando podría fallar si el proveedor aún no está listo |

---

```powershell
az group create --name DefaultResourceGroup-SCUS --location southcentralus
```

| Parte | Qué hace |
|---|---|
| `az group create` | Crea un **Grupo de Recursos** en Azure. Un grupo de recursos es como una carpeta que agrupa todos los recursos del proyecto (contenedores, redes, etc.) para administrarlos juntos |
| `--name DefaultResourceGroup-SCUS` | El nombre que le damos al grupo. `SCUS` es abreviatura de South Central US (la región elegida) |
| `--location southcentralus` | La región de Azure donde se crean los servidores físicamente. Elegimos South Central US porque tiene soporte completo de Container Apps y es la más cercana a Bolivia |

---

```powershell
az containerapp env create `
  --name env-sport `
  --resource-group DefaultResourceGroup-SCUS `
  --location southcentralus `
  --logs-destination none
```

| Parte | Qué hace |
|---|---|
| `az containerapp env create` | Crea el **Entorno de Container Apps**: la red privada virtual donde vivirán todos los contenedores. Es como crear la oficina con su propio Wi-Fi interno |
| `--name env-sport` | El nombre del entorno. Todos los contenedores se desplegarán "dentro" de este entorno |
| `--resource-group DefaultResourceGroup-SCUS` | Le dice a Azure en qué grupo de recursos meter este entorno |
| `--location southcentralus` | La región física. Debe coincidir con la del grupo de recursos |
| `--logs-destination none` | Le dice a Azure que NO cree un workspace de Log Analytics para guardar logs. ¿Por qué? Porque en cuentas universitarias de Azure hay **políticas de seguridad** que bloquean la creación de Log Analytics. Sin este parámetro, el comando falla con error de permisos |

---

### 🗄️ Paso 2 — Desplegar la Base de Datos

```powershell
az containerapp create `
  --name sport-db `
  --resource-group DefaultResourceGroup-SCUS `
  --environment env-sport `
  --image postgres:15-alpine `
  --target-port 5432 `
  --ingress internal `
  --min-replicas 1 `
  --max-replicas 1 `
  --env-vars POSTGRES_USER=postgres POSTGRES_PASSWORD=DBA123 POSTGRES_DB=sport_db
```

| Parámetro | Qué hace |
|---|---|
| `az containerapp create` | Crea y despliega un nuevo contenedor dentro del entorno de Azure |
| `--name sport-db` | El nombre del contenedor. Este nombre también es el **hostname DNS** interno: otros contenedores pueden alcanzar esta BD escribiendo `sport-db` como dirección |
| `--resource-group DefaultResourceGroup-SCUS` | En qué grupo de recursos vive este contenedor |
| `--environment env-sport` | En qué entorno (red privada) se despliega. Debe ser el mismo entorno que el backend para que se puedan comunicar |
| `--image postgres:15-alpine` | La imagen Docker que se usa. `postgres:15-alpine` es la imagen oficial de PostgreSQL versión 15, basada en Alpine Linux (una distribución Linux muy liviana, ~5 MB) para que el contenedor ocupe menos espacio y arranque más rápido |
| `--target-port 5432` | El puerto interno del contenedor que Azure debe exponer. PostgreSQL escucha en el puerto estándar `5432` |
| `--ingress internal` | El contenedor **no tiene IP pública**. Solo es accesible desde dentro del mismo entorno `env-sport`. Máxima seguridad para la base de datos |
| `--min-replicas 1` | Siempre debe haber al menos 1 instancia corriendo. Sin esto Azure podría apagar el contenedor cuando no hay tráfico (escala a 0), dejando la BD sin servicio |
| `--max-replicas 1` | Máximo 1 instancia. Las BDs no se escalan horizontalmente de forma simple (requiere replicación avanzada). Fijamos el techo en 1 para evitar conflictos de datos |
| `--env-vars POSTGRES_USER=postgres ...` | Variables de entorno que la imagen de PostgreSQL lee al iniciar para crear el usuario, la contraseña y la base de datos. Son equivalentes al bloque `environment:` del docker-compose.yml |

---

### ⚙️ Paso 3 — Compilar y Desplegar el Backend

```powershell
docker build -t swidenx520/sport-backend:latest ./backend
```

| Parte | Qué hace |
|---|---|
| `docker build` | Lee el `Dockerfile` dentro de la carpeta indicada y construye una imagen Docker |
| `-t swidenx520/sport-backend:latest` | Le pone un **tag** (etiqueta) a la imagen. El formato es `usuario-dockerhub/nombre-imagen:version`. `latest` es la versión más reciente |
| `./backend` | La ruta al **contexto de construcción**: la carpeta que Docker "ve" durante el build. Debe contener el `Dockerfile` y los archivos del proyecto |

```powershell
docker push swidenx520/sport-backend:latest
```

| Parte | Qué hace |
|---|---|
| `docker push` | Sube la imagen local al repositorio remoto de Docker Hub |
| `swidenx520/sport-backend:latest` | El destino: usuario `swidenx520`, repositorio `sport-backend`, tag `latest`. Azure descargará la imagen de aquí |

---

```powershell
az containerapp create `
  --name sport-backend `
  --resource-group DefaultResourceGroup-SCUS `
  --environment env-sport `
  --image swidenx520/sport-backend:latest `
  --target-port 8080 `
  --ingress external `
  --min-replicas 1 `
  --max-replicas 1 `
  --env-vars `
    SPRING_DATASOURCE_URL="jdbc:postgresql://sport-db:5432/sport_db?stringtype=unspecified" `
    SPRING_DATASOURCE_USERNAME="postgres" `
    SPRING_DATASOURCE_PASSWORD="REDACTED_DB_PASSWORD" `
    SPRING_PROFILES_ACTIVE="prod" `
    JWT_SECRET="REDACTED_JWT_SECRET" `
    TWILIO_ACCOUNT_SID="REDACTED_TWILIO_ACCOUNT_SID" `
    TWILIO_AUTH_TOKEN="REDACTED_TWILIO_AUTH_TOKEN" `
    TWILIO_PHONE_NUMBER="+17017606598"
```

| Parámetro | Qué hace |
|---|---|
| `--name sport-backend` | Nombre del contenedor. También el hostname interno: `sport-backend` |
| `--image swidenx520/sport-backend:latest` | La imagen que subimos a Docker Hub en el paso anterior. Azure la descarga de allí |
| `--target-port 8080` | Spring Boot escucha en el puerto `8080`. Azure redirige el tráfico a este puerto del contenedor |
| `--ingress external` | Le da una **URL pública HTTPS** con certificado SSL gratuito. Necesario porque el frontend (en el navegador del usuario) debe poder llamar a la API REST |
| `SPRING_DATASOURCE_URL` | La URL JDBC de conexión a PostgreSQL. `sport-db:5432` funciona porque ambos contenedores están en el mismo entorno y `sport-db` se resuelve por DNS interno. `stringtype=unspecified` arregla el problema de los Enums (ver nube1.md) |
| `SPRING_DATASOURCE_USERNAME / PASSWORD` | Credenciales que definimos al crear el contenedor `sport-db` |
| `SPRING_PROFILES_ACTIVE="prod"` | Activa el perfil `prod` de Spring Boot. Esto hace que se lea `application-prod.properties` en lugar del de desarrollo, que puede tener configuraciones de logs más silenciosas, sin H2 en memoria, etc. |
| `JWT_SECRET` | Clave secreta para firmar los tokens JWT. Debe ser la misma en todas las instancias del backend. Si cambia, todos los tokens actuales quedan inválidos |
| `TWILIO_ACCOUNT_SID / AUTH_TOKEN / PHONE_NUMBER` | Credenciales de la cuenta Twilio para enviar SMS con los códigos OTP de verificación |

---

### 🖥️ Paso 4 — Desplegar el Frontend

```powershell
docker build --no-cache -t swidenx520/sport-frontend:latest ./frontend
```

| Parte | Qué hace |
|---|---|
| `docker build` | Construye la imagen Docker del frontend |
| `--no-cache` | Fuerza que Docker reconstruya **todas** las capas de la imagen desde cero, sin usar el caché. Imprescindible aquí porque el archivo `.env.production` (que contiene la URL del backend) puede haber cambiado. Sin `--no-cache`, Docker podría usar la capa vieja con la URL anterior |
| `-t swidenx520/sport-frontend:latest` | Tag de la imagen en Docker Hub |
| `./frontend` | Contexto de construcción: la carpeta del frontend que contiene el `Dockerfile` y el código React |

```powershell
az containerapp create `
  --name sport-frontend `
  --resource-group DefaultResourceGroup-SCUS `
  --environment env-sport `
  --image swidenx520/sport-frontend:latest `
  --target-port 80 `
  --ingress external `
  --min-replicas 1 `
  --max-replicas 1
```

| Parámetro | Qué hace |
|---|---|
| `--target-port 80` | El servidor web dentro del contenedor del frontend (Nginx) escucha en el puerto `80` (HTTP estándar). El `Dockerfile` del frontend usa Nginx para servir los archivos estáticos compilados de React |
| `--ingress external` | El frontend sí necesita URL pública: el usuario accede a la web desde su navegador |
| Sin `--env-vars` | El frontend **no recibe variables de entorno** porque la URL del backend ya fue inyectada en el código JavaScript durante el `docker build`. Las vars de entorno en runtime no sirven para React/Vite (ver nube1.md) |

---

### 📊 Paso 6 — Desplegar Prometheus

#### Dockerfile de Prometheus
```dockerfile
FROM prom/prometheus:v2.50.1
COPY prometheus.yml /etc/prometheus/prometheus.yml
EXPOSE 9090
```

| Línea | Qué hace |
|---|---|
| `FROM prom/prometheus:v2.50.1` | Usa la imagen oficial de Prometheus versión 2.50.1. Usamos una versión fija (no `latest`) para garantizar que el comportamiento no cambie si Prometheus saca una versión nueva |
| `COPY prometheus.yml /etc/prometheus/prometheus.yml` | Copia nuestro archivo de configuración personalizado al lugar donde Prometheus lo busca por defecto al arrancar |
| `EXPOSE 9090` | Documenta que el contenedor usa el puerto 9090 (Prometheus). Es informativo; el puerto real lo configura Azure con `--target-port` |

#### Archivo `prometheus.yml`
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'spring-actuator'
    metrics_path: '/actuator/prometheus'
    scrape_interval: 10s
    static_configs:
      - targets: ['sport-backend:80']
```

| Clave | Qué hace |
|---|---|
| `scrape_interval: 15s` (global) | Cada 15 segundos Prometheus recolecta métricas de todos sus targets por defecto |
| `evaluation_interval: 15s` | Cada 15 segundos evalúa las reglas de alerta (aunque aquí las alertas las maneja Grafana) |
| `job_name: 'spring-actuator'` | El nombre que identifica este grupo de targets en Prometheus. Aparece en las métricas como etiqueta `job="spring-actuator"` |
| `metrics_path: '/actuator/prometheus'` | La ruta HTTP donde Spring Boot expone las métricas (lo habilita la dependencia `micrometer-registry-prometheus`) |
| `scrape_interval: 10s` | Para este job específico, recolectamos cada 10 segundos (más frecuente que el global de 15s) para tener datos más granulares del backend |
| `targets: ['sport-backend:80']` | La dirección del backend. Dentro del entorno de Azure, el servicio `sport-backend` se resuelve en el puerto 80 interno (no el 8080 del contenedor) |

```powershell
az containerapp create `
  --name sport-prometheus `
  --target-port 9090 `
  --ingress internal `
  --min-replicas 1 `
  --max-replicas 1
```

| Parámetro | Qué hace |
|---|---|
| `--target-port 9090` | Prometheus expone su interfaz web y API en el puerto `9090` |
| `--ingress internal` | Prometheus no necesita ser accedido desde internet. Solo Grafana lo consulta internamente. Además, su interfaz web no tiene autenticación por defecto: si fuera público, cualquiera podría ver las métricas del sistema |

---

### 📈 Paso 6 — Desplegar Grafana

#### Dockerfile de Grafana
```dockerfile
FROM grafana/grafana-oss:10.2.3

ENV GF_SECURITY_ADMIN_PASSWORD=admin
ENV GF_SECURITY_ADMIN_USER=admin
ENV GF_USERS_ALLOW_SIGN_UP=false

COPY provisioning /etc/grafana/provisioning
EXPOSE 3000
```

| Línea | Qué hace |
|---|---|
| `FROM grafana/grafana-oss:10.2.3` | Imagen oficial de Grafana Open Source versión 10.2.3. Versión fija para evitar cambios inesperados |
| `ENV GF_SECURITY_ADMIN_PASSWORD=admin` | Establece la contraseña del usuario administrador. `GF_` es el prefijo que Grafana usa para leer configuración desde variables de entorno |
| `ENV GF_SECURITY_ADMIN_USER=admin` | Nombre del usuario administrador |
| `ENV GF_USERS_ALLOW_SIGN_UP=false` | Deshabilita el registro de nuevos usuarios desde la interfaz web. Solo el admin puede entrar |
| `COPY provisioning /etc/grafana/provisioning` | Copia toda la carpeta de aprovisionamiento (datasources, dashboards, alertas) al lugar donde Grafana las lee automáticamente al arrancar. Esto es lo que hace que Prometheus y las alertas aparezcan "ya configuradas" sin tener que hacerlo manualmente |

#### Archivo `datasource.yml`
```yaml
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    uid: prometheus-sport
    access: proxy
    url: http://sport-prometheus
    isDefault: true
```

| Clave | Qué hace |
|---|---|
| `apiVersion: 1` | Versión del esquema de aprovisionamiento de Grafana. Necesario para que Grafana entienda el formato |
| `name: Prometheus` | El nombre que aparece en la UI de Grafana para esta fuente de datos |
| `type: prometheus` | Le dice a Grafana qué driver usar para conectarse (protocolo de consulta de Prometheus) |
| `uid: prometheus-sport` | Un ID único interno que usamos en los archivos de alertas para referenciar esta fuente de datos (`datasourceUid: prometheus-sport`) |
| `access: proxy` | Grafana hace las consultas a Prometheus **desde el servidor**, no desde el navegador del usuario. Si fuera `browser`, el navegador del usuario intentaría conectarse a `http://sport-prometheus`, que es una dirección interna no accesible desde internet |
| `url: http://sport-prometheus` | La URL interna de Prometheus. Funciona porque ambos están en el mismo entorno de Azure. Sin `http://` ni puerto, usa el 80 (que es el puerto interno por defecto de Azure Container Apps) |
| `isDefault: true` | Esta es la fuente de datos predeterminada. Cuando creas un panel en Grafana sin especificar fuente, usa esta |

```powershell
docker build -t swidenx520/sport-grafana:v2 ./monitoring/grafana
docker push swidenx520/sport-grafana:v2
```

| Parte | Qué hace |
|---|---|
| `:v2` (tag versionado) | Usamos `:v2` en lugar de `:latest` porque Azure Container Apps compara el tag de la imagen para decidir si redesplegar. Con `:latest` podría no detectar el cambio. Con `:v2`, `:v3`, etc., forzamos que Azure vea una imagen "nueva" y actualice el contenedor |

---

### 🔄 Actualizaciones — `az containerapp update`

```powershell
az containerapp update --name sport-backend --resource-group DefaultResourceGroup-SCUS --image swidenx520/sport-backend:latest
```

| Parte | Qué hace |
|---|---|
| `az containerapp update` | Modifica un Container App existente sin eliminarlo ni recrearlo |
| `--name sport-backend` | El contenedor a actualizar |
| `--image swidenx520/sport-backend:latest` | Le dice que use esta nueva imagen. Azure descarga la imagen de Docker Hub y crea una nueva **revisión** del contenedor (Azure guarda el historial de revisiones para poder hacer rollback) |

---

### 🔍 Comandos de Diagnóstico

```powershell
az containerapp logs show --name sport-backend --resource-group DefaultResourceGroup-SCUS --follow
```

| Parte | Qué hace |
|---|---|
| `az containerapp logs show` | Muestra los logs (salida estándar) del contenedor en ejecución. Equivalente a `docker logs` en local |
| `--name sport-backend` | El contenedor cuyos logs queremos ver |
| `--follow` | Mantiene el stream de logs abierto en tiempo real (como `tail -f`). Sin este flag, solo muestra los logs históricos y termina |

---

```powershell
az containerapp list --resource-group DefaultResourceGroup-SCUS -o table
```

| Parte | Qué hace |
|---|---|
| `az containerapp list` | Lista todos los Container Apps en un grupo de recursos |
| `-o table` | Formatea la salida como tabla en lugar del JSON por defecto. Mucho más legible |

---

```powershell
az containerapp revision restart --name sport-backend --resource-group DefaultResourceGroup-SCUS --revision <nombre-revision>
```

| Parte | Qué hace |
|---|---|
| `az containerapp revision restart` | Reinicia una revisión específica del contenedor. Una **revisión** es una versión inmutable del contenedor. Azure crea una nueva revisión cada vez que actualizas la imagen o configuración |
| `--revision <nombre-revision>` | El nombre de la revisión a reiniciar. Se obtiene del listado de revisiones. Útil cuando el contenedor se colgó y necesitas forzar un reinicio sin desplegar una imagen nueva |

---

---

## 📌 PARTE 2 — Por Qué Esas Métricas y Esas Alertas

---

### 🔬 ¿Qué mide exactamente cada métrica de Prometheus?

Spring Boot con `micrometer-registry-prometheus` expone automáticamente decenas de métricas en `/actuator/prometheus`. Usamos estas 5 porque cubren las **4 áreas críticas** de cualquier aplicación web: CPU, Memoria, Red (HTTP) y Base de Datos.

---

#### Métrica 1: `process_cpu_usage`

```yaml
expr: process_cpu_usage
```

**¿Qué mide?**: El porcentaje de CPU que está usando el **proceso de la JVM** (la máquina virtual de Java que corre Spring Boot), expresado como un número entre 0 y 1 (donde 1 = 100%).

**¿Por qué es importante?**: Si la CPU está constantemente alta (>85%), significa que el backend está haciendo demasiado trabajo: puede ser un bucle infinito, consultas SQL sin índices, o simplemente que hay demasiados usuarios simultáneos y necesitamos escalar.

**¿Por qué el umbral fue 85% (`0.85`)?**: Por debajo del 85% la aplicación tiene margen para picos de carga. Encima del 85% sostenido (más de 2 minutos), la aplicación empieza a responder más lento y puede volverse inestable. No pusimos 100% porque para cuando llegue al 100% ya es demasiado tarde.

**Severidad: `warning`** (no `critical`) porque CPU alta no mata la app inmediatamente, pero hay que revisarla pronto.

---

#### Métrica 2: `jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"}`

```yaml
expr: jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"}
```

**¿Qué mide?**: El porcentaje de uso del **Heap de la JVM**. El Heap es la región de memoria RAM donde Java almacena todos los objetos creados por la aplicación (entidades, respuestas HTTP, caché, etc.). El resultado es un número entre 0 y 1.

**¿Qué es el Heap?**: Cuando tu código hace `new Reserva()`, ese objeto vive en el Heap. El **Garbage Collector (GC)** de Java periodicamente limpia los objetos que ya no se usan para liberar Heap. Si el GC no puede liberar suficiente memoria, la JVM lanza un `OutOfMemoryError` y el servidor **se cae**.

**¿Por qué el umbral fue 90% (`0.90`)?**: Por encima del 90%, el GC entra en modo pánico y empieza a ejecutarse muy frecuentemente, consumiendo mucha CPU y haciendo que la aplicación se vuelva lentísima (se llama "GC thrashing"). Si llega al 100%, `OutOfMemoryError` y el servidor muere.

**Severidad: `critical`** porque si el Heap llega al 100%, el servidor cae inmediatamente. Es una emergencia.

---

#### Métrica 3: `sum(rate(http_server_requests_seconds_count{status=~"5.."}[5m]))`

```yaml
expr: sum(rate(http_server_requests_seconds_count{status=~"5.."}[5m]))
```

**¿Qué mide?**: La **tasa de peticiones HTTP que devuelven error 5xx** (errores del servidor) por segundo, calculada como el promedio de los últimos 5 minutos.

**Desglose de la expresión PromQL**:
- `http_server_requests_seconds_count`: Contador total de peticiones HTTP recibidas (Spring Boot lo expone)
- `{status=~"5.."}`: Filtra solo las peticiones con código de estado HTTP que empiece en 5 (500, 502, 503, 504, etc.). El `=~` es un filtro por expresión regular, `5..` significa "5 seguido de cualquier 2 dígitos"
- `rate(...[5m])`: Calcula la tasa de cambio (peticiones por segundo) usando los últimos 5 minutos de datos
- `sum(...)`: Suma la tasa de todos los endpoints juntos

**¿Por qué es importante?**: Los errores 5xx son errores del servidor (bugs, excepciones no manejadas, base de datos caída). Un error 4xx (como 404) es culpa del cliente. Un 5xx es culpa nuestra.

**¿Por qué el umbral fue 0.05 (5 errores por 100 segundos)?**: Cero tolerancia con errores 5xx. Incluso 0.05 req/s significa que el backend está fallando sistemáticamente. Pusimos un umbral pequeño (no cero) para evitar falsos positivos por errores esporádicos de red.

**Severidad: `critical`** y tiempo de espera solo `1m` (no 2m) porque errores del servidor son urgentes.

---

#### Métrica 4: `http_server_requests_seconds_max`

```yaml
expr: http_server_requests_seconds_max
```

**¿Qué mide?**: El **tiempo máximo de respuesta** de cualquier petición HTTP en el último intervalo de recolección, en segundos. Ejemplo: si el endpoint más lento tardó 3.5 segundos, esta métrica vale 3.5.

**¿Por qué es importante?**: La velocidad de respuesta es una de las métricas más importantes para la experiencia del usuario. Una aplicación que tarda 5 segundos en responder es una mala aplicación, aunque técnicamente "funcione". Además, si un endpoint tarda demasiado, puede consumir threads del servidor y bloquear otras peticiones.

**¿Por qué el umbral fue 2 segundos?**: El estándar de la industria (Google lo menciona en sus guías de UX) es que una respuesta que tarda más de 2 segundos empieza a ser percibida como "lenta" por el usuario. Más de 3 segundos y los usuarios abandonan la página.

**Severidad: `warning`** porque latencia alta degrada la experiencia pero no mata la app inmediatamente.

---

#### Métrica 5: `hikaricp_connections_pending`

```yaml
expr: hikaricp_connections_pending
```

**¿Qué mide?**: El número de **threads del backend que están esperando** a que se libere una conexión del pool de base de datos de HikariCP.

**¿Qué es HikariCP?**: HikariCP (Hikari Connection Pool) es la librería que Spring Boot usa por defecto para gestionar conexiones a la base de datos. En lugar de abrir y cerrar una conexión nueva para cada consulta SQL (lo cual es lento), HikariCP mantiene un **pool (reserva)** de conexiones abiertas y las reutiliza.

**El problema**: Si el pool tiene 10 conexiones disponibles y llegan 15 peticiones simultáneas, las 5 que no consiguieron conexión quedan en espera (`pending`). Si el número de pendientes sube, significa que el pool está saturado: hay más demanda de BD de lo que el pool puede manejar. Si las peticiones esperan demasiado, Spring Boot lanza un `Connection Timeout Exception` y el usuario recibe un error 500.

**¿Por qué el umbral fue 3 conexiones pendientes?**: En condiciones normales, `hikaricp_connections_pending` debería ser 0 o casi 0. Que haya más de 3 esperando durante 1 minuto sostenido indica un problema real: consultas SQL lentas que no liberan la conexión a tiempo, o directamente que el pool es demasiado pequeño para la carga actual.

**Severidad: `critical`** y `for: 1m` porque conexiones agotadas llevan directamente a errores 500 en cascada para los usuarios.

---

### 📋 Resumen: Las 5 Alertas y Su Lógica

| # | Alerta | Métrica | Umbral | Tiempo | Severidad | ¿Qué detecta? |
|---|---|---|---|---|---|---|
| 1 | High CPU Usage | `process_cpu_usage` | > 85% | 2 min | ⚠️ warning | Servidor sobrecargado o código ineficiente |
| 2 | High JVM Heap Memory | `jvm_memory_used/max` | > 90% | 2 min | 🔴 critical | Riesgo inminente de OutOfMemoryError y caída del servidor |
| 3 | High HTTP 5xx Error Rate | `rate(http 5xx[5m])` | > 0.05/s | 1 min | 🔴 critical | El backend está fallando con errores internos |
| 4 | High HTTP Response Latency | `http_seconds_max` | > 2s | 2 min | ⚠️ warning | Los usuarios experimentan respuestas lentas |
| 5 | Hikari DB Pool Exhausted | `hikaricp_connections_pending` | > 3 | 1 min | 🔴 critical | El pool de BD está saturado, inminentes errores 500 |

### ¿Por qué estas 5 y no otras?

Estas 5 cubren las **causas raíz más comunes de fallas en una aplicación Spring Boot**:

1. **CPU** → El servidor no tiene suficiente poder de cómputo
2. **Heap/Memoria** → La aplicación tiene un memory leak o maneja demasiados datos en RAM
3. **Errores 5xx** → Hay un bug o una dependencia (BD, Twilio) que está fallando
4. **Latencia** → Consultas SQL lentas, falta de índices, o lógica de negocio ineficiente
5. **Pool de BD** → Cuello de botella en la capa de persistencia, el eslabón más lento de la cadena

Juntas forman un **sistema de alerta en capas**: si la BD falla → alertas 5 y 3 disparan. Si hay un memory leak → alertas 2 y 1 disparan. Si el código es ineficiente → alertas 4 y 1 disparan. Siempre hay una alerta que apunta al origen del problema.

---

### ⏱️ ¿Por qué el `for: 2m` o `for: 1m` en las alertas?

El campo `for` es el **tiempo que debe sostenerse la condición** antes de que la alerta se active. Por ejemplo, `for: 2m` significa: "si la CPU supera el 85% de forma continua durante 2 minutos, entonces manda la alerta".

**¿Por qué no alertar inmediatamente (for: 0)?** Porque los sistemas de producción tienen picos normales y breves. La CPU puede subir al 95% durante 10 segundos cuando arranca la JVM y eso es completamente normal. Sin el `for`, recibirías alertas falsas constantemente. El `for` filtra el ruido y solo alerta cuando el problema es real y sostenido.

**Alertas críticas usan `for: 1m`** (errores 5xx, pool de BD) porque son urgentes y no queremos esperar 2 minutos para enterarnos de que el backend está fallando.

**Alertas de warning usan `for: 2m`** (CPU, latencia) porque tienen más tolerancia; el sistema puede recuperarse solo de estos picos.
