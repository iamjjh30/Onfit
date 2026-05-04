package com.example.onfit.dto.response;

import com.example.onfit.entity.Comment;
import lombok.Getter;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public class CommentResponse {
    private Long commentId;
    private Long memberId;          // ✅ userId → memberId
    private String nickname;
    private String profileImg;
    private String content;
    private LocalDateTime createdAt;
    private int likeCount;
    private boolean liked;
    private List<CommentResponse> replies;

    public static CommentResponse from(Comment c, Long currentMemberId) {  // ✅ currentUserId → currentMemberId
        CommentResponse r = new CommentResponse();
        r.commentId  = c.getCommentId();
        r.memberId   = c.getMember().getId();           // ✅ getUser().getUserId() → getMember().getId()
        r.nickname   = c.getMember().getName();         // ✅ getUser().getNickname() → getMember().getName()
        r.profileImg = c.getMember().getProfileImg();
        r.content    = c.getContent();
        r.createdAt  = c.getCreatedAt();
        r.likeCount  = c.getLikes().size();
        r.liked      = c.getLikes().stream()
                .anyMatch(l -> l.getMember().getId().equals(currentMemberId)); // ✅ getUser().getUserId() → getMember().getId()
        r.replies    = c.getReplies().stream()
                .map(reply -> CommentResponse.from(reply, currentMemberId))
                .collect(Collectors.toList());
        return r;
    }
}