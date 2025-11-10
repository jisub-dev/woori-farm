package com.woori.wooribat.controller.map;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Controller
public class GisController {
	@GetMapping("/gis.do")
	public String gismove() {
		return "mainMap";
	}
	
	// 연속지적도 WMS 레이어 (노란색)
	@ResponseBody
	@GetMapping("/gis/pnu.do")
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
	
	// 연속지적도 WFS 선택시 정보 요청 
	@ResponseBody
	@PostMapping(value = "/gis/pnufeat.do",
		    	 produces = "application/json; charset=UTF-8") // 응답 json 폰트 깨짐 방지 
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
}
