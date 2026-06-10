package bo.ucb.sport.infrastructure.persistence.mapper;

import bo.ucb.sport.domain.model.usuario.RolUsuario;
import bo.ucb.sport.domain.model.usuario.Telefono;
import bo.ucb.sport.domain.model.usuario.Usuario;
import bo.ucb.sport.infrastructure.persistence.entity.UsuarioJpa;
import org.springframework.stereotype.Component;

@Component
public class UsuarioMapper {

    public Usuario toDomain(UsuarioJpa jpa) {
        return Usuario.reconstituir(
                jpa.getId(),
                jpa.getNombre(),
                new Telefono(jpa.getTelefono()),
                RolUsuario.valueOf(jpa.getRol().name()),
                jpa.isVerificado(),
                jpa.isActivo(),
                jpa.getCreatedAt(),
                jpa.getUpdatedAt()
        );
    }

    public UsuarioJpa toJpa(Usuario domain) {
        UsuarioJpa jpa = new UsuarioJpa();
        jpa.setId(domain.getId());
        jpa.setNombre(domain.getNombre());
        jpa.setTelefono(domain.getTelefono().valor());
        jpa.setRol(UsuarioJpa.RolUsuarioJpa.valueOf(domain.getRol().name()));
        jpa.setVerificado(domain.isVerificado());
        jpa.setActivo(domain.isActivo());
        jpa.setCreatedAt(domain.getCreatedAt());
        jpa.setUpdatedAt(domain.getUpdatedAt());
        return jpa;
    }
}
