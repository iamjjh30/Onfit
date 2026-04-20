package com.example.onfit.controller;

import com.example.onfit.dto.FindAccountDto;
import com.example.onfit.dto.MemberJoinDto;
import com.example.onfit.dto.MemberLoginDto;
import com.example.onfit.entity.Member;
import com.example.onfit.repository.MemberRepository;
import com.example.onfit.service.MemberService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Controller
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;
    private final MemberRepository memberRepository;

    // 1. 회원가입 화면 보여주기
    @GetMapping("/join")
    public String joinForm() {
        // src/main/resources/templates/ 폴더 안의 join.html (또는 jsp 등)을 찾아 엽니다.
        return "signIn";
    }

    // 2. 실제 회원가입 처리 (회원가입 폼에서 Submit 했을 때)
    @PostMapping("/join")
    public String join(MemberJoinDto memberJoinDto, Model model) {
        System.out.println("========== 회원가입 요청 데이터 ==========");
        System.out.println("아이디: " + memberJoinDto.getLoginId());
        System.out.println("비밀번호: " + memberJoinDto.getPassword());
        System.out.println("이름: " + memberJoinDto.getName());
        System.out.println("==========================================");
        try {
            // 서비스에 가입 처리 요청
            memberService.join(memberJoinDto);
            // 가입 성공 시 로그인 페이지나 메인 페이지로 이동 (redirect)
            return "redirect:/login";
        } catch (IllegalArgumentException e) {
            // 중복 아이디 등으로 에러가 났을 때 처리
            model.addAttribute("errorMessage", e.getMessage());
            return "signIn"; // 다시 회원가입 페이지로 돌려보냄
        }
    }

    @GetMapping("/login")
    public String loginForm() {
        return "login"; // templates 폴더 안의 login.html 을 엽니다.
    }

    // 🌟 2. 실제 로그인 처리하기
    @PostMapping("/login")
    public String login(MemberLoginDto loginDto, HttpServletRequest request, Model model) {
        // 서비스에서 검증을 거친 회원 정보 가져오기
        System.out.println("로그인 시도 아이디: " + loginDto.getLoginId());
        System.out.println("로그인 시도 비밀번호: " + loginDto.getPassword());

        Member loginMember = memberService.login(loginDto);

        // 일치하는 회원이 없다면 (로그인 실패)
        if (loginMember == null) {
            System.out.println("❌ 일치하는 회원 정보가 없음! 로그인 실패");
            model.addAttribute("errorMessage", "아이디 또는 비밀번호가 맞지 않습니다.");
            return "login"; // 다시 로그인 페이지로 돌려보냄
        }

        System.out.println("✅ 로그인 성공! 회원 이름: " + loginMember.getName());
        // 💡 로그인 성공 처리: 세션(Session)에 로그인 정보 저장
        // 세션을 생성하고, "loginMember"라는 이름으로 회원의 모든 정보를 서버에 담아둡니다.
        HttpSession session = request.getSession();
        session.setAttribute("loginMember", loginMember);

        // 로그인 성공 시 메인 화면(또는 원하는 곳)으로 이동
        return "redirect:/";
    }

    // 🌟 (보너스) 로그아웃 처리
    @GetMapping("/logout")
    public String logout(HttpServletRequest request) {
        // 현재 세션이 있으면 가져오고, 없으면 안 만듦
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate(); // 세션에 있는 정보를 모두 날려버림 (로그아웃)
        }
        return "redirect:/"; // 메인 화면으로 이동
    }

    @PostMapping("/api/find-account")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> findAccount(@RequestBody FindAccountDto dto) {
        Map<String, Object> response = new HashMap<>();

        Optional<Member> member = memberRepository.findByNameAndTel(dto.getName(), dto.getTel());

        if (member.isPresent()) {
            response.put("success", true);

            if ("ID".equals(dto.getMode())) {
                response.put("result", member.get().getLoginId());
            } else {
                // PW 모드: 실제 서비스에선 임시 비밀번호 발급 권장
                response.put("result", member.get().getPassword());
            }
        } else {
            response.put("success", false);
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/save-personal-color")
    public ResponseEntity<String> savePersonalColor(@RequestBody Map<String, String> requestData, HttpSession session) {

        // 1. 현재 로그인한 세션 유저 가져오기
        Member loginMember = (Member) session.getAttribute("loginMember");

        // 로그인이 안 되어있다면 프론트엔드로 401(Unauthorized) 에러 반환
        if (loginMember == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        // 2. 프론트엔드(JS)에서 보낸 'tone' 데이터 꺼내기 (예: "여름 쿨톤")
        String rawTone = requestData.get("tone");
        String dbTone = "미진단";

        if (rawTone != null) {
            if (rawTone.contains("봄")) {
                dbTone = "SPRING_WARM";
            } else if (rawTone.contains("여름")) {
                dbTone = "SUMMER_COOL";
            } else if (rawTone.contains("가을")) {
                dbTone = "AUTUMN_WARM";
            } else if (rawTone.contains("겨울")) {
                dbTone = "WINTER_COOL";
            }
        }

        // 3. DB에 있는 회원 정보를 찾아 업데이트
        Optional<Member> optionalMember = memberRepository.findById(loginMember.getId());
        if (optionalMember.isPresent()) {
            Member member = optionalMember.get();
            member.setPersonalColor(dbTone); // 🌟 엔티티에 퍼스널 컬러 저장
            memberRepository.save(member); // 🌟 DB에 덮어쓰기 (UPDATE)

            // 4. 세션 정보 덮어쓰기 (가장 중요!)
            // 이걸 해줘야 로그아웃을 안 해도 마이페이지나 스토어에서 바뀐 컬러가 즉시 적용됩니다.
            session.setAttribute("loginMember", member);

            return ResponseEntity.ok("저장 성공!");
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("회원 정보를 찾을 수 없습니다.");
        }
    }
    @GetMapping("/mypalette")
    public String myPalettePage(HttpSession session, Model model) {
        // 1. 세션에서 로그인된 회원 정보 꺼내기
        Member loginMember = (Member) session.getAttribute("loginMember");

        // 2. 로그인이 안 되어있다면 로그인 화면으로 강제 이동
        if (loginMember == null) {
            return "redirect:/login";
        }

        // 3. 로그인이 되어있다면 templates 폴더 안의 MyPalette.html 파일 열기
        return "MyPalette";
    }
    @PostMapping("/api/check-password")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> checkPassword(
            @RequestBody Map<String, String> body,
            HttpSession session) {

        Member loginMember = (Member) session.getAttribute("loginMember");
        if (loginMember == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "로그인이 필요합니다."));
        }

        String inputPwd = body.get("password");

        // ⚠️ 현재 평문 비교 (BCrypt 도입 시 passwordEncoder.matches() 로 교체)
        boolean isCorrect = loginMember.getPassword().equals(inputPwd);

        return ResponseEntity.ok(Map.of("success", isCorrect));
    }
}
