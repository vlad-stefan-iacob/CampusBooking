package com.licenta.backend.converter;

import com.licenta.backend.dto.UserDTO;
import com.licenta.backend.entities.User;
import org.springframework.stereotype.Service;

@Service
public class UserDTOConverter {

    public UserDTO convertToDTO(User user) {
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setFirstname(user.getFirstname());
        userDTO.setLastname(user.getLastname());
        userDTO.setEmail(user.getEmail());
        userDTO.setPassword(user.getPassword());
        userDTO.setRole(user.getRole());

        return userDTO;
    }
}
