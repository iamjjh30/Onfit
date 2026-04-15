package com.example.onfit.repository;
import com.example.onfit.entity.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    Optional<PostLike> findByPost_PostIdAndMember_Id(Long postId, Long memberId);
    boolean existsByPost_PostIdAndMember_Id(Long postId, Long memberId);
    List<PostLike> findByMember_Id(Long memberId);
}
