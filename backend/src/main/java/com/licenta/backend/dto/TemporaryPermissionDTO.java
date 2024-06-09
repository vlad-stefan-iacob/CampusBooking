package com.licenta.backend.dto;

import com.licenta.backend.entities.Role;
import lombok.Data;

@Data
public class TemporaryPermissionDTO {
    private Role temporaryRole;
    private boolean active;
}
