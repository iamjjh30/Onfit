package com.example.onfit.repository;

import com.example.onfit.entity.Coupon;
import com.example.onfit.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CouponRepository extends JpaRepository<Coupon, Long> {
    List<Coupon> findByMemberAndIsUsedFalseOrderByExpiredAtAsc(Member member);
    List<Coupon> findByMemberOrderByExpiredAtAsc(Member member);
    List<Coupon> findByMemberAndIsUsedFalse(Member member);
}