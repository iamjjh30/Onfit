package com.example.onfit.repository;

import com.example.onfit.entity.MemberActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MemberActivityRepository extends JpaRepository<MemberActivity, Long> {
    // 특정 회원의 모든 활동 기록 가져오기
    List<MemberActivity> findAllByMemberId(Long memberId);
}