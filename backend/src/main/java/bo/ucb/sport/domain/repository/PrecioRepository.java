package bo.ucb.sport.domain.repository;

import bo.ucb.sport.domain.model.precio.Precio;

import java.util.List;

public interface PrecioRepository {
    Precio save(Precio precio);
    List<Precio> findVigentesByCanchaId(Long canchaId);
    void invalidarPorCanchaId(Long canchaId);
}
