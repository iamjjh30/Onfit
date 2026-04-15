package com.example.onfit.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class MainController {
    @GetMapping("/")
    public String mainPage() {
        return "Main";
    }

    @GetMapping("/signIn")
    public String signInPage() {
        return "signin";
    }

    @GetMapping("/find")
    public String findPage() {
        return "find";
    }
    @GetMapping("/product/{id}")
    public String productDetail(@PathVariable("id") Long id, Model model) {
        return "itemDetail";
    }

    @GetMapping("/order")
    public String orderPage() {
        return "Checkout";
    }
    @GetMapping("/order/success")
    public String orderSuccessPage() {
        return "CheckoutSuccess";
    }
    @GetMapping("/order/fail")
    public String orderFailPage() {
        return "CheckoutFail";
    }
    @GetMapping("/orderInfo/{id}")
    public String orderInfoDetail(@PathVariable("id") Long id, Model model) {
        return "OrderInfoDetail";
    }

    @GetMapping("/Community")
    public String communityPage() {
        return "Community";
    }

    @GetMapping("/community/{id}")
    public String communityDetail(@PathVariable("id") Long id, Model model) {
        return "CommunityDetail";
    }

    @GetMapping("/community/write")
    public String communityWritePage() {
        return "CommunityWrite";
    }
    @GetMapping("/community/sharefit_write")
    public String communityShareFitWritePage() {
        return "ShareFitWrite";
    }

    @GetMapping("/diagnosis")
    public String diagnosisPage() {
        return "AIStyler";
    }


    @GetMapping("/Cart")
    public String cartPage() {
        // src/main/resources/templates/Cart.html 파일을 찾아서 화면에 띄워줍니다!
        return "Cart";
    }

    @GetMapping("/diagnosisResult")
    public String diagnosisResultPage() {
        return "diagnosisResult";
    }
    @GetMapping("/Ask")
    public String AskPage() {
        return "Ask";
    }
    @GetMapping("/Ask_question")
    public String AskQuestionPage() {
        return "Ask_question";
    }
    @GetMapping("/Main2")
    public String Main2Page() { return "Main"; }

}