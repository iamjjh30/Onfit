package com.example.onfit.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter @Setter
@Builder
@NoArgsConstructor  // 🌟 JPA를 위해 기본 생성자 필수
@AllArgsConstructor
@Table(name = "fitting_history")
public class FittingHistory {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    private String comment; // "생각보다 나한테 잘 어울린다" 등의 한줄평

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String resultImageUrl;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}