package bo.ucb.sport;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("dev")
class SportApplicationTests {

	@org.springframework.beans.factory.annotation.Value("${cloudinary.cloud-name}")
	private String cloudName;

	@org.springframework.beans.factory.annotation.Value("${cloudinary.upload-preset}")
	private String uploadPreset;

	@org.springframework.beans.factory.annotation.Autowired
	private bo.ucb.sport.infrastructure.persistence.jpa.PagoJpaRepository pagoJpaRepository;

	@Test
	void contextLoads() {
		System.out.println("====== CLOUDINARY CLOUD NAME: [" + cloudName + "] ======");
		System.out.println("====== CLOUDINARY UPLOAD PRESET: [" + uploadPreset + "] ======");
		
		System.out.println("====== DB PAYMENTS ======");
		pagoJpaRepository.findAll().forEach(pago -> {
			System.out.println("Pago ID: " + pago.getId() + 
							   ", Reserva ID: " + pago.getReservaId() + 
							   ", Monto: " + pago.getMonto() + 
							   ", Metodo: " + pago.getMetodo() + 
							   ", Estado: " + pago.getEstado() + 
							   ", Concepto: " + pago.getConcepto() + 
							   ", URL Comprobante: " + pago.getUrlComprobante());
		});
		System.out.println("====== END DB PAYMENTS ======");
	}

}
