package bo.ucb.sport.infrastructure.persistence.repository;

import bo.ucb.sport.domain.model.usuario.Telefono;
import bo.ucb.sport.domain.model.usuario.Usuario;
import bo.ucb.sport.domain.repository.UsuarioRepository;
import bo.ucb.sport.infrastructure.persistence.jpa.UsuarioJpaRepository;
import bo.ucb.sport.infrastructure.persistence.mapper.UsuarioMapper;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class UsuarioRepositoryImpl implements UsuarioRepository {

    private final UsuarioJpaRepository jpa;
    private final UsuarioMapper mapper;

    public UsuarioRepositoryImpl(UsuarioJpaRepository jpa, UsuarioMapper mapper) {
        this.jpa = jpa;
        this.mapper = mapper;
    }

    @Override
    public Optional<Usuario> findById(Long id) {
        return jpa.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<Usuario> findByTelefono(Telefono telefono) {
        return jpa.findByTelefono(telefono.valor()).map(mapper::toDomain);
    }

    @Override
    public boolean existsByTelefono(Telefono telefono) {
        return jpa.existsByTelefono(telefono.valor());
    }

    @Override
    public Usuario save(Usuario usuario) {
        var jpaEntity = mapper.toJpa(usuario);
        return mapper.toDomain(jpa.save(jpaEntity));
    }
}
