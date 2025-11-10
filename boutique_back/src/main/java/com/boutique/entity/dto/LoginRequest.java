package com.boutique.entity.dto;

import lombok.Data;

/**
 * @author GERSON
 */

@Data
public class LoginRequest {
    private String username;
    private String password;
}
