package bo.ucb.sport.application.usecase.precio;

import bo.ucb.sport.application.command.ConfigurarPrecioCommand;
import bo.ucb.sport.domain.model.precio.DiaSemana;
import bo.ucb.sport.domain.model.precio.Precio;
import bo.ucb.sport.domain.model.reserva.FranjaHoraria;
import bo.ucb.sport.domain.repository.PrecioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ConfigurarPrecioUseCase {

    private final PrecioRepository precioRepository;

    public ConfigurarPrecioUseCase(PrecioRepository precioRepository) {
        this.precioRepository = precioRepository;
    }

    public Precio execute(ConfigurarPrecioCommand cmd) {
        FranjaHoraria franja = new FranjaHoraria(cmd.horaInicio(), cmd.horaFin());
        DiaSemana dia = cmd.diaSemana() != null ? DiaSemana.valueOf(cmd.diaSemana().toUpperCase()) : null;
        Precio precio = Precio.crear(cmd.canchaId(), cmd.precioHora(), franja, dia, cmd.esFeriado());
        return precioRepository.save(precio);
    }
}
