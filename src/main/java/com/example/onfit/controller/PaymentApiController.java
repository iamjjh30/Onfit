package com.example.onfit.controller;

import com.example.onfit.entity.Member;
import com.example.onfit.repository.ProductRepository;
import com.example.onfit.service.OrderService;
import com.example.onfit.service.StyleDnaService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PaymentApiController {

    private final ProductRepository productRepository; // 🌟 추가

    @Autowired
    private StyleDnaService styleDnaService;

    private final OrderService orderService; // 🌟 1. 서비스 주입
    @PostMapping("/confirm")
    public ResponseEntity<?> confirmPayment(HttpSession session, @RequestBody Map<String, Object> payload) {

        Member loginMember = (Member) session.getAttribute("loginMember");
        if (loginMember == null) {
            return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요합니다."));
        }

        String orderId   = (String) payload.get("orderId");
        Long amount      = Long.valueOf(payload.get("amount").toString());
        List<Map<String, Object>> items = (List<Map<String, Object>>) payload.get("items");
        String recvName  = (String) payload.get("recvName");
        String address   = (String) payload.get("address");
        String phone     = (String) payload.get("phone");
        String payMethod = payload.get("payMethod") != null ? payload.get("payMethod").toString() : null;

        System.out.println("========== DB 저장 로직 시작 ==========");
        System.out.println("받는분: " + recvName);
        System.out.println("주소: "   + address);
        System.out.println("연락처: " + phone);
        System.out.println("주문번호: " + orderId);
        System.out.println("상품개수: " + (items != null ? items.size() : 0));

        try {
            orderService.saveOrder(loginMember, orderId, amount, items,
                    recvName, phone, address, payMethod);

            // 🌟 구매 DNA 활동 기록
            if (items != null) {
                for (Map<String, Object> item : items) {
                    try {
                        Long productId = Long.valueOf(item.get("productId").toString());
                        productRepository.findById(productId).ifPresent(product ->
                                styleDnaService.recordActivity(loginMember, product, "BUY")
                        );
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }

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