package com.example.onfit.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "delivery_addresses")
public class DeliveryAddress {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 어떤 회원의 주소인지 연결 (N:1 관계)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    @JsonIgnore
    private Member member;

    @Column(nullable = false)
    private String addressName; // 배송지명 (집, 회사 등)

    @Column(nullable = false)
    private String address;     // 도로명 주소

    private String addressDetail; // 상세 주소

    @Column(columnDefinition = "boolean default false")
    private Boolean isDefault;  // 기본 배송지 여부
}