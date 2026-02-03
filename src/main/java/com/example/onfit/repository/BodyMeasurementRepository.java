package com.example.onfit.repository;

import com.example.onfit.entity.BodyMeasurement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BodyMeasurementRepository extends JpaRepository<BodyMeasurement, Long> {
}