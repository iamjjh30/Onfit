package com.example.onfit.controller;

import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class OrderController {

    @GetMapping("/OrderInfo")
    public String orderInfoPage(HttpSession session) {
        // 비로그인 사용자는 로그인 페이지로 튕겨내기
        if (session.getAttribute("loginMember") == null) {
            return "redirect:/login";
        }
        return "OrderInfo"; // OrderInfo.html 반환
    }
}