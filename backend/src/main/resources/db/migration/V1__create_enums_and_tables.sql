-- =============================================================
--  V1 — Enums, extensiones, tablas, triggers e índices
--  SPORT – Sistema de Reservas de Canchas Deportivas
-- =============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

CREATE TYPE tipo_cancha    AS ENUM ('FUTBOL', 'WALLY');
CREATE TYPE rol_usuario    AS ENUM ('USUARIO', 'ADMIN');
CREATE TYPE estado_reserva AS ENUM ('PENDIENTE', 'CONFIRMADA', 'CANCELADA');
CREATE TYPE metodo_pago    AS ENUM ('ONLINE', 'PRESENCIAL');
CREATE TYPE estado_pago    AS ENUM ('PENDIENTE', 'COMPLETADO', 'RECHAZADO', 'REEMBOLSADO');
CREATE TYPE dia_semana     AS ENUM ('LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO','DOMINGO');

CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- ── USUARIO ──────────────────────────────────────────────────
CREATE TABLE usuario (
    id             BIGSERIAL        PRIMARY KEY,
    nombre         VARCHAR(100)     NOT NULL,
    telefono       VARCHAR(20)      NOT NULL,
    rol            rol_usuario      NOT NULL DEFAULT 'USUARIO',
    verificado     BOOLEAN          NOT NULL DEFAULT FALSE,
    activo         BOOLEAN          NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ      NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_usuario_telefono UNIQUE (telefono)
);

CREATE TRIGGER trg_usuario_updated_at
    BEFORE UPDATE ON usuario
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ── OTP TOKEN ────────────────────────────────────────────────
CREATE TABLE otp_token (
    id          BIGSERIAL    PRIMARY KEY,
    usuario_id  BIGINT       NOT NULL,
    codigo      VARCHAR(6)   NOT NULL,
    expira_en   TIMESTAMPTZ  NOT NULL,
    usado       BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_otp_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario (id)
        ON DELETE CASCADE
);

CREATE INDEX idx_otp_usuario_vigente
    ON otp_token (usuario_id, expira_en DESC)
    WHERE usado = FALSE;

-- ── CANCHA ───────────────────────────────────────────────────
CREATE TABLE cancha (
    id          BIGSERIAL    PRIMARY KEY,
    nombre      VARCHAR(80)  NOT NULL,
    tipo        tipo_cancha  NOT NULL,
    capacidad   SMALLINT     NOT NULL CHECK (capacidad > 0),
    activa      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_cancha_nombre UNIQUE (nombre)
);

CREATE TRIGGER trg_cancha_updated_at
    BEFORE UPDATE ON cancha
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ── PRECIO ───────────────────────────────────────────────────
CREATE TABLE precio (
    id           BIGSERIAL      PRIMARY KEY,
    cancha_id    BIGINT         NOT NULL,
    precio_hora  NUMERIC(10,2)  NOT NULL CHECK (precio_hora >= 0),
    hora_inicio  TIME           NOT NULL,
    hora_fin     TIME           NOT NULL,
    dia_semana   dia_semana     NULL,
    es_feriado   BOOLEAN        NOT NULL DEFAULT FALSE,
    vigente      BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_precio_cancha
        FOREIGN KEY (cancha_id) REFERENCES cancha (id)
        ON DELETE CASCADE,

    CONSTRAINT chk_precio_horas
        CHECK (hora_fin > hora_inicio)
);

CREATE INDEX idx_precio_cancha_vigente
    ON precio (cancha_id, hora_inicio, hora_fin)
    WHERE vigente = TRUE;

-- ── RESERVA ──────────────────────────────────────────────────
CREATE TABLE reserva (
    id           BIGSERIAL        PRIMARY KEY,
    usuario_id   BIGINT           NOT NULL,
    cancha_id    BIGINT           NOT NULL,
    fecha        DATE             NOT NULL,
    hora_inicio  TIME             NOT NULL,
    hora_fin     TIME             NOT NULL,
    estado       estado_reserva   NOT NULL DEFAULT 'PENDIENTE',
    monto_total  NUMERIC(10,2)    NOT NULL CHECK (monto_total >= 0),
    created_at   TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ      NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_reserva_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario (id),

    CONSTRAINT fk_reserva_cancha
        FOREIGN KEY (cancha_id) REFERENCES cancha (id),

    CONSTRAINT chk_reserva_horas
        CHECK (hora_fin > hora_inicio),

    CONSTRAINT chk_reserva_duracion_minima
        CHECK (
            EXTRACT(EPOCH FROM (hora_fin - hora_inicio)) >= 3600
        ),

    CONSTRAINT chk_reserva_bloques_30min
        CHECK (
            CAST(EXTRACT(EPOCH FROM (hora_fin - hora_inicio)) AS INTEGER) % 1800 = 0
        ),

    CONSTRAINT no_solapamiento_reservas
        EXCLUDE USING GIST (
            cancha_id  WITH =,
            fecha      WITH =,
            tsrange(
                fecha::TIMESTAMP + hora_inicio,
                fecha::TIMESTAMP + hora_fin,
                '[)'
            ) WITH &&
        ) WHERE (estado <> 'CANCELADA')
);

CREATE TRIGGER trg_reserva_updated_at
    BEFORE UPDATE ON reserva
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE INDEX idx_reserva_usuario_fecha
    ON reserva (usuario_id, fecha DESC);

CREATE INDEX idx_reserva_cancha_fecha
    ON reserva (cancha_id, fecha)
    WHERE estado <> 'CANCELADA';

-- ── PAGO ─────────────────────────────────────────────────────
CREATE TABLE pago (
    id          BIGSERIAL       PRIMARY KEY,
    reserva_id  BIGINT          NOT NULL,
    monto       NUMERIC(10,2)   NOT NULL CHECK (monto >= 0),
    metodo      metodo_pago     NOT NULL,
    estado      estado_pago     NOT NULL DEFAULT 'PENDIENTE',
    referencia  VARCHAR(100)    NULL,
    fecha_pago  TIMESTAMPTZ     NULL,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_pago_reserva
        FOREIGN KEY (reserva_id) REFERENCES reserva (id)
        ON DELETE RESTRICT,

    CONSTRAINT uq_pago_reserva UNIQUE (reserva_id)
);

CREATE TRIGGER trg_pago_updated_at
    BEFORE UPDATE ON pago
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
