package com.example.onfit.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Getter @Setter
@Table(name = "member_activities")
public class MemberActivity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    // 활동 유형 (VIEW:조회, LIKE:찜, FIT:피팅, BUY:구매)
    @Column(name = "activity_type")
    private String activityType;

    // 획득 점수 (조회=1, 찜=3, 피팅=5, 구매=10)
    private int score;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}