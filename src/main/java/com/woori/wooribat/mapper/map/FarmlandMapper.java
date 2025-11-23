package com.woori.wooribat.mapper.map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.woori.wooribat.model.dto.map.FarmlandDto;

@Mapper
public interface FarmlandMapper {

	/**
	 * 클릭한 좌표에 해당하는 농지 1개 조회 (ST_Contains)
	 * @param x EPSG:3857 X 좌표
	 * @param y EPSG:3857 Y 좌표
	 * @return 농지 정보 (없으면 null)
	 */
	FarmlandDto selectFarmlandByPoint(@Param("x") double x, @Param("y") double y);
}
