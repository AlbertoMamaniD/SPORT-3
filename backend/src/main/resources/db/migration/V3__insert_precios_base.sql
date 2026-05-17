-- =============================================================
--  V3 — Seed: Precios base + tarifas fin de semana (fútbol)
-- =============================================================

-- Precio base: 50 Bs/hora para todas las canchas (07:00–23:00), cualquier día
INSERT INTO precio (cancha_id, precio_hora, hora_inicio, hora_fin)
SELECT id, 50.00, '07:00', '23:00'
FROM cancha;

-- Precio especial sábado y domingo para canchas de fútbol: 65 Bs/hora
INSERT INTO precio (cancha_id, precio_hora, hora_inicio, hora_fin, dia_semana)
SELECT id, 65.00, '07:00', '23:00', d.dia
FROM cancha
CROSS JOIN (
    VALUES ('SABADO'::dia_semana), ('DOMINGO'::dia_semana)
) AS d(dia)
WHERE tipo = 'FUTBOL';
