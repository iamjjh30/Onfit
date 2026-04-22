package com.example.onfit.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class ProductViewController {

    // 브라우저 주소창에 /store/detail/1 치고 들어갔을 때 페이지를 열어줌
    @GetMapping("/store/detail/{id}")
    public String productDetailPage(@PathVariable Long id) {
        return "itemDetail"; // templates 폴더 안에 있는 productDetail.html을 찾아감
    }
}