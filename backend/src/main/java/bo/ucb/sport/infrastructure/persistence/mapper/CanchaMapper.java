package bo.ucb.sport.infrastructure.persistence.mapper;

import bo.ucb.sport.domain.model.cancha.Cancha;
import bo.ucb.sport.domain.model.cancha.TipoCancha;
import bo.ucb.sport.infrastructure.persistence.entity.CanchaJpa;
import org.springframework.stereotype.Component;

@Component
public class CanchaMapper {

    public Cancha toDomain(CanchaJpa jpa) {
        return Cancha.reconstituir(
                jpa.getId(),
                jpa.getNombre(),
                TipoCancha.valueOf(jpa.getTipo().name()),
                jpa.getCapacidad(),
                jpa.isActiva(),
                jpa.getCreatedAt(),
                jpa.getUpdatedAt()
        );
    }

    public CanchaJpa toJpa(Cancha domain) {
        CanchaJpa jpa = new CanchaJpa();
        jpa.setId(domain.getId());
        jpa.setNombre(domain.getNombre());
        jpa.setTipo(CanchaJpa.TipoCanchaJpa.valueOf(domain.getTipo().name()));
        jpa.setCapacidad((short) domain.getCapacidad());
        jpa.setActiva(domain.isActiva());
        jpa.setCreatedAt(domain.getCreatedAt());
        jpa.setUpdatedAt(domain.getUpdatedAt());
        return jpa;
    }
}
