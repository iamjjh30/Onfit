package com.example.onfit.dto.request;
import jakarta.validation.constraints.Min;
import lombok.Getter;

@Getter
public class CartUpdateRequest {
    private String size;
    @Min(1) private Integer qty;
}
