package com.example.onfit.dto.request;
import lombok.Getter;

@Getter
public class DiagnoseRequest {
    private String personalColor;
    private Integer dnaMinimal;
    private Integer dnaCasual;
    private Integer dnaStreet;
    private Integer dnaFormal;
    private Integer dnaOutdoor;
    private Integer dnaVintage;
    private String dnaTop;
}
