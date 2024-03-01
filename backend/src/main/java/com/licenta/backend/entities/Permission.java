package com.licenta.backend.entities;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum Permission {
    ADMIN_READ("admin:read"),
    ADMIN_UPDATE("admin:update"),
    ADMIN_CREATE("admin:create"),
    ADMIN_DELETE("admin:delete"),

    STUDENT_READ("student:read"),
    STUDENT_UPDATE("student:update"),
    STUDENT_CREATE("student:create"),
    STUDENT_DELETE("student:delete")
    ;

    @Getter
    private final String permission;
}
