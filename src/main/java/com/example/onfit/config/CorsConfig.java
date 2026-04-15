package com.example.onfit.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                // 프론트 파일을 브라우저에서 직접 열 경우 (file://)
                .allowedOriginPatterns("*")
                // 로컬 개발 서버가 있다면 명시 추가 (예: Live Server 포트)
                // .allowedOrigins("http://localhost:5500", "http://127.0.0.1:5500")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false)
                .maxAge(3600);
    }
}
