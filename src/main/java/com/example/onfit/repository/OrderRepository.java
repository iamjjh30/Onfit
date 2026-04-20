package com.example.onfit.repository;

import com.example.onfit.entity.Member;
import com.example.onfit.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    // 기존 클라이언트용 (건드리지 마세요)
    List<Order> findByMemberOrderByCreatedAtDesc(Member member);
    Optional<Order> findByOrderId(String orderId);
}