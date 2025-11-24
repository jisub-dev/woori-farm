package com.woori.wooribat.service.farm;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.woori.wooribat.mapper.farm.FarmStatsMapper;
import com.woori.wooribat.model.dto.farm.FolderStatsDto;
import com.woori.wooribat.model.dto.farm.FolderStatusStatsDto;
import com.woori.wooribat.model.dto.farm.TotalStatsDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FarmStatsServiceImpl implements FarmStatsService{
	private final FarmStatsMapper farmStatsMapper;

    public Map<String, Object> getFolderStats(String userId) {
        TotalStatsDto total = farmStatsMapper.selectTotalStats(userId);
        List<FolderStatsDto> list = farmStatsMapper.selectFolderStats(userId);

        double totalCount = 0;
        double totalArea = 0;

        if (total != null) {
            totalCount = (double) total.getTotalFarmCount();
            totalArea = total.getTotalArea();
        }

        for (FolderStatsDto dto : list) {
            if (dto == null) {
                continue;
            }

            if (totalCount > 0) {
                dto.setCountRatio(round(dto.getFarmCount() * 100.0 / totalCount));
            } else {
                dto.setCountRatio(0.0);
            }

            if (totalArea > 0) {
                dto.setAreaRatio(round(dto.getTotalArea() * 100.0 / totalArea));
            } else {
                dto.setAreaRatio(0.0);
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("totalFarmCount", (long) totalCount);
        result.put("totalArea", totalArea);
        result.put("folders", list);
        return result;
    }

    public Map<String, Object> getFolderStatusStats(String userId, Integer folderId) {
        List<FolderStatusStatsDto> list =
                farmStatsMapper.selectFolderStatusStats(userId, folderId);

        long totalCount = list.stream()
                .mapToLong(FolderStatusStatsDto::getCnt)
                .sum();

        for (FolderStatusStatsDto dto : list) {
            if (totalCount > 0) {
                dto.setRatio(round(dto.getCnt() * 100.0 / totalCount));
            } else {
                dto.setRatio(0.0);
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("folderId", folderId);
        result.put("folderName", list.isEmpty() ? "미지정" : list.get(0).getFolderName());
        result.put("totalFarmCount", totalCount);
        result.put("statusStats", list);
        return result;
    }

    private double round(double v) {
        return Math.round(v * 10.0) / 10.0; // 소수 1자리
    }
}

