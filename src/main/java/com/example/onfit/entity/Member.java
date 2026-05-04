package com.example.onfit.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "members")
public class Member {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String address; // 기본 배송지 주소

    private String addressDetail; // 🌟 상세 주소

    @Column(nullable = false, unique = true)
    private String loginId;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;

    // 🌟 새로 추가된 항목들 (전화번호, 이메일, 생년월일)
    private String tel;
    private String email;
    private String birthDate; // "YYYY-MM-DD" 형태로 합쳐서 저장할 예정

    // AI 퍼스널 컬러 진단 결과
    private String personalColor;

    // 스타일 DNA 대표 성향
    private String styleDna;

    @Column(columnDefinition = "LONGTEXT")
    private String profileImg;

    // 유저 활동 레벨 (기본값 1)
    @Builder.Default
    private Integer styleLevel = 1;

    @Builder.Default
    private Integer totalOrderCount = 0;       // 누적 구매 횟수

    @Builder.Default
    private Integer totalOrderAmount = 0;      // 누적 구매 금액

    private LocalDateTime lastOrderAt;         // 마지막 구매일

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}