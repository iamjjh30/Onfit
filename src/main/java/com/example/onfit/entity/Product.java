package com.example.onfit.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "products")
public class Product {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer price;

    @Column(nullable = false)
    @Builder.Default
    private Integer stockQuantity = 100;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String category;
    private String color;

    // 🌟 1. 성별 카테고리 추가 (예: "M", "F", "U" - 남, 녀, 공용)
    private String gender;

    // 🌟 2. 사이즈 정보 추가 (예: "S,M,L,XL" 처럼 쉼표로 연결해서 저장)
    private String availableSizes;

    // 🌟 3. 인기순 정렬을 위한 조회수 (또는 판매량) 추가
    @Builder.Default
    private Integer viewCount = 0;

    private String imageUrl;
    private String hoverImageUrl;

    private String recommendedSeasons;
    private String styleTags;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    private List<ProductMaterial> materials;
}