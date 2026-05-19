package bo.ucb.sport.infrastructure.persistence.mapper;

import bo.ucb.sport.domain.model.pago.ConceptoPago;
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
                jpa.getConcepto() != null ? ConceptoPago.valueOf(jpa.getConcepto().name()) : ConceptoPago.RESERVA_INICIAL,
                jpa.getUrlComprobante(),
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
        jpa.setConcepto(PagoJpa.ConceptoPagoJpa.valueOf(domain.getConcepto() != null ? domain.getConcepto().name() : ConceptoPago.RESERVA_INICIAL.name()));
        jpa.setUrlComprobante(domain.getUrlComprobante());
        jpa.setReferencia(domain.getReferencia());
        jpa.setFechaPago(domain.getFechaPago());
        jpa.setCreatedAt(domain.getCreatedAt());
        jpa.setUpdatedAt(domain.getUpdatedAt());
        return jpa;
    }
}
