package com.example.onfit.repository;

import com.example.onfit.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    // 특정 상품의 리뷰 목록 (페이지네이션, 최신순)
    Page<Review> findByProduct_IdOrderByCreatedAtDesc(Long productId, Pageable pageable);

    // 특정 상품의 평균 별점
    @Query("SELECT AVG(r.stars) FROM Review r WHERE r.product.id = :productId")
    Double findAvgStarsByProductId(@Param("productId") Long productId);

    // 특정 상품의 리뷰 총 개수
    long countByProduct_Id(Long productId);
}
