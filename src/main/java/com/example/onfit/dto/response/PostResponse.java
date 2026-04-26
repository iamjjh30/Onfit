package com.example.onfit.dto.response;
import com.example.onfit.entity.Post;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
public class PostResponse {
    private Long postId;
    private Long memberId;
    private String nickname;
    private String profileImg;
    private String title;
    private String content;
    private String imgUrl;
    private String type;
    private Integer likeCount;
    private LocalDateTime createdAt;
    private int commentCount;
    private boolean liked; // 현재 유저 좋아요 여부

    public static PostResponse from(Post p, boolean liked) {
        PostResponse r = new PostResponse();
        r.postId = p.getPostId();
        r.memberId = p.getMember().getId();
        r.nickname = p.getMember().getName();
        r.profileImg = p.getMember().getProfileImg();
        r.title = p.getTitle(); r.content = p.getContent();
        r.imgUrl = p.getImgUrl(); r.type = p.getType();
        r.likeCount = p.getLikeCount();
        r.createdAt = p.getCreatedAt();
        r.commentCount = p.getComments().size();
        r.liked = liked;
        return r;
    }
}
