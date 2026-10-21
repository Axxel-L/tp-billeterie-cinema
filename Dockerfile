FROM oven/bun:1-alpine AS frontend
WORKDIR /src/frontend
COPY frontend/package.json frontend/bun.lock ./
RUN bun install --frozen-lockfile
COPY frontend/ ./
RUN bun run build

FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /src
COPY pom.xml mvnw ./
COPY .mvn .mvn
RUN ./mvnw -B -q -DskipTests dependency:go-offline
COPY src src
COPY --from=frontend /src/src/main/resources/static src/main/resources/static
RUN ./mvnw -B -q -DskipTests package

FROM eclipse-temurin:25-jre
WORKDIR /app
RUN addgroup --system app && adduser --system --ingroup app app
COPY --from=build /src/target/billetterie-cinema-1.0.0.jar app.jar
USER app
EXPOSE 8080
ENV JAVA_OPTS=""
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
