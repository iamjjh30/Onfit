package com.example.onfit.controller;

import com.example.onfit.entity.Cart;
import com.example.onfit.entity.Member;
import com.example.onfit.entity.Product;
import com.example.onfit.repository.CartItemRepository;
import com.example.onfit.repository.CartRepository;
import com.example.onfit.repository.ProductRepository;
import com.example.onfit.service.StyleDnaService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private StyleDnaService styleDnaService;

    // 1. 장바구니 목록 조회
    @GetMapping
    public ResponseEntity<?> getCartList(HttpSession session) {
        Member loginMember = (Member) session.getAttribute("loginMember");
        if (loginMember == null) return ResponseEntity.status(401).build();

        List<Cart> cartItems = cartRepository.findByMember(loginMember);

        // 🌟 반드시 List(배열) 형태로 반환해야 JS의 forEach가 작동합니다.
        return ResponseEntity.ok(cartItems.stream().map(cart -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("cartId", cart.getCartId());
            dto.put("productId", cart.getProduct().getId());
            dto.put("name", cart.getProduct().getName());
            dto.put("price", cart.getProduct().getPrice());
            dto.put("imgUrl", cart.getProduct().getImageUrl());
            dto.put("size", cart.getSize());
            dto.put("qty", cart.getQty());
            return dto;
        }).toList());
    }

    // 2. 장바구니 삭제
    @DeleteMapping("/{cartId}") // 🌟 실제 주소: /api/cart/{cartId}
    public ResponseEntity<?> removeCartItem(@PathVariable Long cartId, HttpSession session) {
        Member loginMember = (Member) session.getAttribute("loginMember");
        if (loginMember == null) return ResponseEntity.status(401).build();

        try {
            // Repository에 @Transactional이 붙어있는지 꼭 확인하세요!
            cartRepository.deleteByCartIdAndMember(cartId, loginMember);
            return ResponseEntity.ok().build(); // 성공 시 빈 응답 발송
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }

    }
    @PostMapping("/add")
    public ResponseEntity<String> addToCart(@RequestBody Map<String, Object> payload, HttpSession session) {

        Member loginMember = (Member) session.getAttribute("loginMember");
        if (loginMember == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        try {
            Long productId = Long.valueOf(payload.get("productId").toString());
            int quantity   = Integer.parseInt(payload.get("quantity").toString());
            String size    = payload.containsKey("size") ? payload.get("size").toString() : "FREE";

            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

            // ✅ 동일 상품 + 동일 사이즈가 이미 있으면 수량만 증가
            List<Cart> existingList = cartRepository.findByMemberAndProductAndSize(loginMember, product, size);

            if (!existingList.isEmpty()) {
                // 혹시 중복이 있어도 첫 번째 것만 사용
                Cart cart = existingList.get(0);
                cart.setQty(cart.getQty() + quantity);
                cartRepository.save(cart);
            } else {
                Cart cart = new Cart();
                cart.setMember(loginMember);
                cart.setProduct(product);
                cart.setQty(quantity);
                cart.setSize(size);
                cartRepository.save(cart);
            }

            // DNA 활동 기록
            try {
                styleDnaService.recordActivity(loginMember, product, "BUY");
            } catch (Exception e) {
                e.printStackTrace();
            }

            return ResponseEntity.ok("장바구니에 성공적으로 담겼습니다.");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("장바구니 담기 중 오류가 발생했습니다.");
        }
    }
}