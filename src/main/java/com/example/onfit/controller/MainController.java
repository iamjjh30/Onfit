package com.example.onfit.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MainController {
    @GetMapping("/") public String mainPage() { return "Main"; }
    @GetMapping("/login") public String loginPage() { return "login"; }
    @GetMapping("/signIn") public String signInPage() { return "signIn"; }
    @GetMapping("/find") public String findPage() { return "find"; }

}
