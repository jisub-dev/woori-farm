package com.woori.wooribat.service.farm;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.woori.wooribat.mapper.farm.FarmMapper;
import com.woori.wooribat.model.dto.farm.FarmFolderDto;
import com.woori.wooribat.model.dto.user.UserDto;

@Service
public interface FarmService {
	
	public FarmFolderDto getFarmList(UserDto userDto);
}
