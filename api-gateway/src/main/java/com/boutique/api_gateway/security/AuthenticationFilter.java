package com.boutique.api_gateway.security;

import io.jsonwebtoken.JwtException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.function.Predicate;

/**
 * @author GERSON
 */

@Component
public class AuthenticationFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(AuthenticationFilter.class);

    @Autowired
    private JwtUtils jwtUtils;

    // Lista de endpoints públicos que no requieren autenticación
    public static final List<String> publicEndpoints = List.of(
            "/api/auth/login",
            "/api/auth/login2",
            "/api/auth/refresh",
            "/api/clientes/con-usuario"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();
        String method = request.getMethod().toString();

        log.info("🔍 [AuthFilter] {} {} - Iniciando validación", method, path);

        // 1. Comprobar si la ruta es pública
        Predicate<ServerHttpRequest> isPublic =
                r -> publicEndpoints.stream()
                        .anyMatch(uri -> r.getURI().getPath().contains(uri));

        if (isPublic.test(request)) {
            // Si es pública, dejarla pasar sin verificar
            log.info("✅ [AuthFilter] {} {} - Ruta pública, permitiendo acceso", method, path);
            return chain.filter(exchange);
        }

        // 2. Si no es pública, obtener el encabezado de autorización
        HttpHeaders headers = request.getHeaders();
        if (!headers.containsKey(HttpHeaders.AUTHORIZATION)) {
            // 3. Si no hay encabezado, rechazar
            log.warn("❌ [AuthFilter] {} {} - No se proporcionó header de autorización", method, path);
            return this.onError(exchange, "No se proporcionó encabezado de autorización", HttpStatus.UNAUTHORIZED);
        }

        String authHeader = headers.getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // 3. Si el encabezado no es "Bearer", rechazar
            log.warn("❌ [AuthFilter] {} {} - Header de autorización inválido: {}", method, path, authHeader);
            return this.onError(exchange, "Encabezado de autorización inválido", HttpStatus.UNAUTHORIZED);
        }

        // 4. Extraer el token
        String token = authHeader.substring(7); // Quita "Bearer "
        log.debug("🔑 [AuthFilter] {} {} - Token recibido (primeros 20 chars): {}...", method, path, token.substring(0, Math.min(20, token.length())));

        try {
            // 5. Validar el token
            jwtUtils.validateToken(token);
            log.info("✅ [AuthFilter] {} {} - Token JWT válido, reenviando al microservicio", method, path);

        } catch (JwtException e) {
            // 6. Si la validación falla (expirado, firma mal), rechazar
            log.error("❌ [AuthFilter] {} {} - Token JWT inválido o expirado: {}", method, path, e.getMessage());
            return this.onError(exchange, "Token JWT inválido o expirado: " + e.getMessage(), HttpStatus.UNAUTHORIZED);
        }

        // 7. El token es válido, continuar con la petición original
        // El header Authorization se preserva automáticamente y se reenvía al microservicio
        return chain.filter(exchange);
    }

    /**
     * Helper para responder con un error HTTP.
     */
    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);

        log.error("🚫 [AuthFilter] Respondiendo con error {}: {}", httpStatus.value(), err);

        // Establecer el tipo de contenido a JSON
        response.getHeaders().add(HttpHeaders.CONTENT_TYPE, "application/json");

        // Crear el mensaje de error en formato JSON
        // (Usamos String.format para un JSON simple sin añadir más dependencias)
        String errorJson = String.format("{\"status\": %d, \"error\": \"%s\"}", httpStatus.value(), err);

        // Convertir el JSON a bytes (UTF-8) y luego a un DataBuffer
        DataBuffer buffer = response.bufferFactory().wrap(errorJson.getBytes(StandardCharsets.UTF_8));

        // Escribir el buffer en la respuesta y completarla.
        // Esto reemplaza al 'response.setComplete()'
        return response.writeWith(Mono.just(buffer));
    }

    /**
     * Define el orden del filtro. Queremos que se ejecute primero.
     */
    @Override
    public int getOrder() {
        return -1; // -1 significa alta prioridad
    }
}
