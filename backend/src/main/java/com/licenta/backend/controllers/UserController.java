package com.licenta.backend.controllers;

import com.licenta.backend.dto.UserDTO;
import com.licenta.backend.entities.User;
import com.licenta.backend.exceptions.UserNotFoundException;
import com.licenta.backend.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    @Autowired
    UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all-users")
    public List<UserDTO> getAllUsers() {
        return userService.getAllUsers();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'ASISTENT', 'PROFESOR')")
    @GetMapping("/user/{userId}")
    public List<UserDTO> getUserById(@PathVariable Integer userId) {
        return userService.getUserById(userId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/update-user/{userId}")
    public User updateUser(@PathVariable Integer userId, @RequestBody UserDTO updatedUser) {
        return userService.updateUser(userId, updatedUser);
    }

    //
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'ASISTENT', 'PROFESOR')")
    @PutMapping("/update-user-password/{userId}")
    public User updateUserPassword(@PathVariable Integer userId, @RequestBody UserDTO updatedUserPass) {
        return userService.updateUserPassword(userId, updatedUserPass);
    }


    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/delete-user/{userId}")
    public String deleteUser(@PathVariable Integer userId) {
        userService.deleteUser(userId);
        return "User deleted";
    }

    //
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'ASISTENT', 'PROFESOR')")
    @GetMapping("/verify-password/{userId}/{password}")
    public ResponseEntity<?> verifyPassword(@PathVariable Integer userId, @PathVariable String password) {
        try {
            String decodedPassword = userService.decodePassword(userId); // Fetch the decoded password from the userService
            boolean isPasswordCorrect = passwordEncoder.matches(password, decodedPassword);
            return ResponseEntity.ok(isPasswordCorrect);
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.singletonMap("error", "Failed to verify password"));
        }
    }

}
