package com.example.onfit.dto.request;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import java.util.List;

@Getter
public class OrderCreateRequest {
    @NotBlank private String recvName;
    @NotBlank private String address;
    @NotBlank private String phone;
    @NotBlank private String payMethod;
    private Integer deliFee = 0;
    @NotEmpty private List<OrderItemRequest> items;

    @Getter
    public static class OrderItemRequest {
        private Long productId;
        private String size;
        private Integer qty;
    }
}
