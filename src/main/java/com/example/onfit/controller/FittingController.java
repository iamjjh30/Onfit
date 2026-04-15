package com.example.onfit.controller;

import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.ByteArrayResource;

import java.io.IOException;

@RestController
@RequestMapping("/api/fitting")
public class FittingController {

    private static final String AI_SERVER_URL = "http://localhost:5000/try-on";

    // 리턴 타입을 ResponseEntity<?> (와일드카드)로 변경해야
    // 성공 시엔 이미지(byte[]), 실패 시엔 에러 메시지(String/JSON)를 모두 보낼 수 있습니다.
    @PostMapping("/try-on")
    public ResponseEntity<?> tryOnClothes(
            @RequestParam("userImage") MultipartFile userImage,
            @RequestParam("clothImage") MultipartFile clothImage) {

        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            ByteArrayResource userResource = new ByteArrayResource(userImage.getBytes()) {
                @Override public String getFilename() { return userImage.getOriginalFilename(); }
            };
            ByteArrayResource clothResource = new ByteArrayResource(clothImage.getBytes()) {
                @Override public String getFilename() { return clothImage.getOriginalFilename(); }
            };

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("user_image", userResource);
            body.add("cloth_image", clothResource);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            // 정상 호출 시도
            ResponseEntity<byte[]> response = restTemplate.postForEntity(AI_SERVER_URL, requestEntity, byte[].class);

            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(response.getBody());

        } catch (HttpClientErrorException e) {
            // ★ 핵심: Python이 보낸 400 에러 메시지("사람을 찾을 수 없습니다")를 그대로 꺼냄
            String errorJson = e.getResponseBodyAsString();
            System.err.println("Python Server Error: " + errorJson);

            // 프론트엔드에 400 상태코드와 에러 메시지 전달
            return ResponseEntity.status(e.getStatusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(errorJson);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("{\"error\": \"Server Error\"}");
        }
    }

}