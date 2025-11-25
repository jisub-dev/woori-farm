package com.woori.wooribat.controller.farm;

import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.woori.wooribat.model.dto.farm.FarmDto;
import com.woori.wooribat.model.dto.farm.FarmFolderDto;
import com.woori.wooribat.service.farm.FarmService;

@Controller
@RequestMapping("/api/farm")
public class FarmController {

	@Autowired
	private FarmService farmService;

	// 폴더 목록
	@GetMapping("/folders")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> getFarmFolders(HttpSession session) {
		Map<String, Object> response = new HashMap<>();

		try {
			String userId = (String) session.getAttribute("userId");
			if (userId == null) {
				response.put("success", false);
				response.put("message", "로그인이 필요합니다.");
				return ResponseEntity.ok(response);
			}

			List<FarmFolderDto> folders = farmService.getFarmFolders(userId);

			List<FarmDto> allFarms = farmService.getFarmsByUserId(userId);
			int unassignedCount = 0;
			for (FarmDto farm : allFarms) {
				if (farm.getFolderId() == null) {
					unassignedCount++;
				}
			}

			response.put("success", true);
			response.put("data", folders);
			response.put("unassignedCount", unassignedCount);
			return ResponseEntity.ok(response);

		} catch (Exception e) {
			e.printStackTrace();
			response.put("success", false);
			response.put("message", "폴더 조회에 실패했습니다.");
			return ResponseEntity.ok(response);
		}
	}

	// 폴더 상세
	@GetMapping("/folders/{id}")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> getFarmFolderById(@PathVariable Integer id) {
		Map<String, Object> response = new HashMap<>();

		try {
			FarmFolderDto folder = farmService.getFarmFolderById(id);
			if (folder == null) {
				response.put("success", false);
				response.put("message", "폴더를 찾을 수 없습니다.");
				return ResponseEntity.ok(response);
			}

			response.put("success", true);
			response.put("data", folder);
			return ResponseEntity.ok(response);

		} catch (Exception e) {
			e.printStackTrace();
			response.put("success", false);
			response.put("message", "폴더 조회에 실패했습니다.");
			return ResponseEntity.ok(response);
		}
	}

	// 폴더 추가
	@PostMapping("/folders")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> createFarmFolder(@RequestBody FarmFolderDto farmFolderDto,
			HttpSession session) {
		Map<String, Object> response = new HashMap<>();

		try {
			String userId = (String) session.getAttribute("userId");
			if (userId == null) {
				response.put("success", false);
				response.put("message", "로그인이 필요합니다.");
				return ResponseEntity.ok(response);
			}

			farmFolderDto.setUserId(userId);
			int result = farmService.createFarmFolder(farmFolderDto);

			if (result > 0) {
				response.put("success", true);
				response.put("message", "폴더가 생성되었습니다.");
				response.put("data", farmFolderDto);
				return ResponseEntity.ok(response);
			} else {
				response.put("success", false);
				response.put("message", "폴더 생성에 실패했습니다.");
				return ResponseEntity.ok(response);
			}

		} catch (Exception e) {
			e.printStackTrace();
			response.put("success", false);
			response.put("message", "폴더 생성에 실패했습니다.");
			return ResponseEntity.ok(response);
		}
	}

	// 폴더 수정
	@PutMapping("/folders/{id}")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> updateFarmFolder(@PathVariable Integer id,
			@RequestBody FarmFolderDto farmFolderDto) {
		Map<String, Object> response = new HashMap<>();

		try {
			farmFolderDto.setId(id);
			int result = farmService.updateFarmFolder(farmFolderDto);

			if (result > 0) {
				response.put("success", true);
				response.put("message", "폴더가 수정되었습니다.");
				return ResponseEntity.ok(response);
			} else {
				response.put("success", false);
				response.put("message", "폴더 수정에 실패했습니다.");
				return ResponseEntity.ok(response);
			}

		} catch (Exception e) {
			e.printStackTrace();
			response.put("success", false);
			response.put("message", "폴더 수정에 실패했습니다.");
			return ResponseEntity.ok(response);
		}
	}

