package com.example.onfit.service;

import com.example.onfit.dto.MemberJoinDto;
import com.example.onfit.dto.MemberLoginDto;
import com.example.onfit.entity.Member;
import com.example.onfit.mapper.MemberMapper;
import com.example.onfit.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final MemberMapper memberMapper;

    public void savePersonalColor(Long memberId, String tone) {
        memberMapper.updatePersonalColor(memberId, tone);
    }

    @Transactional
    public void join(MemberJoinDto dto) {
        // 1. 중복 아이디 검사
        if (memberRepository.findByLoginId(dto.getLoginId()).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
        }

        // 2. 생년월일 조립 (예: 1999 + - + 05 + - + 12 = "1999-05-12")
        String fullBirthDate = null;
        if (dto.getBirthYear() != null && dto.getBirthMonth() != null && dto.getBirthDay() != null) {
            fullBirthDate = dto.getBirthYear() + "-" + dto.getBirthMonth() + "-" + dto.getBirthDay();
        }

        // 3. Entity로 변환 (추가된 정보들도 모두 넣어줌)
        Member member = Member.builder()
                .loginId(dto.getLoginId())
                .password(dto.getPassword())
                .name(dto.getName())
                .tel(dto.getTel())
                .email(dto.getEmail())
                .birthDate(fullBirthDate)
                .personalColor("미진단")
                .styleDna("미진단")
                .build();

        // 4. DB에 저장
        memberRepository.save(member);
    }
    public Member login(MemberLoginDto dto) {
        // 1. 입력받은 아이디로 DB에서 회원을 찾고
        // 2. 비밀번호가 일치하면 그 회원(Member) 객체를 통째로 반환, 아니면 null 반환
        return memberRepository.findByLoginId(dto.getLoginId())
                .filter(m -> m.getPassword().equals(dto.getPassword()))
                .orElse(null);
    }
    public boolean isAdmin(String loginId) {
        java.util.List<String> adminIds = java.util.Arrays.asList("kdoryul", "ad1", "ad2"); // 여기에 진짜 ID 3개 넣어
        return adminIds.contains(loginId);
    }
}