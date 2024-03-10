package com.licenta.backend.services;

import com.licenta.backend.converter.UserDTOConverter;
import com.licenta.backend.dto.UserDTO;
import com.licenta.backend.entities.User;
import com.licenta.backend.exceptions.UserNotFoundException;
import com.licenta.backend.repositories.TokenRepository;
import com.licenta.backend.repositories.UserRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserService {
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserDTOConverter userDTOConverter;

    public List<UserDTO> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(userDTOConverter::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<UserDTO> getUserById(Integer userId) {
        Optional<User> users = userRepository.findById(userId);
        return users.stream()
                .map(userDTOConverter::convertToDTO)
                .collect(Collectors.toList());
    }

    public User updateUser(Integer userId, UserDTO userDTO) {
        Optional<User> existingUser = userRepository.findById(userId);

        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setFirstname(userDTO.getFirstname());
            user.setLastname(userDTO.getLastname());
            user.setEmail(userDTO.getEmail());
            user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
            user.setRole(userDTO.getRole());

            return userRepository.save(user);
        } else {
            throw new UserNotFoundException("User with ID: " + userId+ " not found!");
        }
    }

    public void deleteUser(Integer userId){
        TokenRepository.deleteByUserId(userId);
        userRepository.deleteById(userId);
    }
}
