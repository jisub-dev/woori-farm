package com.woori.wooribat.controller.farm;

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
import org.springframework.web.bind.annotation.ResponseBody;

import com.woori.wooribat.model.dto.farm.FarmDto;
import com.woori.wooribat.model.dto.farm.FarmFolderDto;
import com.woori.wooribat.service.farm.FarmService;

@Controller
@RequestMapping("/api/farm")
public class FarmController {

	@Autowired
	private FarmService farmService;

	// ============= Farm Folder APIs =============

	/**
	 * 사용자의 모든 농지 폴더 조회
	 */
	@GetMapping("/folders")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> getFarmFolders(HttpSession session, @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
		Map<String, Object> response = new HashMap<>();

		try {
			String userId = (String) session.getAttribute("id");
			 if (userId == null) {
	              userId = headerUserId;  // 개발용: 헤더에서도 받음
	          }
			if (userId == null) {
				response.put("success", false);
				response.put("message", "로그인이 필요합니다.");
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
			}

			List<FarmFolderDto> folders = farmService.getFarmFolders(userId);
			response.put("success", true);
			response.put("data", folders);
			return ResponseEntity.ok(response);

		} catch (Exception e) {
			e.printStackTrace();
			response.put("success", false);
			response.put("message", "폴더 조회에 실패했습니다.");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}

	/**
	 * 특정 농지 폴더 조회
	 */
	@GetMapping("/folders/{id}")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> getFarmFolderById(@PathVariable Integer id) {
		Map<String, Object> response = new HashMap<>();

		try {
			FarmFolderDto folder = farmService.getFarmFolderById(id);
			if (folder == null) {
				response.put("success", false);
				response.put("message", "폴더를 찾을 수 없습니다.");
				return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
			}

			response.put("success", true);
			response.put("data", folder);
			return ResponseEntity.ok(response);

		} catch (Exception e) {
			e.printStackTrace();
			response.put("success", false);
			response.put("message", "폴더 조회에 실패했습니다.");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}

	/**
	 * 농지 폴더 생성
	 */
	@PostMapping("/folders")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> createFarmFolder(@RequestBody FarmFolderDto farmFolderDto,
			HttpSession session, @RequestHeader(value = "X-User-Id", required = false)String headerUserId) {
		Map<String, Object> response = new HashMap<>();

		try {
			String userId = (String) session.getAttribute("id");
			if (userId == null) {
	              userId = headerUserId;  // 개발용: 헤더에서도 받음
	          }
			if (userId == null) {
				response.put("success", false);
				response.put("message", "로그인이 필요합니다.");
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
			}

			farmFolderDto.setUserId(userId);
			int result = farmService.createFarmFolder(farmFolderDto);

			if (result > 0) {
				response.put("success", true);
				response.put("message", "폴더가 생성되었습니다.");
				response.put("data", farmFolderDto);
				return ResponseEntity.status(HttpStatus.CREATED).body(response);
			} else {
				response.put("success", false);
				response.put("message", "폴더 생성에 실패했습니다.");
				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
			}

		} catch (Exception e) {
			e.printStackTrace();
			response.put("success", false);
			response.put("message", "폴더 생성에 실패했습니다.");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}

	/**
	 * 농지 폴더 수정
	 */
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
				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
			}

		} catch (Exception e) {
			e.printStackTrace();
			response.put("success", false);
			response.put("message", "폴더 수정에 실패했습니다.");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}

	/**
	 * 농지 폴더 삭제
	 */
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
				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
			}

		} catch (Exception e) {
			e.printStackTrace();
			response.put("success", false);
			response.put("message", "폴더 삭제에 실패했습니다.");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}

	// ============= Farm APIs =============

	/**
	 * 사용자의 모든 농지 조회
	 */
	@GetMapping("/farms")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> getFarmsByUserId(HttpSession session, @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
		Map<String, Object> response = new HashMap<>();

		try {
			String userId = (String) session.getAttribute("id");
			if (userId == null) {
	              userId = headerUserId;  // 개발용: 헤더에서도 받음
	          }
			if (userId == null) {
				response.put("success", false);
				response.put("message", "로그인이 필요합니다.");
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
			}

			List<FarmDto> farms = farmService.getFarmsByUserId(userId);
			response.put("success", true);
			response.put("data", farms);
			return ResponseEntity.ok(response);

		} catch (Exception e) {
			e.printStackTrace();
			response.put("success", false);
			response.put("message", "농지 조회에 실패했습니다.");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}

	/**
	 * 폴더별 농지 조회
	 */
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
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}

	/**
	 * 특정 농지 조회
	 */
	@GetMapping("/farms/{id}")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> getFarmById(@PathVariable Integer id) {
		Map<String, Object> response = new HashMap<>();

		try {
			FarmDto farm = farmService.getFarmById(id);
			if (farm == null) {
				response.put("success", false);
				response.put("message", "농지를 찾을 수 없습니다.");
				return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
			}

			response.put("success", true);
			response.put("data", farm);
			return ResponseEntity.ok(response);

		} catch (Exception e) {
			e.printStackTrace();
			response.put("success", false);
			response.put("message", "농지 조회에 실패했습니다.");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}

	/**
	 * 농지 생성
	 */
	@PostMapping("/farms")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> createFarm(@RequestBody FarmDto farmDto, HttpSession session, @RequestHeader(value = "X-User-Id", required = false)String headerUserId) {
		Map<String, Object> response = new HashMap<>();

		try {
			String userId = (String) session.getAttribute("id");
			if (userId == null) {
	              userId = headerUserId;  // 개발용: 헤더에서도 받음
	          }
			if (userId == null) {
				response.put("success", false);
				response.put("message", "로그인이 필요합니다.");
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
			}

			farmDto.setUserId(userId);
			int result = farmService.createFarm(farmDto);

			if (result > 0) {
				response.put("success", true);
				response.put("message", "농지가 생성되었습니다.");
				response.put("data", farmDto);
				return ResponseEntity.status(HttpStatus.CREATED).body(response);
			} else {
				response.put("success", false);
				response.put("message", "농지 생성에 실패했습니다.");
				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
			}

		} catch (Exception e) {
			e.printStackTrace();
			response.put("success", false);
			response.put("message", "농지 생성에 실패했습니다.");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}

	/**
	 * 농지 수정
	 */
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
				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
			}

		} catch (Exception e) {
			e.printStackTrace();
			response.put("success", false);
			response.put("message", "농지 수정에 실패했습니다.");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}

	/**
	 * 농지 삭제 (논리 삭제)
	 */
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
				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
			}

		} catch (Exception e) {
			e.printStackTrace();
			response.put("success", false);
			response.put("message", "농지 삭제에 실패했습니다.");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}
}

