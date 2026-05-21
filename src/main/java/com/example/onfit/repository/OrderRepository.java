package com.example.onfit.repository;

import com.example.onfit.entity.Member;
import com.example.onfit.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // 기존 클라이언트용 메서드 (유지)
    List<Order> findByMemberOrderByCreatedAtDesc(Member member);
    Optional<Order> findByOrderId(String orderId);

    // 어드민 대시보드용 최신 주문 5건 조회 (유지)
    List<Order> findTop5ByOrderByCreatedAtDesc();

    /**
     * 🌟 복잡한 키워드를 모두 제거하고 가장 단순한 기간 조회만 남깁니다.
     * 이 형태는 모든 스프링 버전에서 100% 안전하게 작동합니다.
     */
    List<Order> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    void deleteByMember(Member member);
}