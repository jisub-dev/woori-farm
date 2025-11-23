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
	private Long farmlandId; // farmland_master 테이블 참조
	private String userGeom; // 사용자가 직접 그린 폴리곤 (WKT 형식)
	private String sourceType; // 'MASTER' or 'USER_DRAWN'
	private String geomGeoJson; // GeoJSON 형태의 geometry
}
