import subprocess

# SQL Command
sql = "DELETE FROM otp_token WHERE usuario_id IN (SELECT id FROM usuario WHERE telefono = '+59168699904'); DELETE FROM usuario WHERE telefono = '+59168699904';\n"

# Run psql command interactively, sending the SQL query to stdin
command = [
    "az", "containerapp", "exec",
    "--name", "sport-db",
    "--resource-group", "DefaultResourceGroup-SCUS",
    "--command", "psql -U postgres -d sport_db"
]

print("Executing command to delete user via stdin...")
result = subprocess.run(command, input=sql, capture_output=True, text=True, shell=True)

print("STDOUT:")
print(result.stdout)
print("STDERR:")
print(result.stderr)
print(f"Exit code: {result.returncode}")
