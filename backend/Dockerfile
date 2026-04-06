# Build stage
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
COPY .env ./
EXPOSE 8080
# Pass MongoDB URI directly as a JVM argument so Spring Boot's auto-config
# picks it up before anything else runs (before @PropertySource, etc.).
# The -D flag takes highest precedence over all other property sources.
ENTRYPOINT ["sh", "-c", "java -Dspring.data.mongodb.uri=mongodb://mongodb:27017/ -Dspring.data.mongodb.database=sharingfileweb -jar app.jar"]
