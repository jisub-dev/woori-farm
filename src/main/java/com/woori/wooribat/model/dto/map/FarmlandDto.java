package com.woori.wooribat.model.dto.map;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class FarmlandDto {
	private Integer id;
	private String pnu;
	private String landCd;          // 지목 코드
	private String landCdNm;        // 지목명
	private String stdgCd;          // 표준 코드
	private String stdgAddr;        // 표준 주소
	private Double flAr;            // 면적
	private String cadConCn;        // 지적 내용
	private LocalDate flightYmd;    // 촬영일
	private LocalDateTime updtYmd;  // 갱신일
	private String srcSys;          // 소스 시스템
	private String geomGeoJson;     // GeoJSON 형태의 geometry
}
