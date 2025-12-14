package com.woori.wooribat.controller.farm;

import java.util.Map;

import javax.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.woori.wooribat.service.farm.FarmStatsService;

import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/api/farm/stats")
@RequiredArgsConstructor
public class FarmStatsController {

    private final FarmStatsService farmStatsService;

    @GetMapping("/folders")
    @ResponseBody
    public ResponseEntity<?> getFolderStats(HttpSession session) {
        String userId = (String) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.ok(Map.of("success", false, "message", "로그인이 필요합니다."));
        }

        Map<String, Object> data = farmStatsService.getFolderStats(userId);
        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }

    @GetMapping("/folder/{folderId}/status")
    public ResponseEntity<?> getFolderStatusStats(
            @PathVariable("folderId") Integer folderId,
            HttpSession session
    ) {
        String userId = (String) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.ok(Map.of("success", false, "message", "로그인이 필요합니다."));
        }

        Integer folderIdParam = (folderId != null && folderId == 0) ? null : folderId;

        Map<String, Object> data = farmStatsService.getFolderStatusStats(userId, folderIdParam);
        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }
}

