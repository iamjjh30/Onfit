package com.example.onfit.dto;

import lombok.Data;
import java.util.List;

@Data
public class PersonalColorResult {

    private String tone;
    private String skinFeature;
    private List<String> bestColors;
    private List<String> worstColors;
}
