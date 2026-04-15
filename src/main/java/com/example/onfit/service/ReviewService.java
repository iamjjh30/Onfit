package com.example.onfit.service;

import com.example.onfit.dto.request.ReviewRequest;
import com.example.onfit.dto.response.ReviewResponse;
import com.example.onfit.entity.Product;
import com.example.onfit.entity.Review;
import com.example.onfit.exception.CustomException;
import com.example.onfit.repository.ProductRepository;
import com.example.onfit.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;

    private static final int PAGE_SIZE = 5; // 한 번에 보여줄 리뷰 수

    // ── 리뷰 목록 조회 (페이지네이션) ──
    @Transactional(readOnly = true)
    public ReviewResponse.PageResult getReviews(Long productId, int page) {
        // 상품 존재 확인
        if (!productRepository.existsById(productId)) {
            throw CustomException.notFound("상품을 찾을 수 없습니다.");
        }

        Pageable pageable = PageRequest.of(page, PAGE_SIZE);
        Page<Review> reviewPage = reviewRepository
                .findByProduct_IdOrderByCreatedAtDesc(productId, pageable);

        List<ReviewResponse> reviews = reviewPage.getContent().stream()
                .map(ReviewResponse::from)
                .collect(Collectors.toList());

        Double avg = reviewRepository.findAvgStarsByProductId(productId);
        double avgStars = (avg != null) ? Math.round(avg * 10.0) / 10.0 : 0.0;

        long totalCount = reviewRepository.countByProduct_Id(productId);

        return ReviewResponse.PageResult.builder()
                .reviews(reviews)
                .totalCount(totalCount)
                .avgStars(avgStars)
                .hasMore(reviewPage.hasNext())
                .build();
    }

    // ── 리뷰 작성 ──
    @Transactional
    public ReviewResponse createReview(Long productId, ReviewRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> CustomException.notFound("상품을 찾을 수 없습니다."));

        Review review = Review.builder()
                .product(product)
                .authorName(request.getAuthorName())
                .title(request.getTitle())
                .content(request.getContent())
                .stars(request.getStars())
                .build();

        return ReviewResponse.from(reviewRepository.save(review));
    }
}
