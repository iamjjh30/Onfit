package com.example.onfit.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "coupons")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(nullable = false)
    private String name; // 쿠폰 이름 (예: 신규가입 웰컴 쿠폰)

    @Column(nullable = false)
    private String code; // 쿠폰 코드 (예: WELCOME2026)

    private Integer discountAmount;  // 정액 할인 (원)
    private Integer discountRate;    // 정률 할인 (%)
    private Integer minOrderAmount;  // 최소 주문 금액

    @Column(nullable = false)
    private LocalDate expiredAt;     // 만료일

    @Builder.Default
    private Boolean isUsed = false;  // 사용 여부
}