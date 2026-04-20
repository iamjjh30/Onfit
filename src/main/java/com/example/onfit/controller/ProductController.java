package com.example.onfit.controller;

import com.example.onfit.dto.ProductDto;
import com.example.onfit.entity.Product;
import com.example.onfit.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // 1. 전체 상품 조회 (글쓰기 창에서 인용용)
    @GetMapping
    public ResponseEntity<List<ProductDto>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    // 2. 개별 상품 상세 조회 (상세페이지에서 카드 렌더링용)
    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }
    // 기존 코드 유지하고 아래만 추가
    @GetMapping("/all")
    public ResponseEntity<List<ProductDto>> getAllProductsForFitting() {
        return ResponseEntity.ok(productService.getAllProducts());
    }
}