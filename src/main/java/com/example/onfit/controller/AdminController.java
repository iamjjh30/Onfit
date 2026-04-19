package com.example.onfit.controller;

import com.example.onfit.entity.Member;
import com.example.onfit.entity.Product;
import com.example.onfit.repository.MemberRepository;
import com.example.onfit.repository.ProductRepository;
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

    private final MemberRepository memberRepository;
    private final ProductRepository productRepository;

    @GetMapping("/shopping/delete/{id}")
    public String deleteProduct(@PathVariable("id") Long id) {
        productRepository.deleteById(id);
        return "redirect:/admin"; // 삭제 후 다시 관리자 메인으로
    }
    @GetMapping("/shopping/edit/{id}")
    public String editProductForm(@PathVariable("id") Long id, Model model) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 상품이 없습니다."));
        model.addAttribute("product", product);
        return "admin_edit"; // admin_edit.html 파일을 새로 만들어야 합니다.
    }

    // 2. 실제 수정 실행
    @PostMapping("/shopping/update/{id}")
    public String updateProduct(@PathVariable("id") Long id, @ModelAttribute Product product) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 상품이 없습니다."));

        // 필요한 필드 업데이트
        existingProduct.setName(product.getName());
        existingProduct.setPrice(product.getPrice());
        existingProduct.setCategory(product.getCategory());
        existingProduct.setStockQuantity(product.getStockQuantity());
        existingProduct.setStyleTags(product.getStyleTags());
        existingProduct.setRecommendedSeasons(product.getRecommendedSeasons());
        existingProduct.setDescription(product.getDescription());

        productRepository.save(existingProduct);
        return "redirect:/admin";
    }
    @GetMapping("")
    public String adminMain(Model model) {
        List<Member> allMembers = memberRepository.findAll();
        List<Product> products = productRepository.findAll();

        model.addAttribute("totalMembers", allMembers.size());
        model.addAttribute("totalDiagnosed", allMembers.stream()
                .filter(m -> m.getPersonalColor() != null && !m.getPersonalColor().equals("미진단"))
                .count());

        List<Member> recentMembers = allMembers.stream()
                .sorted((m1, m2) -> Long.compare(m2.getId(), m1.getId()))
                .limit(5)
                .collect(Collectors.toList());

        model.addAttribute("recentMembers", recentMembers);
        model.addAttribute("products", products);
        model.addAttribute("members", allMembers);
        model.addAttribute("todayMembers", 0);
        model.addAttribute("pendingInquiries", 0);

        return "admin";
    }

    @PostMapping("/shopping/add")
    public String addProduct(@ModelAttribute Product product,
                             @RequestParam("imageFile") MultipartFile imageFile,
                             @RequestParam("hoverFile") MultipartFile hoverFile) {
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

            // 🌟 상세페이지(itemDetail.html)의 스크립트가 인식할 수 있도록 대문자로 변환
            if (product.getCategory() != null) product.setCategory(product.getCategory().toUpperCase());
            if (product.getStyleTags() != null) product.setStyleTags(product.getStyleTags().toUpperCase());
            if (product.getRecommendedSeasons() != null) product.setRecommendedSeasons(product.getRecommendedSeasons().toUpperCase());

            product.setCreatedAt(LocalDateTime.now());
            if (product.getViewCount() == null) product.setViewCount(0);

            productRepository.save(product);

        } catch (IOException e) {
            e.printStackTrace();
        }

        return "redirect:/admin";
    }
}