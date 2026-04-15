package com.example.onfit.controller;

import com.example.onfit.dto.request.CommentCreateRequest;
import com.example.onfit.dto.request.PostCreateRequest;
import com.example.onfit.dto.response.CommentResponse;
import com.example.onfit.dto.response.PostResponse;
import com.example.onfit.entity.Member; // ✅ User 대신 Member 임포트
import com.example.onfit.service.CommentService;
import com.example.onfit.service.PostService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;
    private final CommentService commentService;

    /**
     * ✅ MemberController와 동일하게 "loginMember" 키를 사용합니다.
     */
    private Member getLoginMember(HttpSession session) {
        return (Member) session.getAttribute("loginMember");
    }

    // ── 게시글 ─────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<PostResponse>> getPosts(
            @RequestParam(required = false) String type,
            HttpSession session) {
        Member member = getLoginMember(session);
        // Member 엔티티의 ID 필드명이 getId()인지 확인 필요 (MemberController 참고함)
        Long memberId = (member != null) ? member.getId() : null;
        return ResponseEntity.ok(postService.getPosts(type, memberId));
    }

    @GetMapping("/{postId}")
    public ResponseEntity<PostResponse> getPost(
            @PathVariable Long postId,
            HttpSession session) {
        Member member = getLoginMember(session);
        Long memberId = (member != null) ? member.getId() : null;
        return ResponseEntity.ok(postService.getPost(postId, memberId));
    }

    @PostMapping
    public ResponseEntity<?> createPost(
            HttpSession session,
            @Valid @RequestBody PostCreateRequest req) {
        Member member = getLoginMember(session);

        // 로그인 안 한 경우 처리 (비로그인 작성을 허용하려면 0L 등을 넘기세요)
        if (member == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "로그인이 필요합니다."));
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(postService.createPost(member.getId(), req));
    }

    @PutMapping("/{postId}")
    public ResponseEntity<?> updatePost(
            HttpSession session,
            @PathVariable Long postId,
            @RequestBody PostCreateRequest req) {
        Member member = getLoginMember(session);
        if (member == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        return ResponseEntity.ok(postService.updatePost(member.getId(), postId, req));
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deletePost(
            HttpSession session,
            @PathVariable Long postId) {
        Member member = getLoginMember(session);
        if (member == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        postService.deletePost(member.getId(), postId);
        return ResponseEntity.ok(Map.of("message", "게시글이 삭제되었습니다."));
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<?> toggleLike(
            HttpSession session,
            @PathVariable Long postId) {
        Member member = getLoginMember(session);
        if (member == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "로그인 후 이용 가능합니다."));

        boolean liked = postService.toggleLike(member.getId(), postId);
        int likeCount = postService.getLikeCount(postId);
        return ResponseEntity.ok(Map.of("liked", liked, "likeCount", likeCount));
    }

    // ── 댓글 ───────────────────────────────────────────────────────

    @GetMapping("/{postId}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(
            @PathVariable Long postId,
            HttpSession session) {
        Member member = getLoginMember(session);
        Long memberId = (member != null) ? member.getId() : null;
        return ResponseEntity.ok(commentService.getComments(postId, memberId));
    }

    @PostMapping("/{postId}/comments")
    public ResponseEntity<?> createComment(
            HttpSession session,
            @PathVariable Long postId,
            @Valid @RequestBody CommentCreateRequest req) {
        Member member = getLoginMember(session);
        if (member == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(commentService.createComment(member.getId(), postId, req));
    }

    @DeleteMapping("/{postId}/comments/{commentId}")
    public ResponseEntity<?> deleteComment(
            HttpSession session,
            @PathVariable Long postId,
            @PathVariable Long commentId) {
        Member member = getLoginMember(session);
        if (member == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        commentService.deleteComment(member.getId(), commentId);
        return ResponseEntity.ok(Map.of("message", "댓글이 삭제되었습니다."));
    }

    @PostMapping("/{postId}/comments/{commentId}/like")
    public ResponseEntity<?> toggleCommentLike(
            HttpSession session,
            @PathVariable Long postId,
            @PathVariable Long commentId) {
        Member member = getLoginMember(session);
        if (member == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        boolean liked = commentService.toggleLike(member.getId(), commentId);
        return ResponseEntity.ok(Map.of("liked", liked));
    }
}