package com.licenta.backend.entities;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static com.licenta.backend.entities.Permission.*;

@Getter
@RequiredArgsConstructor
public enum Role {

    ADMIN(
            Set.of(
                    ADMIN_READ,
                    ADMIN_UPDATE,
                    ADMIN_DELETE,
                    ADMIN_CREATE,
                    STUDENT_READ,
                    STUDENT_UPDATE,
                    STUDENT_DELETE,
                    STUDENT_CREATE,
                    PROFESOR_READ,
                    PROFESOR_UPDATE,
                    PROFESOR_DELETE,
                    PROFESOR_CREATE,
                    ASISTENT_READ,
                    ASISTENT_UPDATE,
                    ASISTENT_DELETE,
                    ASISTENT_CREATE
            )
    ),
    STUDENT(
            Set.of(
                    STUDENT_READ,
                    STUDENT_UPDATE,
                    STUDENT_DELETE,
                    STUDENT_CREATE
            )
    ),
    PROFESOR(
            Set.of(
                    PROFESOR_READ,
                    PROFESOR_UPDATE,
                    PROFESOR_DELETE,
                    PROFESOR_CREATE
            )
    ),
    ASISTENT(
            Set.of(
                    ASISTENT_READ,
                    ASISTENT_UPDATE,
                    ASISTENT_DELETE,
                    ASISTENT_CREATE
            )
    )

    ;

    private final Set<Permission> permissions;

    public List<SimpleGrantedAuthority> getAuthorities() {
        var authorities = getPermissions()
                .stream()
                .map(permission -> new SimpleGrantedAuthority(permission.getPermission()))
                .collect(Collectors.toList());
        authorities.add(new SimpleGrantedAuthority("ROLE_" + this.name()));
        return authorities;
    }
}
