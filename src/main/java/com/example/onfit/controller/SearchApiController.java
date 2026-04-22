package com.example.onfit.controller;

import com.example.onfit.dto.response.SearchResponseDTO;
import com.example.onfit.service.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
public class SearchApiController {

    @Autowired
    private SearchService searchService;

    @GetMapping("/live")
    public ResponseEntity<SearchResponseDTO> liveSearch(@RequestParam String keyword) {
        return ResponseEntity.ok(searchService.getSearchContent(keyword));
    }
}