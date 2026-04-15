package com.example.onfit.repository;

import com.example.onfit.entity.UserActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserActivityRepository extends JpaRepository<UserActivity, Long> {

    @Modifying
    @Query("UPDATE UserActivity a SET a.fittingCount = a.fittingCount + 1 WHERE a.userId = :userId")
    void incrementFitting(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE UserActivity a SET a.buyCount = a.buyCount + 1 WHERE a.userId = :userId")
    void incrementBuy(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE UserActivity a SET a.postCount = a.postCount + 1 WHERE a.userId = :userId")
    void incrementPost(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE UserActivity a SET a.postCount = a.postCount - 1 WHERE a.userId = :userId AND a.postCount > 0")
    void decrementPost(@Param("userId") Long userId);
}
