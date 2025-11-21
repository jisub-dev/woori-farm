package com.woori.wooribat.model.dto.farm;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class FarmDto {
	private Integer id;
	private String userId;
	private Integer folderId;
	private String name;
	private String pnu;
	private String address;
	private String centerPoint; // PostGIS geometry를 WKT 문자열로 처리
	private BigDecimal area;
	private String currentStatus;
	private String memo;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	private String delYn;
}
