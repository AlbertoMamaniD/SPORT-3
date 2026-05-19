-- Insertar canchas de prueba si no existen
INSERT INTO cancha (nombre, tipo, capacidad, activa)
VALUES 
    ('Fútbol 1', 'FUTBOL', 10, TRUE),
    ('Fútbol 2', 'FUTBOL', 10, TRUE),
    ('Fútbol 3', 'FUTBOL', 10, TRUE),
    ('Wally 1',  'WALLY',  12, TRUE),
    ('Wally 2',  'WALLY',  12, TRUE),
    ('Wally 3',  'WALLY',  12, TRUE)
ON CONFLICT (nombre) DO NOTHING;

-- Insertar precios base si no existen para cada cancha
INSERT INTO precio (cancha_id, precio_hora, hora_inicio, hora_fin, dia_semana, es_feriado, vigente)
SELECT c.id, 50.00, '07:00:00', '23:00:00', NULL, FALSE, TRUE
FROM cancha c
WHERE NOT EXISTS (
    SELECT 1 FROM precio p WHERE p.cancha_id = c.id AND p.hora_inicio = '07:00:00' AND p.hora_fin = '23:00:00' AND p.dia_semana IS NULL
);

-- Precio de fin de semana para fútbol (65.00)
INSERT INTO precio (cancha_id, precio_hora, hora_inicio, hora_fin, dia_semana, es_feriado, vigente)
SELECT c.id, 65.00, '07:00:00', '23:00:00', d.dia, FALSE, TRUE
FROM cancha c
CROSS JOIN (
    VALUES ('SABADO'::dia_semana), ('DOMINGO'::dia_semana)
) AS d(dia)
WHERE c.tipo = 'FUTBOL'
AND NOT EXISTS (
    SELECT 1 FROM precio p WHERE p.cancha_id = c.id AND p.hora_inicio = '07:00:00' AND p.hora_fin = '23:00:00' AND p.dia_semana = d.dia
);
