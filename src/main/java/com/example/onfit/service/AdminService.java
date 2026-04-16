package com.example.onfit.service;

import com.example.onfit.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final AdminRepository adminRepository;

    // 여기에 로그인이나 관리자 조회 로직 추가할 거임
}