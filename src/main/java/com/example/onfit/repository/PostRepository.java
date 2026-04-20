package com.example.onfit.repository;

import com.example.onfit.entity.Member; // Member 임포트 추가 확인!
import com.example.onfit.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    // 1. 컨트롤러의 에러를 해결하기 위해 추가 (Member 객체로 조회)
    List<Post> findByMember(Member member);

    // --- 기존에 사용 중인 메서드들 (PostService에서 쓰고 있으니 건드리면 안 됨!) ---
    List<Post> findByMember_IdOrderByCreatedAtDesc(Long memberId);
    List<Post> findByTypeOrderByCreatedAtDesc(String type);
    List<Post> findAllByOrderByCreatedAtDesc();
    List<Post> findByTitleContainingOrContentContainingOrderByCreatedAtDesc(String title, String content);
}