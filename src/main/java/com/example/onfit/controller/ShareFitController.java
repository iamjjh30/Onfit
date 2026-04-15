package com.example.onfit.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ShareFitController {

    @GetMapping("/ShareFitEditor") // 👈 이 주소가 정확히 등록되어야 합니다.
    public String shareFitEditorPage() {
        return "ShareFitEditor"; // 👈 templates 폴더 안에 ShareFitEditor.html 파일이 있어야 함
    }
}
