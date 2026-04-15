package com.example.onfit.service;

import com.example.onfit.dto.ProductDto;
import com.example.onfit.mapper.ProductMapper;
import com.example.onfit.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductMapper productMapper;
    private final ProductRepository productRepository;

    // 모든 상품 가져오기
    public List<ProductDto> getAllProducts() {
        return productRepository.findAll().stream()
                .map(ProductDto::from)
                .collect(Collectors.toList());
    }

    public ProductDto getProductById(Long id) {
        return productRepository.findById(id)
                .map(ProductDto::from)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다. ID: " + id));
    }

    // 자켓만 가져오기 예시
    public List<ProductDto> getJackets() {
        return productMapper.findProductsByCategory("JACKET");
    }
}