	// 폴더 삭제
	@DeleteMapping("/folders/{id}")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> deleteFarmFolder(@PathVariable Integer id) {
		Map<String, Object> response = new HashMap<>();

		try {
			int result = farmService.deleteFarmFolder(id);

			if (result > 0) {
				response.put("success", true);
				response.put("message", "폴더가 삭제되었습니다.");
				return ResponseEntity.ok(response);
			} else {
				response.put("success", false);
				response.put("message", "폴더 삭제에 실패했습니다.");
				return ResponseEntity.ok(response);
			}

		} catch (Exception e) {
			e.printStackTrace();
			response.put("success", false);
			response.put("message", "폴더 삭제에 실패했습니다.");
			return ResponseEntity.ok(response);
		}
	}

	// 농지 목록
	@GetMapping("/farms")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> getFarmsByUserId(HttpSession session) {
		Map<String, Object> response = new HashMap<>();

		try {
			String userId = (String) session.getAttribute("userId");
			if (userId == null) {
				response.put("success", false);
				response.put("message", "로그인이 필요합니다.");
				return ResponseEntity.ok(response);
			}

			List<FarmDto> farms = farmService.getFarmsByUserId(userId);
			response.put("success", true);
			response.put("data", farms);
			return ResponseEntity.ok(response);

		} catch (Exception e) {
			e.printStackTrace();
			response.put("success", false);
			response.put("message", "농지 조회에 실패했습니다.");
			return ResponseEntity.ok(response);
		}
	}

	// 폴더별 농지 조회
	@GetMapping("/farms/folder/{folderId}")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> getFarmsByFolderId(@PathVariable Integer folderId) {
		Map<String, Object> response = new HashMap<>();

		try {
			List<FarmDto> farms = farmService.getFarmsByFolderId(folderId);
			response.put("success", true);
			response.put("data", farms);
			return ResponseEntity.ok(response);

		} catch (Exception e) {
			e.printStackTrace();
			response.put("success", false);
			response.put("message", "농지 조회에 실패했습니다.");
			return ResponseEntity.ok(response);
		}
	}

	// 농지 상세
	@GetMapping("/farms/{id}")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> getFarmById(@PathVariable Integer id) {
		Map<String, Object> response = new HashMap<>();

		try {
			FarmDto farm = farmService.getFarmById(id);
			if (farm == null) {
				response.put("success", false);
				response.put("message", "농지를 찾을 수 없습니다.");
				return ResponseEntity.ok(response);
			}

			response.put("success", true);
			response.put("data", farm);
			return ResponseEntity.ok(response);

		} catch (Exception e) {
			e.printStackTrace();
			response.put("success", false);
			response.put("message", "농지 조회에 실패했습니다.");
			return ResponseEntity.ok(response);
		}
	}

	// 농지 추가
	@PostMapping("/farms")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> createFarm(@RequestBody FarmDto farmDto, HttpSession session) {
		Map<String, Object> response = new HashMap<>();

		try {
			String userId = (String) session.getAttribute("userId");
			if (userId == null) {
				response.put("success", false);
				response.put("message", "로그인이 필요합니다.");
				return ResponseEntity.ok(response);
			}

			farmDto.setUserId(userId);
			int result = farmService.createFarm(farmDto);

			if (result > 0) {
				response.put("success", true);
				response.put("message", "농지가 생성되었습니다.");
				response.put("data", farmDto);
				return ResponseEntity.ok(response);
			} else {
				response.put("success", false);
				response.put("message", "농지 생성에 실패했습니다.");
				return ResponseEntity.ok(response);
			}

		} catch (Exception e) {
			e.printStackTrace();
			response.put("success", false);
			response.put("message", "농지 생성에 실패했습니다.");
			return ResponseEntity.ok(response);
		}
	}

