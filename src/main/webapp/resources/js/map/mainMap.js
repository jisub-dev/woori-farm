var baseMap;
var switchMap;

// 마우스 호버 모드 (기본값 : 끄기)
var hoverOn = false;

// 지적편집도 클릭 이벤트 (기본값 : 끄기)
var cadWfsClick = false;

$(document).ready(function() {
	initMap();
})

function initMap() {

	// 일반지도 선택시 
	const switchMapGra = document.getElementById("btn_gra");
	switchMapGra.addEventListener("click", () => {
		baseMap.setBasemapType(vw.ol3.BasemapType.GRAPHIC);
		switchMapGra.disabled = true;   
		switchMapPho.disabled = false;  
		
	});
	// 위성지도 선택시 
	const switchMapPho = document.getElementById("btn_pho");
	switchMapPho.addEventListener("click", () => {
		baseMap.setBasemapType(vw.ol3.BasemapType.PHOTO_HYBRID);
		switchMapPho.disabled = true;
		switchMapGra.disabled = false;
	});
	
	// 지적편집도 WFS, 클릭 이벤트 On/Off
	const addCadstreLayer = document.getElementById("chAddCada");
	addCadstreLayer.addEventListener("change", () => {
		cadWfsClick = addCadstreLayer.checked;
		if (cadWfsClick) {
		    // ON
		    refreshHint(); // 줌 레벨 확인 후 안내문 
		    selectCadastreFeatLayer.getSource().clear();
		    cadastreLayer.setVisible(true);
		    selectCadastreFeatLayer.setVisible(true);
		  } else {
		    // OFF
		    cadastreLayer.setVisible(false);
		    selectCadastreFeatLayer.getSource().clear();
		    selectCadastreFeatLayer.setVisible(false);
		    if (overlay) overlay.setPosition(undefined); // 팝업 닫기
		  }
	
	})
	
	// 마우수 오버 이벤트 on/off 
	const mousehovermode = document.getElementById("chAddHover");
	mousehovermode.addEventListener("change", () => {
		hoverOn = mousehovermode.checked;
		if (!hoverOn) {
		    cadastreFeatLayer.getSource().clear(); // 이전에 띄운 레이어 지우기 
		    cadastreFeatLayer.setVisible(false);
		  } else {
		    cadastreFeatLayer.setVisible(true);
		  }
	
	})
	
	const highlightStyle = new ol.style.Style({
		  stroke: new ol.style.Stroke({
		    color: 'white',
		    width: 2
		  }),
		  fill: new ol.style.Fill({
		    color: 'rgba(0,0,255,0.6)'
		  })
		});
		

	
		
	// 초기 카메라 위치, home 카메라 위치 세팅 
	vw.ol3.CameraPosition = { center: ol.proj.fromLonLat([126.9784, 37.5667]), zoom: 12 };
		
	// baseMap 옵션 설정 
	vw.ol3.MapOptions = {
			basemapType: vw.ol3.BasemapType.GRAPHIC // 일반지도 // vw.ol3.BasemapType.PHOTO_HYBRID -> 위성 하이브리드 
			, controlDensity: vw.ol3.DensityType.STANDARD // EMPTY -> STANDARD 
			, interactionDensity: vw.ol3.DensityType.BASIC
			, controlsAutoArrange: true
			, homePosition: vw.ol3.CameraPosition
			, initPosition: vw.ol3.CameraPosition
	}; 
			  
	baseMap = new vw.ol3.Map("baseMap",  vw.ol3.MapOptions);
	
	// 지적편집도 줌 가이드 생성 
	const hintEl = document.createElement('div');
	hintEl.style.cssText =
		'position:absolute;bottom:12px;right:12px;z-index:1000;' +
		'background:#fff;border:1px solid #ddd;border-radius:6px;' +
		'padding:8px 10px;font:13px sans-serif;';
	hintEl.style.display = 'none'; // 처음엔 숨기기 
	
	// 지적편집도 줌 가이드 위치 설정 
	const mapBox = document.getElementById('baseMap'); 
	mapBox.style.position = 'relative';  // 부모 기준점
	mapBox.appendChild(hintEl);

	function refreshHint(){
		if (!cadWfsClick) {            // 체크 꺼지면(충분한 줌 레벨에 도달 시 )
			hintEl.style.display = 'none'; // 무조건 숨김
			return;
		}
		const z = baseMap.getView().getZoom();
		hintEl.innerHTML = `지적 조회는 <b>줌 레벨 17 이상</b>에서 가능합니다.<br>현재 줌 레벨: ${z}`;
		if (z >= 17) hintEl.style.display = 'none';
		else hintEl.style.display = 'block';
	}
	baseMap.getView().on('change:resolution', refreshHint); // 배율 바뀌면 줌 레벨 다시 측정 
	refreshHint();

	
	
		// 연속지적도 WMS 레이어
		cadastreLayer = new ol.layer.Tile({
			visible: false,
			source: new ol.source.TileWMS({
				url : "gis/pnu.do",
				params : {
					'service':'WMS',
					'version':'1.3.0',
					'request':'GetMap',
					'layers':'lp_pa_cbnd_bubun',
					'crs': "EPSG:3857",
					'format': "image/png",
					'transparent': "true"
						},
				serverType: "mapserver",
			})
		});
		
		// 선택한 연속지적도(1개) WFS 레이어
		cadastreFeatLayer = new ol.layer.Vector({
		  visible: false,
		  source: new ol.source.Vector({
		    format: new ol.format.GeoJSON()
		  })
		});
		
		// 선택한 연속지적도(1개) 정보 레이어(WFS -> 폴리곤)  
		selectCadastreFeatLayer = new ol.layer.Vector({
			visible: false,
			style: highlightStyle,
			source: new ol.source.Vector({
		    	format: new ol.format.GeoJSON()
		  })
		});	
		
		baseMap.addLayer(cadastreFeatLayer);
		baseMap.addLayer(cadastreLayer);
		baseMap.addLayer(selectCadastreFeatLayer);
		
		cadastreLayer.setZIndex(12);
		cadastreFeatLayer.setZIndex(20);
		selectCadastreFeatLayer.setZIndex(21);
		
		let lastFetchTime = 0;

		// 마우스 움직임에 따라 폴리곤 호출 기능 
		baseMap.on('pointermove', function(evt) {
		 	// 호버 모드 안켜져 있으면 실행 X
			if (!hoverOn) return;
			const zoom = baseMap.getView().getZoom();
			if (zoom >= 17) {

			const now = Date.now();
			if (now - lastFetchTime < 200) return; // 서버 과부화 방지용, 호출 간격 조정 (현재 200ms 마다 호출)
			lastFetchTime = now;

			const [lon, lat] = evt.coordinate;
			
			fetch("/gis/pnufeat.do", {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: `x=${lon}&y=${lat}`
			})
			.then(res => res.json())
			.then(data => {
					
			const featureCollection = data.response.result.featureCollection; // GeoJson 형식 파싱 
				if (!featureCollection) {
					console.warn("featureCollection 없음:", data);
					return;
				} else {
					console.log("잘 보내고 있음 ");
				}

			const format = new ol.format.GeoJSON();
			const features = format.readFeatures(featureCollection);

			cadastreFeatLayer.getSource().clear(); // 이전 폴리곤 지우고 
			cadastreFeatLayer.getSource().addFeatures(features); // 그리고 
			cadastreFeatLayer.setVisible(true); // 보이게 하고 
				});
			}
		});
		
		const popup = document.getElementById('map-popup');
		const popupContent = document.getElementById('popup-content');
		
		const overlay = new ol.Overlay({
		    id: 'popup',
		    element: popup || undefined,
		    positioning: 'center-center',
		    autoPan: {
		        animation: {
		            duration: 250
		        }
		    }
		});
		
		baseMap.addOverlay(overlay);
	
		baseMap.on('singleclick', function(evt) {
			// 지적편집도 꺼져 있으면 실행 X
			if (!cadWfsClick) return; 
			const [lon, lat] = evt.coordinate;

			const zoom = baseMap.getView().getZoom();
			if (zoom >= 17) {
				fetch("/gis/pnufeat.do", {
					method: "POST",
					headers: { "Content-Type": "application/x-www-form-urlencoded" },
					body: `x=${lon}&y=${lat}` 
				})
					.then(res => res.json())
					.then(data => {
						console.log("응답 상태:", data.response.status);

						const featureCollection = data.response.result.featureCollection; // GeoJson 형식 파싱 
						const format = new ol.format.GeoJSON();
						const features = format.readFeatures(featureCollection);

						selectCadastreFeatLayer.getSource().clear(); // 이전 폴리곤 지우고 
						selectCadastreFeatLayer.getSource().addFeatures(features); // 그리고 
						selectCadastreFeatLayer.setVisible(true); // 보이게 하고 
						
						// json 응답 파싱 
						const props = data.response.result.featureCollection.features[0].properties; //properties가 features 배열 안에 있음 
						// properties 가 있을 경우만 팝업 띄우기 
						if (props) {
							var contentHtml = `
											<b>주소:</b> ${props.addr}<br>
											<b>지번:</b> ${props.jibun}<br>
											<b>공시지가:</b> ${Number(props.jiga).toLocaleString()}원<br>
											<b>고시연도:</b> ${props.gosi_year}년 ${props.gosi_month}월
											<hr>
											<div class="popup-closer">
												<b><button id="btn-popup-closer">닫기</button><b>
											</div>
											`;

							popupContent.innerHTML = contentHtml; // 내용 팝업에 삽입 
							overlay.setPosition(evt.coordinate); // 해당 죄표에 띄우도록 위치 설정 
							overlay.setPositioning('top-center');
							
							// 팝업 닫기 버튼 이벤트리스터 넣기 
							const popupClose = document.getElementById("btn-popup-closer");
							popupClose.addEventListener('click',() => {
								overlay.setPosition(undefined); // 팝업 닫기 -> 위치 해제로 삭제와 같은 효과 
								selectCadastreFeatLayer.getSource().clear(); // 선택한 레이어도 삭제 
							})
						}
						else return;
					});
			};
		});
		
		

		/*setTimeout(function() { //맵 다 그리고 2000ms 뒤에 버튼 추가 
			
			// 브이월드 new vw.ol3.control.Toolbar를 사용하면
			// <div id="vw-collapsible" style="position: absolute; z-index: 100; inset: 0px;">
			// 위 요소가 화면을 다 덮어서 컨트롤이 먹통이 됨  -> 개별 버튼 구현하기로 결정 
			
			
			var toolbar = new vw.ol3.control.Toolbar({
				map: baseMap,
				//vertical: true // true 수직, false 수평  
			});
			
			var panButton = new vw.ol3.button.Pan({map: baseMap});
			var distanceButton = new vw.ol3.button.Distance({map: baseMap});
			var areaButton = new vw.ol3.button.Area({map: baseMap});
			
			//ol.Collection<vw.ol3.control.ToolButton>buttons
			// 	ToolBar의 버튼을 담는 컬렉션	, 컬렉션 사용 이유: ToolButton 관리
			var toolBtnCollection = new ol.Collection([
				//initButton
				panbutton
			]);
			
			// 	addToolButtons(toolButtonArray)
			//toolbar.addToolButtons(toolBtnCollection);

			// 툴바 컨트롤 베이스맵에 추가 
			baseMap.addControl(toolbar);
		}, 2000
		);*/

}

	