package bo.ucb.sport.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "pago")
@Getter
@Setter
@NoArgsConstructor
public class PagoJpa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reserva_id", nullable = false, unique = true)
    private Long reservaId;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal monto;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private MetodoPagoJpa metodo;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private EstadoPagoJpa estado;

    @Column(length = 255)
    private String referencia;

    @Column(name = "fecha_pago")
    private OffsetDateTime fechaPago;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public enum MetodoPagoJpa { ONLINE, PRESENCIAL }
    public enum EstadoPagoJpa { PENDIENTE, COMPLETADO, RECHAZADO, REEMBOLSADO }
}
