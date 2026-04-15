package com.example.onfit.dto.response;

import com.example.onfit.entity.Review;
import lombok.Builder;
import lombok.Getter;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Getter
@Builder
public class ReviewResponse {

    private Long reviewId;
    private String authorName;
    private String title;
    private String content;
    private Integer stars;
    private String createdAt;   // "2026.03.10" 형태로 변환

    public static ReviewResponse from(Review review) {
        return ReviewResponse.builder()
                .reviewId(review.getReviewId())
                .authorName(review.getAuthorName())
                .title(review.getTitle())
                .content(review.getContent())
                .stars(review.getStars())
                .createdAt(review.getCreatedAt()
                        .format(DateTimeFormatter.ofPattern("yyyy.MM.dd")))
                .build();
    }

    // 목록 + 메타 정보를 한 번에 내려주는 래퍼
    @Getter
    @Builder
    public static class PageResult {
        private List<ReviewResponse> reviews;
        private long totalCount;
        private double avgStars;    // 평균 별점 (소수점 1자리)
        private boolean hasMore;    // 다음 페이지 존재 여부
    }
}
