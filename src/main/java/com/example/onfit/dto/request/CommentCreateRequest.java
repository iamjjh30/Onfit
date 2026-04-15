package com.example.onfit.dto.request;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class CommentCreateRequest {
    @NotBlank private String content;
    private Long parentId; // 대댓글일 경우 부모 댓글 ID
}
