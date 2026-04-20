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

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiIntegrationController {

    private final FittingHistoryRepository fittingRepository;
    private final ProductRepository productRepository;
    private final MemberRepository memberRepository;

    // [1] 가상 피팅 결과 저장 (상의/하의 동시 저장 지원)
    @PostMapping("/save-fitting")
    public ResponseEntity<?> saveFitting(@RequestBody Map<String, Object> data, HttpSession session) {
        Member loginMember = (Member) session.getAttribute("loginMember");
        if (loginMember == null) return ResponseEntity.status(401).build();

        String resultImg = data.get("resultImageUrl") != null
                ? data.get("resultImageUrl").toString() : null;

        if (resultImg == null) {
            return ResponseEntity.badRequest().body("resultImageUrl이 없습니다.");
        }

        Object topIdObj    = data.get("topProductId");
        Object bottomIdObj = data.get("bottomProductId");
        Object legacyIdObj = data.get("productId"); // 기존 단일 방식 호환

        // 상의 저장
        if (topIdObj != null) {
            saveHistory(loginMember, Long.valueOf(topIdObj.toString()), resultImg);
        }

        // 하의 저장
        if (bottomIdObj != null) {
            saveHistory(loginMember, Long.valueOf(bottomIdObj.toString()), resultImg);
        }

        // 기존 단일 productId 방식 호환
        if (topIdObj == null && bottomIdObj == null && legacyIdObj != null) {
            saveHistory(loginMember, Long.valueOf(legacyIdObj.toString()), resultImg);
        }

        return ResponseEntity.ok().build();
    }

    // 피팅 히스토리 저장 내부 메서드
    private void saveHistory(Member member, Long productId, String resultImg) {
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) return;

        FittingHistory history = FittingHistory.builder()
                .member(member)
                .product(product)
                .resultImageUrl(resultImg)
                .comment("AI 가상 피팅 완료")
                .createdAt(LocalDateTime.now())
                .build();

        fittingRepository.save(history);
    }

    // [2] 퍼스널 컬러 진단 결과 저장
    @PostMapping("/save-color")
    public ResponseEntity<?> saveColor(@RequestBody Map<String, String> data, HttpSession session) {
        Member loginMember = (Member) session.getAttribute("loginMember");
        if (loginMember == null) return ResponseEntity.status(401).build();

        String tone = data.get("tone");
        loginMember.setPersonalColor(tone);
        memberRepository.save(loginMember);

        return ResponseEntity.ok().build();
    }

    // [3] 퍼스널 컬러 기반 상품 추천
    @GetMapping("/products/recommend")
    public ResponseEntity<?> getRecommendedProductsByTone(@RequestParam String tone) {

        String tempSeason = "";
        if (tone.contains("봄") || tone.toLowerCase().contains("spring"))        tempSeason = "SPRING_WARM";
        else if (tone.contains("여름") || tone.toLowerCase().contains("summer")) tempSeason = "SUMMER_COOL";
        else if (tone.contains("가을") || tone.toLowerCase().contains("autumn")) tempSeason = "AUTUMN_WARM";
        else if (tone.contains("겨울") || tone.toLowerCase().contains("winter")) tempSeason = "WINTER_COOL";

        final String finalSeasonEnum = tempSeason;

        List<Map<String, Object>> recommendedList = productRepository.findAll().stream()
                .filter(p -> p.getRecommendedSeasons() != null
                        && p.getRecommendedSeasons().contains(finalSeasonEnum))
                .limit(3)
                .map(p -> {
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("id",       p.getId());
                    dto.put("name",     p.getName());
                    dto.put("imageUrl", p.getImageUrl());
                    dto.put("category", p.getCategory());
                    dto.put("price",    p.getPrice());
                    return dto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(recommendedList);
    }
}