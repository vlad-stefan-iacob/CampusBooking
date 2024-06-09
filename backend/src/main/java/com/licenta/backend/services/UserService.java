package com.licenta.backend.services;

import com.licenta.backend.converter.UserDTOConverter;
import com.licenta.backend.dto.UserDTO;
import com.licenta.backend.entities.Role;
import com.licenta.backend.entities.User;
import com.licenta.backend.entities.TemporaryPermission;
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
            user.setFaculty(userDTO.getFaculty());
            user.setEmail(userDTO.getEmail());
            user.setRole(userDTO.getRole());

            if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
                user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
            }

            // Update temporary permissions
            user.getTemporaryPermissions().clear();
            if (userDTO.getTemporaryPermissions() != null) {
                List<TemporaryPermission> temporaryPermissions = userDTO.getTemporaryPermissions().stream()
                        .map(tempPermDTO -> TemporaryPermission.builder()
                                .temporaryRole(tempPermDTO.getTemporaryRole())
                                .active(tempPermDTO.isActive())
                                .user(user)
                                .build())
                        .toList();
                user.getTemporaryPermissions().addAll(temporaryPermissions);
            }

            return userRepository.save(user);
        } else {
            throw new UserNotFoundException("User with ID: " + userId + " not found!");
        }
    }

    public User updateUserPassword(Integer userId, UserDTO userDTO){
        Optional<User> existingUser = userRepository.findById(userId);
        if (existingUser.isPresent()) {
            User user = existingUser.get();

            user.setPassword(passwordEncoder.encode(userDTO.getPassword()));

            return userRepository.save(user);
        } else {
            throw new UserNotFoundException("User with ID: " + userId + " not found!");
        }
    }

    public void deleteUser(Integer userId){
        TokenRepository.deleteByUserId(userId);
        userRepository.deleteById(userId);
    }

    public String decodePassword(Integer userId) {
        Optional<User> optionalUser = userRepository.findById(userId);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            return user.getPassword();
        } else {
            throw new UserNotFoundException("User with ID: " + userId + " not found!");
        }
    }

    public void addTemporaryPermission(Integer userId, Role temporaryRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User with ID: " + userId + " not found!"));

        TemporaryPermission tempPermission = TemporaryPermission.builder()
                .user(user)
                .temporaryRole(temporaryRole)
                .active(true)
                .build();

        user.getTemporaryPermissions().add(tempPermission);
        userRepository.save(user);
    }

    public void removeTemporaryPermission(Integer userId, Role temporaryRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User with ID: " + userId + " not found!"));

        user.getTemporaryPermissions().stream()
                .filter(tempPerm -> tempPerm.getTemporaryRole() == temporaryRole && tempPerm.isActive())
                .forEach(tempPerm -> tempPerm.setActive(false));

        userRepository.save(user);
    }

    public List<String> getTemporaryPermissions(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User with ID: " + userId + " not found!"));

        return user.getTemporaryPermissions().stream()
                .filter(TemporaryPermission::isActive) // Filter only active permissions
                .map(TemporaryPermission::getTemporaryRole)
                .map(Enum::name)
                .collect(Collectors.toList());
    }

}
