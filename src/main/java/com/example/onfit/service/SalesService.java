package com.example.onfit.service;

import com.example.onfit.repository.MemberRepository;
import com.example.onfit.repository.OrderRepository;
import com.example.onfit.repository.ProductRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class SalesService {

     private final OrderRepository orderRepository;
     private final MemberRepository memberRepository;
     private final ProductRepository productRepository;

    // 생성자 주입 (레포지토리 연결 시 주석 해제)
     public SalesService(OrderRepository orderRepository, MemberRepository memberRepository, ProductRepository productRepository) {
         this.orderRepository = orderRepository;
         this.memberRepository = memberRepository;
         this.productRepository = productRepository;
     }

    /**
     * 금일 실시간 결제 금액 조회
     */
    public Long getTodaySales() {
        LocalDateTime startOfToday = LocalDateTime.now().with(LocalTime.MIN);
        LocalDateTime endOfToday = LocalDateTime.now().with(LocalTime.MAX);
        // return orderRepository.sumSalesAmountByPeriod(startOfToday, endOfToday);
        return 158000L; // 임시 더미 데이터
    }

    /**
     * 선택된 기간에 따른 누적 매출액 조회
     */
    public Long getMonthSales(String period) {
        LocalDateTime startDate = getStartDateByPeriod(period);
        LocalDateTime endDate = LocalDateTime.now();
        // return orderRepository.sumSalesAmountByPeriod(startDate, endDate);
        return 4820000L;
    }

    /**
     * 선택된 기간의 진단 후 구매 전환율 계산
     */
    public Double getConversionRate(String period) {
        LocalDateTime startDate = getStartDateByPeriod(period);
        // 예시: (진단 후 구매한 회원 수 / 전체 진단 회원 수) * 100
        // Long totalDiagnosed = memberRepository.countByDiagnosedAndPeriod(startDate);
        // Long convertedUsers = orderRepository.countConvertedUsers(startDate);
        // if (totalDiagnosed == 0) return 0.0;
        // return ((double) convertedUsers / totalDiagnosed) * 100;
        return 12.5;
    }

    /**
     * 선택된 기간의 평균 주문 객단가 (ATV)
     */
    public Long getAvgOrderValue(String period) {
        LocalDateTime startDate = getStartDateByPeriod(period);
        LocalDateTime endDate = LocalDateTime.now();
        // Long totalSales = orderRepository.sumSalesAmountByPeriod(startDate, endDate);
        // Long orderCount = orderRepository.countOrdersByPeriod(startDate, endDate);
        // if (orderCount == 0) return 0L;
        // return totalSales / orderCount;
        return 64000L;
    }

    /**
     * 퍼스널 컬러 속성별 매출 비중 (%)
     */
    public Integer getRateByColor(String personalColor, String period) {
        LocalDateTime startDate = getStartDateByPeriod(period);
        // Long totalSales = orderRepository.sumSalesAmountByPeriod(startDate, LocalDateTime.now());
        // Long colorSales = orderRepository.sumSalesAmountByColorAndPeriod(personalColor, startDate, LocalDateTime.now());
        // if (totalSales == 0) return 0;
        // return (int) ((double) colorSales / totalSales * 100);

        // 타임리프 대시보드 테스트용 더미 리턴 값
        switch (personalColor) {
            case "SPRING_WARM": return 25;
            case "SUMMER_COOL": return 40;
            case "AUTUMN_WARM": return 15;
            case "WINTER_COOL": return 20;
            default: return 0;
        }
    }

    /**
     * 판매 실적 우수 상품 TOP 5 조회
     */
    public List<Object> getTopFiveProducts(String period) {
        LocalDateTime startDate = getStartDateByPeriod(period);
        // 실제 운영 시에는 DTO나 인터페이스 프로젝션을 활용해 DB 리스트를 받아옵니다.
        // return productRepository.findTopFiveProductsBySales(startDate, PageRequest.of(0, 5));
        return new ArrayList<>(); // 현재는 빈 리스트 반환 (HTML에서 데이터 없음 분기 작동)
    }

    /**
     * 최근 주문 거래 내역 최신 10건 조회
     */
    public List<Object> getRecentOrders() {
        // return orderRepository.findTop10ByOrderByCreatedAtDesc();
        return new ArrayList<>();
    }

    /**
     * [핵심] 콤보박스 선택 값에 따라 검색 시작 일자를 연산하는 헬퍼 메서드
     */
    private LocalDateTime getStartDateByPeriod(String period) {
        LocalDateTime now = LocalDateTime.now();
        switch (period.toUpperCase()) {
            case "TODAY":
                return now.with(LocalTime.MIN); // 오늘 아침 00:00:00
            case "WEEK":
                return now.minusDays(7).with(LocalTime.MIN); // 7일 전
            case "YEAR":
                return now.withDayOfYear(1).with(LocalTime.MIN); // 올해 1월 1일
            case "MONTH":
            default:
                return now.withDayOfMonth(1).with(LocalTime.MIN); // 이번 달 1일
        }
    }
}