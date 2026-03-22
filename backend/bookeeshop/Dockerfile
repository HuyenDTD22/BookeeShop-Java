# ── Stage 1: Build JAR ──────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom.xml trước để cache dependencies (tăng tốc build lần sau)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source và build
COPY src ./src
RUN mvn package -DskipTests -B

# ── Stage 2: Run JAR ─────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

# Kích hoạt profile "prod" → Spring Boot đọc application-prod.yml
ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=prod", "app.jar"]