package com.licenta.backend.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.licenta.backend.config.AuthenticationRequest;
import com.licenta.backend.config.AuthenticationResponse;
import com.licenta.backend.config.RegisterRequest;
import com.licenta.backend.entities.Role;
import com.licenta.backend.services.AuthService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @Test
    @WithMockUser(roles = "ADMIN")
    void testRegister_shouldReturnToken() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .firstname("John")
                .lastname("Doe")
                .faculty("CS")
                .email("john@example.com")
                .password("pass123")
                .role(Role.STUDENT)
                .build();

        AuthenticationResponse response = AuthenticationResponse.builder()
                .token("mocked-jwt-token")
                .build();

        Mockito.when(authService.register(any(RegisterRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/admin/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mocked-jwt-token"));
    }

    @Test
    void testAuthenticate_shouldReturnTokenAndUserInfo() throws Exception {
        AuthenticationRequest request = AuthenticationRequest.builder()
                .email("john@example.com")
                .password("pass123")
                .build();

        AuthenticationResponse response = AuthenticationResponse.builder()
                .token("valid-jwt-token")
                .firstName("John")
                .lastName("Doe")
                .faculty("CS")
                .role(Role.STUDENT)
                .id(1)
                .build();

        Mockito.when(authService.authenticate(any(AuthenticationRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/authenticate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("valid-jwt-token"))
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.role").value("STUDENT"));
    }
}