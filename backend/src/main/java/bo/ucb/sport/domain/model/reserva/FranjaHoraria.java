package bo.ucb.sport.domain.model.reserva;

import java.time.Duration;
import java.time.LocalTime;
import java.util.Objects;

/**
 * Value Object inmutable — Franja horaria (inicio, fin).
 * Reutilizado en Reserva y en Precio.
 */
public record FranjaHoraria(LocalTime inicio, LocalTime fin) {

    public FranjaHoraria {
        Objects.requireNonNull(inicio, "inicio no puede ser nulo");
        Objects.requireNonNull(fin, "fin no puede ser nulo");
        if (!fin.isAfter(inicio))
            throw new IllegalArgumentException("fin debe ser posterior a inicio");
    }

    public long duracionEnMinutos() {
        return Duration.between(inicio, fin).toMinutes();
    }

    public FranjaHoraria extender(Duration extra) {
        return new FranjaHoraria(inicio, fin.plus(extra));
    }

    public boolean seSolapa(FranjaHoraria otra) {
        return this.inicio.isBefore(otra.fin) && otra.inicio.isBefore(this.fin);
    }
}
