package com.example.onfit.service;

import com.example.onfit.entity.Member;
import com.example.onfit.entity.Order;
import com.example.onfit.entity.OrderItem;
import com.example.onfit.entity.Product;
import com.example.onfit.repository.OrderRepository;
import com.example.onfit.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;       // 🌟 추가
    private final ProductRepository productRepository;

    @Transactional
    public void saveOrder(Member member, String orderId, Long totalAmount,
                          List<Map<String, Object>> items,
                          String receiverName, String receiverPhone,
                          String receiverAddress, String payMethod) {

        Order order = Order.builder()
                .orderId(orderId)
                .member(member)
                .totalAmount(totalAmount)
                .status("결제완료")
                .receiverName(receiverName)
                .receiverPhone(receiverPhone)
                .receiverAddress(receiverAddress)
                .payMethod(payMethod)
                .build();

        for (Map<String, Object> itemData : items) {
            System.out.println("DEBUG - 수신된 상품 데이터: " + itemData);

            Object pIdObj = itemData.get("productId");
            if (pIdObj == null) {
                throw new RuntimeException("상품 ID(productId)가 전달되지 않았습니다. 데이터: " + itemData);
            }

            Long productId = Long.valueOf(pIdObj.toString());
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new IllegalArgumentException("상품 없음: " + productId));

            String size = itemData.get("size") != null ? itemData.get("size").toString() : "FREE";

            Object qtyObj = itemData.get("qty");
            if (qtyObj == null) qtyObj = itemData.get("quantity");
            int finalQuantity = (qtyObj != null) ? Integer.parseInt(qtyObj.toString()) : 1;

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .size(size)
                    .quantity(finalQuantity)
                    .price(product.getPrice().longValue())
                    .build();

            order.addOrderItem(orderItem);
        }

        orderRepository.save(order);
    }
}


