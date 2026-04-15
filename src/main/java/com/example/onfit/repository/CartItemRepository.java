package com.example.onfit.repository;

import com.example.onfit.entity.CartItem;
import com.example.onfit.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    // 🌟 핵심 메서드: 회원 번호(memberId)를 주면 그 회원의 장바구니 목록을 전부 찾아옵니다!
    List<CartItem> findAllByMemberId(Long memberId);

    void deleteByIdAndMember(Long id, Member member);
}