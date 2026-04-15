package com.example.onfit.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FindAccountDto {
    private String mode; // "ID" 또는 "PW"
    private String name;
    private String tel;
}
