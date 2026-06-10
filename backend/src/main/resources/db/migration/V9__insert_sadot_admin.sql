-- Insertar o actualizar a Sadot como administrador verificado
INSERT INTO usuario (nombre, telefono, rol, verificado, activo)
VALUES ('Sadot Torrejon', '+59177178898', 'ADMIN', TRUE, TRUE)
ON CONFLICT (telefono) DO UPDATE 
SET rol = 'ADMIN', 
    verificado = TRUE,
    nombre = 'Sadot Torrejon';
