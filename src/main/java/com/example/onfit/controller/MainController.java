package com.example.onfit.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MainController {
    @GetMapping("/") public String mainPage() { return "main"; }
    @GetMapping("/login") public String loginPage() { return "login"; }
    @GetMapping("/signIn") public String signInPage() { return "signin"; }
    @GetMapping("/find") public String findPage() { return "find"; }
    @GetMapping("/diagnosis") public String diagnosisPage() { return "diagnosis"; }
    @GetMapping("/virtualFitting") public String virtualFittingPage() { return "virtualFitting"; }
    @GetMapping("/store") public String storePage() { return "store"; }
    @GetMapping("/itemDetail") public String itemDetailPage() { return "itemDetail"; }
}
