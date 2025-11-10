package com.boutique.security;

import com.boutique.entity.Usuario;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * @author GERSON
 */

@Component
public class JwtUtils {
    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access.expiration}")
    private long accessExpiration; // en milisegundos

    private long refreshExpiration; // en milisegundos

    private SecretKey getSigningKey() {
        // Para HS256/HS384/HS512: la clave debe ser lo
        // suficientemente larga (p. ej., 32+ bytes para HS256,
        // 64+ bytes para HS512).
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    // Crear Access Token
    public String generateAccessToken(Usuario usuario) {
        return Jwts.builder()
                .subject(usuario.getUsername())
                .claim("rol", usuario.getRol())
                .claim("id", getPerfilId(usuario))
                .claim("id_sucursal", usuario.getEmpleado() != null ? usuario.getEmpleado().getSucursal().getId() : null)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    // Crear Refresh Token
    public String generateRefreshToken(Usuario usuario) {
        return Jwts.builder()
                .subject(usuario.getUsername())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    // Método auxiliar para obtener el ID del perfil asociado
    private Long getPerfilId(Usuario usuario) {
        if (usuario.getEmpleado() != null)
            return usuario.getEmpleado().getId();
        else if (usuario.getCliente() != null)
            return usuario.getCliente().getId();
        else
            return usuario.getId();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token inválido o expirado");
        }
    }

    public String extractUsername(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

}
