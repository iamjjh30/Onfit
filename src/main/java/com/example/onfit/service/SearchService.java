package com.example.onfit.service;

import com.example.onfit.dto.response.SearchResponseDTO;
import com.example.onfit.entity.Product;
import com.example.onfit.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final ProductRepository productRepository;

    // 메뉴와 연관 키워드 매핑 (결제, 배송 등 키워드 포함)
    private final List<SearchResponseDTO.MenuDTO> allMenus = Arrays.asList(
            createMenu("로그인", "/login", "login, 접속, 계정"),
            createMenu("회원가입", "/join", "signup, 계정생성, 가입"),
            createMenu("마이페이지", "/mypalette", "내정보, 프로필, 팔레트"),
            createMenu("스토어", "/store", "쇼핑, 옷, 구매, 상품"),
            createMenu("장바구니", "/Cart", "결제, 구매, 쇼핑백, 장바구니"),
            createMenu("주문내역", "/OrderInfo", "결제, 배송, 구매확인"),
            createMenu("AI진단", "/AIStyler", "퍼스널컬러, 스타일링, 진단, 분석"),
            createMenu("커뮤니티", "/Community", "게시판, 소통, 질문, 자랑")
    );

    public SearchResponseDTO getSearchContent(String keyword) {
        SearchResponseDTO response = new SearchResponseDTO();

        if (keyword == null || keyword.trim().isEmpty()) {
            response.setMenus(new ArrayList<>());
            response.setProducts(new ArrayList<>());
            return response;
        }

        // 1. 메뉴 검색 (이름 또는 키워드 포함 시)
        response.setMenus(allMenus.stream()
                .filter(m -> m.getName().contains(keyword) ||
                        (m.getKeywords() != null && m.getKeywords().contains(keyword)))
                .collect(Collectors.toList()));

        // 2. 상품 검색 (DB 연동 + LIKE 검색)
        List<Product> products = productRepository.findByNameContainingIgnoreCase(keyword);

        response.setProducts(products.stream().map(p -> {
            SearchResponseDTO.ProductDTO dto = new SearchResponseDTO.ProductDTO();
            dto.setId(p.getId());
            dto.setName(p.getName());
            // DB 가격이 int일 경우 String.valueOf 사용 (DTO가 String일 경우 대비)
            dto.setPrice(p.getPrice());
            dto.setImgPath(p.getImageUrl());
            return dto;
        }).limit(3).collect(Collectors.toList()));

        return response;
    }

    private SearchResponseDTO.MenuDTO createMenu(String name, String url, String keywords) {
        SearchResponseDTO.MenuDTO m = new SearchResponseDTO.MenuDTO();
        m.setName(name);
        m.setUrl(url);
        m.setKeywords(keywords);
        return m;
    }
}