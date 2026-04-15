package com.example.onfit.dto.request;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import java.time.LocalDate;

@Getter
public class SignupRequest {
    @NotBlank private String loginId;
    @NotBlank private String password;
    private String nickname;
    private String name;
    private String email;
    private String phone;
    private LocalDate birth;
}
