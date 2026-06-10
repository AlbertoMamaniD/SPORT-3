FROM grafana/grafana-oss:10.2.3

# Configurar credenciales por defecto (usuario: admin, contraseña: admin)
ENV GF_SECURITY_ADMIN_PASSWORD=admin
ENV GF_SECURITY_ADMIN_USER=admin
ENV GF_USERS_ALLOW_SIGN_UP=false

# Copiar archivos de aprovisionamiento
COPY provisioning /etc/grafana/provisioning

EXPOSE 3000
