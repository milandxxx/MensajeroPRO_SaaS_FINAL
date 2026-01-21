package com.mensajeropro.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {

    private final JdbcTemplate jdbcTemplate;
    private final RestTemplate restTemplate;

    @Value("${django.backend.url}")
    private String djangoBackendUrl;

    /**
     * Obtener estadísticas generales del sistema
     */
    public Map<String, Object> getSystemStats() {
        log.info("Calculating system statistics");
        
        Map<String, Object> stats = new HashMap<>();
        
        try {
            // Total de usuarios
            Integer totalUsers = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM users", 
                Integer.class
            );
            
            // Total de negocios
            Integer totalBusinesses = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM users_business", 
                Integer.class
            );
            
            // Negocios activos
            Integer activeBusinesses = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM users_business WHERE is_active = true", 
                Integer.class
            );
            
            // Total de pagos
            Integer totalPayments = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM payments_payment WHERE status = 'COMPLETED'", 
                Integer.class
            );
            
            // Ingresos totales
            Double totalRevenue = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(amount), 0) FROM payments_payment WHERE status = 'COMPLETED'", 
                Double.class
            );
            
            // Usuarios con suscripción activa
            Integer activeSubscriptions = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM payments_subscription WHERE is_active = true", 
                Integer.class
            );
            
            stats.put("totalUsers", totalUsers);
            stats.put("totalBusinesses", totalBusinesses);
            stats.put("activeBusinesses", activeBusinesses);
            stats.put("totalPayments", totalPayments);
            stats.put("totalRevenue", totalRevenue);
            stats.put("activeSubscriptions", activeSubscriptions);
            stats.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
            stats.put("averageRevenuePerUser", totalUsers > 0 ? totalRevenue / totalUsers : 0);
            
            log.info("System stats calculated successfully");
            
        } catch (Exception e) {
            log.error("Error calculating system stats", e);
            stats.put("error", e.getMessage());
        }
        
        return stats;
    }

    /**
     * Obtener estadísticas de un negocio específico
     */
    public Map<String, Object> getBusinessStats(Long businessId) {
        log.info("Calculating stats for business: {}", businessId);
        
        Map<String, Object> stats = new HashMap<>();
        
        try {
            // Info básica del negocio
            Map<String, Object> businessInfo = jdbcTemplate.queryForMap(
                "SELECT name, is_active, created_at FROM users_business WHERE id = ?",
                businessId
            );
            
            stats.put("businessId", businessId);
            stats.put("businessName", businessInfo.get("name"));
            stats.put("isActive", businessInfo.get("is_active"));
            stats.put("createdAt", businessInfo.get("created_at"));
            
            // Aquí podrías agregar más métricas:
            // - Mensajes enviados
            // - Respuestas generadas
            // - Tasa de respuesta
            // - etc.
            
            stats.put("calculatedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
            
            log.info("Business stats calculated successfully for: {}", businessId);
            
        } catch (Exception e) {
            log.error("Error calculating business stats", e);
            stats.put("error", e.getMessage());
        }
        
        return stats;
    }

    /**
     * Obtener estadísticas de un usuario
     */
    public Map<String, Object> getUserStats(Long userId) {
        log.info("Calculating stats for user: {}", userId);
        
        Map<String, Object> stats = new HashMap<>();
        
        try {
            // Info del usuario
            Map<String, Object> userInfo = jdbcTemplate.queryForMap(
                "SELECT username, email, role, max_businesses FROM users WHERE id = ?",
                userId
            );
            
            // Negocios del usuario
            Integer businessCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM users_business WHERE owner_id = ?",
                Integer.class,
                userId
            );
            
            // Pagos del usuario
            Integer paymentCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM payments_payment WHERE user_id = ? AND status = 'COMPLETED'",
                Integer.class,
                userId
            );
            
            // Total gastado
            Double totalSpent = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(amount), 0) FROM payments_payment WHERE user_id = ? AND status = 'COMPLETED'",
                Double.class,
                userId
            );
            
            stats.put("userId", userId);
            stats.put("username", userInfo.get("username"));
            stats.put("email", userInfo.get("email"));
            stats.put("role", userInfo.get("role"));
            stats.put("maxBusinesses", userInfo.get("max_businesses"));
            stats.put("businessCount", businessCount);
            stats.put("paymentCount", paymentCount);
            stats.put("totalSpent", totalSpent);
            stats.put("calculatedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
            
            log.info("User stats calculated successfully for: {}", userId);
            
        } catch (Exception e) {
            log.error("Error calculating user stats", e);
            stats.put("error", e.getMessage());
        }
        
        return stats;
    }

    /**
     * Análisis de tendencias (últimos 30 días)
     */
    public Map<String, Object> getTrends() {
        log.info("Calculating trends for last 30 days");
        
        Map<String, Object> trends = new HashMap<>();
        
        try {
            // Nuevos usuarios últimos 30 días
            Integer newUsers = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM users WHERE date_joined >= NOW() - INTERVAL '30 days'",
                Integer.class
            );
            
            // Nuevos negocios últimos 30 días
            Integer newBusinesses = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM users_business WHERE created_at >= NOW() - INTERVAL '30 days'",
                Integer.class
            );
            
            // Ingresos últimos 30 días
            Double recentRevenue = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(amount), 0) FROM payments_payment " +
                "WHERE status = 'COMPLETED' AND created_at >= NOW() - INTERVAL '30 days'",
                Double.class
            );
            
            trends.put("newUsers30d", newUsers);
            trends.put("newBusinesses30d", newBusinesses);
            trends.put("revenue30d", recentRevenue);
            trends.put("period", "last_30_days");
            trends.put("calculatedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
            
            log.info("Trends calculated successfully");
            
        } catch (Exception e) {
            log.error("Error calculating trends", e);
            trends.put("error", e.getMessage());
        }
        
        return trends;
    }

    /**
     * Comparar rendimiento entre negocios
     */
    public Map<String, Object> compareBusinesses(List<Long> businessIds) {
        log.info("Comparing businesses: {}", businessIds);
        
        Map<String, Object> comparison = new HashMap<>();
        List<Map<String, Object>> businessesData = new ArrayList<>();
        
        for (Long businessId : businessIds) {
            Map<String, Object> businessStats = getBusinessStats(businessId);
            businessesData.add(businessStats);
        }
        
        comparison.put("businesses", businessesData);
        comparison.put("comparedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
        
        return comparison;
    }
}