package com.example.onfit.dto.response;
import com.example.onfit.entity.Comment;
import lombok.Getter;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public class CommentResponse {
    private Long commentId;
    private Long userId;
    private String nickname;
    private String profileImg;
    private String content;
    private LocalDateTime createdAt;
    private int likeCount;
    private boolean liked;
    private List<CommentResponse> replies;

    public static CommentResponse from(Comment c, Long currentUserId) {
        CommentResponse r = new CommentResponse();
        r.commentId = c.getCommentId();
        r.userId = c.getUser().getUserId();
        r.nickname = c.getUser().getNickname();
        r.profileImg = c.getUser().getProfileImg();
        r.content = c.getContent();
        r.createdAt = c.getCreatedAt();
        r.likeCount = c.getLikes().size();
        r.liked = c.getLikes().stream().anyMatch(l -> l.getUser().getUserId().equals(currentUserId));
        r.replies = c.getReplies().stream()
                .map(reply -> CommentResponse.from(reply, currentUserId))
                .collect(Collectors.toList());
        return r;
    }
}
