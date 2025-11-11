package com.boutique.api_gateway.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

/**
 * Esta configuración deshabilita la seguridad por defecto de Spring Security
 * (que genera la contraseña) para el Gateway.
 *
 * Confiamos en nuestro 'AuthenticationFilter' global para manejar la
 * seguridad de las rutas que van al backend.
 *
 * NOTA: La configuración de CORS se maneja en application.yaml
 * para evitar duplicación y conflictos.
 */
@Configuration
@EnableWebFluxSecurity // Importante: Usar la versión reactiva (WebFlux) para Gateway
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        http
                .authorizeExchange(exchanges ->
                        // Permitimos todo a nivel de Spring Security
                        // porque nuestro AuthenticationFilter (filtro de Gateway)
                        // ya se encarga de la lógica de JWT.
                        exchanges.anyExchange().permitAll()
                )
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable) // Desactiva login básico
                .csrf(ServerHttpSecurity.CsrfSpec::disable) // Desactiva CSRF
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable); // Desactiva form login

        return http.build();
    }
}