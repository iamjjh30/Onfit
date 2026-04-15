package com.example.onfit.controller;

import com.example.onfit.dto.request.ReviewRequest;
import com.example.onfit.dto.response.ReviewResponse;
import com.example.onfit.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // GET /api/products/{productId}/reviews?page=0
    @GetMapping
    public ResponseEntity<ReviewResponse.PageResult> getReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page) {
        return ResponseEntity.ok(reviewService.getReviews(productId, page));
    }

    // POST /api/products/{productId}/reviews
    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(
            @PathVariable Long productId,
            @RequestBody @Valid ReviewRequest request) {
        return ResponseEntity.ok(reviewService.createReview(productId, request));
    }
}
