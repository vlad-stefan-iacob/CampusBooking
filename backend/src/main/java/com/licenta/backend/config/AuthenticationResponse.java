package com.licenta.backend.config;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.licenta.backend.entities.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationResponse {

    @JsonProperty("token")
    private String token;
    private String firstName;
    private String lastName;
    private Role role;
    private Integer id;
}
