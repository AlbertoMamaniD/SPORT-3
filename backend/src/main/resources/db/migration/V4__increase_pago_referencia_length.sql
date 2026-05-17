-- V4: Incrementar el tamaño de la columna referencia para soportar URLs de Cloudinary sin problemas de truncado.
ALTER TABLE pago ALTER COLUMN referencia TYPE VARCHAR(255);
