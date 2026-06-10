package bo.ucb.sport.domain.service;

import bo.ucb.sport.domain.model.precio.DiaSemana;
import bo.ucb.sport.domain.model.precio.Precio;
import bo.ucb.sport.domain.model.reserva.FranjaHoraria;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

/**
 * Servicio de dominio puro — Calcula el monto total de una reserva.
 * Prioridad: feriado > día de semana específico > precio general (RN-14).
 */
public class CalculadorPrecioService {

    /**
     * Calcula el precio total dado un listado de tarifas vigentes, la fecha y la franja.
     */
    public BigDecimal calcular(List<Precio> precios, LocalDate fecha, FranjaHoraria franja) {
        BigDecimal precioHora = obtenerPrecioHora(precios, fecha);
        long minutos = franja.duracionEnMinutos();
        BigDecimal horas = BigDecimal.valueOf(minutos).divide(BigDecimal.valueOf(60), 4, RoundingMode.HALF_UP);
        return precioHora.multiply(horas).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal obtenerPrecioHora(List<Precio> precios, LocalDate fecha) {
        DiaSemana dia = mapearDia(fecha.getDayOfWeek());
        boolean esFeriado = false; // Extensible: integrar calendario de feriados

        // Prioridad 1: feriado
        if (esFeriado) {
            return precios.stream()
                    .filter(p -> p.isVigente() && p.isEsFeriado())
                    .map(Precio::getPrecioHora)
                    .findFirst()
                    .orElse(obtenerPrecioBase(precios));
        }

        // Prioridad 2: día de semana específico
        DiaSemana diaActual = dia;
        return precios.stream()
                .filter(p -> p.isVigente() && !p.isEsFeriado()
                          && p.getDiaSemana() != null
                          && p.getDiaSemana() == diaActual)
                .map(Precio::getPrecioHora)
                .findFirst()
                // Prioridad 3: precio general
                .orElse(obtenerPrecioBase(precios));
    }

    private BigDecimal obtenerPrecioBase(List<Precio> precios) {
        return precios.stream()
                .filter(p -> p.isVigente() && p.getDiaSemana() == null && !p.isEsFeriado())
                .map(Precio::getPrecioHora)
                .findFirst()
                .orElse(BigDecimal.ZERO);
    }

    private DiaSemana mapearDia(DayOfWeek dow) {
        return switch (dow) {
            case MONDAY    -> DiaSemana.LUNES;
            case TUESDAY   -> DiaSemana.MARTES;
            case WEDNESDAY -> DiaSemana.MIERCOLES;
            case THURSDAY  -> DiaSemana.JUEVES;
            case FRIDAY    -> DiaSemana.VIERNES;
            case SATURDAY  -> DiaSemana.SABADO;
            case SUNDAY    -> DiaSemana.DOMINGO;
        };
    }
}
