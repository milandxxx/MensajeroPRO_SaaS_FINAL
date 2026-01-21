package com.mensajeropro;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
public class AnalyticsServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AnalyticsServiceApplication.class, args);
        System.out.println("\n===========================================");
        System.out.println("Analytics Service started on port 8081");
        System.out.println("Health: http://localhost:8081/actuator/health");
        System.out.println("Analytics: http://localhost:8081/api/analytics");
        System.out.println("===========================================\n");
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}