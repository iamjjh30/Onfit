package com.example.onfit.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.util.List;

@Getter
@AllArgsConstructor
public class CurationResponse {
    private Long productId;
    private String name;
    private int price;
    private String imgUrl;
    private List<String> reasons; // 추천 이유 (예: "여름 쿨톤 베스트 컬러", "미니멀 취향 저격")
    private double matchScore;    // 매칭 점수 (%)
}