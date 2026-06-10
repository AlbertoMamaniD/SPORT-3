-- =============================================================
--  SPORT – Sistema de Reservas de Canchas Deportivas
--  Base de datos PostgreSQL 15
--  Complejo con 3 canchas de fútbol y 3 canchas de wally
-- =============================================================

DROP DATABASE IF EXISTS sport;

CREATE DATABASE sport
    WITH
    OWNER            = postgres
    ENCODING         = 'UTF8'
    LC_COLLATE       = 'es_BO.UTF-8'
    LC_CTYPE         = 'es_BO.UTF-8'
    TEMPLATE         = template0
    CONNECTION LIMIT = -1;

\c sport

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

COMMENT ON TABLE  usuario            IS 'Clientes y administradores registrados en el sistema.';
COMMENT ON COLUMN usuario.telefono   IS 'Número único del usuario; usado para autenticación OTP.';
COMMENT ON COLUMN usuario.verificado IS 'TRUE solo después de validar correctamente un OTP SMS.';
COMMENT ON COLUMN usuario.activo     IS 'FALSE para deshabilitar cuentas sin eliminarlas.';

CREATE TRIGGER trg_usuario_updated_at
    BEFORE UPDATE ON usuario
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TABLE otp_token (
    id          BIGSERIAL    PRIMARY KEY,
    usuario_id  BIGINT       NOT NULL,
    codigo      CHAR(6)      NOT NULL,
    expira_en   TIMESTAMPTZ  NOT NULL,
    usado       BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_otp_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario (id)
        ON DELETE CASCADE
);

COMMENT ON TABLE  otp_token           IS 'Tokens OTP enviados por SMS para autenticación.';
COMMENT ON COLUMN otp_token.codigo    IS 'Código numérico aleatorio de 6 dígitos.';
COMMENT ON COLUMN otp_token.expira_en IS 'created_at + 5 minutos.';
COMMENT ON COLUMN otp_token.usado     IS 'TRUE una vez validado correctamente.';

CREATE INDEX idx_otp_usuario_vigente
    ON otp_token (usuario_id, expira_en DESC)
    WHERE usado = FALSE;

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

COMMENT ON TABLE  cancha        IS 'Canchas deportivas del complejo: 3 de fútbol y 3 de wally.';
COMMENT ON COLUMN cancha.activa IS 'Solo canchas activas pueden reservarse.';

CREATE TRIGGER trg_cancha_updated_at
    BEFORE UPDATE ON cancha
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

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

COMMENT ON TABLE  precio            IS 'Tarifas por hora de las canchas.';
COMMENT ON COLUMN precio.dia_semana IS 'NULL = aplica cualquier día.';
COMMENT ON COLUMN precio.es_feriado IS 'TRUE para tarifas especiales de feriados.';
COMMENT ON COLUMN precio.vigente    IS 'FALSE para tarifas antiguas.';

CREATE INDEX idx_precio_cancha_vigente
    ON precio (cancha_id, hora_inicio, hora_fin)
    WHERE vigente = TRUE;

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

COMMENT ON TABLE  reserva IS 'Reservas de canchas deportivas.';
COMMENT ON COLUMN reserva.monto_total IS 'Monto calculado según tarifas vigentes.';

CREATE TRIGGER trg_reserva_updated_at
    BEFORE UPDATE ON reserva
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE INDEX idx_reserva_usuario_fecha
    ON reserva (usuario_id, fecha DESC);

CREATE INDEX idx_reserva_cancha_fecha
    ON reserva (cancha_id, fecha)
    WHERE estado <> 'CANCELADA';

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

COMMENT ON TABLE  pago            IS 'Pagos asociados a reservas.';
COMMENT ON COLUMN pago.referencia IS 'ID de transacción o recibo.';
COMMENT ON COLUMN pago.fecha_pago IS 'Fecha de confirmación del pago.';

CREATE TRIGGER trg_pago_updated_at
    BEFORE UPDATE ON pago
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE OR REPLACE VIEW v_reservas_activas AS
SELECT
    r.id,
    r.cancha_id,
    c.nombre        AS cancha_nombre,
    c.tipo          AS cancha_tipo,
    r.usuario_id,
    u.nombre        AS usuario_nombre,
    u.telefono      AS usuario_telefono,
    r.fecha,
    r.hora_inicio,
    r.hora_fin,
    r.estado,
    r.monto_total,
    p.metodo        AS pago_metodo,
    p.estado        AS pago_estado
FROM  reserva r
JOIN  cancha   c ON c.id = r.cancha_id
JOIN  usuario  u ON u.id = r.usuario_id
LEFT  JOIN pago p ON p.reserva_id = r.id
WHERE r.estado <> 'CANCELADA';

COMMENT ON VIEW v_reservas_activas
    IS 'Reservas activas con información de usuario, cancha y pago.';

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

INSERT INTO precio (cancha_id, precio_hora, hora_inicio, hora_fin)
SELECT id, 50.00, '07:00', '23:00'
FROM cancha;

INSERT INTO precio (cancha_id, precio_hora, hora_inicio, hora_fin, dia_semana)
SELECT id, 65.00, '07:00', '23:00', d.dia
FROM cancha
CROSS JOIN (
    VALUES ('SABADO'::dia_semana), ('DOMINGO'::dia_semana)
) AS d(dia)
WHERE tipo = 'FUTBOL';

-- =============================================================
-- FIN DEL SCRIPT
-- =============================================================