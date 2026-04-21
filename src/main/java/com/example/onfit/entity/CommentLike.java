package com.example.onfit.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "comment_like",
        uniqueConstraints = @UniqueConstraint(columnNames = {"comment_id", "member_id"}))  // ✅ user_id → member_id
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CommentLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "like_id")
    private Long likeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_id", nullable = false)
    private Comment comment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)  // ✅ user_id → member_id
    private Member member;                              // ✅ User → Member
}