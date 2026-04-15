package com.example.onfit.repository;

import com.example.onfit.entity.SavedColor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SavedColorRepository extends JpaRepository<SavedColor, Long> {
}