package com.woori.wooribat.model.dto.user;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class UserDto {
	private Integer id;
	private String userId;
	private String email;
	private String name;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
}
