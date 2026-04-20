package com.example.onfit.dto.response;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter @Setter
public class SearchResponseDTO {
    // 1. 오른쪽 상품 결과 3개 (Response 데이터)
    private List<ProductDTO> products;

    // 2. 왼쪽 메뉴 버튼 결과 (Response 데이터)
    private List<MenuDTO> menus;

    @Getter @Setter
    public static class ProductDTO {
        private Long id;
        private String name;
        private int price; // DB 가격이 숫자니까 int로 맞추는 게 좋다
        private String imgPath;
    }

    @Getter @Setter
    public static class MenuDTO {
        private String name;
        private String url;
        private String keywords; // 이 필드가 있어야 '결제' 같은 키워드 검색이 된다
    }
}