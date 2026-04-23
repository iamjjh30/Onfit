package com.example.onfit.controller;

import com.example.onfit.dto.CurationResponse;
import com.example.onfit.entity.FittingHistory;
import com.example.onfit.entity.Member;
import com.example.onfit.repository.FittingHistoryRepository;
import com.example.onfit.repository.MemberRepository;
import com.example.onfit.service.CurationService;
import com.example.onfit.service.MemberService;
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

    private final StyleDnaService       dnaService;
    private final CurationService       curationService;
    private final FittingHistoryRepository fittingRepository;
    private final MemberRepository      memberRepository;  // ✅ 추가

    @GetMapping("/MyPalette")
    public String myPalettePage(HttpSession session, Model model) {
        Member sessionMember = (Member) session.getAttribute("loginMember");

        if (sessionMember == null) {
            return "redirect:/login";
        }

        // ✅ 세션 대신 DB에서 최신 데이터 조회
        Member loginMember = memberRepository.findById(sessionMember.getId())
                .orElse(sessionMember);

        // ✅ 세션도 최신 데이터로 업데이트
        session.setAttribute("loginMember", loginMember);

        List<FittingHistory> recentFittings = fittingRepository.findByMemberOrderByCreatedAtDesc(
                loginMember, PageRequest.of(0, 3)
        );

        // 1. 진짜 내 DNA 점수 계산해오기
        Map<String, Integer> dnaScores = dnaService.calculateDna(loginMember.getId());
        String dnaTop = dnaService.getTopDna(dnaScores); // ✅ dnaTop도 추가
        model.addAttribute("dnaTop", dnaTop);

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

        // ✅ null 안전하게 진행도 계산해서 넘기기
        int orderAmount = loginMember.getTotalOrderAmount() != null ? loginMember.getTotalOrderAmount() : 0;
        int orderCount  = loginMember.getTotalOrderCount()  != null ? loginMember.getTotalOrderCount()  : 0;
        int level       = loginMember.getStyleLevel()       != null ? loginMember.getStyleLevel()       : 1;
        int next        = StyleDnaService.getNextLevelAmount(level);
        int progressPct = (level >= 5 || next == 0) ? 100 : Math.min(100, orderAmount * 100 / next);


        model.addAttribute("fittings", fittings);
        model.addAttribute("recentFittings", recentFittings);
        // static이라 인스턴스 없이 클래스명으로 바로 호출
        model.addAttribute("levelName",   StyleDnaService.getLevelName(level));
        model.addAttribute("nextAmount",  next);
        model.addAttribute("orderAmount", orderAmount);
        model.addAttribute("orderCount",  orderCount);
        model.addAttribute("progressPct", progressPct);  // ✅ 계산된 % 값만 넘김
        return "MyPalette";
    }
}