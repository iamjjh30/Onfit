package com.example.onfit.controller;

import com.example.onfit.dto.response.UserCrmDTO;
import com.example.onfit.entity.Member;
import com.example.onfit.entity.Product;
import com.example.onfit.repository.*;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final MemberRepository memberRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final FittingHistoryRepository fittingHistoryRepository;
    private final PostRepository postRepository;

    private final String MEMO_FILE_PATH = System.getProperty("user.dir") + "/src/main/resources/static/uploads/admin_memo.txt";

    private static final List<String> PERSONAL_COLORS = List.of(
            "NEUTRAL", "SPRING_WARM", "SUMMER_COOL", "AUTUMN_WARM", "WINTER_COOL"
    );
    private static final List<String> SET_NUMBERS = List.of("SET01", "SET02", "SET03", "SET04");
    private static final List<String> POSITIONS = List.of("TOP", "BOTTOM");

    private boolean isAdmin(HttpSession session) {
        Member loginMember = (Member) session.getAttribute("loginMember");
        if (loginMember == null) return false;
        List<String> masters = Arrays.asList("kdoryul", "ad1", "ad2");
        return masters.contains(loginMember.getLoginId()) || "ADMIN".equals(loginMember.getStyleDna());
    }

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

        List<Member> recentMembers = allMembers.stream()
                .sorted((m1, m2) -> Long.compare(m2.getId(), m1.getId()))
                .limit(5)
                .collect(Collectors.toList());
        model.addAttribute("recentMembers", recentMembers);
        model.addAttribute("products", products);

        List<UserCrmDTO> crmList = allMembers.stream().map(m -> new UserCrmDTO(
                m.getId(), m.getName(), m.getLoginId(),
                m.getPersonalColor() != null ? m.getPersonalColor() : "미진단",
                m.getStyleDna() != null ? m.getStyleDna() : "-",
                0, 0, 0
        )).collect(Collectors.toList());
        model.addAttribute("members", crmList);

        String memoContent = "";
        try {
            File memoFile = new File(MEMO_FILE_PATH);
            if (memoFile.exists()) {
                memoContent = java.nio.file.Files.readString(memoFile.toPath());
            }
        } catch (IOException e) { e.printStackTrace(); }
        model.addAttribute("adminMemo", memoContent);

        // Outfit 맵
        Map<String, Product> outfitMap = new HashMap<>();
        for (Product p : products) {
            if (p.getOutfit() != null && !p.getOutfit().isBlank()) {
                outfitMap.put(p.getOutfit().toUpperCase(), p);
            }
        }
        model.addAttribute("outfitMap", outfitMap);

        // BestPick (임시 빈 맵)
        model.addAttribute("bestMap", new HashMap<String, List<Product>>());

        model.addAttribute("totalProducts", products.size());

        return "admin";
    }

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

    @GetMapping("/shopping/edit/{id}")
    public String editProductPage(@PathVariable("id") Long id, Model model, HttpSession session) {
        if (!isAdmin(session)) return "redirect:/login";
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 상품이 없습니다. id=" + id));
        model.addAttribute("product", product);
        return "admin_edit";
    }

    @PostMapping("/shopping/update/{id}")
    public String updateProduct(@PathVariable("id") Long id,
                                @ModelAttribute Product product,
                                HttpSession session) {
        if (!isAdmin(session)) return "redirect:/";
        try {
            Product existingProduct = productRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("해당 상품이 없습니다. id=" + id));

            existingProduct.setName(product.getName());
            existingProduct.setCategory(product.getCategory());
            existingProduct.setPrice(product.getPrice());
            existingProduct.setStockQuantity(product.getStockQuantity());
            existingProduct.setStyleTags(product.getStyleTags());
            existingProduct.setDescription(product.getDescription());
            String isfeared = product.getIsfeared();
            existingProduct.setIsfeared((isfeared == null || isfeared.isBlank()) ? null : isfeared);
            existingProduct.setAvailableSizes(product.getAvailableSizes());

            productRepository.save(existingProduct);
        } catch (Exception e) {
            e.printStackTrace();
            return "redirect:/admin?error=update_failed";
        }
        return "redirect:/admin";
    }

    @GetMapping("/shopping/delete/{id}")
    public String deleteProduct(@PathVariable("id") Long id, HttpSession session) {
        if (!isAdmin(session)) return "redirect:/";
        productRepository.deleteById(id);
        return "redirect:/admin";
    }

    @PostMapping("/outfit/save")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveOutfitSlot(
            @RequestParam("slot") String slot,
            @RequestParam("productId") Long productId,
            HttpSession session) {

        if (!isAdmin(session)) {
            return ResponseEntity.status(403).body(Map.of("result", "error", "message", "권한 없음"));
        }

        String slotKey = slot.toUpperCase();
        boolean valid = PERSONAL_COLORS.stream().anyMatch(c -> slotKey.startsWith(c))
                && SET_NUMBERS.stream().anyMatch(s -> slotKey.contains(s))
                && POSITIONS.stream().anyMatch(p -> slotKey.endsWith(p));
        if (!valid) {
            return ResponseEntity.badRequest().body(Map.of("result", "error", "message", "잘못된 슬롯 키: " + slot));
        }

        productRepository.clearOutfitSlot(slotKey);

        if (productId == 0L) {
            return ResponseEntity.ok(Map.of("result", "success", "message", "슬롯이 비워졌습니다."));
        }

        Product target = productRepository.findById(productId)
                .orElse(null);
        if (target == null) {
            return ResponseEntity.badRequest().body(Map.of("result", "error", "message", "상품을 찾을 수 없습니다."));
        }

        productRepository.updateOutfit(productId, slotKey);

        return ResponseEntity.ok(Map.of(
                "result", "success",
                "message", slotKey + " → " + target.getName() + " 설정 완료"
        ));
    }

    @GetMapping("/outfit/status")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getOutfitStatus(HttpSession session) {
        if (!isAdmin(session)) {
            return ResponseEntity.status(403).body(Map.of("result", "error"));
        }

        List<Product> allProducts = productRepository.findAll();
        Map<String, Map<String, Object>> outfitStatus = new LinkedHashMap<>();

        for (Product p : allProducts) {
            if (p.getOutfit() != null && !p.getOutfit().isBlank()) {
                outfitStatus.put(p.getOutfit().toUpperCase(), Map.of(
                        "productId", p.getId(),
                        "productName", p.getName(),
                        "imageUrl", p.getImageUrl() != null ? p.getImageUrl() : ""
                ));
            }
        }
        return ResponseEntity.ok(Map.of("result", "success", "slots", outfitStatus));
    }

    @GetMapping("/member/detail/{id}")
    public String memberDetail(@PathVariable("id") Long id, Model model, HttpSession session) {
        if (!isAdmin(session)) return "redirect:/";
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("회원이 없습니다."));
        model.addAttribute("m", member);
        model.addAttribute("orders", orderRepository.findByMemberOrderByCreatedAtDesc(member));
        model.addAttribute("fittings", fittingHistoryRepository.findByMember(member));
        model.addAttribute("posts", postRepository.findByMember(member));
        return "admin_member_detail";
    }

    @PostMapping("/access/toggle/{id}")
    public String toggleAccess(@PathVariable("id") Long id, HttpSession session) {
        Member loginMember = (Member) session.getAttribute("loginMember");
        List<String> masters = Arrays.asList("kdoryul", "ad1", "ad2");
        if (loginMember == null || !masters.contains(loginMember.getLoginId())) {
            return "redirect:/admin?error=denied";
        }
        Member targetMember = memberRepository.findById(id).orElseThrow();
        if (masters.contains(targetMember.getLoginId())) return "redirect:/admin";
        targetMember.setStyleDna("ADMIN".equals(targetMember.getStyleDna()) ? "USER" : "ADMIN");
        memberRepository.save(targetMember);
        return "redirect:/admin";
    }

    @PostMapping("/member/delete/{id}")
    public String deleteMember(@PathVariable("id") Long id, HttpSession session) {
        if (!isAdmin(session)) return "redirect:/";
        Member member = memberRepository.findById(id).orElse(null);
        if (member != null && !"kdoryul".equals(member.getLoginId())) {
            member.setStyleDna("DELETED");
            member.setName("(탈퇴)" + member.getName());
            memberRepository.save(member);
        }
        return "redirect:/admin";
    }

    @PostMapping("/project/memo/save")
    @ResponseBody
    public String saveMemo(@RequestParam("content") String content, HttpSession session) {
        if (!isAdmin(session)) return "error";
        try {
            File folder = new File(System.getProperty("user.dir") + "/src/main/resources/static/uploads/");
            if (!folder.exists()) folder.mkdirs();
            java.nio.file.Files.writeString(new File(MEMO_FILE_PATH).toPath(), content);
            return "success";
        } catch (IOException e) {
            e.printStackTrace();
            return "error";
        }
    }
}