package bo.ucb.sport.infrastructure.persistence.mapper;

import bo.ucb.sport.domain.model.precio.DiaSemana;
import bo.ucb.sport.domain.model.precio.Precio;
import bo.ucb.sport.domain.model.reserva.FranjaHoraria;
import bo.ucb.sport.infrastructure.persistence.entity.PrecioJpa;
import org.springframework.stereotype.Component;

@Component
public class PrecioMapper {

    public Precio toDomain(PrecioJpa jpa) {
        DiaSemana dia = jpa.getDiaSemana() != null
                ? DiaSemana.valueOf(jpa.getDiaSemana().name())
                : null;
        return Precio.reconstituir(
                jpa.getId(),
                jpa.getCanchaId(),
                jpa.getPrecioHora(),
                new FranjaHoraria(jpa.getHoraInicio(), jpa.getHoraFin()),
                dia,
                jpa.isEsFeriado(),
                jpa.isVigente(),
                jpa.getCreatedAt()
        );
    }

    public PrecioJpa toJpa(Precio domain) {
        PrecioJpa jpa = new PrecioJpa();
        jpa.setId(domain.getId());
        jpa.setCanchaId(domain.getCanchaId());
        jpa.setPrecioHora(domain.getPrecioHora());
        jpa.setHoraInicio(domain.getFranja().inicio());
        jpa.setHoraFin(domain.getFranja().fin());
        jpa.setDiaSemana(domain.getDiaSemana() != null
                ? PrecioJpa.DiaSemanaJpa.valueOf(domain.getDiaSemana().name())
                : null);
        jpa.setEsFeriado(domain.isEsFeriado());
        jpa.setVigente(domain.isVigente());
        jpa.setCreatedAt(domain.getCreatedAt());
        return jpa;
    }
}
