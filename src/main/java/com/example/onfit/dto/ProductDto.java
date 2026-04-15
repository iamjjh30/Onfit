package com.example.onfit.dto;

import com.example.onfit.entity.Product;
import lombok.*;

// ProductDto.java (기존 ProductResponse 내용을 여기로!)
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductDto {
    private Long productId;
    private String name;
    private Integer price;
    private String imgUrl;
    private String category;
    private String color;

    public static ProductDto from(Product product) {
        return ProductDto.builder()
                .productId(product.getId())
                .name(product.getName())
                .price(product.getPrice())
                .imgUrl(product.getImageUrl())
                .category(product.getCategory())
                .color(product.getColor())
                .build();
    }
}