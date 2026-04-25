package com.woori.wooribat.mapper.map;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.woori.wooribat.model.dto.map.FarmlandDto;

@Mapper
public interface FarmlandMapper {

	FarmlandDto selectFarmlandByPoint(@Param("x") double x, @Param("y") double y);

	List<FarmlandDto> selectFarmlandByBbox(
		@Param("minX") double minX, @Param("minY") double minY,
		@Param("maxX") double maxX, @Param("maxY") double maxY
	);
}
