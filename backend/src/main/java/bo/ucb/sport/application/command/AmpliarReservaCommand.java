package bo.ucb.sport.application.command;

public record AmpliarReservaCommand(Long reservaId, Long usuarioId, int minutosExtra) {}
