package com.woori.wooribat.model.dto.farm;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class FarmFolderDto {
	private Integer id;
	private Integer userId;
	private String name;
	private String description;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	private String delYn;
}
