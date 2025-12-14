package com.woori.wooribat.service.farm;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.woori.wooribat.mapper.farm.FarmMapper;
import com.woori.wooribat.model.dto.farm.FarmDto;
import com.woori.wooribat.model.dto.farm.FarmFolderDto;

@Service
@Transactional
public class FarmServiceImpl implements FarmService {

	@Autowired
	private FarmMapper farmMapper;

	// 폴더 관련
	@Override
	@Transactional(readOnly = true)
	public List<FarmFolderDto> getFarmFolders(String userId) {
		return farmMapper.getFarmFolders(userId);
	}

	@Override
	@Transactional(readOnly = true)
	public FarmFolderDto getFarmFolderById(Integer id) {
		return farmMapper.getFarmFolderById(id);
	}

	@Override
	public int createFarmFolder(FarmFolderDto farmFolderDto) {
		return farmMapper.insertFarmFolder(farmFolderDto);
	}

	@Override
	public int updateFarmFolder(FarmFolderDto farmFolderDto) {
		return farmMapper.updateFarmFolder(farmFolderDto);
	}

	@Override
	public int deleteFarmFolder(Integer id) {
		return farmMapper.deleteFarmFolder(id);
	}

	// 농지 관련
	@Override
	@Transactional(readOnly = true)
	public List<FarmDto> getFarmsByUserId(String userId) {
		return farmMapper.getFarmsByUserId(userId);
	}

	@Override
	@Transactional(readOnly = true)
	public List<FarmDto> getFarmsByFolderId(Integer folderId) {
		return farmMapper.getFarmsByFolderId(folderId);
	}

	@Override
	@Transactional(readOnly = true)
	public FarmDto getFarmById(Integer id) {
		return farmMapper.getFarmById(id);
	}

	@Override
	public int createFarm(FarmDto farmDto) {
		return farmMapper.insertFarm(farmDto);
	}

	@Override
	public int createDrawnFarm(FarmDto farmDto) {
		return farmMapper.insertDrawnFarm(farmDto);
	}

	@Override
	public int updateFarm(FarmDto farmDto) {
		return farmMapper.updateFarm(farmDto);
	}

	@Override
	public int deleteFarm(Integer id) {
		return farmMapper.deleteFarm(id);
	}
}
