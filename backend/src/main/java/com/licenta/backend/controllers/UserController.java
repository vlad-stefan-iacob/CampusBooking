package com.licenta.backend.controllers;

import com.licenta.backend.dto.UserDTO;
import com.licenta.backend.entities.User;
import com.licenta.backend.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    @Autowired
    UserService userService;

    @GetMapping("/all-users")
    public List<UserDTO> getAllUsers(){
        return userService.getAllUsers();
    }

    @GetMapping("/user/{userId}")
    public List<UserDTO> getUserById(@PathVariable Integer userId){
        return userService.getUserById(userId);
    }

    @PutMapping("/update-user/{userId}")
    public User updateUser(@PathVariable Integer userId, @RequestBody UserDTO updatedUser) {
        return userService.updateUser(userId, updatedUser);
    }

    @DeleteMapping("/delete-user/{userId}")
    public String deleteUser(@PathVariable Integer userId){
        userService.deleteUser(userId);
        return "User deleted";
    }
}
