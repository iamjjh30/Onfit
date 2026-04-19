package com.example.onfit.controller;

import com.example.onfit.dto.response.UserCrmDTO;
import com.example.onfit.entity.Member;
import com.example.onfit.entity.Product;
import com.example.onfit.repository.*; // 👈 모든 Repository를 한 번에 import
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    // [필수] 스크린샷에 있던 리포지토리들을 여기에 모두 등록해야 실시간 조회가 가능합니다.
    private final MemberRepository memberRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final FittingHistoryRepository fittingHistoryRepository;
    private final PostRepository postRepository;

    // [0. 권한 체크 공통 로직]
    private boolean isAdmin(HttpSession session) {
        Member loginMember = (Member) session.getAttribute("loginMember");
        return loginMember != null && ("ADMIN".equals(loginMember.getStyleDna()) || "kdoryul".equals(loginMember.getLoginId()));
    }

    // [1. 관리자 메인]
    @GetMapping("")
    public String adminMain(Model model, HttpSession session) {
        if (!isAdmin(session)) return "redirect:/login";

        List<Member> allMembers = memberRepository.findAll();
        List<Product> products = productRepository.findAll();

        model.addAttribute("totalMembers", allMembers.size());
        model.addAttribute("totalDiagnosed", allMembers.stream()
                .filter(m -> m.getPersonalColor() != null && !m.getPersonalColor().equals("미진단"))
                .count());
        model.addAttribute("todayMembers", 0);
        model.addAttribute("pendingInquiries", 0);

        List<Member> recentMembers = allMembers.stream()
                .sorted((m1, m2) -> Long.compare(m2.getId(), m1.getId()))
                .limit(5)
                .collect(Collectors.toList());
        model.addAttribute("recentMembers", recentMembers);
        model.addAttribute("products", products);

        List<UserCrmDTO> crmList = allMembers.stream().map(m -> {
            return new UserCrmDTO(
                    m.getId(), m.getName(), m.getLoginId(),
                    m.getPersonalColor() != null ? m.getPersonalColor() : "미진단",
                    m.getStyleDna() != null ? m.getStyleDna() : "-",
                    0, 0, 0
            );
        }).collect(Collectors.toList());
        model.addAttribute("members", crmList);

        return "admin";
    }

    // [2. 상품 등록]
    @PostMapping("/shopping/add")
    public String addProduct(@ModelAttribute Product product,
                             @RequestParam("imageFile") MultipartFile imageFile,
                             @RequestParam("hoverFile") MultipartFile hoverFile,
                             HttpSession session) {
        if (!isAdmin(session)) return "redirect:/";
        try {
            String uploadDir = System.getProperty("user.dir") + "/src/main/resources/static/uploads/";
            File folder = new File(uploadDir);
            if (!folder.exists()) folder.mkdirs();

            if (!imageFile.isEmpty()) {
                String fileName = System.currentTimeMillis() + "_" + imageFile.getOriginalFilename();
                imageFile.transferTo(new File(uploadDir + fileName));
                product.setImageUrl("/uploads/" + fileName);
            }
            if (!hoverFile.isEmpty()) {
                String hoverName = System.currentTimeMillis() + "_hover_" + hoverFile.getOriginalFilename();
                hoverFile.transferTo(new File(uploadDir + hoverName));
                product.setHoverImageUrl("/uploads/" + hoverName);
            }
            product.setCreatedAt(LocalDateTime.now());
            productRepository.save(product);
        } catch (IOException e) { e.printStackTrace(); }
        return "redirect:/admin";
    }

    // [3. 상품 삭제]
    @GetMapping("/shopping/delete/{id}")
    public String deleteProduct(@PathVariable("id") Long id, HttpSession session) {
        if (!isAdmin(session)) return "redirect:/";
        productRepository.deleteById(id);
        return "redirect:/admin";
    }

    // [4. 유저 상세보기 - 기존 Repository 메서드 활용 버전]
    @GetMapping("/member/detail/{id}")
    public String memberDetail(@PathVariable("id") Long id, Model model, HttpSession session) {
        if (!isAdmin(session)) return "redirect:/";

        // 1. 먼저 회원 객체를 가져옵니다.
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("회원이 없습니다."));
        model.addAttribute("m", member);

        // 2. Repository를 수정하지 않고, 이미 있는 메서드에 member 객체를 통째로 넘깁니다.
        // 기존에 작성하신 findByMemberOrderByCreatedAtDesc 메서드를 활용합니다.
        model.addAttribute("orders", orderRepository.findByMemberOrderByCreatedAtDesc(member));

        // fittingHistoryRepository와 postRepository도
        // 기존에 사용하시던 'Member 객체를 인자로 받는 메서드명'으로 맞춰서 호출하세요.
        // 만약 해당 리포지토리에도 findByMember... 형태의 메서드가 있다면 그걸 쓰시면 됩니다.
        model.addAttribute("fittings", fittingHistoryRepository.findByMember(member));
        model.addAttribute("posts", postRepository.findByMember(member));

        return "admin_member_detail";
    }

    // [5. 권한 관리]
    @PostMapping("/access/toggle/{id}")
    public String toggleAccess(@PathVariable("id") Long id, HttpSession session) {
        Member loginMember = (Member) session.getAttribute("loginMember");
        if (loginMember == null || !"kdoryul".equals(loginMember.getLoginId())) {
            return "redirect:/admin?error=denied";
        }
        Member targetMember = memberRepository.findById(id).orElseThrow();
        if ("kdoryul".equals(targetMember.getLoginId())) return "redirect:/admin";

        targetMember.setStyleDna("ADMIN".equals(targetMember.getStyleDna()) ? "USER" : "ADMIN");
        memberRepository.save(targetMember);
        return "redirect:/admin";
    }
}