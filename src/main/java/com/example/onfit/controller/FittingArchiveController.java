package com.example.onfit.controller;

import com.example.onfit.entity.FittingHistory;
import com.example.onfit.entity.Member;
import com.example.onfit.repository.FittingHistoryRepository;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Controller
@RequiredArgsConstructor
public class FittingArchiveController {

    private final FittingHistoryRepository fittingHistoryRepository;

    @GetMapping("/FittingArchive")
    public String showFittingArchive(HttpSession session, Model model) {
        // 1. 로그인 여부 확인
        Member loginMember = (Member) session.getAttribute("loginMember");
        if (loginMember == null) {
            return "redirect:/Login";
        }

        // 2. 해당 회원의 전체 피팅 기록 조회
        List<FittingHistory> allFittings = fittingHistoryRepository.findByMemberOrderByCreatedAtDesc(loginMember);

        // 3. 자바 스트림을 사용하여 데이터를 월별로 그룹화 (Key: "March 2026")
        // LinkedHashMap을 사용하여 최신 월이 위로 오도록 순서 유지
        Map<String, List<FittingHistory>> groupedData = allFittings.stream()
                .collect(Collectors.groupingBy(
                        fit -> fit.getCreatedAt().format(DateTimeFormatter.ofPattern("MMMM yyyy", Locale.ENGLISH)),
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        // 4. 화면(Thymeleaf)에 데이터 전달
        model.addAttribute("groupedFittings", groupedData);
        model.addAttribute("totalCount", allFittings.size());

        return "FittingArchive"; // templates/FittingArchive.html 실행
    }
}