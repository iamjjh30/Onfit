package com.example.onfit.dto.request;

import lombok.Getter;

// FittingRequestDto.java
@Getter
public class FittingRequestDto {
    private Long topProductId;      // ✅ 추가
    private Long bottomProductId;   // ✅ 추가
    private String resultImageUrl;
}
