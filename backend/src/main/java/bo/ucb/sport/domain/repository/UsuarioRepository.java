package bo.ucb.sport.domain.repository;

import bo.ucb.sport.domain.model.usuario.Telefono;
import bo.ucb.sport.domain.model.usuario.Usuario;

import java.util.Optional;

public interface UsuarioRepository {
    Optional<Usuario> findById(Long id);
    Optional<Usuario> findByTelefono(Telefono telefono);
    boolean existsByTelefono(Telefono telefono);
    Usuario save(Usuario usuario);
}
