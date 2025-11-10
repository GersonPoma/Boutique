package com.boutique.controller;

import com.boutique.entity.dto.LoginRequest;
import com.boutique.entity.dto.LoginResponse;
import com.boutique.entity.Usuario;
import com.boutique.repository.UsuarioRepository;
import com.boutique.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * @author GERSON
 */

@RestController
@RequestMapping("api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private JwtUtils jwtUtils;

    // Opción 1: Solo access y refresh token (con id y rol dentro del JWT)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        Usuario usuario = usuarioRepository.findByUsername(request.getUsername()).orElseThrow();

        String accessToken = jwtUtils.generateAccessToken(usuario);
        String refreshToken = jwtUtils.generateRefreshToken(usuario);

        Map<String, String> response = new HashMap<>();
        response.put("access_token", accessToken);
        response.put("refresh_token", refreshToken);

        return ResponseEntity.ok(response);
    }

    // Opción 2: Además de los tokens, se devuelven id y rol aparte
    @PostMapping("/login2")
    public ResponseEntity<LoginResponse> loginWithDetails(@RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        Usuario usuario = usuarioRepository.findByUsername(request.getUsername()).orElseThrow();

        String accessToken = jwtUtils.generateAccessToken(usuario);
        String refreshToken = jwtUtils.generateRefreshToken(usuario);

        Long perfilId = usuario.getEmpleado() != null
                ? usuario.getEmpleado().getId()
                : usuario.getCliente() != null
                ? usuario.getCliente().getId()
                : usuario.getId();

        LoginResponse response = LoginResponse.builder()
                .access_token(accessToken)
                .refresh_token(refreshToken)
                .id(perfilId)
                .rol(usuario.getRol().name())
                .build();

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    // Refresh token endpoint
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refresh_token");
        if (!jwtUtils.validateToken(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh token inválido");
        }

        String username = jwtUtils.extractUsername(refreshToken);
        Usuario usuario = usuarioRepository.findByUsername(username).orElseThrow();
        String newAccessToken = jwtUtils.generateAccessToken(usuario);

        Map<String, String> response = new HashMap<>();
        response.put("access_token", newAccessToken);

        return ResponseEntity.ok(response);
    }
}
