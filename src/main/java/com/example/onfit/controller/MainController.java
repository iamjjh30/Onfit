package com.example.onfit.controller;

import com.example.onfit.entity.Product;
import com.example.onfit.repository.ProductRepository;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.stream.Collectors;

@Controller
@RequiredArgsConstructor
public class MainController {
    private final ProductRepository productRepository;

    @GetMapping({"/", "/main", "/Main"})
    public String mainPage(HttpSession session, Model model) {

        // ── 1. BEST PICKS ──
        model.addAttribute("bestNeutral",    productRepository.findTop4ByIsfearedOrderByViewCountDesc("NEUTRAL"));
        model.addAttribute("bestSpringWarm", productRepository.findTop4ByIsfearedOrderByViewCountDesc("SPRING_WARM"));
        model.addAttribute("bestSummerCool", productRepository.findTop4ByIsfearedOrderByViewCountDesc("SUMMER_COOL"));
        model.addAttribute("bestAutumnWarm", productRepository.findTop4ByIsfearedOrderByViewCountDesc("AUTUMN_WARM"));
        model.addAttribute("bestWinterCool", productRepository.findTop4ByIsfearedOrderByViewCountDesc("WINTER_COOL"));

        // ── 2. OUTFIT ──
        model.addAttribute("outfitNeutral",    getSortedOutfits("NEUTRAL"));
        model.addAttribute("outfitSpringWarm", getSortedOutfits("SPRING_WARM"));
        model.addAttribute("outfitSummerCool", getSortedOutfits("SUMMER_COOL"));
        model.addAttribute("outfitAutumnWarm", getSortedOutfits("AUTUMN_WARM"));
        model.addAttribute("outfitWinterCool", getSortedOutfits("WINTER_COOL"));

        return "Main";
    }

    // ✅ 수정: findOutfitsByPrefix 사용으로 _ 와일드카드 문제 해결
    private List<Product> getSortedOutfits(String colorPrefix) {
        List<Product> rawList = productRepository.findOutfitsByPrefix(colorPrefix);

        return rawList.stream()
                .sorted((p1, p2) -> {
                    String o1 = p1.getOutfit() == null ? "" : p1.getOutfit();
                    String o2 = p2.getOutfit() == null ? "" : p2.getOutfit();

                    boolean sameSet = o1.replaceAll("_(TOP|BOTTOM)$", "")
                            .equals(o2.replaceAll("_(TOP|BOTTOM)$", ""));

                    if (sameSet) {
                        return o2.compareTo(o1);
                    }
                    return o1.compareTo(o2);
                })
                .collect(Collectors.toList());
    }

    @GetMapping("/signIn")
    public String signInPage() {
        return "signin";
    }

    @GetMapping("/find")
    public String findPage() {
        return "find";
    }

    @GetMapping("/product/{id}")
    public String productDetail(@PathVariable("id") Long id, Model model) {
        return "itemDetail";
    }

    @GetMapping("/order")
    public String orderPage() {
        return "Checkout";
    }

    @GetMapping("/order/success")
    public String orderSuccessPage() {
        return "CheckoutSuccess";
    }

    @GetMapping("/order/fail")
    public String orderFailPage() {
        return "CheckoutFail";
    }

    @GetMapping("/orderInfo/{id}")
    public String orderInfoDetail(@PathVariable("id") Long id, Model model) {
        return "OrderInfoDetail";
    }

    @GetMapping("/community")
    public String communityPage() {
        return "Community";
    }

    @GetMapping("/community/{id}")
    public String communityDetail(@PathVariable("id") Long id, Model model) {
        return "CommunityDetail";
    }

    @GetMapping("/community/write")
    public String communityWritePage() {
        return "CommunityWrite";
    }

    @GetMapping("/diagnosis")
    public String diagnosisPage() {
        return "AIStyler";
    }

    @GetMapping("/OrderInfoDetail")
    public String orderInfoDetail() {
        return "OrderInfoDetail";
    }

    @GetMapping("/Cart")
    public String cartPage() {
        return "Cart";
    }

    @GetMapping("/diagnosisResult")
    public String diagnosisResultPage() {
        return "diagnosisResult";
    }

    @GetMapping("/Ask")
    public String AskPage() {
        return "Ask";
    }

    @GetMapping("/Ask_question")
    public String AskQuestionPage() {
        return "Ask_question";
    }

    @GetMapping("/Main2")
    public String Main2Page() {
        return "Main";
    }

    @GetMapping("/colorTrend")
    public String colorTrend() {
        return "ColorTrend";
    }
}