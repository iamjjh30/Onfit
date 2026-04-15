package com.example.onfit.controller;

import com.example.onfit.entity.Member;
import com.example.onfit.entity.Order;
import com.example.onfit.repository.OrderRepository;
import com.example.onfit.service.OrderService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderApiController {

    private final OrderRepository orderRepository;
    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<?> getMyOrders(HttpSession session) {
        Member loginMember = (Member) session.getAttribute("loginMember");
        if (loginMember == null) {
            return ResponseEntity.status(401).build(); // 비로그인 시 401 에러
        }

        // 1. 로그인한 유저의 주문 내역을 DB에서 가져옴
        List<Order> orders = orderRepository.findByMemberOrderByCreatedAtDesc(loginMember);

        // 2. JS에서 쓰기 편하도록 무한루프(순환참조)를 방지하며 DTO(Map) 형태로 변환
        List<Map<String, Object>> result = orders.stream().map(order -> {
            Map<String, Object> orderMap = new HashMap<>();
            orderMap.put("orderId", order.getOrderId()); // 예: ONFIT-12345
            orderMap.put("totalAmount", order.getTotalAmount());
            orderMap.put("status", order.getStatus()); // 예: "결제완료", "배송중"
            orderMap.put("createdAt", order.getCreatedAt()); // 주문일자

            // 만약 Order 엔티티 안에 구매한 상품 목록(OrderItems)이 있다면 함께 변환해서 넣어줍니다.
            if (order.getOrderItems() != null) {
                List<Map<String, Object>> items = order.getOrderItems().stream().map(item -> {
                    Map<String, Object> itemMap = new HashMap<>();
                    itemMap.put("productName", item.getProduct().getName());
                    itemMap.put("imageUrl", item.getProduct().getImageUrl());
                    itemMap.put("price", item.getPrice());
                    itemMap.put("quantity", item.getQuantity());
                    itemMap.put("size", item.getSize());
                    return itemMap;
                }).collect(Collectors.toList());

                orderMap.put("items", items);
            } else {
                orderMap.put("items", new ArrayList<>());
            }

            return orderMap;
        }).collect(Collectors.toList());

        // 3. 자바스크립트로 전송!
        return ResponseEntity.ok(result);
    }
    // 🌟 프론트엔드에서 결제 성공 시 호출할 저장 API
    @PostMapping("/save")
    public ResponseEntity<?> saveOrderAfterPayment(HttpSession session, @RequestBody Map<String, Object> requestData) {
        System.out.println("=== 주문 저장 API 호출됨 ==="); // 👈 로그 추가
        System.out.println("넘어온 데이터: " + requestData); // 👈 데이터가 잘 왔는지 확인

        Member loginMember = (Member) session.getAttribute("loginMember");
        if (loginMember == null) {
            System.out.println("로그인 멤버가 세션에 없음!"); // 👈 세션 문제 확인
            return ResponseEntity.status(401).build();
        }

        try {
            String orderId = requestData.get("orderId").toString();
            Long totalAmount = Long.valueOf(requestData.get("totalAmount").toString());
            List<Map<String, Object>> items = (List<Map<String, Object>>) requestData.get("items");

            // 공장(Service) 가동!
            orderService.saveOrder(loginMember, orderId, totalAmount, items);

            return ResponseEntity.ok("주문 저장 성공!");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("주문 저장 실패: " + e.getMessage());
        }
    }
}