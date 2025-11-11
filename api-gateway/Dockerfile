# ----- Etapa 1: Build (Construcción) -----
# Usamos una imagen estándar con Temurin (OpenJDK) 21 y Maven 3
FROM maven:3-eclipse-temurin-21 AS build

WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn package -DskipTests

# ----- Etapa 2: Run (Ejecución) -----
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Exponemos el puerto 8080 (default de tu gateway)
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]