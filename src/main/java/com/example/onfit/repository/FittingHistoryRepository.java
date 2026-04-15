package com.example.onfit.repository;

import com.example.onfit.entity.FittingHistory;
import com.example.onfit.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface FittingHistoryRepository extends JpaRepository<FittingHistory, Long> {
    List<FittingHistory> findByMemberOrderByCreatedAtDesc(Member member, Pageable pageable);

    List<FittingHistory> findByMemberOrderByCreatedAtDesc(Member member);
}