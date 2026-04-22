package com.example.onfit.repository;

import com.example.onfit.entity.CommentLike;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CommentLikeRepository extends JpaRepository<CommentLike, Long> {
    Optional<CommentLike> findByCommentCommentIdAndMemberId(Long commentId, Long memberId);  // ✅ UserUserId → MemberId
    boolean existsByCommentCommentIdAndMemberId(Long commentId, Long memberId);              // ✅ UserUserId → MemberId
}