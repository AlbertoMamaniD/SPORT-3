package bo.ucb.sport.domain.service;

import bo.ucb.sport.domain.exception.CanchaNoDisponibleException;
import bo.ucb.sport.domain.model.reserva.FranjaHoraria;
import bo.ucb.sport.domain.model.reserva.Reserva;
import bo.ucb.sport.domain.repository.ReservaRepository;

import java.time.LocalDate;
import java.util.List;

/**
 * Servicio de dominio puro — Verifica la disponibilidad de una cancha.
 * Implementa validación previa al constraint GIST de PostgreSQL (RN-08).
 */
public class DisponibilidadService {

    private final ReservaRepository reservaRepository;

    public DisponibilidadService(ReservaRepository reservaRepository) {
        this.reservaRepository = reservaRepository;
    }

    /**
     * Verifica que no exista solapamiento. Lanza excepción si hay conflicto.
     */
    public void verificar(Long canchaId, LocalDate fecha, FranjaHoraria franja) {
        boolean solapamiento = reservaRepository.existeSolapamiento(canchaId, fecha, franja);
        if (solapamiento) {
            throw new CanchaNoDisponibleException(
                "La cancha ya tiene una reserva en el horario " +
                franja.inicio() + "-" + franja.fin() + " el " + fecha
            );
        }
    }

    /**
     * Obtiene las franjas ocupadas de una cancha en una fecha determinada.
     */
    public List<Reserva> obtenerReservasActivas(Long canchaId, LocalDate fecha) {
        return reservaRepository.findActivasByCanchaIdAndFecha(canchaId, fecha);
    }
}
