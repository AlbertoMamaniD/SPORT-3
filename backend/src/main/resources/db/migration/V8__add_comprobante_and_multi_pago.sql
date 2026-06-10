-- ================================================================
--  V8 — Soporte de comprobantes de pago y pagos múltiples por reserva
--  Permite registrar el pago de la reserva inicial Y de ampliaciones
-- ================================================================

-- 1. Eliminar la restricción UNIQUE para permitir múltiples pagos por reserva
ALTER TABLE pago DROP CONSTRAINT IF EXISTS uq_pago_reserva;

-- 2. Crear el tipo ENUM para el concepto del pago
CREATE TYPE concepto_pago AS ENUM ('RESERVA_INICIAL', 'AMPLIACION');

-- 3. Añadir columnas nuevas a la tabla pago
ALTER TABLE pago
    ADD COLUMN concepto         concepto_pago   NOT NULL DEFAULT 'RESERVA_INICIAL',
    ADD COLUMN url_comprobante  VARCHAR(500)    NULL;

-- 4. Índice para consultar todos los pagos de una reserva de forma eficiente
CREATE INDEX idx_pago_reserva
    ON pago (reserva_id, concepto);
