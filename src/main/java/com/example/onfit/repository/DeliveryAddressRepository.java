package com.example.onfit.repository;

import com.example.onfit.entity.DeliveryAddress;
import com.example.onfit.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DeliveryAddressRepository extends JpaRepository<DeliveryAddress, Long> {
    // 특정 회원의 배송지 목록을 최신 등록순으로 가져오기
    List<DeliveryAddress> findByMemberOrderByIdDesc(Member member);

    // 특정 회원의 배송지 목록 모두 가져오기 (기본 배송지 해제용)
    List<DeliveryAddress> findByMember(Member member);
}