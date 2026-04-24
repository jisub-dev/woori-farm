<%@ page language="java" %>
<%
    Boolean isLoggedIn = (Boolean) session.getAttribute("isLoggedIn");
    if (Boolean.TRUE.equals(isLoggedIn)) {
        response.sendRedirect(request.getContextPath() + "/gis");
    } else {
        response.sendRedirect(request.getContextPath() + "/login");
    }
%>
