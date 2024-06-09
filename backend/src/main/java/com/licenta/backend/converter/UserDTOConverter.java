package com.licenta.backend.converter;

import com.licenta.backend.dto.TemporaryPermissionDTO;
import com.licenta.backend.dto.UserDTO;
import com.licenta.backend.entities.TemporaryPermission;
import com.licenta.backend.entities.User;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserDTOConverter {

    public UserDTO convertToDTO(User user) {
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setFirstname(user.getFirstname());
        userDTO.setLastname(user.getLastname());
        userDTO.setFaculty(user.getFaculty());
        userDTO.setEmail(user.getEmail());
        userDTO.setPassword(user.getPassword());
        userDTO.setRole(user.getRole());
        userDTO.setTemporaryPermissions(convertTemporaryPermissionsToDTO(user.getTemporaryPermissions()));

        return userDTO;
    }

    private List<TemporaryPermissionDTO> convertTemporaryPermissionsToDTO(List<TemporaryPermission> temporaryPermissions) {
        return temporaryPermissions.stream()
                .map(this::convertTemporaryPermissionToDTO)
                .collect(Collectors.toList());
    }

    private TemporaryPermissionDTO convertTemporaryPermissionToDTO(TemporaryPermission temporaryPermission) {
        TemporaryPermissionDTO dto = new TemporaryPermissionDTO();
        dto.setTemporaryRole(temporaryPermission.getTemporaryRole());
        dto.setActive(temporaryPermission.isActive());
        return dto;
    }
}
