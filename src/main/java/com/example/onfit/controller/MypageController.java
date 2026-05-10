package com.example.onfit.controller;

import com.example.onfit.entity.Coupon;
import com.example.onfit.entity.DeliveryAddress;
import com.example.onfit.entity.Member;
import com.example.onfit.repository.CouponRepository;
import com.example.onfit.repository.DeliveryAddressRepository;
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

    private final DeliveryAddressRepository deliveryAddressRepository;
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

        List<DeliveryAddress> addressList = deliveryAddressRepository.findByMemberOrderByIdDesc(loginMember);
        model.addAttribute("addressList", addressList);

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
    @PostMapping("/api/mypage/address")
    @ResponseBody
    public ResponseEntity<?> addAddress(HttpSession session, @RequestBody Map<String, Object> body) {
        return saveAddressData(session, body, null); // id가 없으므로 신규 추가
    }

    /* ── 배송지 수정 API (PUT) ── */
    @PutMapping("/api/mypage/address")
    @ResponseBody
    public ResponseEntity<?> updateAddress(HttpSession session, @RequestBody Map<String, Object> body) {
        Long id = Long.valueOf(body.get("id").toString());
        return saveAddressData(session, body, id); // id가 있으므로 기존 덮어쓰기
    }

    /* ── 공통 저장/수정 로직 ── */
    private ResponseEntity<?> saveAddressData(HttpSession session, Map<String, Object> body, Long id) {
        Member loginMember = (Member) session.getAttribute("loginMember");
        if (loginMember == null) return ResponseEntity.status(401).build();

        Member member = memberRepository.findById(loginMember.getId()).orElse(null);
        if (member == null) return ResponseEntity.notFound().build();

        String addressName = (String) body.get("addressName");
        String address = (String) body.get("address");
        String addressDetail = (String) body.get("addressDetail");
        Boolean isDefault = (Boolean) body.get("isDefault");

        // 🌟 "기본 배송지"로 체크했다면?
        if (isDefault != null && isDefault) {
            // 1. 기존의 다른 배송지들은 모두 기본 해제(false) 처리
            List<DeliveryAddress> existingList = deliveryAddressRepository.findByMember(member);
            for (DeliveryAddress da : existingList) {
                da.setIsDefault(false);
            }
            deliveryAddressRepository.saveAll(existingList);

            // 2. Member 테이블의 대표 주소도 동기화 (결제창에서 바로 불러올 수 있게!)
            member.setAddress(address);
            member.setAddressDetail(addressDetail);
            memberRepository.save(member);
            session.setAttribute("loginMember", member); // 세션도 최신화
        }

        // 🌟 새 객체 생성 또는 기존 객체 불러오기
        DeliveryAddress target;
        if (id != null) {
            target = deliveryAddressRepository.findById(id).orElse(new DeliveryAddress());
        } else {
            target = new DeliveryAddress();
            target.setMember(member);
        }

        // 값 세팅
        target.setAddressName(addressName);
        target.setAddress(address);
        target.setAddressDetail(addressDetail);
        target.setIsDefault(isDefault != null ? isDefault : false);

        deliveryAddressRepository.save(target);
        return ResponseEntity.ok().build();
    }

    /* ── 배송지 삭제 API (DELETE) ── */
    @DeleteMapping("/api/mypage/address/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteAddress(@PathVariable("id") Long id, HttpSession session) {
        Member loginMember = (Member) session.getAttribute("loginMember");
        if (loginMember == null) return ResponseEntity.status(401).build();

        // 선택한 배송지 삭제
        deliveryAddressRepository.deleteById(id);

        return ResponseEntity.ok().build();
    }

    /* ── 배송지 전체 목록 조회 API (결제창에서 사용) ── */
    @GetMapping("/api/mypage/addresses")
    @ResponseBody
    public ResponseEntity<List<DeliveryAddress>> getAddressList(HttpSession session) {
        Member loginMember = (Member) session.getAttribute("loginMember");
        if (loginMember == null) return ResponseEntity.status(401).build();

        List<DeliveryAddress> list = deliveryAddressRepository.findByMemberOrderByIdDesc(loginMember);
        return ResponseEntity.ok(list);
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