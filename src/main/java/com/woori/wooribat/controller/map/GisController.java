package com.woori.wooribat.controller.map;

import java.net.URI;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.woori.wooribat.model.dto.map.FarmlandDto;
import com.woori.wooribat.service.map.FarmlandService;

@Controller
public class GisController {

	@Autowired
	private FarmlandService farmlandService;

	@GetMapping("/gis")
	public String gismove() {
		return "mainMap";
	}

	@ResponseBody
	@GetMapping("/gis/pnu")
	public ResponseEntity<byte[]> loadPnuLayer(@RequestParam("BBOX") String bbox, @RequestParam("WIDTH") String width, @RequestParam("HEIGHT") String height) {
		RestTemplate restTemplate = new RestTemplate();
		URI uri = UriComponentsBuilder
	            .fromUriString("https://api.vworld.kr/req/wms")
	            .queryParam("service", "WMS")
	            .queryParam("request", "GetMap")
	            .queryParam("version", "1.3.0")
	            .queryParam("layers", "lp_pa_cbnd_bubun")  
	            .queryParam("styles", "lp_pa_cbnd_bubun_line")
	            .queryParam("crs", "EPSG:3857")
	            .queryParam("bbox", bbox)
	            .queryParam("width", width)
	            .queryParam("height", height)
	            .queryParam("format", "image/png")
	            .queryParam("transparent", "true")
	            .queryParam("key", "8E952DFB-FFDE-33E3-BA8A-3D78FF78B6CC")
	            .queryParam("domain", "http://localhost:8080")
	            .encode()
	            .build()
	            .toUri();

	    byte[] imageBytes = restTemplate.getForObject(uri, byte[].class);

	    return ResponseEntity.ok()
	            .header("Content-Type", "image/png")
	            .body(imageBytes);
	}

	@ResponseBody
	@PostMapping(value = "/gis/pnufeat",
		    	 produces = "application/json; charset=UTF-8")
	public String loadPnuFeatLayer(double x, double y) {

		RestTemplate restTemplate = new RestTemplate();

		URI uri = UriComponentsBuilder
				.fromUriString("https://api.vworld.kr")
				.path("/req/data")
				.queryParam("service", "data")
				.queryParam("request", "GetFeature")
				.queryParam("data", "LP_PA_CBND_BUBUN")
				.queryParam("key", "8E952DFB-FFDE-33E3-BA8A-3D78FF78B6CC")
				.queryParam("domain", "http://localhost:8080")
				.queryParam("geomFilter", "POINT(" + x + " " + y + ")" )
				.queryParam("crs", "EPSG:3857")
				.queryParam("format", "json")
				.encode()
				.build()
				.toUri();


		return restTemplate.getForObject(uri, String.class);
	}

	@ResponseBody
	@GetMapping("/gis/farm")
	public ResponseEntity<byte[]> loadFarmLayer(
			@RequestParam("BBOX") String bbox,
			@RequestParam("WIDTH") String width,
			@RequestParam("HEIGHT") String height) {

		RestTemplate restTemplate = new RestTemplate();

		URI uri = UriComponentsBuilder
	            .fromUriString("http://localhost:9090/geoserver/board/wms")
	            .queryParam("service", "WMS")
	            .queryParam("version", "1.1.0")
	            .queryParam("request", "GetMap")
	            .queryParam("layers", "board:farmland_master")
	            .queryParam("styles", "")
	            .queryParam("format", "image/png")
	            .queryParam("transparent", "true")
	            .queryParam("crs", "EPSG:3857")
	            .queryParam("bbox", bbox)
	            .queryParam("width", width)
	            .queryParam("height", height)
	            .encode()
	            .build()
	            .toUri();

		byte[] imageBytes = restTemplate.getForObject(uri, byte[].class);

		return ResponseEntity.ok()
				.header("Content-Type", "image/png")
				.body(imageBytes);
	}

	@ResponseBody
	@PostMapping(value = "/gis/farmfeat",
		    	 produces = "application/json; charset=UTF-8")
	public Map<String, Object> loadFarmFeatLayer(double x, double y) {

		Map<String, Object> result = new HashMap<>();

		try {
			FarmlandDto farmland = farmlandService.getFarmlandByPoint(x, y);

			if (farmland == null) {
				result.put("status", "EMPTY");
				result.put("message", "해당 위치에 농지가 없습니다.");
				return result;
			}

			Map<String, Object> properties = new HashMap<>();
			properties.put("id", farmland.getId());
			properties.put("pnu", farmland.getPnu());
			properties.put("landCd", farmland.getLandCd());
			properties.put("landCdNm", farmland.getLandCdNm());
			properties.put("stdgAddr", farmland.getStdgAddr());
			properties.put("flAr", farmland.getFlAr());
			properties.put("flightYmd", farmland.getFlightYmd());

			ObjectMapper objectMapper = new ObjectMapper();
			Map<String, Object> geometry = objectMapper.readValue(
				farmland.getGeomGeoJson(),
				Map.class
			);

			Map<String, Object> feature = new HashMap<>();
			feature.put("type", "Feature");
			feature.put("geometry", geometry);
			feature.put("properties", properties);

			Map<String, Object> featureCollection = new HashMap<>();
			featureCollection.put("type", "FeatureCollection");
			featureCollection.put("features", Collections.singletonList(feature));

			result.put("status", "OK");
			result.put("featureCollection", featureCollection);

		} catch (Exception e) {
			e.printStackTrace();
			result.put("status", "ERROR");
			result.put("message", "농지 조회 오류");
		}

		return result;
	}
	
}