	// 농지 수정
	@PutMapping("/farms/{id}")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> updateFarm(@PathVariable Integer id, @RequestBody FarmDto farmDto) {
		Map<String, Object> response = new HashMap<>();

		try {
			farmDto.setId(id);
			int result = farmService.updateFarm(farmDto);

			if (result > 0) {
				response.put("success", true);
				response.put("message", "농지가 수정되었습니다.");
				return ResponseEntity.ok(response);
			} else {
				response.put("success", false);
				response.put("message", "농지 수정에 실패했습니다.");
				return ResponseEntity.ok(response);
			}

		} catch (Exception e) {
			e.printStackTrace();
			response.put("success", false);
			response.put("message", "농지 수정에 실패했습니다.");
			return ResponseEntity.ok(response);
		}
	}

	// 농지 삭제
	@DeleteMapping("/farms/{id}")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> deleteFarm(@PathVariable Integer id) {
		Map<String, Object> response = new HashMap<>();

		try {
			int result = farmService.deleteFarm(id);

			if (result > 0) {
				response.put("success", true);
				response.put("message", "농지가 삭제되었습니다.");
				return ResponseEntity.ok(response);
			} else {
				response.put("success", false);
				response.put("message", "농지 삭제에 실패했습니다.");
				return ResponseEntity.ok(response);
			}

		} catch (Exception e) {
			e.printStackTrace();
			response.put("success", false);
			response.put("message", "농지 삭제에 실패했습니다.");
			return ResponseEntity.ok(response);
		}
	}

	// 직접 그린 농지 추가
	@PostMapping("/farms/drawn")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> createDrawnFarm(@RequestBody FarmDto farmDto, HttpSession session, @RequestHeader(value = "userId", required = false)String headerUserId) {
		Map<String, Object> response = new HashMap<>();

		try {
			String userId = (String) session.getAttribute("userId");
			if (userId == null) {
				userId = headerUserId;
			}
			if (userId == null) {
				response.put("success", false);
				response.put("message", "로그인이 필요합니다.");
				return ResponseEntity.ok(response);
			}

			farmDto.setUserId(userId);
			int result = farmService.createDrawnFarm(farmDto);

			if (result > 0) {
				response.put("success", true);
				response.put("message", "직접 그린 농지가 생성되었습니다.");
				response.put("data", farmDto);
				return ResponseEntity.ok(response);
			} else {
				response.put("success", false);
				response.put("message", "농지 생성에 실패했습니다.");
				return ResponseEntity.ok(response);
			}

		} catch (Exception e) {
			e.printStackTrace();
			response.put("success", false);
			response.put("message", "농지 생성에 실패했습니다: " + e.getMessage());
			return ResponseEntity.ok(response);
		}
	}

	// 주소 검색
	@GetMapping("/search")
	@ResponseBody
	public ResponseEntity<String> getFarmByAddress(@RequestParam("q") String address) {
		try {
			RestTemplate restTemplate = new RestTemplate();

			URI uri = UriComponentsBuilder
					.fromUriString("https://api.vworld.kr/req/search")
					.queryParam("service", "search")
					.queryParam("request", "search")
					.queryParam("version", "2.0")
					.queryParam("type", "address")
					.queryParam("category", "parcel")
					.queryParam("query", address)
					.queryParam("size", "10")
					.queryParam("page", "1")
					.queryParam("format", "json")
					.queryParam("errorformat", "json")
					.queryParam("crs", "EPSG:900913")
					.queryParam("key", "8E952DFB-FFDE-33E3-BA8A-3D78FF78B6CC")
					.build()
					.encode()
					.toUri();


			ResponseEntity<String> externalRes = restTemplate.getForEntity(uri, String.class);

			return ResponseEntity
					.status(externalRes.getStatusCode())
					.body(externalRes.getBody());

		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.ok("{\"success\":false,\"message\":\"주소 검색 오류\"}");
		}
	}
}

