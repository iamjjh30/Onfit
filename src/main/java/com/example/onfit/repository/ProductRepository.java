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
    List<Product> findByNameContainingIgnoreCase(String name);

    List<Product> findTop4ByIsfearedOrderByViewCountDesc(String isfeared);

    List<Product> findTop6ByOutfitStartingWithOrderByIdAsc(String outfitPrefix);

    Optional<Product> findByOutfit(String outfit);

    // ✅ nativeQuery로 변경 - _ 와일드카드 문제 완전 해결
    @Query(value = "SELECT * FROM products WHERE outfit LIKE CONCAT(:prefix, '_%') ORDER BY id ASC", nativeQuery = true)
    List<Product> findOutfitsByPrefix(@Param("prefix") String prefix);

    @Modifying
    @Transactional
    @Query("UPDATE Product p SET p.outfit = :outfit WHERE p.id = :id")
    void updateOutfit(@Param("id") Long id, @Param("outfit") String outfit);

    @Modifying
    @Transactional
    @Query("UPDATE Product p SET p.outfit = NULL WHERE p.outfit = :outfit")
    void clearOutfitSlot(@Param("outfit") String outfit);
}