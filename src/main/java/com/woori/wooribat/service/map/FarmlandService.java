package com.woori.wooribat.service.map;

import java.util.List;

import com.woori.wooribat.model.dto.map.FarmlandDto;

public interface FarmlandService {

	FarmlandDto getFarmlandByPoint(double x, double y);

	List<FarmlandDto> getFarmlandByBbox(double minX, double minY, double maxX, double maxY);
}
