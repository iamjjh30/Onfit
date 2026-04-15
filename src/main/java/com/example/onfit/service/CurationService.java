package com.example.onfit.service;

import com.example.onfit.entity.Member;
import com.example.onfit.entity.Product;
import com.example.onfit.repository.ProductRepository;
import com.example.onfit.dto.CurationResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class CurationService {

    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private StyleDnaService dnaService;

    public List<CurationResponse> getMonthlyRecommendation(Member member) {
        // 1. 회원의 스타일 DNA 비중 가져오기 (전체 합 100%)
        Map<String, Integer> dnaMap = dnaService.calculateDna(member.getId());
        String memberColor = member.getPersonalColor(); // 예: "SUMMER_COOL"

        // 2. 전체 상품(또는 이번 달 시즌 상품) 가져오기
        List<Product> allProducts = productRepository.findAll();

        List<CurationResponse> recommendedList = new ArrayList<>();

        for (Product product : allProducts) {
            double score = 0;
            List<String> reasons = new ArrayList<>();

            // [로직 01] 퍼스널 컬러 매칭 (가중치 50점)
            if (memberColor != null && product.getRecommendedSeasons() != null) {
                if (product.getRecommendedSeasons().contains(memberColor)) {
                    score += 50;
                    reasons.add("🎨 " + translateColor(memberColor) + " 베스트 컬러");
                }
            }

            // [로직 02] 스타일 DNA 매칭 (가중치: DNA 비중만큼 점수 부여)
            if (!dnaMap.isEmpty() && product.getStyleTags() != null) {
                String[] pTags = product.getStyleTags().split(",");
                for (String tag : pTags) {
                    String korTag = translateTag(tag.trim());
                    if (dnaMap.containsKey(korTag)) {
                        int dnaWeight = dnaMap.get(korTag); // 해당 스타일의 유저 비중 (%)
                        score += (dnaWeight * 0.5); // DNA 비중이 높을수록 높은 점수
                        if (dnaWeight >= 30) { // 30% 이상 차지하는 주요 DNA일 때 문구 추가
                            reasons.add("🧬 " + korTag + " DNA 매칭 완료");
                        }
                    }
                }
            }

            // [로직 03] 시즌/트렌드 보너스 (가변성 부여)
            // 실제 서비스라면 '이번 달 신상품'이나 '조회수 급상승' 상품에 가산점 부여 가능
            score += Math.random() * 10; // 약간의 랜덤성을 섞어 매번 신선함 유지

            if (score > 10) { // 일정 점수 이상인 것만 후보에 등록
                recommendedList.add(new CurationResponse(
                        product.getId(),
                        product.getName(),
                        product.getPrice(),
                        product.getImageUrl(),
                        reasons,
                        Math.min(score, 100.0) // 최대 100점
                ));
            }
        }

        // 3. 점수 높은 순으로 정렬하여 상위 3개 반환
        return recommendedList.stream()
                .sorted(Comparator.comparingDouble(CurationResponse::getMatchScore).reversed())
                .limit(3)
                .collect(Collectors.toList());
    }

    private String translateColor(String color) {
        if (color == null) return "뉴트럴";
        return color.replace("_", " ");
    }

    private String translateTag(String tag) {
        return switch (tag.toUpperCase()) {
            case "MINIMAL" -> "미니멀";
            case "CASUAL" -> "캐주얼";
            case "STREET" -> "스트릿";
            case "FORMAL" -> "포멀";
            case "VINTAGE" -> "빈티지";
            default -> tag;
        };
    }
}