package com.example.onfit.controller;

import com.example.onfit.entity.Product;
import com.example.onfit.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Controller
public class StoreController {

    @Autowired
    private ProductRepository productRepository; // 상품 레포지토리 연결

    @GetMapping("/store")
    public String storeMain(Model model) {
        // 1. DB에서 모든 상품 데이터를 가져옵니다.
        List<Product> productList = productRepository.findAll();

        // 2. 가져온 상품 리스트를 "products"라는 이름으로 HTML에 넘겨줍니다.
        model.addAttribute("products", productList);

        return "store";
    } // 👈 이 닫는 중괄호가 빠져있었습니다!

    @GetMapping("/itemDetail")
    public String itemDetail(@RequestParam("id") Long id, Model model) {
        // 1. 전달받은 id로 DB에서 해당 상품을 찾습니다.
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("없는 상품입니다."));

        // 2. 찾은 상품을 "product"라는 이름으로 HTML에 넘겨줍니다.
        model.addAttribute("product", product);

        return "itemDetail"; // itemDetail.html 열기
    }
}