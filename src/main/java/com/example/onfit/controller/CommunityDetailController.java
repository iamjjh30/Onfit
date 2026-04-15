package com.example.onfit.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class CommunityDetailController {
    @GetMapping("/Community/detail")
    public String communityDetailPage() {
        return "communityDetail";
    }
}
