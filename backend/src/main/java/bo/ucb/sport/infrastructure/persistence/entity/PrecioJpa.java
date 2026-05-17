package bo.ucb.sport.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.time.OffsetDateTime;

@Entity
@Table(name = "precio")
@Getter
@Setter
@NoArgsConstructor
public class PrecioJpa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cancha_id", nullable = false)
    private Long canchaId;

    @Column(name = "precio_hora", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioHora;

    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "hora_fin", nullable = false)
    private LocalTime horaFin;

    @Column(name = "dia_semana", length = 20)
    @Enumerated(EnumType.STRING)
    private DiaSemanaJpa diaSemana;

    @Column(name = "es_feriado", nullable = false)
    private boolean esFeriado;

    @Column(nullable = false)
    private boolean vigente;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    public enum DiaSemanaJpa {
        LUNES, MARTES, MIERCOLES, JUEVES, VIERNES, SABADO, DOMINGO
    }
}
