package com.example.onfit.controller;

import com.example.onfit.dto.CurationResponse;
import com.example.onfit.entity.FittingHistory;
import com.example.onfit.entity.Member;
import com.example.onfit.repository.FittingHistoryRepository;
import com.example.onfit.service.CurationService;
import com.example.onfit.service.StyleDnaService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import jakarta.servlet.http.HttpSession;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class PaletteController {

    @Autowired
    private StyleDnaService dnaService;

    @Autowired
    private CurationService curationService;

    @Autowired
    private FittingHistoryRepository fittingRepository;

    @GetMapping("/MyPalette")
    public String myPalettePage(HttpSession session, Model model) {
        Member loginMember = (Member) session.getAttribute("loginMember");

        if (loginMember == null) {
            return "redirect:/login";
        }

        List<FittingHistory> recentFittings = fittingRepository.findByMemberOrderByCreatedAtDesc(
                loginMember, PageRequest.of(0, 3)
        );

        // 1. 진짜 내 DNA 점수 계산해오기
        Map<String, Integer> dnaScores = dnaService.calculateDna(loginMember.getId());

        // 2. JSON 변환 (예외 처리 필수!)
        ObjectMapper mapper = new ObjectMapper();
        try {
            String jsonStr = mapper.writeValueAsString(dnaScores);
            model.addAttribute("dnaJson", jsonStr);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            model.addAttribute("dnaJson", "{}"); // 에러 시 빈 객체 전달
        }

        // 3. 🌟 이번 달 AI 맞춤 코디 데이터 추가
        // 여기서 에러가 난다면 CurationService 파일이 생성되었는지 확인하세요!
        try {
            List<CurationResponse> recommendations = curationService.getMonthlyRecommendation(loginMember);
            model.addAttribute("recommendations", recommendations);
        } catch (Exception e) {
            e.printStackTrace();
            model.addAttribute("recommendations", new ArrayList<>()); // 에러 시 빈 리스트
        }
        List<FittingHistory> fittings = fittingRepository.findByMemberOrderByCreatedAtDesc(
                loginMember, PageRequest.of(0, 3));

        model.addAttribute("fittings", fittings);
        model.addAttribute("recentFittings", recentFittings);
        return "MyPalette";
    }
}