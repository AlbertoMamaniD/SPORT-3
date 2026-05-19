# 🧪 Plan de Pruebas QA (Experto) - Flujo de Autenticación SMS

¡Bienvenido al panel de QA, chango! Este plan está diseñado para validar el flujo completo de autenticación y envío real de SMS utilizando **Twilio** en nuestro entorno de producción (`prod`).

---

## 🟢 Test Case 01: Registro Exitoso con Envío de OTP Real (Happy Path)

**Objetivo:** Verificar que un nuevo usuario puede registrarse y recibir un código OTP real en su celular.
**Pre-condiciones:**
1. El backend debe estar corriendo con el perfil `prod` activo.
2. El número de teléfono de destino debe estar verificado en Twilio (por ser cuenta Trial).
3. El número de teléfono no debe existir previamente en la base de datos (o debe ser eliminado antes del test).

**Pasos de Ejecución (PowerShell):**
Abre una terminal y ejecuta el siguiente comando (¡reemplaza `+5917XXXXXXX` por tu celular real verificado en Twilio!):

```powershell
$body = @{ 
    nombre = "Tester QA"; 
    telefono = "+5917XXXXXXX" 
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method Post -Body $body -ContentType "application/json"
```

**Resultado Esperado:**
1. El servidor responde con `HTTP 201 Created`.
2. El JSON de respuesta indica: `{"mensaje": "OTP enviado al número registrado"}`.
3. **Validación Física:** ¡Tu celular debe vibrar y recibir un mensaje SMS de Twilio con el código de 6 dígitos!

---

## 🟡 Test Case 02: Fallo por Número No Verificado en Twilio Trial (Edge Case)

**Objetivo:** Verificar el comportamiento del sistema cuando Twilio rechaza el envío por restricciones de la cuenta de prueba.
**Pre-condiciones:** Backend corriendo en perfil `prod`.

**Pasos de Ejecución:**
Ejecuta el mismo script de registro del Test Case 01, pero usa un número de teléfono falso o que **NO** hayas verificado en Twilio (ejemplo: `+59170000000`).

**Resultado Esperado:**
1. El servidor debe atrapar la excepción de Twilio (`com.twilio.exception.ApiException: The number is unverified...`).
2. El sistema debe responder con `HTTP 500 Internal Server Error` (o el código manejado por nuestro GlobalExceptionHandler) indicando que hubo un error al enviar el SMS.
3. No se guarda el usuario ni el token falso en la BD.

---

## 🟢 Test Case 03: Inicio de Sesión y Generación de Nuevo OTP (Happy Path)

**Objetivo:** Validar que un usuario ya registrado puede volver a iniciar sesión y recibir un nuevo OTP real por SMS.
**Pre-condiciones:** El usuario ya debe existir en la BD (haber pasado el Test Case 01).

**Pasos de Ejecución:**
```powershell
$body = @{ 
    telefono = "+5917XXXXXXX" 
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $body -ContentType "application/json"
```

**Resultado Esperado:**
1. El servidor responde con `HTTP 200 OK`.
2. El JSON de respuesta indica: `{"mensaje": "OTP enviado"}`.
3. **Validación Física:** Recibes un nuevo SMS en tu celular con un nuevo código de 6 dígitos.

---

## 🟢 Test Case 04: Verificación de OTP (Happy Path)

**Objetivo:** Validar que el código recibido por SMS otorga acceso exitoso al sistema.
**Pre-condiciones:** Haber recibido el SMS del Test 01 o Test 03.

**Pasos de Ejecución:**
Reemplaza `+5917XXXXXXX` por tu celular y `123456` por el código exacto que te llegó por SMS:
```powershell
$body = @{ 
    telefono = "+5917XXXXXXX"; 
    codigo = "123456" 
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/auth/verify-otp" -Method Post -Body $body -ContentType "application/json"
```

**Resultado Esperado:**
1. El servidor responde con `HTTP 200 OK`.
2. El sistema devuelve el token JWT real:
```json
{
    "token": "eyJhbGci...",
    "rol": "USUARIO",
    "nombre": "Tester QA"
}
```

---

¡Ejecutá el **Test Case 01** en tu consola de PowerShell y contame si te llega el SMS a tu celular real! 📱🚀
