var map;
var switchMap;

// 마우스 호버 모드 (기본값 : 끄기)
var hoverOn = false;

// 지적편집도 클릭 이벤트 (기본값 : 끄기)
var cadWfsClick = false;

/**
 * Currently drawn feature.
 * @type {import('ol/Feature.js').default}
 */
let sketch;

/**
 * The help tooltip element.
 * @type {HTMLElement}
 */
let helpTooltipElement;

/**
 * Overlay to show the help messages.
 * @type {Overlay}
 */
let helpTooltip;

/**
 * The measure tooltip element.
 * @type {HTMLElement}
 */
let measureTooltipElement;

/**
 * Overlay to show the measurement.
 * @type {Overlay}
 */
let measureTooltip;

// 그려서 거리재기, 면적재기 (기본값 : false)
var drawLine = false;
var drawPoly = false;


/**
 * Message to show when the user is drawing a polygon.
 * @type {string}
 */
const continuePolygonMsg = '클릭하여 도형을 그리세요(더블클릭으로 멈추기)';

/**
 * Message to show when the user is drawing a line.
 * @type {string}
 */
const continueLineMsg = '클릭하여 라인을 그리기(더블클릭으로 멈추기)';

$(document).ready(function() {
	initMap();
	initNavigation();
})

// 네비게이션 메뉴 초기화
function initNavigation() {
	const panelLayout = document.querySelector('.panel-layout');
	const navItems = document.querySelectorAll('.nav-item');

	console.log('패널:', panelLayout);
	console.log('메뉴 개수:', navItems.length);

	// 페이지 로드 시 패널 숨기기 (지도 홈이 기본 활성화)
	if (panelLayout) {
		panelLayout.style.display = 'none';
		console.log('초기 패널 숨김');
	}

	navItems.forEach((item, index) => {
		const link = item.querySelector('.nav-link');
		link.addEventListener('click', (e) => {
			e.preventDefault();
			console.log('메뉴 클릭:', index);

			// 모든 메뉴에서 active 제거
			navItems.forEach(nav => nav.classList.remove('active'));

			// 클릭한 메뉴에 active 추가
			item.classList.add('active');

			// 첫 번째 메뉴(지도 홈)일 때 패널 숨김, 나머지는 보임
			if (index === 0) {
				panelLayout.style.display = 'none';
				console.log('패널 숨김');
			} else {
				panelLayout.style.display = 'block';
				console.log('패널 표시');
			}
		});
	});
}




