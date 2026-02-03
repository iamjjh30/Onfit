package com.example.onfit.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import java.time.Duration;

@Configuration // 스프링에게 설정 파일임을 알려줍니다.
public class RestTemplateConfig {

    @Bean // 스프링이 관리하는 객체(Bean)로 등록합니다.
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                // Python AI 서버의 응답 시간을 고려해 타임아웃을 넉넉히 잡습니다.
                .setConnectTimeout(Duration.ofSeconds(5))
                .setReadTimeout(Duration.ofSeconds(60))
                .build();
    }
}