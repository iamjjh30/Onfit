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

    // 유저 활동 레벨 (기본값 1)
    @Builder.Default
    private Integer styleLevel = 1;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}