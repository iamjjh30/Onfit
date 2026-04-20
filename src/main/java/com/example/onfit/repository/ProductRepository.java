package com.example.onfit.repository;

import com.example.onfit.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // 이름에 키워드가 포함된 상품 검색 (대소문자 무시, LIKE %keyword% 자동 생성)
    List<Product> findByNameContainingIgnoreCase(String name);
}