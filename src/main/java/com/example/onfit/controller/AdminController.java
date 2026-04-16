package com.example.onfit.controller;

import com.example.onfit.entity.Member;
import com.example.onfit.entity.Product;
import com.example.onfit.repository.MemberRepository;
import com.example.onfit.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final MemberRepository memberRepository;
    private final ProductRepository productRepository;

    @GetMapping("")
    public String adminMain(Model model) {
        // 1. 모든 회원 데이터 가져오기
        List<Member> allMembers = memberRepository.findAll();

        // 2. 대시보드 통계 계산
        long totalMembers = allMembers.size();
        long totalDiagnosed = allMembers.stream()
                .filter(m -> m.getPersonalColor() != null && !m.getPersonalColor().equals("미진단"))
                .count();

        // 3. 최근 가입 유저 5명 (ID 역순)
        List<Member> recentMembers = allMembers.stream()
                .sorted((m1, m2) -> Long.compare(m2.getId(), m1.getId()))
                .limit(5)
                .collect(Collectors.toList());

        // 4. 쇼핑 데이터 (전체 상품)
        List<Product> products = productRepository.findAll();

        // 5. 모델에 데이터 바인딩
        model.addAttribute("totalMembers", totalMembers);
        model.addAttribute("totalDiagnosed", totalDiagnosed);
        model.addAttribute("todayMembers", 0); // 추후 날짜 필드 추가 시 로직 수정
        model.addAttribute("pendingInquiries", 0);

        model.addAttribute("recentMembers", recentMembers);
        model.addAttribute("products", products);
        model.addAttribute("members", allMembers); // CRM용 전체 리스트

        return "admin";
    }
}