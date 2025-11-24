package com.woori.wooribat.interceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 인증 체크 인터셉터
 * 세션의 isLoggedIn을 확인하여 로그인 여부 체크
 */
public class AuthInterceptor implements HandlerInterceptor {

	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
			throws Exception {

		HttpSession session = request.getSession(false);

		// 세션이 없거나 로그인하지 않은 경우
		if (session == null || session.getAttribute("isLoggedIn") == null
				|| !(Boolean) session.getAttribute("isLoggedIn")) {

			// AJAX 요청인 경우 401 응답
			String ajaxHeader = request.getHeader("X-Requested-With");
			if ("XMLHttpRequest".equals(ajaxHeader)) {
				response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
				response.setContentType("application/json;charset=UTF-8");
				response.getWriter().write("{\"success\":false,\"message\":\"로그인이 필요합니다.\"}");
				return false;
			}

			// 일반 요청인 경우 로그인 페이지로 리다이렉트
			response.sendRedirect(request.getContextPath() + "/login.do");
			return false;
		}

		return true;
	}
}
