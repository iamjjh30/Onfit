package com.example.onfit.repository;

import com.example.onfit.entity.Cart;
import com.example.onfit.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface CartRepository extends JpaRepository<Cart, Long> {
    // JpaRepository를 상속받으면 기본 저장/조회 기능이 자동으로 생깁니다!
    List<Cart> findByMember(Member member);

    @Transactional
    void deleteByCartIdAndMember(Long cartId, Member member);
}