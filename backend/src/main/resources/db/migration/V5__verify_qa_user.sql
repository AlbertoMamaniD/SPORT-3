-- V5: Activar de forma manual el usuario de pruebas QA (+59168699904) a verificado para evitar bloqueos del flujo de Login.
UPDATE usuario SET verificado = TRUE WHERE telefono = '+59168699904';
