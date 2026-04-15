package com.example.onfit.repository;
import com.example.onfit.entity.CommentLike;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface CommentLikeRepository extends JpaRepository<CommentLike, Long> {
    Optional<CommentLike> findByCommentCommentIdAndUserUserId(Long commentId, Long userId);
    boolean existsByCommentCommentIdAndUserUserId(Long commentId, Long userId);
}
