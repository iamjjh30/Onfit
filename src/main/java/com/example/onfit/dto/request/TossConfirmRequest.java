package com.example.onfit.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.util.List;

@Getter
public class TossConfirmRequest {

    // ── 토스 승인에 필요한 필드 ──
    @NotBlank private String paymentKey;
    @NotBlank private String orderId;     // 토스 orderId (ONFIT-xxx)
    @NotNull  private Integer amount;

    // ── 주문 생성에 필요한 배송지 정보 ──
    @NotBlank private String recvName;
    @NotBlank private String address;
    @NotBlank private String phone;
    private Integer deliFee = 0;

    @NotEmpty private List<OrderCreateRequest.OrderItemRequest> items;
}
