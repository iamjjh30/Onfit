package com.example.onfit.controller;

import com.example.onfit.entity.FittingHistory;
import com.example.onfit.entity.Member;
import com.example.onfit.entity.Product;
import com.example.onfit.repository.FittingHistoryRepository;
import com.example.onfit.repository.MemberRepository;
import com.example.onfit.repository.ProductRepository;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController // 🌟 @Controller가 아니라 @RestController여야 합니다!
@RequestMapping("/api/ai") // 🌟 이 주소가 있어야 JS에서 404 에러가 안 납니다.
@RequiredArgsConstructor
public class AiIntegrationController {

    private final FittingHistoryRepository fittingRepository;
    private final ProductRepository productRepository;
    private final MemberRepository memberRepository;

    // [1] 가상 피팅 결과 저장
    @PostMapping("/save-fitting")
    public ResponseEntity<?> saveFitting(@RequestBody Map<String, Object> data, HttpSession session) {
        Member loginMember = (Member) session.getAttribute("loginMember");
        if (loginMember == null) {
            return ResponseEntity.status(401).build(); // 비로그인 시 401 반환
        }

        // JS에서 보낸 데이터 받기
        Long productId = Long.valueOf(data.get("productId").toString());
        String resultImg = (String) data.get("resultImageUrl");

        // DB 저장
        Product product = productRepository.findById(productId).orElseThrow();

        FittingHistory history = FittingHistory.builder()
                .member(loginMember)
                .product(product)
                .resultImageUrl(resultImg)
                .comment("AI 가상 피팅 완료") // 기본 한줄평
                .createdAt(LocalDateTime.now())
                .build();

        fittingRepository.save(history);
        return ResponseEntity.ok().build();
    }

    // [2] 퍼스널 컬러 진단 결과 저장 (기존 탭1 기능 연동)
    @PostMapping("/save-color")
    public ResponseEntity<?> saveColor(@RequestBody Map<String, String> data, HttpSession session) {
        Member loginMember = (Member) session.getAttribute("loginMember");
        if (loginMember == null) return ResponseEntity.status(401).build();

        String tone = data.get("tone");
        loginMember.setPersonalColor(tone);
        memberRepository.save(loginMember);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/products/recommend")
    public ResponseEntity<?> getRecommendedProductsByTone(@RequestParam String tone) {

        // 1. 임시 변수(tempSeason)에 먼저 값을 찾아서 담습니다.
        String tempSeason = "";
        if (tone.contains("봄") || tone.toLowerCase().contains("spring")) tempSeason = "SPRING_WARM";
        else if (tone.contains("여름") || tone.toLowerCase().contains("summer")) tempSeason = "SUMMER_COOL";
        else if (tone.contains("가을") || tone.toLowerCase().contains("autumn")) tempSeason = "AUTUMN_WARM";
        else if (tone.contains("겨울") || tone.toLowerCase().contains("winter")) tempSeason = "WINTER_COOL";

        // 🌟 2. [핵심 해결책] 람다에서 사용할 수 있도록 final 변수로 확정 짓습니다!
        final String finalSeasonEnum = tempSeason;

        // 3. 필터 안에서는 값이 절대 변하지 않는 finalSeasonEnum을 사용합니다.
        List<Map<String, Object>> recommendedList = productRepository.findAll().stream()
                .filter(p -> p.getRecommendedSeasons() != null && p.getRecommendedSeasons().contains(finalSeasonEnum))
                .limit(3)
                .map(p -> {
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("id", p.getId());
                    dto.put("name", p.getName());
                    dto.put("imageUrl", p.getImageUrl());
                    return dto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(recommendedList);
    }
}