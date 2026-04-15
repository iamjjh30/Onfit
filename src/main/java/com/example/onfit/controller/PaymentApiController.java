package com.example.onfit.controller;

import com.example.onfit.entity.Member;
import com.example.onfit.service.OrderService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PaymentApiController {

    private final OrderService orderService; // 🌟 1. 서비스 주입

    @PostMapping("/confirm")
    public ResponseEntity<?> confirmPayment(HttpSession session, @RequestBody Map<String, Object> payload) {

        // 2. 세션에서 로그인 회원 가져오기
        Member loginMember = (Member) session.getAttribute("loginMember");
        if (loginMember == null) {
            return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요합니다."));
        }

        // 3. 프론트엔드(Payload)에서 데이터 추출
        String orderId = (String) payload.get("orderId");
        Long amount = Long.valueOf(payload.get("amount").toString());

        // 🌟 CheckoutSuccess.js 등에서 보낸 상품 리스트와 배송 정보 추출
        List<Map<String, Object>> items = (List<Map<String, Object>>) payload.get("items");
        String recvName = (String) payload.get("recvName");
        String address = (String) payload.get("address");
        String phone = (String) payload.get("phone");

        System.out.println("========== DB 저장 로직 시작 ==========");
        System.out.println("주문번호: " + orderId);
        System.out.println("상품개수: " + (items != null ? items.size() : 0));

        try {
            // 🌟 4. [핵심] 서비스 호출하여 DB에 저장 (order + order_item)
            // 서비스 메서드에 배송 정보 파라미터를 추가하셨다면 함께 넘겨주세요!
            orderService.saveOrder(loginMember, orderId, amount, items);

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "주문 정보가 성공적으로 저장되었습니다."
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "저장 실패: " + e.getMessage()
            ));
        }
    }
    @GetMapping("/api/payment/success")
    public String successPage() {
        return "CheckoutSuccess"; // src/main/resources/templates/CheckoutSuccess.html 을 찾아감
    }
}