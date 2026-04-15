package com.example.onfit.dto.response;
import com.example.onfit.entity.User;
import lombok.Getter;
import java.time.LocalDate;

@Getter
public class UserProfileResponse {
    private Long userId;
    private String loginId;
    private String nickname;
    private String name;
    private String email;
    private String phone;
    private LocalDate birth;
    private String profileImg;
    private String personalColor;
    private Integer dnaMinimal;
    private Integer dnaCasual;
    private Integer dnaStreet;
    private Integer dnaFormal;
    private Integer dnaOutdoor;
    private Integer dnaVintage;
    private String dnaTop;

    public static UserProfileResponse from(User u) {
        UserProfileResponse r = new UserProfileResponse();
        r.userId = u.getUserId(); r.loginId = u.getLoginId();
        r.nickname = u.getNickname(); r.name = u.getName();
        r.email = u.getEmail(); r.phone = u.getPhone();
        r.birth = u.getBirth(); r.profileImg = u.getProfileImg();
        r.personalColor = u.getPersonalColor();
        r.dnaMinimal = u.getDnaMinimal(); r.dnaCasual = u.getDnaCasual();
        r.dnaStreet = u.getDnaStreet(); r.dnaFormal = u.getDnaFormal();
        r.dnaOutdoor = u.getDnaOutdoor(); r.dnaVintage = u.getDnaVintage();
        r.dnaTop = u.getDnaTop();
        return r;
    }
}
