package com.example.onfit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(exclude = SecurityAutoConfiguration.class)
@EnableJpaRepositories(basePackages = "com.example.onfit.repository") // 리포지토리 위치 지정
@EntityScan(basePackages = "com.example.onfit.entity")
@MapperScan("com.example.onfit.mapper")
public class OnfitApplication {
    public static void main(String[] args) {
        SpringApplication.run(OnfitApplication.class, args);
    }

}
