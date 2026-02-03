package com.example.onfit.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Getter @Setter
@Table(name = "body_measurements") // 테이블 이름을 지정합니다.
public class BodyMeasurement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // 기본키 (자동 증가)

    @Column(nullable = false)
    private Double height; // 키

    @Column(name = "shoulder_width")
    private Double shoulderWidth; // 어깨 너비

    private LocalDateTime measuredAt; // 측정 시간

    // 저장 전 자동으로 현재 시간을 넣습니다.
    @PrePersist
    public void prePersist() {
        this.measuredAt = LocalDateTime.now();
    }
}