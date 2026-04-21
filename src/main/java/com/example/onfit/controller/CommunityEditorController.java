package com.example.onfit.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
@Controller
public class    CommunityEditorController {
    @GetMapping("/CommunityEditor")
    public String CommunityEditorPage() {
        return "CommunityEditor";
    }
}
