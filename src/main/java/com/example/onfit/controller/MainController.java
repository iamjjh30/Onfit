package com.example.onfit.controller;

import com.example.onfit.entity.Product;
import com.example.onfit.repository.ProductRepository;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class MainController {
    private final ProductRepository productRepository;

    @GetMapping("/")
    public String mainPage(HttpSession session, Model model) {
        // ── BEST PICKS: is_feared 컬럼 값으로 퍼스널컬러별 4개씩 조회 ──
        // is_feared 값 예시: "neutral", "spring_warm", "summer_cool", "autumn_warm", "winter_cool"
        // viewCount 내림차순(인기순)으로 4개 반환
        List<Product> bestNeutral    = productRepository
                .findTop4ByIsfearedOrderByViewCountDesc("NEUTRAL");
        List<Product> bestSpringWarm = productRepository
                .findTop4ByIsfearedOrderByViewCountDesc("SPRING_WARM");
        List<Product> bestSummerCool = productRepository
                .findTop4ByIsfearedOrderByViewCountDesc("SUMMER_COOL");
        List<Product> bestAutumnWarm = productRepository
                .findTop4ByIsfearedOrderByViewCountDesc("AUTUMN_WARM");
        List<Product> bestWinterCool = productRepository
                .findTop4ByIsfearedOrderByViewCountDesc("WINTER_COOL");

        model.addAttribute("bestNeutral",    bestNeutral);
        model.addAttribute("bestSpringWarm", bestSpringWarm);
        model.addAttribute("bestSummerCool", bestSummerCool);
        model.addAttribute("bestAutumnWarm", bestAutumnWarm);
        model.addAttribute("bestWinterCool", bestWinterCool);

        // ── OUTFIT: outfit 컬럼 값으로 퍼스널컬러별 조회 ──
        // outfit 컬럼 예시: "neutral_top", "neutral_bottom",
        //                   "spring_warm_top", "spring_warm_bottom" 등
        // 각 컬러별 TOP 3쌍(상의 3개 + 하의 3개)을 가져와서 템플릿에서 zip 처리
        //
        // 또는 outfit = "neutral_01", "neutral_02", "neutral_03" 처럼
        // 세트 단위 그룹핑이라면 아래 방식으로 가져옵니다.
        //
        // 현재 구조: outfit 컬럼으로 같은 값끼리 묶어서 상/하의 2개를 한 세트로 처리.
        // 예) outfit = "neutral_set01_top" / "neutral_set01_bottom"
        // 단순화를 위해 컬러+세트번호 prefix로 묶어 총 6개(3세트×2)씩 가져옵니다.

        List<Product> outfitNeutral    = productRepository
                .findTop6ByOutfitStartingWithOrderByIdAsc("NEUTRAL");
        List<Product> outfitSpringWarm = productRepository
                .findTop6ByOutfitStartingWithOrderByIdAsc("SPRING_WARM");
        List<Product> outfitSummerCool = productRepository
                .findTop6ByOutfitStartingWithOrderByIdAsc("SUMMER_COOL");
        List<Product> outfitAutumnWarm = productRepository
                .findTop6ByOutfitStartingWithOrderByIdAsc("AUTUMN_WARM");
        List<Product> outfitWinterCool = productRepository
                .findTop6ByOutfitStartingWithOrderByIdAsc("WINTER_COOL");

        model.addAttribute("outfitNeutral",    outfitNeutral);
        model.addAttribute("outfitSpringWarm", outfitSpringWarm);
        model.addAttribute("outfitSummerCool", outfitSummerCool);
        model.addAttribute("outfitAutumnWarm", outfitAutumnWarm);
        model.addAttribute("outfitWinterCool", outfitWinterCool);

        return "Main";
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
        return "OrderInfoDetail"; // templates/OrderInfoDetail.html 반환
    }
    @GetMapping("/Cart")
    public String cartPage() {
        // src/main/resources/templates/Cart.html 파일을 찾아서 화면에 띄워줍니다!
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
    public String Main2Page() { return "Main"; }

}