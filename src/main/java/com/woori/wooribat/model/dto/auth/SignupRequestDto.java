package com.woori.wooribat.model.dto.auth;

import lombok.Data;

@Data
public class SignupRequestDto {
	String email;
	String password;
	String name;
}
