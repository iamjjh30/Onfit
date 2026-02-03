package com.example.onfit.service;

import com.example.onfit.entity.BodyMeasurement;
import com.example.onfit.repository.BodyMeasurementRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
public class FittingService {

    @Autowired
    private BodyMeasurementRepository repository; // 리포지토리 주입

    // [통합 메서드] 사진 분석 후 DB 저장까지 한 번에 수행
    public String analyzeAndSave(MultipartFile photo, double height) throws IOException {
        String pythonUrl = "http://localhost:8000/analyze";

        // 1. Python 서버로 사진 전송
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("photo", photo.getResource());

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.postForEntity(pythonUrl, requestEntity, String.class);

        // 2. JSON 파싱
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> result = mapper.readValue(response.getBody(), Map.class);
        List<Map<String, Object>> landmarkList = (List<Map<String, Object>>) result.get("landmarks");

        // 3. 사람 인식 실패 시 예외 처리
        if (landmarkList == null || landmarkList.isEmpty()) {
            return "AI가 사진에서 사람을 인식하지 못했습니다.";
        }

        // 4. 어깨 너비 계산 (기존 메서드 호출)
        double shoulderWidth = calculateShoulderWidth(landmarkList, height);

        // 5. [추가] DB에 저장 (Entity 생성)
        BodyMeasurement measurement = new BodyMeasurement();
        measurement.setHeight(height);
        measurement.setShoulderWidth(shoulderWidth);

        repository.save(measurement); // DB 저장 실행

        return String.format("%.2f", shoulderWidth);
    }

    // 어깨 너비 계산 로직 (수정 불필요)
    private double calculateShoulderWidth(List<Map<String, Object>> landmarks, double userHeight) {
        Map<String, Object> leftS = landmarks.get(11);
        Map<String, Object> rightS = landmarks.get(12);
        Map<String, Object> leftH = landmarks.get(23);
        Map<String, Object> rightH = landmarks.get(24);

        double pixelShoulderWidth = Math.sqrt(
                Math.pow((double)rightS.get("x") - (double)leftS.get("x"), 2) +
                        Math.pow((double)rightS.get("y") - (double)leftS.get("y"), 2)
        );

        double shoulderMidY = ((double)leftS.get("y") + (double)rightS.get("y")) / 2;
        double hipMidY = ((double)leftH.get("y") + (double)rightH.get("y")) / 2;
        double torsoHeightRatio = Math.abs(hipMidY - shoulderMidY);

        double torsoActualCm = userHeight * 0.28;
        double cmPerRatio = torsoActualCm / torsoHeightRatio;

        double calculatedWidth = pixelShoulderWidth * cmPerRatio;
        double calibratedWidth = calculatedWidth * 0.95;

        return calibratedWidth;
    }
}