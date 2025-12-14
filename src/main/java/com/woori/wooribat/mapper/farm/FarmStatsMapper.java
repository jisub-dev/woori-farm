package com.woori.wooribat.mapper.farm;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.woori.wooribat.model.dto.farm.FolderStatsDto;
import com.woori.wooribat.model.dto.farm.FolderStatusStatsDto;
import com.woori.wooribat.model.dto.farm.TotalStatsDto;


@Mapper
public interface FarmStatsMapper {

    List<FolderStatsDto> selectFolderStats(@Param("userId") String userId);

    TotalStatsDto selectTotalStats(@Param("userId") String userId);

    List<FolderStatusStatsDto> selectFolderStatusStats(
            @Param("userId") String userId,
            @Param("folderId") Integer folderId   
    );
}

