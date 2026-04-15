package com.example.onfit.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "order_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order; // 어떤 주문서에 속해 있는지

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product; // 어떤 상품을 샀는지

    private String size; // 선택한 사이즈 (예: M, L)

    private int quantity; // 구매 수량

    private Long price; // 🌟 구매 당시의 상품 1개당 가격 (나중에 상품 원가가 바뀌어도 주문 내역의 가격은 변하면 안 됨)
}