package com.example.onfit.service;

import com.example.onfit.dto.request.CommentCreateRequest;
import com.example.onfit.dto.response.CommentResponse;
import com.example.onfit.entity.*;
import com.example.onfit.exception.CustomException;
import com.example.onfit.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final CommentLikeRepository commentLikeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(Long postId, Long currentUserId) {
        return commentRepository.findByPostPostIdAndParentIsNullOrderByCreatedAtAsc(postId)
                .stream()
                .map(c -> CommentResponse.from(c, currentUserId))
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentResponse createComment(Long userId, Long postId, CommentCreateRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> CustomException.notFound("사용자를 찾을 수 없습니다."));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> CustomException.notFound("게시글을 찾을 수 없습니다."));

        Comment parent = null;
        if (req.getParentId() != null) {
            parent = commentRepository.findById(req.getParentId())
                    .orElseThrow(() -> CustomException.notFound("부모 댓글을 찾을 수 없습니다."));
        }

        Comment comment = Comment.builder()
                .user(user)
                .post(post)
                .parent(parent)
                .content(req.getContent())
                .build();

        return CommentResponse.from(commentRepository.save(comment), userId);
    }

    @Transactional
    public void deleteComment(Long userId, Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> CustomException.notFound("댓글을 찾을 수 없습니다."));
        if (!comment.getUser().getUserId().equals(userId)) {
            throw CustomException.forbidden("삭제 권한이 없습니다.");
        }
        commentRepository.delete(comment);
    }

    @Transactional
    public boolean toggleLike(Long userId, Long commentId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> CustomException.notFound("사용자를 찾을 수 없습니다."));
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> CustomException.notFound("댓글을 찾을 수 없습니다."));

        return commentLikeRepository.findByCommentCommentIdAndUserUserId(commentId, userId)
                .map(like -> {
                    commentLikeRepository.delete(like);
                    return false;
                })
                .orElseGet(() -> {
                    commentLikeRepository.save(CommentLike.builder().comment(comment).user(user).build());
                    return true;
                });
    }
}
