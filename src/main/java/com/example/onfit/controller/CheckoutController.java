package com.example.onfit.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequiredArgsConstructor
public class CheckoutController {

    // 1. 결제 화면 진입
    @GetMapping("/Checkout")
    public String checkoutPage() {
        return "Checkout";
    }

    // 2. 토스 결제 성공 시 돌아오는 API
    @GetMapping("/api/payment/success")
    public String paymentSuccess(@RequestParam String paymentKey,
                                 @RequestParam String orderId,
                                 @RequestParam Long amount,
                                 Model model) {

        // 🌟 [핵심] 실제 서비스에서는 여기서 paymentKey를 가지고
        // 토스 서버에 한 번 더 '결제 승인(Confirm)' API를 호출해야 완전히 돈이 빠져나갑니다.
        // 현재는 흐름을 완성하기 위해 바로 성공 페이지로 넘깁니다.

        // 화면에 결제 정보를 띄워주기 위해 Model에 담음
        model.addAttribute("orderId", orderId);
        model.addAttribute("amount", amount);

        // 결제 완료 페이지(PaymentSuccess.html)로 이동
        return "CheckoutSuccess";
    }

    // 3. 토스 결제 실패 시 돌아오는 API
    @GetMapping("/api/payment/fail")
    public String paymentFail(@RequestParam String code,
                              @RequestParam String message,
                              Model model) {
        model.addAttribute("code", code);
        model.addAttribute("message", message);

        // 결제 실패 페이지(PaymentFail.html)로 이동
        return "CheckoutFail";
    }
}