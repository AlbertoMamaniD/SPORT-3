# 🛠️ Scripts de Diagnóstico y Generación de Carga (SPORT-3 Monitoring)

Este archivo contiene scripts prácticos en PowerShell y Bash para interactuar con los endpoints de métricas, diagnosticar el estado del monitoreo y simular tráfico (carga) en la aplicación para poblar con datos los tableros de Grafana.

---

## ⚡ 1. Generador de Tráfico (Poblar Grafana con Datos)

Si tu dashboard de Grafana muestra **"No data"**, suele ser porque el backend no ha recibido peticiones recientes y Prometheus no tiene métricas que mostrar. 

Ejecuta cualquiera de estos scripts para generar tráfico artificial continuo en el backend.

### Opción A: Script en PowerShell (Windows)
Abre PowerShell y ejecuta el siguiente bucle. Hará peticiones continuas al endpoint de autenticación cada segundo:

```powershell
# URL de tu backend en Azure
$BACKEND_URL = "https://sport-backend.whitebay-232ffa18.southcentralus.azurecontainerapps.io"

Write-Host "Iniciando simulador de tráfico hacia $BACKEND_URL..." -ForegroundColor Cyan
Write-Host "Presiona Ctrl+C para detener." -ForegroundColor Yellow

while ($true) {
    try {
        # Realizar petición de prueba al endpoint de login (fallará con 400/405 pero generará tráfico y logs)
        $response = Invoke-WebRequest -Uri "$BACKEND_URL/api/auth/login" -Method Post -Body '{"phone":"+123456789","code":"1234"}' -ContentType "application/json" -UseBasicParsing -ErrorAction SilentlyContinue
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Petición enviada..." -ForegroundColor Green
    }
    catch {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Petición registrada (error esperado de credenciales)..." -ForegroundColor Gray
    }
    Start-Sleep -Seconds 1
}
```

### Opción B: Script en Bash (Linux / macOS / Git Bash)
Si usas Git Bash o WSL, puedes correr este script:

```bash
#!/bin/bash
BACKEND_URL="https://sport-backend.whitebay-232ffa18.southcentralus.azurecontainerapps.io"

echo "Iniciando simulador de tráfico hacia $BACKEND_URL..."
echo "Presiona [CTRL+C] para detener."

while true; do
  curl -s -X POST "$BACKEND_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"phone":"+123456789","code":"1234"}' > /dev/null
  echo "[$(date +%H:%M:%S)] Petición enviada..."
  sleep 1
done
```

---

## 🔍 2. Scripts de Verificación de Endpoints

### 1. Comprobar Exposición de Métricas del Backend (Actuator)
Verifica que el endpoint de Prometheus del backend esté expuesto públicamente y retorne métricas en formato crudo de Prometheus (`prometheus-format`):

```powershell
curl https://sport-backend.whitebay-232ffa18.southcentralus.azurecontainerapps.io/actuator/prometheus
```

*Si el comando anterior responde con un listado largo de métricas como `jvm_memory_used_bytes...`, la exposición en el backend está **correcta**.*

### 2. Comprobar la Conectividad Interna de Prometheus
Dado que Prometheus está dentro de la red interna de Azure Container Apps, no puedes acceder a su interfaz web directamente desde Internet. Sin embargo, puedes ver si se está comunicando correctamente leyendo sus logs:

```powershell
# Ver logs de Prometheus
az containerapp logs show `
  --name sport-prometheus `
  --resource-group DefaultResourceGroup-SCUS `
  --follow
```

Busca en los logs líneas parecidas a:
* `component=scraper...` indicando si está obteniendo los datos correctamente de `sport-backend:80`.

---

## 🛠️ 3. Comandos Útiles de Mantenimiento y Reinicio

Si cambias la configuración y quieres reiniciar los servicios para forzar una recarga limpia del datasource de Grafana o la configuración de Prometheus:

```powershell
# Reiniciar Prometheus
az containerapp revision restart `
  --name sport-prometheus `
  --resource-group DefaultResourceGroup-SCUS

# Reiniciar Grafana
az containerapp revision restart `
  --name sport-grafana `
  --resource-group DefaultResourceGroup-SCUS
```
