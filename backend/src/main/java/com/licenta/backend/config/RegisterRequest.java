package com.licenta.backend.config;

import com.licenta.backend.entities.Role;
import com.licenta.backend.entities.TemporaryPermission;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {

    private String firstname;
    private String lastname;
    private String faculty;
    private String email;
    private String password;
    private Role role;
}
