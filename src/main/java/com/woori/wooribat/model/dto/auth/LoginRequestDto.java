package com.woori.wooribat.model.dto.auth;

import lombok.Data;

@Data
public class LoginRequestDto {
	String email;
	String password;
}
