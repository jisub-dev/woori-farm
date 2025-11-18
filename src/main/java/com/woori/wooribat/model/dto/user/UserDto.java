package com.woori.wooribat.model.dto.user;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class UserDto {
	Integer id;
	String email;
	String name;
	LocalDateTime createdAt;
	LocalDateTime updatedAt;
}
