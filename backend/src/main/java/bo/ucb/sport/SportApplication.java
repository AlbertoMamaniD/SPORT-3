package bo.ucb.sport;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;

@SpringBootApplication
public class SportApplication {

	static {
		// Carga el archivo .env si existe en el directorio actual o superior
		String[] paths = { "../.env", "./.env", ".env" };
		for (String path : paths) {
			var file = Paths.get(path);
			if (Files.exists(file)) {
				try {
					List<String> lines = Files.readAllLines(file);
					for (String line : lines) {
						line = line.trim();
						if (line.isEmpty() || line.startsWith("#") || !line.contains("=")) {
							continue;
						}
						String[] parts = line.split("=", 2);
						String key = parts[0].trim();
						String value = parts[1].trim();
						// Evita sobreescribir variables reales del sistema operativo
						if (System.getenv(key) == null && System.getProperty(key) == null) {
							System.setProperty(key, value);
						}
					}
				} catch (IOException e) {
					System.err.println("Error al leer archivo .env: " + e.getMessage());
				}
				break;
			}
		}
	}

	public static void main(String[] args) {
		SpringApplication.run(SportApplication.class, args);
	}

}
