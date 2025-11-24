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

	<!-- 세션 정보를 JavaScript로 전달 -->
	<script type="text/javascript">
		// 세션에서 userId 가져오기
		var sessionUserId = '<c:out value="${sessionScope.userId}" default=""/>';
		console.log('Session User ID:', sessionUserId);
	</script>

	<script src="<c:url value='/resources/js/map/mainMap.js'/>"></script>

	<!-- Custom CSS -->
	<link rel="stylesheet" href="<c:url value='/resources/js/style/mapStyle.css'/>">
	<link rel="stylesheet" href="<c:url value='/resources/style/mainMap.css'/>">

	<!-- 픽토그래머스 연결 -->
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css">
</head>
<body>
	<!-- 네비 스킵 -->
	<div class="skip-nav">
		<a href="#section_content">본문 바로가기</a>
		<a href="#header">주 메뉴 바로가기</a>
	</div>

	<!-- 왼쪽 헤더 -->
	<header id="header" class="map-header">
		<h1 class="logo">
			<a href="<c:url value='/gis.do'/>">
				<span class="logo-icon">🌾</span>
				<span class="logo-text">우리밭</span>
			</a>
		</h1>

		<!-- 왼쪽 메뉴 -->
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
					<a href="#" class="nav-link" id="nav-guide">
						<i class="mdi mdi-help-circle nav-icon"></i>
						<span class="nav-text">가이드</span>
					</a>
				</li>
			</ul>
		</nav>

		<!-- 유저 정보 -->
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

	<!-- 메인 레이아웃 -->
	<div class="app-layout">
		<!-- Left Panel -->
		<div class="panel-layout">
			<div class="panel-container">
				<!-- Search Box -->
				<div id="home_search_input_box" class="search-input-box">
					<div class="search-wrap">
						<div class="search-box">
							<button type="button" class="button-search"></button>
							<div class="input-box">
								<!-- <label for="input_search" class="label-search">농지, 주소 검색</label> -->
								<input id="input_search" class="input-search" autocomplete="off"
									   maxlength="255" type="text" placeholder="농지, 주소 검색">
							</div>
						</div>
						<div id="search_results" class="search-result-list"></div>
					</div>
				</div>

				<!-- 패널  -->
				<div class="panel" id="section_content">
					<!-- 지도 홈 패널 -->
					<div class="panel-content" id="panel-map-home" style="display:none;">
						<h2 class="blind">지도 홈</h2>
					</div>


					<!-- 내 농지 패널 -->
					<div class="panel-content" id="panel-my-farms" style="display:none;">
						<div class="my-farms-header">
							<h2 class="panel-title">내 농지</h2>
							<div>
								<button type="button" class="btn-view-all" id="btn-view-all-farms">
									<i class="mdi mdi-view-list"></i>
									<span>전체보기</span>
								</button>
								<button type="button" class="btn-add-folder" id="btn-add-folder">
									<i class="mdi mdi-folder-plus"></i>
									<span>폴더 추가</span>
								</button>
							</div>
						</div>

						<!-- 폴더 목록 영역 -->
						<div class="farm-folders-area">
							<div id="farm-folders-list" class="farm-folders-list">
								<!-- 폴더 목록이 동적으로 추가됩니다 -->
								<div class="folder-loading">
									<i class="mdi mdi-loading mdi-spin"></i>
									<span>폴더 목록을 불러오는 중...</span>
								</div>
							</div>
						</div>

						<!-- 선택된 폴더의 농지 목록 영역 -->
						<div class="farms-list-area" id="farms-list-area" style="display:none;">
							<div class="farms-list-header">
								<button type="button" class="btn-back" id="btn-back-to-folders">
									<i class="mdi mdi-arrow-left"></i>
								</button>
								<h3 class="folder-name" id="selected-folder-name">폴더명</h3>
								<button type="button" class="btn-folder-edit">
									<i class="mdi mdi-pencil"></i>
								</button>
								<button type="button" class="btn-folder-delete">
									<i class="mdi mdi-delete"></i>
								</button>
							</div>
							<div id="farms-list" class="farms-list">
								<!-- 농지 목록이 동적으로 추가됩니다 -->
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

		<!-- 지도 컨테이너 -->
		<div class="base-map">
			<!-- 지도 컨트롤 -->
			<div class="map-control-widget">
				<!-- 지도 유형 선택 -->
				<div class="item-carto">
					<div class="carto-widget">
						<div role="presentation" class="wrap-btn-carto">
							<button type="button" id="btn_gra" aria-current="true" class="btn-carto active" title="일반지도">
								<span class="carto-label">일반지도</span>
							</button>
						</div>
						<div role="presentation" class="wrap-btn-carto">
							<button type="button" id="btn_pho" aria-current="false" class="btn-carto" title="위성지도">
								<span class="carto-label">위성지도</span>
							</button>
						</div>
					</div>
				</div>

				<!-- 레이어 & 도구 -->
				<div class="item-toolbox">
					<!-- 레이어 위젯 -->
					<div class="widget-group layer-widget">
						<button class="widget-button widget-land" id="chAddCadaWMS" aria-pressed="false" title="지적편집도 표시 (줌 레벨 17 이상)">
							<i class="mdi mdi-map-outline"></i>
							<span class="blind">지적편집도 표시</span>
						</button>
						<button class="widget-button widget-click" id="chAddCadaClick" aria-pressed="false" title="지적편집도 클릭 조회 (줌 레벨 17 이상)">
							<i class="mdi mdi-cursor-default-click-outline"></i>
							<span class="blind">지적편집도 클릭</span>
						</button>
						<button class="widget-button widget-hover" id="chAddHover" aria-pressed="false" title="마우스 호버로 지적편집도 미리보기">
							<i class="mdi mdi-cursor-default-outline"></i>
							<span class="blind">마우스 호버</span>
						</button>
					</div>

					<!-- 농지 위젯 -->
					<div class="widget-group farm-widget">
						<button class="widget-button widget-farm" id="chAddFarmWMS" aria-pressed="false" title="농지 레이어 표시 (줌 레벨 17 이상)">
							<i class="mdi mdi-tractor"></i>
							<span class="blind">농지 표시</span>
						</button>
						<button class="widget-button widget-farm-click" id="chAddFarmClick" aria-pressed="false" title="농지 클릭 조회 (줌 레벨 17 이상)">
							<i class="mdi mdi-tractor-variant"></i>
							<span class="blind">농지 클릭</span>
						</button>
					</div>

					<!-- 측정 도구 -->
					<div class="widget-group toolbox-widget">
						<button class="widget-button widget-distance" id="chLength" aria-pressed="false" title="거리 측정">
							<i class="mdi mdi-ruler"></i>
							<span class="blind">거리측정</span>
						</button>
						<button class="widget-button widget-area" id="chArea" aria-pressed="false" title="면적 측정">
							<i class="mdi mdi-vector-square"></i>
							<span class="blind">면적측정</span>
						</button>
						<button class="widget-button widget-draw-farm" id="chDrawFarm" aria-pressed="false" title="농지 직접 그리기">
							<i class="mdi mdi-draw"></i>
							<span class="blind">농지 그리기</span>
						</button>
					</div>
				</div>

				<!-- 위치 & 줌 컨트롤 -->
				<div class="item-location">
					<div class="widget-group location-widget">
						<button type="button" class="btn-location" aria-pressed="false" title="현재 위치로 이동">
							<i class="mdi mdi-crosshairs-gps"></i>
							<span class="blind">현재위치</span>
						</button>
					</div>

					<div class="widget-group zoom-widget">
						<button type="button" class="btn-widget-zoom zoom-in" title="지도 확대">
							<i class="mdi mdi-plus"></i>
							<span class="blind">확대</span>
						</button>
						<button type="button" class="btn-widget-zoom zoom-out" title="지도 축소">
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

	<!-- 날씨 플로팅 버튼 -->
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

	<!-- 농지 추가 모달 (지도에서 선택) -->
	<div id="farmland-add-modal" class="modal-overlay" style="display:none;">
		<div class="modal-container">
			<div class="modal-header">
				<h3 class="modal-title">농지 추가</h3>
				<button type="button" class="modal-close-btn" id="modal-close-btn">
					<i class="mdi mdi-close"></i>
					<span class="blind">닫기</span>
				</button>
			</div>
			<div class="modal-body">
				<div class="form-group">
					<label for="farmland-name" class="form-label">농지 이름 <span class="required">*</span></label>
					<input type="text" id="farmland-name" class="form-input" placeholder="농지 이름을 입력하세요" maxlength="50">
				</div>
				<div class="form-group">
					<label for="farmland-folder" class="form-label">폴더 선택</label>
					<select id="farmland-folder" class="form-select">
						<option value="">미지정</option>
						<!-- 폴더 목록이 동적으로 추가됩니다 -->
					</select>
				</div>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn-cancel" id="modal-cancel-btn">취소</button>
				<button type="button" class="btn-save" id="modal-save-btn">저장</button>
			</div>
		</div>
	</div>

	<!-- 폴리곤 그리기 완료 확인 팝업 -->
	<div id="polygon-confirm-popup" class="ol-popup" style="display:none;">
		<div class="polygon-confirm-content">
			<h4 style="margin:0 0 12px 0; font-size:16px; font-weight:600;">농지 등록</h4>
			<p style="margin:0 0 16px 0; color:#666; font-size:14px;">
				그린 영역을 농지로 등록하시겠습니까?
			</p>
			<div class="polygon-area-info" id="polygon-area-display" style="margin:0 0 16px 0; padding:10px; background:#f5f5f5; border-radius:6px;">
				<i class="mdi mdi-vector-square"></i>
				<span style="font-weight:600;">면적: </span>
				<span id="drawn-area-text">-</span>
			</div>
			<div style="display:flex; gap:8px;">
				<button id="btn-redraw-polygon" style="flex:1; padding:10px; background:#f5f5f5; color:#666; border:none; border-radius:6px; cursor:pointer; font-weight:500;">
					<i class="mdi mdi-refresh"></i> 다시 그리기
				</button>
				<button id="btn-add-drawn-farmland" style="flex:1; padding:10px; background:#4CAF50; color:#fff; border:none; border-radius:6px; cursor:pointer; font-weight:500;">
					<i class="mdi mdi-plus"></i> 농지 추가
				</button>
			</div>
		</div>
	</div>

	<!-- 직접 그린 농지 추가 모달 -->
	<div id="drawn-farmland-modal" class="modal-overlay" style="display:none;">
		<div class="modal-container">
			<div class="modal-header">
				<h3 class="modal-title">직접 그린 농지 추가</h3>
				<button type="button" class="modal-close-btn" id="drawn-modal-close-btn">
					<i class="mdi mdi-close"></i>
					<span class="blind">닫기</span>
				</button>
			</div>
			<div class="modal-body">
				<div class="form-group">
					<label for="drawn-farmland-name" class="form-label">농지 이름 <span class="required">*</span></label>
					<input type="text" id="drawn-farmland-name" class="form-input" placeholder="농지 이름을 입력하세요" maxlength="50">
				</div>
				<div class="form-group">
					<label for="drawn-farmland-folder" class="form-label">폴더 선택</label>
					<select id="drawn-farmland-folder" class="form-select">
						<option value="">미지정</option>
						<!-- 폴더 목록이 동적으로 추가됩니다 -->
					</select>
				</div>
				<div class="form-group">
					<label class="form-label">그린 영역 정보</label>
					<div style="padding:12px; background:#f5f5f5; border-radius:6px;">
						<div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
							<i class="mdi mdi-vector-square" style="font-size:20px; color:#4CAF50;"></i>
							<span style="font-weight:600;">면적: </span>
							<span id="drawn-area-text-modal">-</span>
						</div>
					</div>
				</div>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn-cancel" id="drawn-modal-cancel-btn">취소</button>
				<button type="button" class="btn-save" id="drawn-modal-save-btn">저장</button>
			</div>
		</div>
	</div>

	<!-- 농지 상태 변경 모달 -->
	<div id="status-change-modal" class="modal-overlay" style="display:none;">
		<div class="modal-container" style="max-width:300px;">
			<div class="modal-header">
				<h3 class="modal-title">농지 상태 변경</h3>
				<button type="button" class="modal-close-btn" onclick="closeStatusModal()">
					<i class="mdi mdi-close"></i>
				</button>
			</div>
			<div class="modal-body">
				<select id="status-select" class="form-select">
					<option value="씨뿌림">씨뿌림</option>
					<option value="모내기">모내기</option>
					<option value="성장중">성장중</option>
					<option value="수확완료">수확완료</option>
					<option value="휴경">휴경</option>
				</select>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn-cancel" onclick="closeStatusModal()">취소</button>
				<button type="button" class="btn-save" onclick="saveStatus()">변경</button>
			</div>
		</div>
	</div>

	<!-- 폴더 변경 모달 -->
	<div id="folder-change-modal" class="modal-overlay" style="display:none;">
		<div class="modal-container" style="max-width:300px;">
			<div class="modal-header">
				<h3 class="modal-title">폴더 변경</h3>
				<button type="button" class="modal-close-btn" onclick="closeFolderModal()">
					<i class="mdi mdi-close"></i>
				</button>
			</div>
			<div class="modal-body">
				<select id="folder-select" class="form-select">
					<option value="">미지정</option>
				</select>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn-cancel" onclick="closeFolderModal()">취소</button>
				<button type="button" class="btn-save" onclick="saveFolder()">변경</button>
			</div>
		</div>
	</div>

	<!-- 통계 모달 -->
	<div id="stats-modal" class="modal-overlay" style="display:none;">
		<div class="modal-container" style="max-width:800px; width:90%;">
			<div class="modal-header">
				<h3 class="modal-title">농지 통계</h3>
				<button type="button" class="modal-close-btn" onclick="closeStatsModal()">
					<i class="mdi mdi-close"></i>
				</button>
			</div>
			<div class="modal-body">
				<!-- 전체 통계 -->
				<div class="stats-summary">
					<div class="stats-card">
						<div class="stats-label">전체 농지</div>
						<div class="stats-value" id="total-farm-count">-</div>
					</div>
					<div class="stats-card">
						<div class="stats-label">전체 면적</div>
						<div class="stats-value" id="total-area">-</div>
					</div>
				</div>

				<!-- 폴더별 통계 -->
				<div class="stats-section">
					<h4 class="stats-section-title">폴더별 통계</h4>
					<div class="stats-table-wrapper">
						<table class="stats-table">
							<thead>
								<tr>
									<th>폴더명</th>
									<th>농지 수</th>
									<th>비율</th>
									<th>면적 (㎡)</th>
									<th>비율</th>
								</tr>
							</thead>
							<tbody id="folder-stats-tbody">
								<tr>
									<td colspan="5" style="text-align:center; padding:40px;">통계를 불러오는 중...</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				<!-- 선택한 폴더의 상태별 통계 -->
				<div class="stats-section" id="folder-status-section">
					<h4 class="stats-section-title">폴더별 상태 통계</h4>
					<div class="form-group" style="margin-bottom:16px;">
						<select id="folder-status-select" class="form-select">
							<option value="">폴더를 선택하세요</option>
						</select>
					</div>
					<div class="stats-table-wrapper">
						<table class="stats-table">
							<thead>
								<tr>
									<th>상태</th>
									<th>농지 수</th>
									<th>비율</th>
								</tr>
							</thead>
							<tbody id="folder-status-tbody">
								<tr>
									<td colspan="3" style="text-align:center; padding:40px; color:#999;">폴더를 선택하세요</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- 가이드 모달 -->
	<div id="guide-modal" class="modal-overlay" style="display:none;">
		<div class="modal-container" style="max-width:900px; width:90%;">
			<div class="modal-header">
				<h3 class="modal-title">
					<i class="mdi mdi-help-circle" style="margin-right:8px;"></i>
					우리밭 사용 가이드
				</h3>
				<button type="button" class="modal-close-btn" onclick="closeGuideModal()">
					<i class="mdi mdi-close"></i>
				</button>
			</div>
			<div class="modal-body" style="max-height:70vh; overflow-y:auto;">
				<!-- 시작하기 -->
				<div class="guide-section">
					<h4 class="guide-section-title">
						<i class="mdi mdi-flag-checkered"></i>
						시작하기
					</h4>
					<div class="guide-content">
						<p>우리밭에 오신 것을 환영합니다! 우리밭은 농지를 효율적으로 관리하고 시각화하는 스마트 농업 관리 시스템입니다.</p>
						<ul class="guide-list">
							<li><strong>지도 기반 관리:</strong> 실제 농지를 지도에서 직접 확인하고 관리할 수 있습니다.</li>
							<li><strong>폴더 구조:</strong> 농지를 폴더별로 분류하여 체계적으로 관리할 수 있습니다.</li>
							<li><strong>실시간 통계:</strong> 농지 면적, 개수 등을 실시간으로 확인할 수 있습니다.</li>
						</ul>
					</div>
				</div>

				<!-- 농지 등록 방법 -->
				<div class="guide-section">
					<h4 class="guide-section-title">
						<i class="mdi mdi-plus-circle"></i>
						농지 등록 방법
					</h4>
					<div class="guide-content">
						<div class="guide-method">
							<h5 class="guide-method-title">
								<i class="mdi mdi-numeric-1-circle"></i>
								지적편집도에서 선택하기
							</h5>
							<ol class="guide-steps">
								<li>오른쪽 지도 컨트롤에서 <i class="mdi mdi-cursor-default-click-outline"></i> <strong>지적편집도 클릭</strong> 버튼을 활성화합니다.</li>
								<li>지도를 줌 레벨 17 이상으로 확대합니다.</li>
								<li>원하는 농지를 클릭하면 농지 추가 모달이 열립니다.</li>
								<li>농지 이름과 폴더를 선택하고 저장합니다.</li>
							</ol>
						</div>

						<div class="guide-method">
							<h5 class="guide-method-title">
								<i class="mdi mdi-numeric-2-circle"></i>
								직접 그려서 등록하기
							</h5>
							<ol class="guide-steps">
								<li>오른쪽 지도 컨트롤에서 <i class="mdi mdi-draw"></i> <strong>농지 그리기</strong> 버튼을 클릭합니다.</li>
								<li>지도에서 클릭하여 농지 경계를 그립니다.</li>
								<li>더블클릭으로 그리기를 완료합니다.</li>
								<li>확인 팝업에서 면적을 확인하고 <strong>농지 추가</strong>를 클릭합니다.</li>
								<li>농지 정보를 입력하고 저장합니다.</li>
							</ol>
						</div>
					</div>
				</div>

				<!-- 폴더 관리 -->
				<div class="guide-section">
					<h4 class="guide-section-title">
						<i class="mdi mdi-folder-multiple"></i>
						폴더 관리
					</h4>
					<div class="guide-content">
						<ul class="guide-list">
							<li><strong>폴더 추가:</strong> 상단 <i class="mdi mdi-folder-plus"></i> <strong>폴더 추가</strong> 버튼을 클릭하여 새 폴더를 만들 수 있습니다.</li>
							<li><strong>폴더 수정:</strong> 폴더 카드의 편집 버튼 <i class="mdi mdi-pencil"></i>을 클릭하여 폴더명을 변경할 수 있습니다.</li>
							<li><strong>폴더 삭제:</strong> 삭제 버튼 <i class="mdi mdi-delete"></i>을 클릭하면 폴더를 삭제할 수 있습니다. (폴더 내 농지는 미지정으로 이동됩니다)</li>
							<li><strong>폴더 보기:</strong> 폴더 카드를 클릭하면 해당 폴더의 농지 목록을 볼 수 있습니다.</li>
						</ul>
					</div>
				</div>

				<!-- 지도 기능 -->
				<div class="guide-section">
					<h4 class="guide-section-title">
						<i class="mdi mdi-map"></i>
						지도 기능 활용
					</h4>
					<div class="guide-content">
						<div class="guide-feature-grid">
							<div class="guide-feature">
								<div class="guide-feature-icon">
									<i class="mdi mdi-map-outline"></i>
								</div>
								<h5>지적편집도</h5>
								<p>실제 필지 경계를 지도에 표시합니다. 줌 레벨 17 이상에서 활성화됩니다.</p>
							</div>

							<div class="guide-feature">
								<div class="guide-feature-icon">
									<i class="mdi mdi-tractor"></i>
								</div>
								<h5>농지 레이어</h5>
								<p>등록된 모든 농지를 지도에 표시합니다. 클릭하면 상세 정보를 확인할 수 있습니다.</p>
							</div>

							<div class="guide-feature">
								<div class="guide-feature-icon">
									<i class="mdi mdi-ruler"></i>
								</div>
								<h5>거리/면적 측정</h5>
								<p>지도에서 직접 거리와 면적을 측정할 수 있습니다.</p>
							</div>

							<div class="guide-feature">
								<div class="guide-feature-icon">
									<i class="mdi mdi-cursor-default-outline"></i>
								</div>
								<h5>마우스 호버</h5>
								<p>마우스를 올리면 지적편집도 정보를 미리 볼 수 있습니다.</p>
							</div>
						</div>
					</div>
				</div>

				<!-- 농지 관리 -->
				<div class="guide-section">
					<h4 class="guide-section-title">
						<i class="mdi mdi-cog"></i>
						농지 관리
					</h4>
					<div class="guide-content">
						<ul class="guide-list">
							<li><strong>상태 변경:</strong> 농지 카드에서 상태 드롭다운을 클릭하여 농지의 현재 상태(씨뿌림, 모내기, 성장중, 수확완료, 휴경)를 변경할 수 있습니다.</li>
							<li><strong>폴더 이동:</strong> 농지를 다른 폴더로 이동하거나 미지정 상태로 변경할 수 있습니다.</li>
							<li><strong>농지 삭제:</strong> 더 이상 필요하지 않은 농지는 삭제할 수 있습니다.</li>
							<li><strong>지도에서 보기:</strong> <i class="mdi mdi-map-marker"></i> 버튼을 클릭하면 해당 농지 위치로 지도가 이동합니다.</li>
						</ul>
					</div>
				</div>

				<!-- 통계 확인 -->
				<div class="guide-section">
					<h4 class="guide-section-title">
						<i class="mdi mdi-chart-line"></i>
						통계 확인
					</h4>
					<div class="guide-content">
						<p>상단 메뉴의 <strong>통계</strong>를 클릭하면 다음 정보를 확인할 수 있습니다:</p>
						<ul class="guide-list">
							<li><strong>전체 통계:</strong> 총 농지 개수와 전체 면적을 한눈에 확인</li>
							<li><strong>폴더별 통계:</strong> 각 폴더의 농지 개수, 면적, 비율을 비교</li>
							<li><strong>상태별 통계:</strong> 폴더별로 농지 상태 분포를 확인</li>
						</ul>
					</div>
				</div>

				
				<!-- 문의하기 -->
				<div class="guide-section">
					<h4 class="guide-section-title">
						<i class="mdi mdi-face-agent"></i>
						문의 사항은 지도 오른쪽 하단 채팅을 이용해주세요!
					</h4>
				</div>
			</div>
		</div>
	</div>

</body>
</html>