function initMap() {

	// 일반지도 레이어
	const baseLayer = new ol.layer.Tile({
		source: new ol.source.XYZ({
			url: 'https://api.vworld.kr/req/wmts/1.0.0/8E952DFB-FFDE-33E3-BA8A-3D78FF78B6CC/Base/{z}/{y}/{x}.png'
		})
	});

	// 위성지도 레이어
	const satelliteLayer = new ol.layer.Tile({
		visible: false,
		source: new ol.source.XYZ({
			url: 'https://api.vworld.kr/req/wmts/1.0.0/8E952DFB-FFDE-33E3-BA8A-3D78FF78B6CC/Satellite/{z}/{y}/{x}.jpeg'
		})
	});

	// 위성 하이브리드 레이어 (라벨)
	const hybridLayer = new ol.layer.Tile({
		visible: false,
		source: new ol.source.XYZ({
			url: 'https://api.vworld.kr/req/wmts/1.0.0/8E952DFB-FFDE-33E3-BA8A-3D78FF78B6CC/Hybrid/{z}/{y}/{x}.png'
		})
	});

	// 일반지도 선택시
	const switchMapGra = document.getElementById("btn_gra");
	switchMapGra.addEventListener("click", () => {
		baseLayer.setVisible(true);
		satelliteLayer.setVisible(false);
		hybridLayer.setVisible(false);
		switchMapGra.disabled = true;
		switchMapPho.disabled = false;
		switchMapGra.classList.add("active");
		switchMapPho.classList.remove("active");
	});
	// 위성지도 선택시
	const switchMapPho = document.getElementById("btn_pho");
	switchMapPho.addEventListener("click", () => {
		baseLayer.setVisible(false);
		satelliteLayer.setVisible(true);
		hybridLayer.setVisible(true);
		switchMapPho.disabled = true;
		switchMapGra.disabled = false;
		switchMapGra.classList.remove("active");
		switchMapPho.classList.add("active");
	});
	
	// 지적편집도 WFS, 클릭 이벤트 On/Off
	const addCadstreLayer = document.getElementById("chAddCada");
	addCadstreLayer.addEventListener("click", () => {
		cadWfsClick = !cadWfsClick; // 토글
		addCadstreLayer.setAttribute('aria-pressed', cadWfsClick);

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

	// 마우스 오버 이벤트 on/off
	const mousehovermode = document.getElementById("chAddHover");
	mousehovermode.addEventListener("click", () => {
		hoverOn = !hoverOn; // 토글
		mousehovermode.setAttribute('aria-pressed', hoverOn);

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
		

	var vectorSource = new ol.source.Vector({
		projection: 'EPSG:3857'
	})
	const drawVector = new ol.layer.Vector({
		source: vectorSource,
		style: {
			'fill-color': 'rgba(255, 255, 255, 0.2)',
			'stroke-color': '#ffcc33',
			'stroke-width': 2,
			'circle-radius': 7,
			'circle-fill-color': '#ffcc33',
		},
	});

	// 거리 재기 기능
	const pointerMoveHandler = function(evt) {
		if (!(drawLine || drawPoly)) { // 거리재기 기능 선택안하면  못그림
			return;
		}
		if (evt.dragging) { // 드래그 중이면 무시
			return;
		}

		// helpTooltipElement가 생성되지 않았으면 실행하지 않음
		if (!helpTooltipElement || !helpTooltip) {
			return;
		}

		let helpMsg = '클릭하여 그리기'; // 기본 안내 메시지

		if (sketch) {
			const geom = sketch.getGeometry();
			if (geom instanceof ol.geom.Polygon) {
				helpMsg = continuePolygonMsg;
			} else if (geom instanceof ol.geom.LineString) {
				helpMsg = continueLineMsg;
			}
		}

		helpTooltipElement.innerHTML = helpMsg;
		helpTooltip.setPosition(evt.coordinate);

		helpTooltipElement.classList.remove('hidden');
	};
	
		
	


	// Map 설정 (순수 OpenLayers)
	map = new ol.Map({
		target: 'map',
		layers: [
			baseLayer,
			satelliteLayer,
			hybridLayer
		],
		view: new ol.View({
			center: ol.proj.fromLonLat([126.65, 35.97]), // 군산 좌표
			zoom: 17,
			projection: 'EPSG:3857'
		})
	});
	
	// 지적편집도 줌 가이드 생성 
	const hintEl = document.createElement('div');
	hintEl.style.cssText =
		'position:absolute;bottom:12px;right:12px;z-index:1000;' +
		'background:#fff;border:1px solid #ddd;border-radius:6px;' +
		'padding:8px 10px;font:13px sans-serif;';
	hintEl.style.display = 'none'; // 처음엔 숨기기 
	
	// 지적편집도 줌 가이드 위치 설정 
	const mapBox = document.getElementById('map'); 
	mapBox.style.position = 'relative';  // 부모 기준점
	mapBox.appendChild(hintEl);

	function refreshHint(){
		if (!cadWfsClick) {            // 체크 꺼지면(충분한 줌 레벨에 도달 시 )
			hintEl.style.display = 'none'; // 무조건 숨김
			return;
		}
		const z = Math.round(map.getView().getZoom());
		hintEl.innerHTML = `지적 조회는 <b>줌 레벨 18 이상</b>에서 가능합니다.<br>현재 줌 레벨: ${z}`;
		if (z >= 18) hintEl.style.display = 'none';
		else hintEl.style.display = 'block';
	}
	map.getView().on('change:resolution', refreshHint); // 배율 바뀌면 줌 레벨 다시 측정
	refreshHint();



	// 연속지적도 WMS 레이어
	cadastreLayer = new ol.layer.Tile({
		visible: false,
		source: new ol.source.TileWMS({
			url: "gis/pnu.do",
			params: {
				'service': 'WMS',
				'version': '1.3.0',
				'request': 'GetMap',
				'layers': 'lp_pa_cbnd_bubun',
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

	map.addLayer(cadastreFeatLayer);
	map.addLayer(cadastreLayer);
	map.addLayer(selectCadastreFeatLayer);
	map.addLayer(drawVector);

	cadastreLayer.setZIndex(12);
	cadastreFeatLayer.setZIndex(20);
	selectCadastreFeatLayer.setZIndex(21);

	let lastFetchTime = 0;

	// 마우스 움직임에 따라 폴리곤 호출 기능
	map.on('pointermove', function(evt) {
		// 호버 모드 안켜져 있으면 실행 X
		if (!hoverOn) return;
		const zoom = map.getView().getZoom();
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

	map.addOverlay(overlay);

	map.on('singleclick', function(evt) {
		// 지적편집도 꺼져 있으면 실행 X
		if (!cadWfsClick) return;
		const [lon, lat] = evt.coordinate;

		const zoom = map.getView().getZoom();
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
						popupClose.addEventListener('click', () => {
							overlay.setPosition(undefined); // 팝업 닫기 -> 위치 해제로 삭제와 같은 효과 
							selectCadastreFeatLayer.getSource().clear(); // 선택한 레이어도 삭제 
						})
					}
					else return;
				});
		};
	});

		// 거리 재기 기능 
		map.on('pointermove', pointerMoveHandler);

		map.getViewport().addEventListener('mouseout', function () {
		  if (helpTooltipElement) {
		    helpTooltipElement.classList.add('hidden');
		  }
		});
	
		

		/**
		 * Format length output.
		 * @param {LineString} line The line.
		 * @return {string} The formatted length.
		 */
		const formatLength = function (line) {
		  const length = ol.sphere.getLength(line);
		  let output;
		  if (length > 100) {
		    output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
		  } else {
		    output = Math.round(length * 100) / 100 + ' ' + 'm';
		  }
		  return output;
		};

		/**
		 * Format area output.
		 * @param {Polygon} polygon The polygon.
		 * @return {string} Formatted area.
		 */
		const formatArea = function (polygon) {
		  const area = ol.sphere.getArea(polygon);
		  let output;
		  let mSquare = Math.round(area * 100) / 100; 
		  if (area > 10000) {
		    output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>' + ' (' + Math.round(mSquare / 3.30579) + '평)';
		  } else {
		    output = mSquare + ' ' + 'm<sup>2</sup>' + ' (' + Math.round(mSquare / 3.30579) + '평)';
		  }
		  return output;
		};

		const style = new ol.style.Style({
		  fill: new ol.style.Fill({
		    color: 'rgba(255, 255, 255, 0.2)',
		  }),
		  stroke: new ol.style.Stroke({
		    color: 'rgba(0, 0, 0, 0.5)',
		    lineDash: [0, 0],
		    width: 2,
		  }),
		  image: new ol.style.Circle({
		    radius: 5,
		    stroke: new ol.style.Stroke({
		      color: 'rgba(0, 0, 0, 0.7)',
		    }),
		    fill: new ol.style.Fill({
		      color: 'rgba(255, 255, 255, 0.2)',
		    }),
		  }),
		});

		
	// 거리, 면적 재기 타입 선택
	const chLength = document.getElementById('chLength');
	const chArea = document.getElementById('chArea');

	let draw; // global so we can remove it later


	// 거리 재기 버튼 클릭시
	chLength.addEventListener('click', () => {
		drawLine = !drawLine; // 토글
		chLength.setAttribute('aria-pressed', drawLine);

		if (drawLine) {
			// 면적 재기 해제
			drawPoly = false;
			chArea.setAttribute('aria-pressed', false);

			// 이전에 있던 그리는 도구 지우기
			if (draw) map.removeInteraction(draw);

			// 거리 재기 시작
			addInteraction('LineString');
		} else {
			// 이전에 있던 그리는 도구 지우기
			if (draw) map.removeInteraction(draw);
			// 마우스 옆 툴팁헬퍼 지우기
			if (helpTooltipElement) {
				helpTooltipElement.remove();
			}
		}
	});

	// 면적 재기 버튼 클릭시
	chArea.addEventListener('click', () => {
		drawPoly = !drawPoly; // 토글
		chArea.setAttribute('aria-pressed', drawPoly);

		if (drawPoly) {
			// 거리 재기 해제
			drawLine = false;
			chLength.setAttribute('aria-pressed', false);

			// 이전에 있던 그리는 도구 지우기
			if (draw) map.removeInteraction(draw);

			// 면적 재기 시작
			addInteraction('Polygon');
		} else {
			// 이전에 있던 그리는 도구 지우기
			if (draw) map.removeInteraction(draw);
			// 마우스 옆 툴팁헬퍼 지우기
			if (helpTooltipElement) {
				helpTooltipElement.remove();
			}
		}
	});


	function addInteraction(type) {
		draw = new ol.interaction.Draw({
			source: vectorSource, // 그린 도형이 저장되는 벡터 소스 
			type: type, // LineString or Polygon
			style: function(feature) { // 그리는 동안 스타일 
				const geometryType = feature.getGeometry().getType();
				if (geometryType === type || geometryType === 'Point') { 
					return style; // style 반환 
				}
			},
		});

		map.addInteraction(draw);  // 맵에 draw interaction 추가

		createMeasureTooltip(); // 수치 팝업 
		createHelpTooltip(); // 마우스 옆에 도움말 

		let listener;
		//그리기 시작 이벤트 
		draw.on('drawstart', function(evt) {
			// set sketch
			sketch = evt.feature;

			let tooltipCoord;

			listener = sketch.getGeometry().on('change', function(evt) { 
				const geom = evt.target;
				let output;
				if (geom instanceof ol.geom.Polygon) { // 이벤트 타겟이 폴리곤일때 
					output = formatArea(geom); // 면적 계산 
					tooltipCoord = geom.getInteriorPoint().getCoordinates(); // 위치 대입 
				} else if (geom instanceof ol.geom.LineString) { // 이벤트 타겟이 라인일때 
					output = formatLength(geom); // 거리 계산 
					tooltipCoord = geom.getLastCoordinate(); // 위치 대입 
				}
				measureTooltipElement.innerHTML = output; // 팝업 내용 채우기 (수치 표기)
				measureTooltip.setPosition(tooltipCoord); // 팝업 위치 
			});
			
			
		});

		// 그리기 완료 이벤트 (더블클릭)
		draw.on('drawend', function(evt) {

			const feature = evt.feature;
			const currentElement = measureTooltipElement;
			const currentOverlay = measureTooltip;

			// X 버튼 추가
			currentElement.innerHTML += '<a id="popup-closer" class="ol-popup-closer"></a>';

			// 해당 DIV 다켓방법
			let oElem = currentOverlay.getElement();
			oElem.addEventListener('click', function(e) {
				var target = e.target;
				if (target.className == "ol-popup-closer") {
					//선택한 OverLayer 삭제
					map.removeOverlay(currentOverlay);
					// 해당 벡터데이터도 삭제 
					vectorSource.removeFeature(feature);

				}
			});

			measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
			measureTooltip.setOffset([0, -7]);
			// unset sketch
			sketch = null;
			// unset tooltip so that a new one can be created
			measureTooltipElement = null;
			createMeasureTooltip(); //새 측정을 위한 툴팁 생성 
			ol.Observable.unByKey(listener); // 이벤트 리스너 해제 	


		});
	}

		/**
		 * Creates a new help tooltip
		 */
		function createHelpTooltip() {
		  if (helpTooltipElement) {
		    helpTooltipElement.remove();
		  }
		  helpTooltipElement = document.createElement('div');
		  helpTooltipElement.className = 'ol-tooltip hidden';
		  helpTooltip = new ol.Overlay({
		    element: helpTooltipElement,
		    offset: [15, 0],
		    positioning: 'center-left',
		  });
		  map.addOverlay(helpTooltip);
		}

		/**
		 * Creates a new measure tooltip
		 */
		function createMeasureTooltip() {
		  if (measureTooltipElement) {
		    measureTooltipElement.remove();
		  }
		  measureTooltipElement = document.createElement('div');
		  measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
		  measureTooltip = new ol.Overlay({
		    element: measureTooltipElement,
		    offset: [0, -15],
		    positioning: 'bottom-center',
		    stopEvent: false,
		    insertFirst: false,
		  });
		  map.addOverlay(measureTooltip);
		}

		/**
		 * Let user change the geometry type.
		 */
		/*typeSelect.onchange = function () {
		  map.removeInteraction(draw);
		  addInteraction();
		};*/

	// 채널톡 
	 (function(){var w=window;if(w.ChannelIO){return w.console.error("ChannelIO script included twice.");}var ch=function(){ch.c(arguments);};ch.q=[];ch.c=function(args){ch.q.push(args);};w.ChannelIO=ch;function l(){if(w.ChannelIOInitialized){return;}w.ChannelIOInitialized=true;var s=document.createElement("script");s.type="text/javascript";s.async=true;s.src="https://cdn.channel.io/plugin/ch-plugin-web.js";var x=document.getElementsByTagName("script")[0];if(x.parentNode){x.parentNode.insertBefore(s,x);}}if(document.readyState==="complete"){l();}else{w.addEventListener("DOMContentLoaded",l);w.addEventListener("load",l);}})();
	
	  ChannelIO('boot', {
	    "pluginKey": "b24f84e5-424d-49cc-ba18-547bfd387917"
	  });


}

// 사용자 드롭다운 토글
$(document).ready(function() {
	const userProfile = $('.user-profile');
	const userDropdown = $('.user-dropdown');

	// 사용자 프로필 클릭 시 드롭다운 토글
	userProfile.on('click', function(e) {
		e.stopPropagation();
		userDropdown.toggleClass('active');
	});

	// 외부 클릭 시 드롭다운 닫기
	$(document).on('click', function(e) {
		if (!userProfile.is(e.target) && userProfile.has(e.target).length === 0) {
			userDropdown.removeClass('active');
		}
	});

	// 줌 인 버튼
	$('.zoom-in').on('click', function() {
		const view = map.getView();
		const currentZoom = view.getZoom();
		view.animate({
			zoom: currentZoom + 1,
			duration: 250
		});
	});

	// 줌 아웃 버튼
	$('.zoom-out').on('click', function() {
		const view = map.getView();
		const currentZoom = view.getZoom();
		view.animate({
			zoom: currentZoom - 1,
			duration: 250
		});
	});

	// 현재 위치 버튼
	$('.btn-location').on('click', function() {
		const button = $(this);

		if (navigator.geolocation) {
			button.attr('aria-pressed', 'true');

			navigator.geolocation.getCurrentPosition(
				function(position) {
					const coords = ol.proj.fromLonLat([
						position.coords.longitude,
						position.coords.latitude
					]);

					map.getView().animate({
						center: coords,
						zoom: 18,
						duration: 500
					});

					button.attr('aria-pressed', 'false');
				},
				function(error) {
					alert('위치를 가져올 수 없습니다: ' + error.message);
					button.attr('aria-pressed', 'false');
				}
			);
		} else {
			alert('이 브라우저는 위치 서비스를 지원하지 않습니다.');
		}
	});
});

