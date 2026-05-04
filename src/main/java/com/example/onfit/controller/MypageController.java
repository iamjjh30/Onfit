package com.example.onfit.controller;

import com.example.onfit.entity.Coupon;
import com.example.onfit.entity.Member;
import com.example.onfit.repository.CouponRepository;
import com.example.onfit.repository.MemberRepository;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Controller
@RequiredArgsConstructor
public class MypageController {

    private final MemberRepository memberRepository;
    private final CouponRepository couponRepository;

    /* ── 페이지 렌더링 ── */
    @GetMapping("/MyPage")
    public String myPage(HttpSession session, Model model) {
        Member loginMember = (Member) session.getAttribute("loginMember");
        if (loginMember == null) return "redirect:/login";

        // 쿠폰 목록
        List<Coupon> coupons = couponRepository.findByMemberAndIsUsedFalseOrderByExpiredAtAsc(loginMember);
        long couponCount = coupons.stream().filter(c -> !c.getIsUsed()).count();

        // 레벨 정보
        int level = loginMember.getStyleLevel() != null ? loginMember.getStyleLevel() : 1;
        String levelName = getLevelName(level);
        int nextAmount   = getNextAmount(level);
        int orderAmount  = loginMember.getTotalOrderAmount() != null ? loginMember.getTotalOrderAmount() : 0;
        int progressPct  = level >= 5 ? 100 : (nextAmount > 0 ? Math.min(100, orderAmount * 100 / nextAmount) : 0);

        model.addAttribute("coupons",      coupons);
        model.addAttribute("couponCount",  couponCount);
        model.addAttribute("levelName",    levelName);
        model.addAttribute("nextAmount",   nextAmount);
        model.addAttribute("progressPct",  progressPct);
        model.addAttribute("orderAmount",  orderAmount);
        model.addAttribute("orderCount",   loginMember.getTotalOrderCount());

        return "MyPage";
    }

    /* ── 회원 정보 수정 API ── */
    @PutMapping("/api/mypage/info")
    @ResponseBody
    public ResponseEntity<?> updateInfo(
            HttpSession session,
            @RequestBody Map<String, String> body) {

        Member loginMember = (Member) session.getAttribute("loginMember");
        if (loginMember == null) return ResponseEntity.status(401).build();

        Optional<Member> opt = memberRepository.findById(loginMember.getId());
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Member member = opt.get();
        if (body.containsKey("name"))  member.setName(body.get("name"));
        if (body.containsKey("email")) member.setEmail(body.get("email"));
        if (body.containsKey("tel"))   member.setTel(body.get("tel"));
        memberRepository.save(member);

        // 세션 갱신
        session.setAttribute("loginMember", member);
        return ResponseEntity.ok().build();
    }

    /* ── 비밀번호 변경 API ── */
    @PutMapping("/api/mypage/password")
    @ResponseBody
    public ResponseEntity<?> changePassword(
            HttpSession session,
            @RequestBody Map<String, String> body) {

        Member loginMember = (Member) session.getAttribute("loginMember");
        if (loginMember == null) return ResponseEntity.status(401).build();

        String currentPassword = body.get("currentPassword");
        String newPassword     = body.get("newPassword");

        Optional<Member> opt = memberRepository.findById(loginMember.getId());
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Member member = opt.get();
        if (!member.getPassword().equals(currentPassword)) {
            return ResponseEntity.badRequest().body(Map.of("message", "현재 비밀번호가 일치하지 않습니다."));
        }

        member.setPassword(newPassword);
        memberRepository.save(member);
        session.setAttribute("loginMember", member);
        return ResponseEntity.ok().build();
    }

    /* ── 배송지 수정 API ── */
    @PutMapping("/api/mypage/address")
    @ResponseBody
    public ResponseEntity<?> updateAddress(
            HttpSession session,
            @RequestBody Map<String, String> body) {

        Member loginMember = (Member) session.getAttribute("loginMember");
        if (loginMember == null) return ResponseEntity.status(401).build();

        Optional<Member> opt = memberRepository.findById(loginMember.getId());
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Member member = opt.get();
        member.setAddress(body.getOrDefault("address", ""));
        member.setAddressDetail(body.getOrDefault("addressDetail", ""));
        memberRepository.save(member);
        session.setAttribute("loginMember", member);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/api/mypage/coupons")
    @ResponseBody
    public ResponseEntity<?> getAvailableCoupons(HttpSession session) {
        Member loginMember = (Member) session.getAttribute("loginMember");
        if (loginMember == null) return ResponseEntity.status(401).build();

        List<Coupon> coupons = couponRepository
                .findByMemberAndIsUsedFalseOrderByExpiredAtAsc(loginMember);

        List<Map<String, Object>> result = coupons.stream().map(c -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id",             c.getId());
            map.put("name",           c.getName());
            map.put("code",           c.getCode());
            map.put("discountAmount", c.getDiscountAmount());
            map.put("discountRate",   c.getDiscountRate());
            map.put("minOrderAmount", c.getMinOrderAmount());
            map.put("expiredAt",      c.getExpiredAt().toString());
            return map;
        }).toList();

        return ResponseEntity.ok(result);
    }

    /* ── 회원 탈퇴 API ── */
    @DeleteMapping("/api/mypage/withdraw")
    @ResponseBody
    public ResponseEntity<?> withdraw(
            HttpSession session,
            @RequestBody Map<String, String> body) {

        Member loginMember = (Member) session.getAttribute("loginMember");
        if (loginMember == null) return ResponseEntity.status(401).build();

        Optional<Member> opt = memberRepository.findById(loginMember.getId());
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Member member = opt.get();
        if (!member.getPassword().equals(body.get("password"))) {
            return ResponseEntity.badRequest().body(Map.of("message", "비밀번호가 일치하지 않습니다."));
        }

        memberRepository.delete(member);
        session.invalidate();
        return ResponseEntity.ok().build();
    }

    /* ── 레벨 유틸 ── */
    private String getLevelName(int level) {
        return switch (level) {
            case 1 -> "🌱 New Fitter";
            case 2 -> "⭐ Style Starter";
            case 3 -> "💎 Color Expert";
            case 4 -> "👑 Fit Master";
            case 5 -> "🔥 OnFit Editor";
            default -> "New Fitter";
        };
    }

    private int getNextAmount(int level) {
        return switch (level) {
            case 1 -> 100000;
            case 2 -> 300000;
            case 3 -> 500000;
            case 4 -> 1000000;
            default -> 0;
        };
    }
}