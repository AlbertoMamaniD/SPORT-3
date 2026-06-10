package bo.ucb.sport.infrastructure.config;

import bo.ucb.sport.domain.repository.ReservaRepository;
import bo.ucb.sport.domain.service.CalculadorPrecioService;
import bo.ucb.sport.domain.service.DisponibilidadService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Registra como Beans los servicios de dominio puro.
 * El dominio no puede tener @Component ni @Service de Spring.
 */
@Configuration
public class DomainConfig {

    @Bean
    public CalculadorPrecioService calculadorPrecioService() {
        return new CalculadorPrecioService();
    }

    @Bean
    public DisponibilidadService disponibilidadService(ReservaRepository reservaRepository) {
        return new DisponibilidadService(reservaRepository);
    }
}
