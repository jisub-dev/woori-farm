package com.woori.wooribat.model.dto.farm;

import lombok.Data;

@Data
public class FolderStatsDto {
 private Integer folderId;   // NULL = 미지정
 private String folderName;
 private long farmCount;
 private double totalArea;   // 제곱미터 

 private double countRatio;  // %
 private double areaRatio;   // %

}

