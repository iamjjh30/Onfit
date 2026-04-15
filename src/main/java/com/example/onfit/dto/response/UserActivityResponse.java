package com.example.onfit.dto.response;
import com.example.onfit.entity.UserActivity;
import lombok.Getter;

@Getter
public class UserActivityResponse {
    private Integer fittingCount;
    private Integer buyCount;
    private Integer postCount;

    public static UserActivityResponse from(UserActivity a) {
        UserActivityResponse r = new UserActivityResponse();
        r.fittingCount = a.getFittingCount();
        r.buyCount = a.getBuyCount();
        r.postCount = a.getPostCount();
        return r;
    }
}
