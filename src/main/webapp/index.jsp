<%@ page language="java" %>
<%
    Boolean isLoggedIn = (Boolean) session.getAttribute("isLoggedIn");
    if (Boolean.TRUE.equals(isLoggedIn)) {
        response.sendRedirect(request.getContextPath() + "/gis.do");
    } else {
        response.sendRedirect(request.getContextPath() + "/login.do");
    }
%>
