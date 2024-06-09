package com.licenta.backend.dto;

import com.licenta.backend.entities.Role;
import lombok.Data;

import java.util.List;

@Data
public class UserDTO {
    private Integer id;
    private String firstname;
    private String lastname;
    private String faculty;
    private String email;
    private String password;
    private Role role;
    private List<TemporaryPermissionDTO> temporaryPermissions;
}
