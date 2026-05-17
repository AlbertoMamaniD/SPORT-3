-- =============================================================
--  V2 — Seed: Admin inicial + 6 canchas del complejo
-- =============================================================

INSERT INTO usuario (nombre, telefono, rol, verificado)
VALUES (
    'Administrador',
    '59100000000',
    'ADMIN',
    TRUE
);

INSERT INTO cancha (nombre, tipo, capacidad) VALUES
    ('Fútbol 1', 'FUTBOL', 10),
    ('Fútbol 2', 'FUTBOL', 10),
    ('Fútbol 3', 'FUTBOL', 10),
    ('Wally 1',  'WALLY',  12),
    ('Wally 2',  'WALLY',  12),
    ('Wally 3',  'WALLY',  12);
