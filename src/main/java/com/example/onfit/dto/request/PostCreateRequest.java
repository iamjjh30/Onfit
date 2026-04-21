package com.example.onfit.dto.request;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class PostCreateRequest {
    @NotBlank private String title;
    @NotBlank private String content;
    private String imgUrl;
    private String type;
}
