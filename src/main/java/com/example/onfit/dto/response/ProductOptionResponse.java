package com.example.onfit.dto.response;

import com.example.onfit.entity.ProductOption;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProductOptionResponse {

    private Long optionId;
    private String size;
    private Integer stock;

    public static ProductOptionResponse from(ProductOption option) {
        return ProductOptionResponse.builder()
                .optionId(option.getOptionId())
                .size(option.getSize().name())
                .stock(option.getStock())
                .build();
    }
}
