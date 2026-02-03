package com.example.onfit;

import org.springframework.ai.model.google.genai.autoconfigure.chat.GoogleGenAiChatAutoConfiguration;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(exclude = {GoogleGenAiChatAutoConfiguration.class, SecurityAutoConfiguration.class})
@EnableJpaRepositories(basePackages = "com.example.onfit.repository") // 리포지토리 위치 지정
@EntityScan(basePackages = "com.example.onfit.entity")
public class OnfitApplication {

    public static void main(String[] args) {
        SpringApplication.run(OnfitApplication.class, args);
    }

}
