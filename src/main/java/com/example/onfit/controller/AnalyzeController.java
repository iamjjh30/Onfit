package com.example.onfit.controller;

import com.example.onfit.dto.PersonalColorResult;
import com.example.onfit.service.OpenAIService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AnalyzeController {

    private final OpenAIService openAIService;

    @PostMapping("/analyze")
    public ResponseEntity<PersonalColorResult> analyze(
            @RequestParam("image") MultipartFile file) throws Exception {

        PersonalColorResult result =
                openAIService.analyzeImage(file);

        return ResponseEntity.ok(result);
    }
}