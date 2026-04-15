package com.example.onfit.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders") // 🌟 중요: ORDER는 SQL 예약어라 반드시 이름을 바꿔줘야 합니다!
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String orderId; // 예: ONFIT-1234567 (토스 결제 시 사용한 고유 번호)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member; // 주문한 회원

    @Column(nullable = false)
    private Long totalAmount; // 총 결제 금액 (배송비 포함)

    @Column(nullable = false)
    private String status; // 주문 상태 (예: 결제완료, 상품준비중, 배송중)

    private String payMethod; // 결제 수단 (예: 토스 간편결제, 카드 등)

    // 배송지 정보
    private String receiverName;
    private String receiverPhone;
    private String receiverAddress;

    // 🌟 하나의 주문서 안에는 여러 개의 상품(OrderItem)이 들어갈 수 있습니다.
    @Builder.Default
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> orderItems = new ArrayList<>();

    @Column(updatable = false)
    private LocalDateTime createdAt; // 주문 일자

    // DB에 저장되기 직전에 자동으로 실행되어 날짜와 기본 상태를 채워줍니다.
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "결제완료";
        }
    }

    // 연관관계 편의 메서드: 주문에 상품을 추가할 때 양쪽을 한 번에 세팅해 줍니다.
    public void addOrderItem(OrderItem item) {
        orderItems.add(item);
        item.setOrder(this);
    }
}