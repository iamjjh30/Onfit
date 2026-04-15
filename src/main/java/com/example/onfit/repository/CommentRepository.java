package com.example.onfit.repository;
import com.example.onfit.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostPostIdAndParentIsNullOrderByCreatedAtAsc(Long postId);
    List<Comment> findByUserUserIdOrderByCreatedAtDesc(Long userId);
}
