package com.example.onfit.repository;

import com.example.onfit.entity.Member;
import com.example.onfit.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    // 특정 회원의 주문 내역을 최신순(생성일자 내림차순)으로 가져오기
    List<Order> findByMemberOrderByCreatedAtDesc(Member member);
}