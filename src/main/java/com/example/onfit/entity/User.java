package com.example.onfit.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "user")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "login_id", unique = true, nullable = false, length = 50)
    private String loginId;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(length = 50)
    private String nickname;

    @Column(length = 50)
    private String name;

    @Column(length = 100)
    private String email;

    @Column(length = 20)
    private String phone;

    private LocalDate birth;

    @Column(name = "profile_img", length = 255)
    private String profileImg;

    // AI 진단 결과
    @Column(name = "personal_color", length = 30)
    private String personalColor;

    @Column(name = "dna_minimal")
    private Integer dnaMinimal = 0;

    @Column(name = "dna_casual")
    private Integer dnaCasual = 0;

    @Column(name = "dna_street")
    private Integer dnaStreet = 0;

    @Column(name = "dna_formal")
    private Integer dnaFormal = 0;

    @Column(name = "dna_outdoor")
    private Integer dnaOutdoor = 0;

    @Column(name = "dna_vintage")
    private Integer dnaVintage = 0;

    @Column(name = "dna_top", length = 20)
    private String dnaTop;

    @Column(name = "diagnosed_at")
    private LocalDateTime diagnosedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
