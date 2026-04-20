package com.example.onfit.controller;

import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.ByteArrayResource;

@RestController
@RequestMapping("/api/fitting")
public class FittingController {

    private static final String AI_SERVER_URL = "http://localhost:5000/api/try-on";

    @PostMapping("/try-on")
    public ResponseEntity<?> tryOnClothes(
            @RequestParam("userImage")              MultipartFile userImage,
            @RequestParam(value = "clothImage",  required = false) MultipartFile clothImage,
            @RequestParam(value = "topImage",    required = false) MultipartFile topImage,
            @RequestParam(value = "bottomImage", required = false) MultipartFile bottomImage) {

        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

            // 사람 이미지 (필수)
            body.add("user_image", toResource(userImage));

            // 상의+하의 동시 피팅
            if (topImage != null && !topImage.isEmpty() &&
                    bottomImage != null && !bottomImage.isEmpty()) {
                body.add("top_image",    toResource(topImage));
                body.add("bottom_image", toResource(bottomImage));

                // 단일 옷 피팅 (clothImage 또는 topImage 단독)
            } else if (clothImage != null && !clothImage.isEmpty()) {
                body.add("cloth_image", toResource(clothImage));

            } else if (topImage != null && !topImage.isEmpty()) {
                body.add("cloth_image", toResource(topImage));

            } else if (bottomImage != null && !bottomImage.isEmpty()) {
                body.add("cloth_image", toResource(bottomImage));

            } else {
                return ResponseEntity.badRequest()
                        .body("{\"error\": \"옷 이미지가 필요합니다.\"}");
            }

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<byte[]> response = restTemplate.postForEntity(AI_SERVER_URL, requestEntity, byte[].class);

            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(response.getBody());

        } catch (HttpClientErrorException e) {
            String errorJson = e.getResponseBodyAsString();
            System.err.println("Python Server Error: " + errorJson);
            return ResponseEntity.status(e.getStatusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(errorJson);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"Server Error\"}");
        }
    }

    // ByteArrayResource 변환 유틸
    private ByteArrayResource toResource(MultipartFile file) throws Exception {
        byte[] bytes = file.getBytes();
        String filename = file.getOriginalFilename();
        return new ByteArrayResource(bytes) {
            @Override public String getFilename() { return filename; }
        };
    }
}