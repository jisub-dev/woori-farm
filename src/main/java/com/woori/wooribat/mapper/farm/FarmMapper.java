package com.woori.wooribat.mapper.farm;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.woori.wooribat.model.dto.farm.FarmDto;
import com.woori.wooribat.model.dto.farm.FarmFolderDto;

@Mapper
public interface FarmMapper {

	// Farm Folder CRUD
	List<FarmFolderDto> getFarmFolders(@Param("userId") Integer userId);
	FarmFolderDto getFarmFolderById(@Param("id") Integer id);
	int insertFarmFolder(FarmFolderDto farmFolderDto);
	int updateFarmFolder(FarmFolderDto farmFolderDto);
	int deleteFarmFolder(@Param("id") Integer id);

	// Farm CRUD
	List<FarmDto> getFarmsByUserId(@Param("userId") Integer userId);
	List<FarmDto> getFarmsByFolderId(@Param("folderId") Integer folderId);
	FarmDto getFarmById(@Param("id") Integer id);
	int insertFarm(FarmDto farmDto);
	int updateFarm(FarmDto farmDto);
	int deleteFarm(@Param("id") Integer id);
}
