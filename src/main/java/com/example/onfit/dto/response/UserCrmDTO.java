package com.example.onfit.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserCrmDTO {
    private Long userId;
    private String name;
    private String loginId;
    private String personalColor;
    private String styleDna;
    private int buyCount;
    private int fittingCount;
    private int postCount;
}