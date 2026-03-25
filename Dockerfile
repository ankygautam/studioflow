FROM maven:3.9.9-eclipse-temurin-17 AS build

WORKDIR /workspace/backend

COPY backend/pom.xml ./
RUN mvn -DskipTests dependency:go-offline

COPY backend/src ./src
RUN mvn -DskipTests package

FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=build /workspace/backend/target/studioflow-backend-0.0.1-SNAPSHOT.jar /app/app.jar

EXPOSE 8080

CMD ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar /app/app.jar"]
