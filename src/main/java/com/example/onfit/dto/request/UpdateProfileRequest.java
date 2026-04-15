package com.example.onfit.dto.request;
import lombok.Getter;
import java.time.LocalDate;

@Getter
public class UpdateProfileRequest {
    private String nickname;
    private String name;
    private String email;
    private String phone;
    private LocalDate birth;
    private String profileImg;
}
