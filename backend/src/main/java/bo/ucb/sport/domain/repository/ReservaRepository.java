package bo.ucb.sport.domain.repository;

import bo.ucb.sport.domain.model.reserva.FranjaHoraria;
import bo.ucb.sport.domain.model.reserva.Reserva;
import bo.ucb.sport.domain.model.reserva.ReservaId;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ReservaRepository {
    Reserva save(Reserva reserva);
    Optional<Reserva> findById(ReservaId id);
    List<Reserva> findByUsuarioId(Long usuarioId);
    List<Reserva> findActivasByCanchaIdAndFecha(Long canchaId, LocalDate fecha);
    boolean existeSolapamiento(Long canchaId, LocalDate fecha, FranjaHoraria franja);
}
