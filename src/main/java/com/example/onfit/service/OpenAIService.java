package com.example.onfit.service;

import com.example.onfit.dto.PersonalColorResult;
import com.example.onfit.entity.OpenAIResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class OpenAIService {

    @Value("${openai.api-key}")
    private String apiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public PersonalColorResult analyzeImage(MultipartFile file) throws Exception {

        String base64Image = Base64.getEncoder().encodeToString(file.getBytes());

        String requestBody = """
        {
          "model": "gpt-4o-mini",
          "messages": [
            {
              "role": "user",
              "content": [
                {"type": "text", "text": "JSON 형식으로만 답변해줘. tone, skinFeature, bestColors(5개), worstColors(3개) 포함."},
                {
                  "type": "image_url",
                  "image_url": {
                    "url": "data:image/jpeg;base64,%s"
                  }
                }
              ]
            }
          ]
        }
        """.formatted(base64Image);

        HttpClient client = HttpClient.newHttpClient();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response =
                client.send(request, HttpResponse.BodyHandlers.ofString());

        // 1️⃣ 전체 OpenAI 응답 파싱
        OpenAIResponse openAIResponse =
                objectMapper.readValue(response.body(), OpenAIResponse.class);

        // 2️⃣ content 문자열 추출
        String contentJson =
                openAIResponse.getChoices().get(0).getMessage().getContent();

        // 3️⃣ 혹시 ```json ``` 코드블럭 제거
        contentJson = contentJson
                .replace("```json", "")
                .replace("```", "")
                .trim();

        // 4️⃣ 실제 JSON 객체로 변환
        return objectMapper.readValue(contentJson, PersonalColorResult.class);
    }
}