package com.woori.wooribat.service.map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.woori.wooribat.mapper.map.FarmlandMapper;
import com.woori.wooribat.model.dto.map.FarmlandDto;

@Service
@Transactional
public class FarmlandServiceImpl implements FarmlandService {

	@Autowired
	private FarmlandMapper farmlandMapper;

	@Override
	@Transactional(readOnly = true)
	public FarmlandDto getFarmlandByPoint(double x, double y) {
		return farmlandMapper.selectFarmlandByPoint(x, y);
	}
}
