package com.example.onfit.dto.request;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class CartAddRequest {
    @NotNull private Long productId;
    private String size;
    @Min(1) private Integer qty = 1;
}
