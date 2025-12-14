package com.woori.wooribat.service.map;

import com.woori.wooribat.model.dto.map.FarmlandDto;

public interface FarmlandService {

	/**
	 * 클릭한 좌표에 해당하는 농지 조회
	 * @param x EPSG:3857 X 좌표
	 * @param y EPSG:3857 Y 좌표
	 * @return 농지 정보 (없으면 null)
	 */
	FarmlandDto getFarmlandByPoint(double x, double y);
}
