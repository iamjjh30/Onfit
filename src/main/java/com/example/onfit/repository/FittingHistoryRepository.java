package com.example.onfit.repository;

import com.example.onfit.entity.FittingHistory;
import com.example.onfit.entity.Member;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FittingHistoryRepository extends JpaRepository<FittingHistory, Long> {

    // 1. 최신순 + 페이징 (이미 잘 만드심)
    List<FittingHistory> findByMemberOrderByCreatedAtDesc(Member member, Pageable pageable);

    // 2. 최신순 전체 조회 (이미 잘 만드심)
    List<FittingHistory> findByMemberOrderByCreatedAtDesc(Member member);

    // 3. 컨트롤러의 에러를 해결하기 위한 기본 메서드 추가
    List<FittingHistory> findByMember(Member member);
}