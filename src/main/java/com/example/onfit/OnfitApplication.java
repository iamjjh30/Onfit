package com.example.onfit;

import org.springframework.ai.model.google.genai.autoconfigure.chat.GoogleGenAiChatAutoConfiguration;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;

@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class, GoogleGenAiChatAutoConfiguration.class, SecurityAutoConfiguration.class})
public class OnfitApplication {

    public static void main(String[] args) {
        SpringApplication.run(OnfitApplication.class, args);
    }

}
