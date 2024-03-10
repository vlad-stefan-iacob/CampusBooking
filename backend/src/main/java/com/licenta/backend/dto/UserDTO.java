package com.licenta.backend.dto;

import com.licenta.backend.entities.Role;
import lombok.Data;

@Data
public class UserDTO {
    private Integer id;
    private String firstname;
    private String lastname;
    private String email;
    private String password;
    private Role role;
}
