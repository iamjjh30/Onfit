package com.example.onfit.repository;

import com.example.onfit.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByLoginId(String loginId);

    Optional<Member> findByNameAndTel(String name, String tel);
}
