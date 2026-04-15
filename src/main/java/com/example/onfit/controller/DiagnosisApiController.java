package com.example.onfit.controller;

import org.springframework.web.client.HttpClientErrorException;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/diagnosis")
public class DiagnosisApiController {

    // Python 서버 주소
    private static final String AI_SERVER_URL = "http://localhost:5000/analyze";

    @PostMapping("/analyze")
    public ResponseEntity<Map<String, Object>> analyzeImage(@RequestParam("image") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }

        try {
            // 1. RestTemplate 생성 (HTTP 요청 도구)
            RestTemplate restTemplate = new RestTemplate();

            // 2. 헤더 설정 (Multipart Form Data)
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            // 3. 파일 데이터 준비 (중요: ByteArrayResource 사용 시 getFilename 오버라이드 필수)
            ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename(); // 파일명이 없으면 Python 쪽에서 에러가 날 수 있음
                }
            };

            // 4. 요청 바디 구성
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("image", fileResource);

            // 5. HTTP 엔티티 생성
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            // 6. Python 서버로 POST 요청 전송
            ResponseEntity<Map> response = restTemplate.postForEntity(AI_SERVER_URL, requestEntity, Map.class);
            // 7. Python 서버의 응답을 그대로 프론트엔드에 전달
            return ResponseEntity.ok(response.getBody());

        } catch (HttpClientErrorException.BadRequest e) {
            e.printStackTrace();

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "No face detected");
            errorResponse.put("message", "얼굴을 인식하지 못했습니다. 정면 사진을 다시 올려주세요.");

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);

        } catch (Exception e) {
            e.printStackTrace();
            // Python 서버가 꺼져있거나 에러가 났을 때
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "AI Server connection failed"));
        }

    }
}