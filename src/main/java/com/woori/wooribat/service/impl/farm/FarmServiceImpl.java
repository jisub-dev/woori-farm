package com.woori.wooribat.service.impl.farm;

import org.springframework.beans.factory.annotation.Autowired;

import com.woori.wooribat.mapper.farm.FarmMapper;
import com.woori.wooribat.model.dto.farm.FarmFolderDto;
import com.woori.wooribat.model.dto.user.UserDto;
import com.woori.wooribat.service.farm.FarmService;

public class FarmServiceImpl implements FarmService{
	
	@Autowired
	private FarmMapper farmMapper;
	
	/**
	 * 농지 폴더 리스트
	 */
	public FarmFolderDto getFarmFolder(Integer userId) {
		return farmMapper.getFarmFolder(userId);
	}
	
	/**
	 * 농지 폴더 등록
	 */
	public void insertFarmFolder(FarmFolderDto farmFolderDto) {
		return farmMapper.insertFarmFolder(farmFolderDto);
	}
	
	/**
	 * 농지 폴더 수정
	 */
	public void updateFarmFolder(FarmFolderDto farmFolderDto) {
		return farmMapper.updateFarmFolder(farmFolderDto);
	}
	
	/**
	 * 농지 폴더 삭제
	 */
	public void deleteFarmFolder(Integer farmId) {
		return farmMapper.deleteFarmFolder(farmId);
	}
	
	/**
	 * 농지 리스트 
	 */
	public FarmDto getFarmList(Integer folderId) {
		return farmMapper.getFarmList(folderId);
	}
	
	/**
	 * 농지 등록
	 */
	public void insertFarm(FarmDto farmDto) {
		return farmMapper.insertFarm(farmDto);
	}
	
	/**
	 * 농지 수정
	 */
	public void updateFarm(FarmDto farmDto) {
		return farmMapper.updateFarm(farmDto);
	}
	
	/**
	 * 농지 삭제
	 */
	public void deleteFarm(Integer farmId) {
		return farmMapper.deleteFarm(farmId);
	}
}
