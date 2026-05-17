package bo.ucb.sport.infrastructure.persistence.mapper;

import bo.ucb.sport.domain.model.pago.EstadoPago;
import bo.ucb.sport.domain.model.pago.MetodoPago;
import bo.ucb.sport.domain.model.pago.Pago;
import bo.ucb.sport.infrastructure.persistence.entity.PagoJpa;
import org.springframework.stereotype.Component;

@Component
public class PagoMapper {

    public Pago toDomain(PagoJpa jpa) {
        return Pago.reconstituir(
                jpa.getId(),
                jpa.getReservaId(),
                jpa.getMonto(),
                MetodoPago.valueOf(jpa.getMetodo().name()),
                EstadoPago.valueOf(jpa.getEstado().name()),
                jpa.getReferencia(),
                jpa.getFechaPago(),
                jpa.getCreatedAt(),
                jpa.getUpdatedAt()
        );
    }

    public PagoJpa toJpa(Pago domain) {
        PagoJpa jpa = new PagoJpa();
        jpa.setId(domain.getId());
        jpa.setReservaId(domain.getReservaId());
        jpa.setMonto(domain.getMonto());
        jpa.setMetodo(PagoJpa.MetodoPagoJpa.valueOf(domain.getMetodo().name()));
        jpa.setEstado(PagoJpa.EstadoPagoJpa.valueOf(domain.getEstado().name()));
        jpa.setReferencia(domain.getReferencia());
        jpa.setFechaPago(domain.getFechaPago());
        jpa.setCreatedAt(domain.getCreatedAt());
        jpa.setUpdatedAt(domain.getUpdatedAt());
        return jpa;
    }
}
