package com.woori.wooribat.controller.auth;

import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

import com.fasterxml.jackson.databind.JsonNode;
import com.google.api.client.auth.oauth2.TokenResponse;
import com.woori.wooribat.model.dto.auth.SignupRequestDto;
import com.woori.wooribat.service.auth.GoogleOAuthService;
import com.woori.wooribat.service.auth.GoogleUserService;

@Controller
public class AuthController {

	@Autowired
	private GoogleOAuthService googleOAuthService;

	@Autowired
	private GoogleUserService googleUserService;

	/**
	 * 로그인 페이지 (Google OAuth만 사용)
	 */
	@GetMapping("/login.do")
	public String login() {
		return "auth/login";
	}

	/**
	 * Google OAuth 로그인 시작
	 */
	@GetMapping("/oauth2/google.do")
	public String googleLogin() {
		String authUrl = googleOAuthService.getAuthorizationUrl();
		return "redirect:" + authUrl;
	}

	/**
	 * Google OAuth 콜백 처리
	 */
	@GetMapping("/oauth2callback.do")
	public ModelAndView oauth2Callback(@RequestParam("code") String code, HttpSession session) {
		ModelAndView mav = new ModelAndView();

		try {
			// 1. Authorization Code로 Access Token 교환
			TokenResponse tokenResponse = googleOAuthService.getAccessToken(code);
			String accessToken = tokenResponse.getAccessToken();

			// 2. Access Token으로 사용자 정보 조회
			JsonNode userInfo = googleUserService.getUserInfo(accessToken);

			// 3. 사용자 정보 세션에 저장
			String userId = userInfo.get("id").asText();
			String email = userInfo.get("email").asText();
			String name = userInfo.get("name").asText();
			String picture = userInfo.has("picture") ? userInfo.get("picture").asText() : null;

			session.setAttribute("userId", userId);
			session.setAttribute("userEmail", email);
			session.setAttribute("userName", name);
			session.setAttribute("userPicture", picture);
			session.setAttribute("isLoggedIn", true);

			// 4. 메인 페이지로 리다이렉트
			mav.setViewName("redirect:/gis.do");

		} catch (Exception e) {
			e.printStackTrace();
			mav.setViewName("redirect:/login.do");
			mav.addObject("error", "Google 로그인에 실패했습니다.");
		}

		return mav;
	}

	/**
	 * 로그아웃
	 */
	@GetMapping("/logout.do")
	public String logout(HttpSession session) {
		session.invalidate();
		return "redirect:/login.do";
	}
}
