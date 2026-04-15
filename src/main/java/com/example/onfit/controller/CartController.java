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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cart") // 🌟 클래스 상단에 공통 주소를 박아두면 실수를 줄일 수 있습니다.
public class CartController {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

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
    @PostMapping("/add") // 클래스 상단의 /api/cart 와 합쳐져서 실제 주소는 "/api/cart/add" 가 됩니다.
    public ResponseEntity<String> addToCart(@RequestBody Map<String, Object> payload, HttpSession session) {

        // 1. 로그인 확인
        Member loginMember = (Member) session.getAttribute("loginMember");
        if (loginMember == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        try {
            // 2. 프론트엔드에서 보낸 데이터(JSON) 꺼내기
            Long productId = Long.valueOf(payload.get("productId").toString());
            int quantity = Integer.parseInt(payload.get("quantity").toString());
            String size = payload.containsKey("size") ? payload.get("size").toString() : "FREE";

            // 3. DB에서 상품 정보 찾기
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

            // 4. 장바구니(Cart) 엔티티 만들어서 DB에 저장하기
            Cart cart = new Cart();
            cart.setMember(loginMember);
            cart.setProduct(product);
            cart.setQty(quantity);
            cart.setSize(size);

            cartRepository.save(cart);

            return ResponseEntity.ok("장바구니에 성공적으로 담겼습니다.");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("장바구니 담기 중 오류가 발생했습니다.");
        }
    }
}