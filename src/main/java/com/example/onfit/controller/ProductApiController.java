package com.example.onfit.controller;

import com.example.onfit.dto.ProductDto;
import com.example.onfit.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor // 💡 Lombok을 사용해 의존성을 자동으로 주입합니다.
public class ProductApiController {

    private final ProductService productService;

    // 🌟 프론트엔드(AIStyler.js)에서 호출하는 API 주소
    @GetMapping("/api/products/all")
    public List<ProductDto> getAllProducts() {
        // 팀장님이 만들어두신 서비스 메서드를 그대로 호출!
        return productService.getAllProducts();
    }
}
