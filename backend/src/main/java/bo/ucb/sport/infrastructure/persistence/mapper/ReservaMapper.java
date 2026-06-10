package bo.ucb.sport.infrastructure.persistence.mapper;

import bo.ucb.sport.domain.model.reserva.EstadoReserva;
import bo.ucb.sport.domain.model.reserva.FranjaHoraria;
import bo.ucb.sport.domain.model.reserva.Reserva;
import bo.ucb.sport.domain.model.reserva.ReservaId;
import bo.ucb.sport.infrastructure.persistence.entity.ReservaJpa;
import org.springframework.stereotype.Component;

@Component
public class ReservaMapper {

    public Reserva toDomain(ReservaJpa jpa) {
        return Reserva.reconstituir(
                new ReservaId(jpa.getId()),
                jpa.getUsuarioId(),
                jpa.getCanchaId(),
                jpa.getFecha(),
                new FranjaHoraria(jpa.getHoraInicio(), jpa.getHoraFin()),
                EstadoReserva.valueOf(jpa.getEstado().name()),
                jpa.getMontoTotal(),
                jpa.getCreatedAt(),
                jpa.getUpdatedAt()
        );
    }

    public ReservaJpa toJpa(Reserva domain) {
        ReservaJpa jpa = new ReservaJpa();
        if (domain.getId() != null) jpa.setId(domain.getId().valor());
        jpa.setUsuarioId(domain.getUsuarioId());
        jpa.setCanchaId(domain.getCanchaId());
        jpa.setFecha(domain.getFecha());
        jpa.setHoraInicio(domain.getFranja().inicio());
        jpa.setHoraFin(domain.getFranja().fin());
        jpa.setEstado(ReservaJpa.EstadoReservaJpa.valueOf(domain.getEstado().name()));
        jpa.setMontoTotal(domain.getMontoTotal());
        jpa.setCreatedAt(domain.getCreatedAt());
        jpa.setUpdatedAt(domain.getUpdatedAt());
        return jpa;
    }
}
