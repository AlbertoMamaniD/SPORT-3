package bo.ucb.sport.interfaces.dto.response;

public record PagoAdminDTO(
    String concepto,
    String estado,
    String urlComprobante,
    String fechaSubida
) {}
