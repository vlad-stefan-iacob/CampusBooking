package com.licenta.backend.controllers;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/adminsauceofi")
public class AdminController {
    @GetMapping("/unu")
    @PreAuthorize("hasRole('ADMIN')")
    public String get() {
        return "GET:: management controller";
    }
}
