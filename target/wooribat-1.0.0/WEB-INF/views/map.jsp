<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"> 
<title>baseMapSample</title>
	<!-- c:url 하면 context 로 반영됨 -->
	<!--  절대 경로로 설정  --> 
	<script src="<c:url value='/resources/context/js/style/jquery-3.1.1.min.js'/>"></script>
	<script src="<c:url value='/resources/context/js/map/ol.js'/>"></script>
	<script src="<c:url value='/resources/context/js/map/proj4.js'/>"></script>
	<script src="<c:url value='/resources/context/js/map/transCoord.js'/>"></script>
	<script type="text/javascript" src="http://www.khoa.go.kr/oceanmap/BASEMAP_RLTM/otmsVectormapApi.do?ServiceKey=A9D554563295A888B7BCAB037&version=2"></script>
	<script src="<c:url value='/resources/context/js/map/apiVectorSample.js'/>"></script>
	<link rel="stylesheet" href="<c:url value='/resources/context/js/style/mapStyle.css'/>">
  	
  	<!-- openlayers 스타일 적용을 위한 cdn  -->
  	<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/openlayers/openlayers.github.io@master/en/v6.5.0/css/ol.css" type="text/css">
  	
  </head>
<body>
	<div id="baseMap" class="baseMap"></div>
	<div id="satelliteMap" class="satelliteMap"></div>
	<input type="checkbox" id="showDoCheck">도 경계
	<input type="checkbox" id="showRDZCheck">그린벨트
	<input type="checkbox" id="showCadastreCheck">연속지적도 (줌 레벨 8부터 작동)
	
	<!-- 팝업을 사용할 DOM  -->
	<div id="map-popup" class="ol-popup">
	  <a href="#" id="popup-closer" class="ol-popup-closer"></a>
	  <div id="popup-content"></div>
	</div>
	
	
</body>	
</html>