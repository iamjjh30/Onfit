package com.example.onfit.service;

import com.example.onfit.dto.request.PostCreateRequest;
import com.example.onfit.dto.response.PostResponse;
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
public class PostService {

    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final MemberRepository memberRepository;
    private final UserActivityRepository userActivityRepository;

    @Transactional(readOnly = true)
    public List<PostResponse> getPosts(String type, Long currentMemberId) {
        List<Post> posts = (type == null || type.isBlank())
                ? postRepository.findAllByOrderByCreatedAtDesc()
                : postRepository.findByTypeOrderByCreatedAtDesc(type);

        return posts.stream()
                .map(p -> PostResponse.from(p,
                        // ✅ Repository의 existsByPostIdAndMemberId 사용
                        currentMemberId != null && postLikeRepository.existsByPost_PostIdAndMember_Id(p.getPostId(), currentMemberId)))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PostResponse getPost(Long postId, Long currentMemberId) {
        Post post = getPostEntity(postId);
        // ✅ Repository의 existsByPostIdAndMemberId 사용
        boolean liked = currentMemberId != null &&
                postLikeRepository.existsByPost_PostIdAndMember_Id(postId, currentMemberId);
        return PostResponse.from(post, liked);
    }

    @Transactional
    public PostResponse createPost(Long memberId, PostCreateRequest req) {
        // ✅ MemberRepository에서 회원을 찾습니다.
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> CustomException.notFound("사용자를 찾을 수 없습니다."));

        Post post = Post.builder()
                .member(member) // ✅ Post 엔티티의 member 필드에 할당
                .title(req.getTitle())
                .content(req.getContent())
                .imgUrl(req.getImgUrl())
                .type(req.getType())
                .likeCount(0)
                .build();
        Post saved = postRepository.save(post);

        if (userActivityRepository != null) {
            userActivityRepository.incrementPost(memberId);
        }

        return PostResponse.from(saved, false);
    }

    @Transactional
    public PostResponse updatePost(Long memberId, Long postId, PostCreateRequest req) {
        Post post = getPostEntity(postId);
        // ✅ 작성자 확인 시 Member ID 비교
        checkOwner(post.getMember().getId(), memberId);

        if (req.getTitle() != null) post.setTitle(req.getTitle());
        if (req.getContent() != null) post.setContent(req.getContent());
        if (req.getImgUrl() != null) post.setImgUrl(req.getImgUrl());
        if (req.getType() != null) post.setType(req.getType());

        return PostResponse.from(postRepository.save(post), false);
    }

    @Transactional
    public void deletePost(Long memberId, Long postId) {
        Post post = getPostEntity(postId);
        checkOwner(post.getMember().getId(), memberId);
        postRepository.delete(post);

        if (userActivityRepository != null) {
            userActivityRepository.decrementPost(memberId);
        }
    }

    @Transactional
    public boolean toggleLike(Long memberId, Long postId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> CustomException.notFound("사용자를 찾을 수 없습니다."));
        Post post = getPostEntity(postId);

        // ✅ Repository의 findByPostIdAndMemberId 사용
        return postLikeRepository.findByPost_PostIdAndMember_Id(postId, memberId)
                .map(like -> {
                    postLikeRepository.delete(like);
                    post.setLikeCount(Math.max(0, post.getLikeCount() - 1));
                    postRepository.save(post);
                    return false;
                })
                .orElseGet(() -> {
                    // ✅ PostLike 빌더에서도 member(member) 사용
                    postLikeRepository.save(PostLike.builder().post(post).member(member).build());
                    post.setLikeCount(post.getLikeCount() + 1);
                    postRepository.save(post);
                    return true;
                });
    }

    private Post getPostEntity(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> CustomException.notFound("게시글을 찾을 수 없습니다."));
    }

    public int getLikeCount(Long postId) {
        return getPostEntity(postId).getLikeCount();
    }

    private void checkOwner(Long ownerId, Long requesterId) {
        if (!ownerId.equals(requesterId)) {
            throw CustomException.forbidden("수정/삭제 권한이 없습니다.");
        }
    }

    @Transactional(readOnly = true)
    public List<PostResponse> searchPosts(String query) {
        List<Post> posts = postRepository.findByTitleContainingOrContentContainingOrderByCreatedAtDesc(query, query);

        return posts.stream()
                .map(p -> PostResponse.from(p, false))
                .collect(Collectors.toList());
    }
}