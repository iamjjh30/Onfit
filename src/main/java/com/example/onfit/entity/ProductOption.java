package com.example.onfit.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_options")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ProductOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "option_id")
    private Long optionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Size size;

    @Column(nullable = false)
    private Integer stock;

    public enum Size { S, M, L, XL }
}
