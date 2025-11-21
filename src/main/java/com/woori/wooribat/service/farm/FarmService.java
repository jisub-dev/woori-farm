package com.woori.wooribat.service.farm;

import java.util.List;

import com.woori.wooribat.model.dto.farm.FarmDto;
import com.woori.wooribat.model.dto.farm.FarmFolderDto;

public interface FarmService {

	// Farm Folder CRUD
	List<FarmFolderDto> getFarmFolders(String userId);
	FarmFolderDto getFarmFolderById(Integer id);
	int createFarmFolder(FarmFolderDto farmFolderDto);
	int updateFarmFolder(FarmFolderDto farmFolderDto);
	int deleteFarmFolder(Integer id);

	// Farm CRUD
	List<FarmDto> getFarmsByUserId(String userId);
	List<FarmDto> getFarmsByFolderId(Integer folderId);
	FarmDto getFarmById(Integer id);
	int createFarm(FarmDto farmDto);
	int updateFarm(FarmDto farmDto);
	int deleteFarm(Integer id);
}
