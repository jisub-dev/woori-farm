<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html lang="ko">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>우리밭 지도</title>

	<!-- OpenLayers CSS & JS -->
	<link rel="stylesheet" href="<c:url value='/resources/js/ol/ol.css'/>">
	<script type="text/javascript" src="<c:url value='/resources/js/ol/dist/ol.js'/>"></script>
	<script type="text/javascript" src="<c:url value='/resources/js/jquery-3.1.1.min.js'/>"></script>
	<script src="<c:url value='/resources/js/map/mainMap.js'/>"></script>

	<!-- Custom CSS -->
	<link rel="stylesheet" href="<c:url value='/resources/js/style/mapStyle.css'/>">
	<link rel="stylesheet" href="<c:url value='/resources/style/mainMap.css'/>">

	<!-- 픽토그래머스 연결 -->
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css">
</head>
<body>
	<!-- Skip Navigation -->
	<div class="skip-nav">
		<a href="#section_content">본문 바로가기</a>
		<a href="#header">주 메뉴 바로가기</a>
	</div>

	<!-- Header -->
	<header id="header" class="map-header">
		<h1 class="logo">
			<a href="<c:url value='/gis.do'/>">
				<span class="logo-icon">🌾</span>
				<span class="logo-text">우리밭</span>
			</a>
		</h1>

		<!-- Navigation Menu -->
		<nav class="header-nav">
			<ul class="nav-list">
				<li class="nav-item active">
					<a href="#" class="nav-link">
						<i class="mdi mdi-map nav-icon"></i>
						<span class="nav-text">지도</span>
					</a>
				</li>
				<li class="nav-item">
					<a href="#" class="nav-link">
						<i class="mdi mdi-layers nav-icon"></i>
						<span class="nav-text">내 농지</span>
					</a>
				</li>
				<li class="nav-item">
					<a href="#" class="nav-link">
						<i class="mdi mdi-chart-line nav-icon"></i>
						<span class="nav-text">통계</span>
					</a>
				</li>
				<li class="nav-item">
					<a href="#" class="nav-link">
						<i class="mdi mdi-bookmark nav-icon"></i>
						<span class="nav-text">저장</span>
					</a>
				</li>
			</ul>
		</nav>

		<!-- User Info -->
		<div class="header-user">
			<c:choose>
				<c:when test="${not empty sessionScope.userName}">
					<div class="user-profile">
						<img src="${sessionScope.userPicture}" alt="프로필" class="user-avatar"
							 onerror="this.src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAMAAAC5zwKfAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAADNQTFRF8PDw5ubm+vr6+/v76enp+Pj47e3t5+fn9/f37Ozs9PT08vLy7+/v6urq9fX15OTk/f39pqwodgAAAQNJREFUeNrs11EOgyAMgOEWUAF19f6n3cMeplJHoSZbsv4H+DIWaCNsNwcGGmiggQZ+D/Q5reuasr8H9ID0CsHfALpA74JTgwPSPnRK0Ac6FrwOXOjcogIdlTkNuDDgogGRAVEBDsQ19IMzC879ILAgGNgAZhbMP3RttonxJs1Lgea/sDYcyreHXjW+oPUHVid2MWC1K+A0sqsDW7CksGmlCNZoFt9pIfjYgY8bwMMexUENQuOtqYCxfHtT7AddYodDcp0gIPEh9IBxous+nBuaTis4Nw/OSLVwloN+JEmjGJR5FyIDRpIWZeAoBkcZGMRgkIEkz0D7GjXQQAMN/GvwKcAAEGGHJh0mmaAAAAAASUVORK5CYII='">
						<span class="user-name">${sessionScope.userName}</span>
						<div class="user-dropdown">
							<div class="dropdown-content">
								<p class="user-email">${sessionScope.userEmail}</p>
								<a href="#" class="dropdown-link">내 정보</a>
								<a href="#" class="dropdown-link">설정</a>
								<a href="<c:url value='/logout.do'/>" class="dropdown-link logout">로그아웃</a>
							</div>
						</div>
					</div>
				</c:when>
				<c:otherwise>
					<a href="<c:url value='/login.do'/>" class="login-btn">로그인</a>
				</c:otherwise>
			</c:choose>
		</div>
	</header>

	<!-- Main Layout -->
	<div class="app-layout">
		<!-- Left Panel -->
		<div class="panel-layout">
			<div class="panel-container">
				<!-- Search Box -->
				<div id="home_search_input_box" class="search-input-box">
					<div class="search-wrap">
						<div class="search-box">
							<button type="button" class="button-search">검색</button>
							<div class="input-box">
								<label for="input_search" class="label-search">농지, 주소 검색</label>
								<input id="input_search" class="input-search" autocomplete="off"
									   maxlength="255" type="text" placeholder="농지, 주소 검색">
							</div>
						</div>
					</div>
				</div>

				<!-- Panel Content -->
				<div class="panel" id="section_content">
					<div class="panel-content">
						<h2 class="blind">지도 홈</h2>

						<!-- 공지사항 영역 (네이버 지도 스타일) -->
						<div class="notice-area">
							<h3 class="blind">공지사항</h3>
							<div class="notice-list">
								<!-- 공지사항 내용 추가 예정 -->
							</div>
						</div>

						<!-- 주소 표시 영역 -->
						<div class="address-area">
							<div class="address-content">
								<button class="btn-address" type="button">군산시 나운동</button>
								<button type="button" class="btn-report">오류신고</button>
							</div>
						</div>

						<!-- Smart Around 영역 -->
						<div class="smart-around">
							<div class="around-wrap">
								<h3 class="heading">
									<span class="blind">주변 정보</span>
								</h3>
								<div class="around-content">
									<!-- 주변 농지 정보 -->
									<div class="my-around">
										<h3 class="my-around-heading">내 주변</h3>
										<div class="my-around-filter">
											<button type="button" class="btn-around-filter">
												<strong class="point">전체</strong>
												<span>필터</span>
											</button>
										</div>
										<!-- 농지 카드 리스트 영역 -->
										<div class="place-item-list">
											<!-- 동적으로 농지 카드가 추가될 영역 -->
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<!-- 패널 접기 버튼 -->
					<button type="button" aria-expanded="true" class="fold-button">
						<span class="blind">패널 접기</span>
					</button>
				</div>
			</div>
		</div>

		<!-- Map Container -->
		<div class="base-map">
			<!-- Map Controls -->
			<div class="map-control-widget">
				<!-- 지도 유형 선택 -->
				<div class="item-carto">
					<div class="carto-widget">
						<div role="presentation" class="wrap-btn-carto">
							<button type="button" id="btn_gra" aria-current="true" class="btn-carto active">
								<span class="carto-label">일반지도</span>
							</button>
						</div>
						<div role="presentation" class="wrap-btn-carto">
							<button type="button" id="btn_pho" aria-current="false" class="btn-carto">
								<span class="carto-label">위성지도</span>
							</button>
						</div>
					</div>
				</div>

				<!-- 레이어 & 도구 -->
				<div class="item-toolbox">
					<!-- 레이어 위젯 -->
					<div class="widget-group layer-widget">
						<button class="widget-button widget-land" id="chAddCada" aria-pressed="false">
							<i class="mdi mdi-map-marker-outline"></i>
							<span class="blind">지적편집도</span>
						</button>
						<button class="widget-button widget-hover" id="chAddHover" aria-pressed="false">
							<i class="mdi mdi-cursor-default-outline"></i>
							<span class="blind">마우스 호버</span>
						</button>
					</div>

					<!-- 측정 도구 -->
					<div class="widget-group toolbox-widget">
						<button class="widget-button widget-distance" id="chLength" aria-pressed="false">
							<i class="mdi mdi-ruler"></i>
							<span class="blind">거리측정</span>
						</button>
						<button class="widget-button widget-area" id="chArea" aria-pressed="false">
							<i class="mdi mdi-vector-square"></i>
							<span class="blind">면적측정</span>
						</button>
					</div>

					<!-- 공유 & 출력 -->
					<!-- <div class="widget-group export-widget">
						<button class="widget-button widget-print">
							<i class="mdi mdi-printer"></i>
							<span class="blind">인쇄</span>
						</button>
						<button class="widget-button widget-share">
							<i class="mdi mdi-share-variant"></i>
							<span class="blind">공유하기</span>
						</button>
					</div>
					 -->
				</div>

				<!-- 위치 & 줌 컨트롤 -->
				<div class="item-location">
					<div class="widget-group location-widget">
						<button type="button" class="btn-location" aria-pressed="false">
							<i class="mdi mdi-crosshairs-gps"></i>
							<span class="blind">현재위치</span>
						</button>
					</div>

					<div class="widget-group zoom-widget">
						<button type="button" class="btn-widget-zoom zoom-in">
							<i class="mdi mdi-plus"></i>
							<span class="blind">확대</span>
						</button>
						<button type="button" class="btn-widget-zoom zoom-out">
							<i class="mdi mdi-minus"></i>
							<span class="blind">축소</span>
						</button>
					</div>
				</div>
			</div>

			<!-- OpenLayers Map -->
			<div id="map" class="mantle-map"></div>

			<!-- 팝업 -->
			<div id="map-popup" class="ol-popup">
				<div id="popup-content"></div>
			</div>
		</div>
	</div>

	<!-- 날씨 플로팅 버튼 (네이버 지도 스타일) -->
	<div class="weather-floating-button">
		<div role="button" tabindex="0" class="weather-btn">
			<div class="weather-info-wrap">
				<div class="weather-info-area">
					<span class="weather-icon">
						<span class="blind">맑음</span>
					</span>
					<span class="weather-info-temperature">
						<span id="current-temp">--</span>°
						<span class="blind">기온</span>
					</span>
				</div>
			</div>
		</div>
	</div>

</body>
</html>