package com.example.onfit.dto.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ReviewRequest {

    @NotBlank(message = "작성자 이름을 입력해 주세요.")
    private String authorName;

    @NotBlank(message = "제목을 입력해 주세요.")
    @Size(max = 200, message = "제목은 200자 이내로 입력해 주세요.")
    private String title;

    @NotBlank(message = "내용을 입력해 주세요.")
    private String content;

    @NotNull(message = "별점을 선택해 주세요.")
    @Min(value = 1, message = "별점은 최소 1점입니다.")
    @Max(value = 5, message = "별점은 최대 5점입니다.")
    private Integer stars;
}
