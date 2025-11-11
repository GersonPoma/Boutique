# ----- Etapa 1: Build (Construcción) -----
# Usamos una imagen estándar con Temurin (OpenJDK) 21 y Maven 3
FROM maven:3-eclipse-temurin-21 AS build

# Establecemos el directorio de trabajo
WORKDIR /app

# Copiamos el pom.xml para descargar dependencias
COPY pom.xml .
RUN mvn dependency:go-offline

# Copiamos el resto del código fuente
COPY src ./src

# Compilamos y empaquetamos la aplicación
RUN mvn package -DskipTests

# ----- Etapa 2: Run (Ejecución) -----
# Usamos una imagen de JRE 21 (solo para ejecutar)
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copiamos el .jar construido desde la etapa anterior
COPY --from=build /app/target/*.jar app.jar

# Exponemos el puerto 8081
EXPOSE 8081

# Comando para iniciar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]