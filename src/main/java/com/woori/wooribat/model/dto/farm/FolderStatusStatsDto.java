package com.woori.wooribat.model.dto.farm;

import lombok.Data;

@Data	
public class FolderStatusStatsDto {
	private Integer folderId;
    private String folderName;
    private String currentStatus; // 농지 상태 
    private long cnt;
    private double ratio;
}
