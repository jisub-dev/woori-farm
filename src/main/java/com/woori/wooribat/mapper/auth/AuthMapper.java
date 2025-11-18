package com.woori.wooribat.mapper.auth;

import org.apache.ibatis.annotations.Mapper;

import com.woori.wooribat.model.dto.auth.SignupRequestDto;

@Mapper
public interface AuthMapper {
	public void signup(SignupRequestDto signupRequestDto) throws Exception;
}
