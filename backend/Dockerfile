FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copiar archivos esenciales para descargar dependencias
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Arreglar los saltos de linea de Windows a Linux por si acaso
RUN sed -i 's/\r$//' mvnw
RUN chmod +x mvnw

# Descargar dependencias
RUN ./mvnw dependency:go-offline || true

# Copiar codigo fuente
COPY src src

# Compilar aplicacion omitiendo tests
RUN ./mvnw clean package -DskipTests

# Etapa de produccion
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
