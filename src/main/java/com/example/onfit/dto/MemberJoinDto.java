package com.example.onfit.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class MemberJoinDto {
    private String loginId;
    private String password;
    private String name;
    private String tel;
    private String email;
    private String birthYear;
    private String birthMonth;
    private String birthDay;
    private String address; // 🌟 추가
    private String addressDetail;
}