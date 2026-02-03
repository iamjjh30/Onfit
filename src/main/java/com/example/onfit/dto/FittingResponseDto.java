package com.example.onfit.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class FittingResponseDto {
    private List<Map<String, Object>> coords; // x, y, z, visibility가 담긴 리스트
    private String model_path;
}
