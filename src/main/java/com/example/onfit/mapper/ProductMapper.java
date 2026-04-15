package com.example.onfit.mapper;

import com.example.onfit.dto.ProductDto;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper // 스프링이 MyBatis 매퍼로 인식하게 해줌
public interface ProductMapper {

    // 1. 전체 상품 조회
    List<ProductDto> findAllProducts();

    // 2. 특정 카테고리 상품 조회
    List<ProductDto> findProductsByCategory(String category);

    // 3. 상품 저장
    void insertProduct(ProductDto productDto);
}