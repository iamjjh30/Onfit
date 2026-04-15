package com.example.onfit.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Getter @Setter
@Table(name = "cart") // 실제 DB 테이블 이름과 맞추세요
public class Cart {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cart_id")
    private Long cartId;

    // 장바구니를 담은 회원 (DB의 user_id)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private Member member;

    // 담은 상품 (DB의 product_id)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", referencedColumnName = "id")
    private Product product;

    private String size;

    private int qty;

    // DB에 DEFAULT_GENERATED 설정이 있으므로 인서트 시 생략합니다.
    @Column(name = "added_at", insertable = false, updatable = false)
    private LocalDateTime addedAt;
}