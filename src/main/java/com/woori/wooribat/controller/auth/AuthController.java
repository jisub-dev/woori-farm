package com.woori.wooribat.controller.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

import com.woori.wooribat.model.dto.auth.SignupRequestDto;

@Controller
public class AuthController {
	
	@Autowired
	private AuthServiceImpl authService;
	
	@GetMapping("/login.do")
	public String login() {
		return "login";
	}
	
	@PostMapping("/login/process.do")
	public String loginProcess() {
		return "redirect:/mainMap";

	}
	
	// 회원가입 화면으로 이동 
	@GetMapping("/signup.do") 
	public String signup() {
		return "signup";
	}
	
	// 회원가입 동작 
	@PostMapping("/signup/process.do") 
	public String signupProcess(SignupRequestDto signupRequestDto) {
		
		return "login";
	}
	
	
}
