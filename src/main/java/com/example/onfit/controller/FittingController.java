package com.example.onfit.controller;

import com.example.onfit.service.FittingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/fitting")
@CrossOrigin(origins = "*") // 프론트엔드와의 통신을 위해 허용
public class FittingController {

    @Autowired
    private FittingService fittingService;

    /**
     * 사용자의 상체 사진을 받아 AI 좌표를 분석합니다.
     * [POST] http://localhost:8080/api/fitting/analyze
     */
    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeFitting(
            @RequestParam("photo") MultipartFile photo,
            @RequestParam("height") double height) {
        try {
            if (photo.isEmpty()) return ResponseEntity.badRequest().body("사진이 없습니다.");

            // [수정] analyzePhoto 대신 analyzeAndSave를 호출합니다!
            String analysisResult = fittingService.analyzeAndSave(photo, height);

            return ResponseEntity.ok(analysisResult);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("오류: " + e.getMessage());
        }
    }
}