-- Insertar administrador por defecto para pruebas de desarrollo
INSERT INTO usuario (nombre, telefono, rol, verificado, activo)
VALUES ('Admin Dotas', '+59177178898', 'ADMIN', TRUE, TRUE)
ON CONFLICT (telefono) DO NOTHING;
