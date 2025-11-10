var baseMap;
var satelliteLayer;
var doLayer;
var RDZLayer;
var cadastreFeatLayer;
var cadastreLayer;
var selectCadastreFeatLayer;

var selectPointerMove;
var mapCenter = { x: 956498.5710969, y: 1939967.0629328 };

//베이스맵
$(document).ready(function(){
	 initMap();

const showDoCheck = document.getElementById("showDoCheck");
showDoCheck.addEventListener("change", () => {
	if (showDoCheck.checked) {
		doLayer.setVisible(true);
	}
	else {
		doLayer.setVisible(false);
	}
})

const showRDZCheck = document.getElementById("showRDZCheck");
showRDZCheck.addEventListener("change", () => {
	if (showRDZCheck.checked) {
		RDZLayer.setVisible(true);
	}
	else {
		RDZLayer.setVisible(false);
	}
})

const showCadastreCheck = document.getElementById("showCadastreCheck");
showCadastreCheck.addEventListener("change", () => {
	if (showCadastreCheck.checked) {
		satelliteLayer.setVisible(true);
		cadastreFeatLayer.setVisible(true);
		cadastreLayer.setVisible(true);
		selectCadastreFeatLayer.setVisible(true);
		
	}
	else {
		satelliteLayer.setVisible(false);
		cadastreFeatLayer.setVisible(false);
		cadastreLayer.setVisible(false);
		selectCadastreFeatLayer.setVisible(false);

	}
})

});

const highlightStyle = new ol.style.Style({
	  stroke: new ol.style.Stroke({
	    color: 'white',
	    width: 2
	  }),
	  fill: new ol.style.Fill({
	    color: 'rgba(0,0,255,0.6)'
	  })
	});

