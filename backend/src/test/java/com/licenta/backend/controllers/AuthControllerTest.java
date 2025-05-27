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
        // construim un obiect AuthenticationRequest cu email si parola
        AuthenticationRequest request = AuthenticationRequest.builder()
                .email("vlad@iacob.com")
                .password("pass123")
                .build();

        // definim un răspuns simulat (mocked) pe care serviciul de autentificare ar trebui sa il returneze
        AuthenticationResponse response = AuthenticationResponse.builder()
                .token("valid-jwt-token")
                .firstName("Vlad")
                .lastName("Iacob")
                .faculty("CS")
                .role(Role.STUDENT)
                .id(1)
                .build();

        // configurăm comportamentul simulat al serviciului: cand se apeleaza authenticate cu orice request, returneaza raspunsul de mai sus
        Mockito.when(authService.authenticate(any(AuthenticationRequest.class))).thenReturn(response);

        // executam o cerere POST catre endpoint-ul de autentificare cu corpul JSON corespunzator
        mockMvc.perform(post("/api/v1/auth/authenticate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                // verificam ca raspunsul HTTP este 200 OK
                .andExpect(status().isOk())
                // verificam ca raspunsul contine token-ul asteptat
                .andExpect(jsonPath("$.token").value("valid-jwt-token"))
                // verificam ca numele returnat este corect
                .andExpect(jsonPath("$.firstName").value("Vlad"))
                // verificam ca rolul returnat este corect
                .andExpect(jsonPath("$.role").value("STUDENT"));
    }
}