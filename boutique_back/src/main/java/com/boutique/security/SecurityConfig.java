package com.boutique.security;

import com.boutique.service.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * @author GERSON
 */

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;

    // Ya no inyectamos JwtFilter
    public SecurityConfig(CustomUserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
//                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
//                        .requestMatchers(
//                                "api/auth/**",
//                                "/v3/api-docs/**",        // Rutas de Swagger/OpenAPI
//                                "/swagger-ui/**",
//                                "/swagger-ui.html",
//                                "/swagger-resources/**",
//                                "/webjars/**"
//                        ).permitAll()
                        // ¡CAMBIO CLAVE!
                        // Permitimos todas las demás peticiones porque confiamos
                        // en que el Gateway ya las autenticó.
                        .anyRequest().permitAll()
                );

        // --- FILTRO JWT ELIMINADO ---
        // Ya no añadimos el JwtFilter, el Gateway hace este trabajo.
        // .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        // Todavía necesitamos el AuthenticationManager para el endpoint de /login
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    //http://localhost:8080/swagger-ui/index.html#/

//    @Bean
//    public CorsConfigurationSource corsConfigurationSource() {
//        CorsConfiguration configuration = new CorsConfiguration();
//
//        // --- ¡CAMBIO DE SEGURIDAD IMPORTANTE! ---
//        // Ya no permitimos peticiones del frontend (5173).
//        // SOLO permitimos peticiones que vengan del API Gateway (8080).
//        configuration.setAllowedOrigins(List.of(
//                "http://localhost:8080",
//                "http://localhost:5173"
//        ));
//
//        // Métodos permitidos
//        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
//
//        // Headers permitidos
//        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
//
//        // Permitir credenciales si las necesitas (cookies, headers auth)
//        configuration.setAllowCredentials(true);
//
//        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//        source.registerCorsConfiguration("/**", configuration);
//
//        return source;
//    }
}

//@Configuration
//@EnableWebSecurity
//public class SecurityConfig {
//
//    private final JwtFilter jwtFilter;
//    private final CustomUserDetailsService userDetailsService;
//
//    public SecurityConfig(JwtFilter jwtFilter, CustomUserDetailsService userDetailsService) {
//        this.jwtFilter = jwtFilter;
//        this.userDetailsService = userDetailsService;
//    }
//
//    @Bean
//    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//        http
//                .csrf(csrf -> csrf.disable())
//                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
//                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
//                .authorizeHttpRequests(auth -> auth
//                        .requestMatchers(
//                                "api/auth/**",
//                                "api/usuarios/**",
//                                "/v3/api-docs/**",        // incluye todas las subrutas del JSON OpenAPI
//                                "/swagger-ui/**",         // necesario para la interfaz web
//                                "/swagger-ui.html",       // redirección clásica
//                                "/swagger-resources/**",  // recursos internos (por compatibilidad)
//                                "/webjars/**"             // assets estáticos (JS, CSS)
//                        ).permitAll()
//                        .anyRequest().authenticated()
//                )
//                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
//
//        return http.build();
//    }
//
//    @Bean
//    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
//            throws Exception {
//        return config.getAuthenticationManager();
//    }
//
//    @Bean
//    public PasswordEncoder passwordEncoder() {
//        return new BCryptPasswordEncoder();
//    }
//    //http://localhost:8080/swagger-ui/index.html#/
//
//    @Bean
//    public CorsConfigurationSource corsConfigurationSource() {
//        CorsConfiguration configuration = new CorsConfiguration();
//
//        // Permitir tu frontend
//        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
//
//        // Métodos permitidos
//        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
//
//        // Headers permitidos
//        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
//
//        // Permitir credenciales si las necesitas (cookies, headers auth)
//        configuration.setAllowCredentials(true);
//
//        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//        source.registerCorsConfiguration("/**", configuration);
//
//        return source;
//    }
//}