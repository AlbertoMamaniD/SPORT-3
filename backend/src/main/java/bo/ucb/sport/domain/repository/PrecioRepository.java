package bo.ucb.sport.domain.repository;

import bo.ucb.sport.domain.model.precio.Precio;

import java.util.List;

public interface PrecioRepository {
    Precio save(Precio precio);
    List<Precio> findVigentesByCanchaId(Long canchaId);
    List<Precio> findAllVigentes();
    void invalidarPorCanchaId(Long canchaId);
    void deleteById(Long id);
}
