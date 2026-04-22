package com.example.onfit.service;

import com.example.onfit.entity.Member;
import com.example.onfit.entity.MemberActivity;
import com.example.onfit.entity.Product;
import com.example.onfit.repository.MemberActivityRepository;
import com.example.onfit.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class StyleDnaService {

    @Autowired
    private MemberActivityRepository activityRepository;

    @Autowired
    private MemberRepository memberRepository;

    // 1. 활동 기록 저장 메서드 (컨트롤러에서 호출할 예정)
    public void recordActivity(Member member, Product product, String type) {
        int score = switch (type.toUpperCase()) {
            case "VIEW" -> 1;   // 상품 조회
            case "LIKE" -> 3;   // 찜하기
            case "FIT"  -> 5;   // 가상 피팅
            case "BUY"  -> 10;  // 장바구니/구매
            default -> 0;
        };

        MemberActivity activity = new MemberActivity();
        activity.setMember(member);
        activity.setProduct(product);
        activity.setActivityType(type.toUpperCase());
        activity.setScore(score);

        activityRepository.save(activity);
    }

    // 2. DNA 차트 점수 계산 메서드
    public Map<String, Integer> calculateDna(Long memberId) {
        List<MemberActivity> activities = activityRepository.findAllByMemberId(memberId);
        Map<String, Integer> rawScores = new HashMap<>();

        // 1) 모든 활동 기록의 태그별 점수 합산
        int totalSum = 0; // 전체 점수의 총합을 저장할 변수
        for (MemberActivity act : activities) {
            String tags = act.getProduct().getStyleTags();
            if (tags != null && !tags.isBlank()) {
                String[] tagArray = tags.split(",");
                for (String tag : tagArray) {
                    String korTag = translateTag(tag.trim());
                    int activityScore = act.getScore();
                    rawScores.put(korTag, rawScores.getOrDefault(korTag, 0) + activityScore);
                    totalSum += activityScore; // 🌟 전체 총점 누적
                }
            }
        }

        // 2) 비중 계산 (각 항목 점수 / 전체 총점 * 100)
        Map<String, Integer> finalScores = new HashMap<>();
        if (totalSum == 0) return finalScores;

        for (Map.Entry<String, Integer> entry : rawScores.entrySet()) {
            // 🌟 (항목 점수 / 전체 총합) * 100
            // 소수점 반올림을 위해 Math.round 사용
            int percentage = (int) Math.round(((double) entry.getValue() / totalSum) * 100);
            finalScores.put(entry.getKey(), percentage);
        }

        return finalScores;
    }

    // 3. 1등 DNA 추출
    public String getTopDna(Map<String, Integer> dnaScores) {
        if (dnaScores.isEmpty()) return "미진단";
        return dnaScores.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("미진단");
    }

    // 영어 DB 태그를 한글로 변환
    private String translateTag(String tag) {
        return switch (tag.toUpperCase()) {
            case "MINIMAL" -> "미니멀";
            case "CASUAL"  -> "캐주얼";
            case "STREET"  -> "스트릿";
            case "FORMAL"  -> "포멀";
            case "VINTAGE" -> "빈티지";
            case "OUTDOOR" -> "아웃도어";
            default -> tag;
        };
    }

    public void updateLevel(Member member) {
        int count  = member.getTotalOrderCount();
        int amount = member.getTotalOrderAmount();

        int newLevel = calculateLevel(count, amount);
        member.setStyleLevel(newLevel);
        member.setLastOrderAt(LocalDateTime.now());
        memberRepository.save(member);
    }

    private int calculateLevel(int count, int amount) {
        if (amount >= 1_000_000 && count >= 20) return 5;
        if (amount >= 500_000  && count >= 10) return 4;
        if (amount >= 300_000  && count >= 5)  return 3;
        if (amount >= 100_000  || count >= 3)  return 2;
        return 1;
    }

    public static String getLevelName(int level) {
        return switch (level) {
            case 2 -> "⭐ Style Starter";
            case 3 -> "💎 Color Expert";
            case 4 -> "👑 Fit Master";
            case 5 -> "🔥 OnFit Editor";
            default -> "🌱 New Fitter";
        };
    }

    public static int getNextLevelAmount(int level) {
        return switch (level) {
            case 1 -> 100_000;
            case 2 -> 300_000;
            case 3 -> 500_000;
            case 4 -> 1_000_000;
            default -> 0;
        };
    }
    // 스케줄러로 매일 자정 강등 체크
    @Scheduled(cron = "0 0 0 * * *")
    public void checkDemotion() {
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);
        List<Member> members = memberRepository.findAll();

        members.forEach(member -> {
            int level = member.getStyleLevel();
            if (level <= 1) return;

            LocalDateTime lastOrder = member.getLastOrderAt();
            boolean inactive = (lastOrder == null || lastOrder.isBefore(sixMonthsAgo));

            // 6개월 구매 기록 없으면 강등
            if (inactive) {
                // 최근 6개월 구매금액 계산은 OrderRepository에서 별도 조회 권장
                int demotedLevel = Math.max(1, level - 1);
                member.setStyleLevel(demotedLevel);
                memberRepository.save(member);
                System.out.println("강등 처리: " + member.getName() + " → " + demotedLevel + "레벨");
            }
        });
    }
}