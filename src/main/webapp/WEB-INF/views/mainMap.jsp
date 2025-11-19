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
	
	<script type="text/javascript" src="<c:url value='/resources/js/ol/dist/ol.js'/>"></script>
	<script type="text/javascript" src="<c:url value='/resources/js/jquery-3.1.1.min.js'/>"></script>
	<script src="<c:url value='/resources/js/map/mainMap.js'/>"></script>
	<link rel="stylesheet" href="<c:url value='/resources/js/style/mapStyle.css'/>">
  	<link rel="stylesheet" href="<c:url value='/resources/js/ol/ol.css'/>">
  	
  </head>
<body>
	<!-- 지도  -->
	<div id="map" class="map"></div>
	
	<!--  baseMap 변환 버튼  --> 
	<div id="btnBaseMaps" class="btnBaseMaps">
	    <button id="btn_gra" style="font-weight: bold; color: #000000; -webkit-text-stroke: 1px #999999;" disabled>일반지도</button>
	   	<br>
	    <button id="btn_pho" style="font-weight: bold; color: #000000; -webkit-text-stroke: 1px #999999;">위성지도</button>
	</div>

	<div id="checkChAddCada" class="checkChAddCada">
		<label
			style="font-weight: bold; color: #000000; -webkit-text-stroke: 1px #999999;">
			<input type="checkbox" id="chAddCada" class="chAddCada">지적편집도
		</label>
	</div>

	<div id="checkChAddHover" class="checkChAddHover">
		<label
			style="font-weight: bold; color: #000000; -webkit-text-stroke: 1px #999999;">
			<input type="checkbox" id="chAddHover" class="chAddHover">마우스
			호버 지적편집도
		</label>
	</div>

	<div id="measurementType" class="measurementType">
		<label
			style="font-weight: bold; color: #000000; -webkit-text-stroke: 1px #999999;">
			<input type="checkbox" id="chLength">거리
		</label> <br> <label
			style="font-weight: bold; color: #000000; -webkit-text-stroke: 1px #999999;">
			<input type="checkbox" id="chArea">면적
		</label>
	</div>


	<!-- 팝업을 사용할 DOM  -->
	<div id="map-popup" class="ol-popup">
	  <div id="popup-content"></div>
	</div>
	

	
	

</body>	
</html>