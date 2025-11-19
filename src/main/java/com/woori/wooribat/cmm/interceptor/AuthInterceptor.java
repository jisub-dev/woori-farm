package com.woori.wooribat.cmm.interceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 로그인 체크 인터셉터
 * OAuth 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
 */
public class AuthInterceptor implements HandlerInterceptor {

	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
			throws Exception {

		HttpSession session = request.getSession(false);

		// 세션이 없거나 로그인 정보가 없으면 로그인 페이지로 리다이렉트
		if (session == null || session.getAttribute("isLoggedIn") == null) {
			response.sendRedirect(request.getContextPath() + "/login.do");
			return false;
		}

		// 로그인되어 있으면 요청 진행
		return true;
	}
}