function initMap(){
	//뷰(좌표 및 줌 설정)
	proj4.defs("EPSG:5179", "+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
	ol.proj.proj4.register(proj4);
	var proj5179 = ol.proj.get('EPSG:5179');
	var resolutions = [125094.232896, 62547.116448, 31273.558224, 15636.779112, 7818.389556, 3909.194778, 1954.597389, 977.2986945, 488.6493472, 244.3246736, 122.1623368, 61.08116841, 30.5405842, 15.2702921, 7.635146051, 3.817573025, 1.908786513];
	var tileExtent = [-200000.0, -28024123.62, 31824123.62, 4000000.0];
	var initExtent = [18321.13581588259, 1424794.937360047, 1894734.6292558827, 2214452.282516047];
	var initBasemapType = "BASEMAP_RLTM"
	var minZoomLevel = 0;
	var maxZoomLevel = 13; // 논 크기 적정 
	var feature = null;
	var view =  new ol.View({
				projection: proj5179,
				extent: tileExtent,
				center: [mapCenter.x, mapCenter.y ],
				zoom: 7,
				minZoom: minZoomLevel,
				maxZoom: maxZoomLevel,
				maxResolution: 1954.597389
	});


	//베이스맵 설정
	baseMap = new ol.Map({
		target: 'baseMap',
		layers: [
			new ol.layer.Tile({
				division: 'TILE',
				layerName: 'BASEMAP',
				visible: true,

				source: new ol.source.TileWMS({
					matrixSet: 'EPSG:5179',
					projection: 'EPSG:5179',
					hidpi: false,
					tileGrid: new ol.tilegrid.TileGrid({
						extent: tileExtent,
						origin: [tileExtent[0], tileExtent[1]],
						resolutions: resolutions
					}),
					url: _vectorMapUrl,
					serverType: "mapserver"
				})
			})
		],
		controls: ol.control.defaults({
			attributionOptions: ({
				collapsible: false
			})
		}),
		view: view
	});

	
	// 위성 레이어
	satelliteLayer = new ol.layer.Tile({
	    visible: false,
	    source: new ol.source.XYZ({
	      url: "https://xdworld.vworld.kr/2d/Satellite/service/{z}/{x}/{y}.jpeg"
		  		+ "?apiKey=8E952DFB-FFDE-33E3-BA8A-3D78FF78B6CC"
		        + "&domain=http://localhost:8080",
	      crossOrigin: "anonymous"
	    })
	  });

	
	
	doLayer = new ol.layer.Tile({
		visible: false,
		source : new ol.source.TileWMS({
			url : "http://localhost:9090/geoserver/board/wms",
			params : {
				'service':'WMS',
				'version':'1.1.0',
				'request':'GetMap',
				'layers':'board:do_layer',
				'bbox':'746110.25%2C1458754.0%2C1387949.625%2C2068444.0',
				'width':'768',
				'height':'729',
				'srs':'EPSG:5179', // 원래 EPSG:404000, 하지만 현재 5179 잘 적용되므로 놔둠
				'format':'image/png'
			},
			serverType : 'geoserver',
		})
	});
	
	RDZLayer = new ol.layer.Tile({
		visible:false,
		source : new ol.source.TileWMS({
			url : "http://localhost:9090/geoserver/board/wms",
			params : {
				'service':'WMS',
				'version':'1.1.0',
				'request':'GetMap',
				'layers':'board:RDZ',
				'bbox':'935035.2321307088%2C1936665.5597336835%2C970073.811095744%2C1966987.1602504407',
				'width':'768',
				'height':'664',
				'srs':'EPSG:5179',
				'format':'image/png'
			},
			serverType : 'geoserver',
		})
	});
	
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
				'crs': "EPSG:5179",
				'format': "image/png",
				'transparent': "true"
					},
			serverType: "mapserver",
		})
	});
	
	// 연속지적도 WFS 레이어
	cadastreFeatLayer = new ol.layer.Vector({
	  visible: false,
	  source: new ol.source.Vector({
	    format: new ol.format.GeoJSON()
	  })
	});
	
	// 연속지적도 선택 레이어(WFS -> 폴리곤)
	selectCadastreFeatLayer = new ol.layer.Vector({
		visible: false,
		style: highlightStyle,
		source: new ol.source.Vector({
	    	format: new ol.format.GeoJSON()
	  })
	});	
	
	baseMap.addLayer(satelliteLayer);
	baseMap.addLayer(doLayer);
	baseMap.addLayer(RDZLayer);
	baseMap.addLayer(cadastreFeatLayer);
	baseMap.addLayer(cadastreLayer);
	baseMap.addLayer(selectCadastreFeatLayer);

	
	satelliteLayer.setZIndex(1);
	doLayer.setZIndex(10);
	RDZLayer.setZIndex(11);
	cadastreLayer.setZIndex(12);
	cadastreFeatLayer.setZIndex(20);
	selectCadastreFeatLayer.setZIndex(21);
 	
	let lastFetchTime = 0;

	baseMap.on('pointermove', function(evt) {
		const now = Date.now();
		if (now - lastFetchTime < 200) return; // 서버 과부화 방지용, 호출 간격 조정 (현재 200ms 마다 호출)
		lastFetchTime = now;

		const [mx, my] = evt.coordinate;
		const coord4326 = ol.proj.transform([mx, my], 'EPSG:5179', 'EPSG:4326');
		const [lon, lat] = coord4326;

		console.log("요청 좌표 (4326):", lon, lat);

		const zoom = baseMap.getView().getZoom();
		if (zoom >= 8) {
			fetch("/gis/pnufeat.do", {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: `x=${lon}&y=${lat}` // 4326 좌표로 전달
			})
				.then(res => res.json())
				.then(data => {
					//console.log("응답 상태:", data.response.status);

					const featureCollection = data.response.result.featureCollection; // GeoJson 형식 파싱 
					if (!featureCollection) {
						console.warn("featureCollection 없음:", data);
						return;
					} else {
						console.log("잘 보내고 있음 ");
					}

					const format = new ol.format.GeoJSON();
					const features = format.readFeatures(featureCollection, {
						dataProjection: "EPSG:4326",   // 응답 좌표계
						featureProjection: "EPSG:5179" // 지도 좌표계
					});

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
		const [mx, my] = evt.coordinate;
		const coord4326 = ol.proj.transform([mx, my], 'EPSG:5179', 'EPSG:4326');
		const [lon, lat] = coord4326;

		console.log("요청 좌표 (4326):", lon, lat);

		const zoom = baseMap.getView().getZoom();
		if (zoom >= 8) {
			fetch("/gis/pnufeat.do", {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: `x=${lon}&y=${lat}` // 4326 좌표로 전달
			})
				.then(res => res.json())
				.then(data => {
					console.log("응답 상태:", data.response.status);

					const featureCollection = data.response.result.featureCollection; // GeoJson 형식 파싱 
					const format = new ol.format.GeoJSON();
					const features = format.readFeatures(featureCollection, {
						dataProjection: "EPSG:4326",   // 응답 좌표계
						featureProjection: "EPSG:5179" // 지도 좌표계
					});

					selectCadastreFeatLayer.getSource().clear(); // 이전 폴리곤 지우고 
					selectCadastreFeatLayer.getSource().addFeatures(features); // 그리고 
					selectCadastreFeatLayer.setVisible(true); // 보이게 하고 
					console.log("그렸");
					
					// json 응답 파싱 
					const props = data.response.result.featureCollection.features[0].properties; //properties가 features 배열 안에 있음 
					// properties 가 있을 경우만 팝업 띄우기 
					if (props) {
						var contentHtml = `
											        <b>주소:</b> ${props.addr}<br>
											        <b>지번:</b> ${props.jibun}<br>
											        <b>공시지가:</b> ${Number(props.jiga).toLocaleString()}원<br>
											        <b>고시연도:</b> ${props.gosi_year}년 ${props.gosi_month}월
											      `;



						popupContent.innerHTML = contentHtml; // 내용 팝업에 삽입 
						overlay.setPosition(evt.coordinate); // 해당 죄표에 띄우도록 위치 설정 
						overlay.setPositioning('top');
					}
					else return;


				});
		};
	});

	  
	
	
}	

//베이스맵 요청 시 사용
function fn_fillzero(n, digits) {
	var zero = '';
	n = n.toString();
	if (digits > n.length) {
		for (var i = 0; digits - n.length > i; i++) {
			zero += '0';
		}
	}
	return zero + n;
}



