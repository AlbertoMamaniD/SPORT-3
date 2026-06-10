-- Insertar administrador por defecto para pruebas de desarrollo
INSERT INTO usuario (nombre, telefono, rol, verificado, activo)
VALUES ('Admin Sport3', '+59177777777', 'ADMIN', TRUE, TRUE)
ON CONFLICT (telefono) DO NOTHING;
