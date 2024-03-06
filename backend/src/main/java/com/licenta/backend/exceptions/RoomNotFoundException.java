package com.licenta.backend.exceptions;

public class RoomNotFoundException extends RuntimeException{
    public RoomNotFoundException(String message){
        super(message);
    }
}
