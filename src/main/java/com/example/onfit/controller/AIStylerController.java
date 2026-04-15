package com.example.onfit.controller;

import com.example.onfit.entity.Member; // 🌟 추가: 회원 정보
import com.example.onfit.entity.Product;
import com.example.onfit.repository.ProductRepository;
import com.example.onfit.service.StyleDnaService;
import jakarta.servlet.http.HttpSession; // 🌟 추가: 로그인 세션 확인용
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequiredArgsConstructor
public class AIStylerController {

    @Autowired
    private StyleDnaService styleDnaService;

    private final ProductRepository productRepository;

    @GetMapping("/AIStyler")
    public String aiStylerPage(@RequestParam(value="productId", required=false) Long productId,
                               HttpSession session, // 🌟 세션(로그인 유저) 파라미터 추가
                               Model model) {

        // 상품 ID가 넘어온 경우 DB에서 조회해서 모델에 담음
        if (productId != null) {
            Product product = productRepository.findById(productId).orElse(null);
            model.addAttribute("product", product);

            // 🌟🌟 가상 피팅 DNA 점수 적립 로직 추가 🌟🌟
            if (product != null) {
                // 1. 현재 로그인한 유저인지 확인
                Member loginMember = (Member) session.getAttribute("loginMember");

                // 2. 로그인이 되어 있다면 피팅룸에 옷을 들고 온 행동을 "FIT"으로 기록! (5점)
                if (loginMember != null) {
                    styleDnaService.recordActivity(loginMember, product, "FIT");
                }
            }
        }

        return "AIStyler";
    }
}