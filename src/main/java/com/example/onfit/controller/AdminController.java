package com.example.onfit.controller;

import com.example.onfit.dto.response.UserCrmDTO;
import com.example.onfit.entity.Member;
import com.example.onfit.entity.Product;
import com.example.onfit.entity.Order;
import com.example.onfit.entity.OrderItem;
import com.example.onfit.repository.*;
import com.example.onfit.service.SalesService;
import com.example.onfit.service.StyleDnaService;
import jakarta.servlet.http.HttpSession;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final CouponRepository couponRepository;
    private final MemberActivityRepository activityRepository;
    private final SalesService salesService;
    private final StyleDnaService styleDnaService;
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

    // ═════════════════════════════════════════════════════════════════════
    // 🔀 [Unified Dashboard Routes] 어떤 URL로 들어와도 동일한 실제 데이터 보장
    // ═════════════════════════════════════════════════════════════════════

    @GetMapping({"","/"})
    public String adminMain(
            @RequestParam(value = "period", required = false, defaultValue = "MONTH") String period,
            Model model, HttpSession session) {
        if (!isAdmin(session)) return "redirect:/login";
        populateDashboardData(period, model);
        return "admin";
    }

    @GetMapping("/admin")
    public String adminConsole(
            @RequestParam(value = "period", required = false, defaultValue = "MONTH") String period,
            Model model, HttpSession session) {
        if (!isAdmin(session)) return "redirect:/login";
        populateDashboardData(period, model);
        return "admin";
    }

    @GetMapping("/dashboard")
    public String dashboard(
            @RequestParam(value = "period", required = false, defaultValue = "MONTH") String period,
            Model model, HttpSession session) {
        if (!isAdmin(session)) return "redirect:/login";
        populateDashboardData(period, model);
        return "admin";
    }

    // ═════════════════════════════════════════════════════════════════════
    // ⚙️ [공통 핵심 정산/조회 빌더] 컨트롤러 내 더미데이터 로직 완전 폐기
    // ═════════════════════════════════════════════════════════════════════
    private void populateDashboardData(String period, Model model) {
        System.out.println("대시보드 데이터 빌드 시작..."); // 로그 확인
        List<Member> allMembers = memberRepository.findAll();
        List<Product> products = productRepository.findAll();
        List<UserCrmDTO> crmList = allMembers.stream().map(m -> new UserCrmDTO(
                m.getId(),           // userId
                m.getName(),         // name
                m.getLoginId(),      // loginId
                m.getPersonalColor() != null ? m.getPersonalColor() : "미진단", // personalColor
                m.getStyleDna() != null ? m.getStyleDna() : "미진단",               // styleDna
                0, // buyCount (이후에 실제값 계산해서 넣으세요)
                0, // fittingCount
                0  // postCount
        )).collect(Collectors.toList());

        // 1. 기본 회원/상품 정보
        model.addAttribute("members", crmList);
        model.addAttribute("totalMembers", allMembers.size());
        model.addAttribute("totalDiagnosed", allMembers.stream()
                .filter(m -> m.getPersonalColor() != null && !m.getPersonalColor().equals("미진단"))
                .count());
        model.addAttribute("recentMembers", allMembers.stream()
                .sorted((m1, m2) -> Long.compare(m2.getId(), m1.getId()))
                .limit(5).collect(Collectors.toList()));
        model.addAttribute("products", products);
        model.addAttribute("totalProducts", products.size());

        // 2. 관리자 메모
        try {
            File memoFile = new File(MEMO_FILE_PATH);
            if (memoFile.exists()) model.addAttribute("adminMemo", java.nio.file.Files.readString(memoFile.toPath()));
        } catch (IOException e) { e.printStackTrace(); }

        // 2. 매출 및 통계 계산
        try {
            List<Order> allOrders = orderRepository.findAll();
            List<Order> validOrders = allOrders.stream()
                    .filter(o -> o.getStatus() != null && !"주문취소".equals(o.getStatus()))
                    .collect(Collectors.toList());

            LocalDateTime now = LocalDateTime.now();
            LocalDateTime startOfToday = now.toLocalDate().atStartOfDay();
            LocalDateTime targetStartDate;

            switch (period.toUpperCase()) {
                case "TODAY": targetStartDate = startOfToday; break;
                case "WEEK": targetStartDate = now.minusDays(7).toLocalDate().atStartOfDay(); break;
                case "YEAR": targetStartDate = now.withDayOfYear(1).toLocalDate().atStartOfDay(); break;
                case "MONTH":
                default: targetStartDate = now.withDayOfMonth(1).toLocalDate().atStartOfDay(); break;
            }

            long todaySalesSum = 0L;
            long periodSalesSum = 0L;
            long periodOrderCount = 0L;
            long curationBuyCount = 0L;

            Map<String, Long> colorSalesMap = new HashMap<>();
            colorSalesMap.put("SPRING_WARM", 0L);
            colorSalesMap.put("SUMMER_COOL", 0L);
            colorSalesMap.put("AUTUMN_WARM", 0L);
            colorSalesMap.put("WINTER_COOL", 0L);

            List<Order> periodFilteredOrders = new ArrayList<>();

            for (Order order : validOrders) {
                long amount = order.getTotalAmount() != null ? order.getTotalAmount() : 0L;
                if (order.getMember() != null && order.getCreatedAt() != null) {
                    if (order.getCreatedAt().isAfter(startOfToday)) todaySalesSum += amount;
                    if (order.getCreatedAt().isAfter(targetStartDate)) {
                        periodSalesSum += amount;
                        periodOrderCount++;
                        periodFilteredOrders.add(order);

                        String memberColor = order.getMember().getPersonalColor();
                        if (memberColor != null && colorSalesMap.containsKey(memberColor)) {
                            colorSalesMap.put(memberColor, colorSalesMap.get(memberColor) + amount);
                        }

                        if (order.getMember().getPersonalColor() != null
                                && !order.getMember().getPersonalColor().equals("미진단")) {
                            curationBuyCount++;
                        }
                    }
                }
            }

            // 3. KPI 카드 데이터 설정 (동적 기간 타이틀)
            String periodName, periodUnit;
            switch (period.toUpperCase()) {
                case "TODAY": periodName = "오늘 결제 금액"; periodUnit = "금일 총 결제액"; break;
                case "WEEK": periodName = "최근 7일 매출"; periodUnit = "최근 7일간 결제액"; break;
                case "YEAR": periodName = "올해 누적 매출"; periodUnit = "올해 총 결제액"; break;
                default: periodName = "이번 달 누적 매출"; periodUnit = "이번 달 취소 건 제외액"; break;
            }
            model.addAttribute("periodName", periodName);
            model.addAttribute("periodUnit", periodUnit);
            model.addAttribute("periodSales", periodSalesSum);
            model.addAttribute("todaySales", todaySalesSum);
            model.addAttribute("avgOrderValue", periodOrderCount == 0 ? 0L : periodSalesSum / periodOrderCount);
            model.addAttribute("curationConversion", periodOrderCount == 0 ? 0.0 : Math.round(((double) curationBuyCount / periodOrderCount) * 1000) / 10.0);

            // 4. 차트 데이터 설정
            Map<String, Long> chartData = new LinkedHashMap<>();
            if ("TODAY".equals(period.toUpperCase())) {
                for (int i = 0; i <= 21; i += 3) {
                    int s = i; int e = i + 3;
                    long sum = validOrders.stream().filter(o -> o.getCreatedAt() != null && o.getCreatedAt().toLocalDate().equals(now.toLocalDate()) && o.getCreatedAt().getHour() >= s && o.getCreatedAt().getHour() < e).mapToLong(o -> o.getTotalAmount() != null ? o.getTotalAmount() : 0L).sum();
                    chartData.put(i + ":00", sum);
                }
            } else if ("WEEK".equals(period.toUpperCase())) {
                for (int i = 6; i >= 0; i--) {
                    LocalDateTime day = now.minusDays(i);
                    long sum = validOrders.stream().filter(o -> o.getCreatedAt() != null && o.getCreatedAt().toLocalDate().equals(day.toLocalDate())).mapToLong(o -> o.getTotalAmount() != null ? o.getTotalAmount() : 0L).sum();
                    chartData.put(day.format(DateTimeFormatter.ofPattern("MM/dd")), sum);
                }
            } else if ("YEAR".equals(period.toUpperCase())) {
                for (int i = 1; i <= 12; i++) {
                    int m = i;
                    long sum = validOrders.stream().filter(o -> o.getCreatedAt() != null && o.getCreatedAt().getYear() == now.getYear() && o.getCreatedAt().getMonthValue() == m).mapToLong(o -> o.getTotalAmount() != null ? o.getTotalAmount() : 0L).sum();
                    chartData.put(i + "월", sum);
                }
            } else {
                for (int i = 1; i <= 4; i++) chartData.put(i + "주차", 0L);
                for (Order o : periodFilteredOrders) {
                    int week = Math.min((o.getCreatedAt().getDayOfMonth() - 1) / 7 + 1, 4);
                    String key = week + "주차";
                    chartData.put(key, chartData.get(key) + (o.getTotalAmount() != null ? o.getTotalAmount() : 0L));
                }
            }
            model.addAttribute("chartLabels", new ArrayList<>(chartData.keySet()));
            model.addAttribute("chartValues", new ArrayList<>(chartData.values()));

            // --- (기존 로직 하단에 이어서) ---

            // 1. 큐레이션 속성별 매출 비중 (colorSalesMap 사용)
            long sumForRate = colorSalesMap.values().stream().mapToLong(Long::longValue).sum();
            if (sumForRate > 0) {
                model.addAttribute("springSalesRate", (colorSalesMap.getOrDefault("SPRING_WARM", 0L) * 100) / sumForRate);
                model.addAttribute("summerSalesRate", (colorSalesMap.getOrDefault("SUMMER_COOL", 0L) * 100) / sumForRate);
                model.addAttribute("autumnSalesRate", (colorSalesMap.getOrDefault("AUTUMN_WARM", 0L) * 100) / sumForRate);
                model.addAttribute("winterSalesRate", (colorSalesMap.getOrDefault("WINTER_COOL", 0L) * 100) / sumForRate);
            } else {
                model.addAttribute("springSalesRate", 0);
                model.addAttribute("summerSalesRate", 0);
                model.addAttribute("autumnSalesRate", 0);
                model.addAttribute("winterSalesRate", 0);
            }

            // 2. 판매 실적 우수 상품 TOP 5 (periodFilteredOrders 사용)
            Map<Product, Integer> productSalesMap = periodFilteredOrders.stream()
                    .filter(o -> o.getOrderItems() != null)
                    .flatMap(o -> o.getOrderItems().stream())
                    .collect(Collectors.groupingBy(OrderItem::getProduct, Collectors.summingInt(OrderItem::getQuantity)));

            List<TopProductResponse> topProducts = productSalesMap.entrySet().stream()
                    .sorted((e1, e2) -> Integer.compare(e2.getValue(), e1.getValue()))
                    .limit(5)
                    .map(entry -> new TopProductResponse(
                            entry.getKey().getName(),
                            entry.getKey().getCategory() != null ? entry.getKey().getCategory() : "CLOTHES",
                            entry.getValue(),
                            (int) (entry.getValue() * entry.getKey().getPrice())
                    ))
                    .collect(Collectors.toList());
            model.addAttribute("topProducts", topProducts);

            // 3. 최근 주문 내역 (recentOrders)
            List<RecentOrderResponse> uiRecentOrders = validOrders.stream()
                    .sorted((o1, o2) -> o2.getCreatedAt().compareTo(o1.getCreatedAt()))
                    .limit(5)
                    .map(o -> new RecentOrderResponse(
                            o.getOrderId() != null ? o.getOrderId() : "ONFIT-" + o.getId(),
                            o.getMember() != null ? o.getMember().getName() : "비회원",
                            o.getMember() != null ? o.getMember().getLoginId() : "guest",
                            o.getMember() != null ? o.getMember().getPersonalColor() : "미진단",
                            (o.getOrderItems() != null && !o.getOrderItems().isEmpty()) ? o.getOrderItems().get(0).getProduct().getName() : "상품정보 없음",
                            o.getTotalAmount() != null ? o.getTotalAmount() : 0L,
                            o.getStatus() != null ? o.getStatus() : "결제완료"
                    )).collect(Collectors.toList());
            model.addAttribute("recentOrders", uiRecentOrders);
            // 5. 기타 정보 (CRM, 인기상품 등) ... (기존과 동일)
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }

    }

    // ═════════════════════════════════════════════════════════════════════
    // 📦 [기존 도메인 기능 유지 영역] 하단 코드는 기존 로직과 100% 동일합니다.
    // ═════════════════════════════════════════════════════════════════════

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

        Product target = productRepository.findById(productId).orElse(null);
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
        if (member == null) return "redirect:/admin";

        List<String> masters = Arrays.asList("kdoryul", "ad1", "ad2");
        if (masters.contains(member.getLoginId())) return "redirect:/admin";

        activityRepository.deleteByMember(member);
        fittingHistoryRepository.deleteByMember(member);
        postRepository.deleteByMember(member);
        orderRepository.deleteByMember(member);
        couponRepository.deleteByMember(member);
        memberRepository.delete(member);

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

    @PostMapping("/best/save")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveBestPick(
            @RequestParam("color") String color,
            @RequestParam("slot") int slot,
            @RequestParam("productId") Long productId,
            HttpSession session) {

        if (!isAdmin(session)) {
            return ResponseEntity.status(403).body(Map.of("result", "error", "message", "권한 없음"));
        }

        String slotKey = color.toUpperCase() + "_BEST_" + slot;

        Product target = productRepository.findById(productId).orElse(null);
        if (target == null) {
            return ResponseEntity.badRequest().body(Map.of("result", "error", "message", "상품을 찾을 수 없습니다."));
        }

        // 기존에 같은 슬롯키가 있으면 먼저 초기화
        productRepository.findAll().stream()
                .filter(p -> slotKey.equals(p.getIsfeared()))
                .forEach(p -> { p.setIsfeared(null); productRepository.save(p); });

        target.setIsfeared(slotKey);
        productRepository.save(target);

        return ResponseEntity.ok(Map.of(
                "result", "success",
                "message", color + " 추천 상품 저장 완료"
        ));
    }


    @Getter
    @AllArgsConstructor
    public static class TopProductResponse {
        private String name;
        private String category;
        private int salesCount;
        private int totalRevenue;
    }

    @Getter
    @AllArgsConstructor
    public static class RecentOrderResponse {
        private String orderId;
        private String customerName;
        private String loginId;
        private String personalColor;
        private String productSummary;
        private long totalPrice;
        private String status;
    }
}