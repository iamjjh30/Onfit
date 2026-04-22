package com.example.onfit.repository;

import com.example.onfit.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // 이름에 키워드가 포함된 상품 검색 (대소문자 무시, LIKE %keyword% 자동 생성)
    List<Product> findByNameContainingIgnoreCase(String name);

    // ── BEST PICKS: 퍼스널컬러(is_feared)별 인기순 4개 ──
    List<Product> findTop4ByIsfearedOrderByViewCountDesc(String isfeared);

    // ── OUTFIT: outfit 컬럼 prefix(퍼스널컬러)로 6개 (3세트 × 상·하의) ──
    List<Product> findTop6ByOutfitStartingWithOrderByIdAsc(String outfitPrefix);

    // 기존 메서드들 (다른 곳에서 사용 중이면 유지)
    List<Product> findAll();

    Optional<Product> findByOutfit(String outfit);

    // outfit 컬럼을 직접 업데이트 (특정 상품의 outfit 슬롯 지정)
    @Modifying
    @Transactional
    @Query("UPDATE Product p SET p.outfit = :outfit WHERE p.id = :id")
    void updateOutfit(@Param("id") Long id, @Param("outfit") String outfit);

    // 특정 outfit 값을 가진 상품의 outfit을 null로 초기화 (슬롯 비우기)
    @Modifying
    @Transactional
    @Query("UPDATE Product p SET p.outfit = NULL WHERE p.outfit = :outfit")
    void clearOutfitSlot(@Param("outfit") String outfit);
}