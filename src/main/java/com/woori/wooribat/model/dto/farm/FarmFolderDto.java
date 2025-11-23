package com.woori.wooribat.model.dto.farm;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class FarmFolderDto {
	private Integer id;
	private String userId;
	private String name;
	private String description;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	private String delYn;
	private Integer farmCount; // 폴더에 속한 농지 개수
}
