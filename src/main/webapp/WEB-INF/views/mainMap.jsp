<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>baseMapSample</title>
	<!-- c:url 하면 context 로 반영됨 -->
	<!--  절대 경로로 설정  -->
	<script type="text/javascript" src="https://map.vworld.kr/js/vworldMapInit.js.do?version=2.0&apiKey=8E952DFB-FFDE-33E3-BA8A-3D78FF78B6CC&domain=http://localhost:8080/"></script>
	<script src="<c:url value='/resources/js/map/mainMap.js'/>"></script>
	<link rel="stylesheet" href="<c:url value='/resources/js/style/mapStyle.css'/>">
  	
  </head>
<body>
	<!-- 지도  -->
	<div id="baseMap" class="baseMap"></div>
	
	<!--  baseMap 변환 버튼  --> 
	<div id="btnBaseMaps" class="btnBaseMaps">
	    <button id="btn_gra" disabled>일반지도</button>
	   	<br>
	    <button id="btn_pho">위성지도</button>
	</div>	
	
	<div id="checkChAddCada" class="checkChAddCada">
		<input type="checkbox" id="chAddCada" class="chAddCada">지적편집도 (클릭이벤트 포함)
	</div>
	<div id="checkChAddHover" class="checkChAddHover">
		<input type="checkbox" id="chAddHover" class="chAddHover">마우스 호버 지적편집도 
	</div>
	
	
	
	<!-- 팝업을 사용할 DOM  -->
	<div id="map-popup" class="ol-popup">
	  <div id="popup-content"></div>
	</div>
	
	
	
	

</body>	
</html>