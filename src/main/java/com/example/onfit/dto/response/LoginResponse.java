package com.example.onfit.dto.response;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter @AllArgsConstructor
public class LoginResponse {
    private String token;
    private Long userId;
    private String nickname;
    private String profileImg;
}
