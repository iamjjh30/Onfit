package com.example.onfit.repository;
import com.example.onfit.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByMember_IdOrderByCreatedAtDesc(Long memberId);

    List<Post> findByTypeOrderByCreatedAtDesc(String type);
    List<Post> findAllByOrderByCreatedAtDesc();
    List<Post> findByTitleContainingOrContentContainingOrderByCreatedAtDesc(String title, String content);
}
