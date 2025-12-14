package com.woori.wooribat.interceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.web.servlet.HandlerInterceptor;

// 로그인 체크
public class AuthInterceptor implements HandlerInterceptor {

	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
			throws Exception {

		HttpSession session = request.getSession(false);

		if (session == null || session.getAttribute("isLoggedIn") == null
				|| !(Boolean) session.getAttribute("isLoggedIn")) {

			String ajaxHeader = request.getHeader("X-Requested-With");
			if ("XMLHttpRequest".equals(ajaxHeader)) {
				response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
				response.setContentType("application/json;charset=UTF-8");
				response.getWriter().write("{\"success\":false,\"message\":\"로그인이 필요합니다.\"}");
				return false;
			}

			response.sendRedirect(request.getContextPath() + "/login.do");
			return false;
		}

		return true;
	}
}
