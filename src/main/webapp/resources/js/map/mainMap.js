var map;
var switchMap;

// 모드 상태
var hoverOn = false;
var cadWmsVisible = false;
var cadWfsClick = false;
var farmWmsVisible = false;
var farmlandClick = false;

// 농지 선택 레이어
let farmlandSelectSource;
let farmlandSelectLayer;

let overlay;
let popup;
let popupContent;

// 측정용
let sketch;
let helpTooltipElement;
let helpTooltip;
let measureTooltipElement;
let measureTooltip;

// 측정 모드
var drawLine = false;
var drawPoly = false;

// 농지 그리기
var drawFarmland = false;
var farmlandDraw = null;
var drawnFarmlandFeature = null;

const continuePolygonMsg = '클릭하여 도형을 그리세요(더블클릭으로 멈추기)';
const continueLineMsg = '클릭하여 라인을 그리기(더블클릭으로 멈추기)';

$(document).ready(function() {
	initMap();
	initNavigation();

	// 폴더 추가 버튼
	$('#btn-add-folder').on('click', function() {
		var folderName = prompt('폴더 이름을 입력하세요');
		if (!folderName) return;

		fetch('/api/farm/folders', {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: folderName })
		})
			.then(res => res.json())
			.then(data => {
				if (data.success) {
					alert('폴더가 추가되었습니다.');
					loadFarmFolders();
				} else {
					alert('폴더 추가 실패');
				}
			});
	});

	// 전체 농지 보기 버튼
	$('#btn-view-all-farms').on('click', function() {
		showAllFarms();
	});
})

// 네비게이션 메뉴 초기화
function initNavigation() {
	const panelLayout = document.querySelector('.panel-layout');
	const navItems = document.querySelectorAll('.nav-item');
	const panelMapHome = document.getElementById('panel-map-home');
	const panelMyFarms = document.getElementById('panel-my-farms');

	// 페이지 로드 시 패널 숨기기 (지도 홈이 기본 활성화)
	if (panelLayout) {
		panelLayout.style.display = 'none';
	}

	navItems.forEach((item, index) => {
		const link = item.querySelector('.nav-link');
		link.addEventListener('click', (e) => {
			e.preventDefault();

			// 모든 메뉴에서 active 제거
			navItems.forEach(nav => nav.classList.remove('active'));

			// 클릭한 메뉴에 active 추가
			item.classList.add('active');

			// 패널 전환
			if (index === 0) {
				// 지도 홈
				panelLayout.style.display = 'none';
				panelMapHome.style.display = 'none';
				panelMyFarms.style.display = 'none';
			} else if (index === 1) {
				// 내 농지
				panelLayout.style.display = 'block';
				panelMapHome.style.display = 'none';
				panelMyFarms.style.display = 'block';

				// 폴더 목록 로드
				loadFarmFolders();
			} else if (index === 2) {
				// 통계
				openStatsModal();
				// 패널은 숨기고 모달만 표시
				panelLayout.style.display = 'none';
				panelMapHome.style.display = 'none';
				panelMyFarms.style.display = 'none';
			} else if (index === 3) {
				// 가이드
				openGuideModal();
				// 패널은 숨기고 모달만 표시
				panelLayout.style.display = 'none';
				panelMapHome.style.display = 'none';
				panelMyFarms.style.display = 'none';
			} else {
				// 다른 메뉴
				panelLayout.style.display = 'block';
				panelMapHome.style.display = 'block';
				panelMyFarms.style.display = 'none';
			}
		});
	});
}


// ===== 내 농지 관리 =====

// 폴더 목록 로드
function loadFarmFolders() {
	const foldersList = document.getElementById('farm-folders-list');
	// 세션 체크
	if (!sessionUserId) {
		alert('로그인이 필요합니다.');
		return;
	}

	fetch("/api/farm/folders", {
		method: 'GET',
		credentials: 'include',
		headers: {
			"Content-Type": "application/json" //JSESSEIONID 쿠키 같이 보냄 
		}
	})
		.then(res => res.json())
		.then(data => {
			if (data.success) {
				renderFolders(data.data, data.unassignedCount || 0);
			} else {
				  alert('폴더 목록을 불러올 수 없습니다.');
			}
		})
		.catch(err => {
			console.error('폴더 목록 로드 오류:', err);
			  alert('서버 오류 발생');
		});
}


// 폴더 목록 렌더링
function renderFolders(folders, unassignedCount) {
	const foldersList = document.getElementById('farm-folders-list');

	// "미지정" 폴더 추가 (ID = null)
	const unassignedFolder = {
		id: null,
		name: '미지정',
		description: '폴더에 추가되지 않은 농지',
		farmCount: unassignedCount || 0
	};

	const allFolders = [unassignedFolder, ...(folders || [])];

	if (allFolders.length === 0) {
		foldersList.innerHTML = `
					<div class="folder-loading">
						<i class="mdi mdi-folder-open-outline"></i>
						<span>폴더가 없습니다. 폴더를 추가해보세요!</span>
					</div>
				`;
		return;
	}

	foldersList.innerHTML = allFolders.map(folder => `
				<div class="folder-item" data-folder-id="${folder.id || ''}" onclick="showFarmsByFolder(${folder.id ? folder.id : 'null'}, '${folder.name}')">
					<div class="folder-icon">
						<i class="mdi mdi-folder"></i>
					</div>
					<div class="folder-info">
						<div class="folder-name">${folder.name}</div>
						<div class="folder-count">농지 ${folder.farmCount || 0}개</div>
					</div>
					<div class="folder-arrow">
						<i class="mdi mdi-chevron-right"></i>
					</div>
				</div>
			`).join('');
}

// 폴더별 농지 목록 표시
window.showFarmsByFolder = function(folderId, folderName) {
	const farmsListArea = document.getElementById('farms-list-area');
	const farmFoldersArea = document.querySelector('.farm-folders-area');
	const selectedFolderName = document.getElementById('selected-folder-name');
	const farmsList = document.getElementById('farms-list');

	// 현재 폴더 ID 저장
	farmsListArea.dataset.currentFolderId = folderId;

	// 폴더 목록 숨기고 농지 목록 표시
	farmFoldersArea.style.display = 'none';
	farmsListArea.style.display = 'block';
	selectedFolderName.textContent = folderName;

	// 로딩 상태
	farmsList.innerHTML = `
				<div class="folder-loading">
					<i class="mdi mdi-loading mdi-spin"></i>
					<span>농지 목록을 불러오는 중...</span>
				</div>
			`;

	// API 호출
	const url = folderId ? `/api/farm/farms/folder/${folderId}` : `/api/farm/farms`;

	fetch(url, {
		method: 'GET',
		credentials: 'include',
		headers: {
			"Content-Type": "application/json"
		}
	})
		.then(res => res.json())
		.then(data => {
			if (data.success) {
				renderFarms(data.data, folderId);
			} else {
				alert('농지 목록을 불러올 수 없습니다 ');
			}
		})
		.catch(err => {
			console.error('농지 목록 로드 오류:', err);
			alert('서버 오류 발생');
		});
};

// 상태별 CSS 클래스 반환
function getStatusClass(status) {
	const statusMap = {
		'씨뿌림': 'status-planting',
		'모내기': 'status-transplanting',
		'성장중': 'status-growing',
		'수확완료': 'status-harvested',
		'휴경': 'status-fallow',
		'미지정': 'status-unspecified'
	};
	return statusMap[status] || 'status-unspecified';
}

// 농지 목록 렌더링
function renderFarms(farms, folderId) {
	const farmsList = document.getElementById('farms-list');

	// folderId가 null(미지정 폴더)이면 folderId가 null인 농지만 필터링
	let filteredFarms = farms;
	if (folderId === null) {
		filteredFarms = farms.filter(farm => farm.folderId === null);
	}

	if (!filteredFarms || filteredFarms.length === 0) {
		farmsList.innerHTML = `
					<div class="farm-empty">
						<i class="mdi mdi-sprout-outline"></i>
						<p>이 폴더에는 농지가 없습니다.</p>
					</div>
				`;
		return;
	}

	farmsList.innerHTML = filteredFarms.map(farm => {
		const status = farm.currentStatus || '미지정';
		const statusClass = getStatusClass(status);
		return `
				<div class="farm-item" data-farm-id="${farm.id}">
					<div class="farm-item-header">
						<div class="farm-name">${farm.name}</div>
						<div class="farm-status ${statusClass}" onclick="updateFarmStatus(${farm.id}, '${farm.name}', event)">${status}</div>
						<button type="button" class="btn-change-folder" onclick="changeFarmFolder(${farm.id}, '${farm.name}', event)" title="폴더 변경">
							<i class="mdi mdi-folder-move"></i>
						</button>
						<button type="button" class="btn-delete-farm" onclick="deleteFarm(${farm.id}, event)" title="삭제">
							<i class="mdi mdi-delete"></i>
						</button>
					</div>
					<div class="farm-info" onclick="showFarmOnMap(${farm.id}, event)">
						<div class="farm-info-row">
							<i class="mdi mdi-map-marker"></i>
							<span>${farm.address || farm.pnu || '-'}</span>
						</div>
						${farm.area ? `
						<div class="farm-info-row">
							<i class="mdi mdi-ruler-square"></i>
							<span>${parseFloat(farm.area).toLocaleString()} ㎡</span>
						</div>
						` : ''}
					</div>
				</div>
				`;
	}).join('');
}

// 농지 삭제
window.deleteFarm = function(farmId, event) {
	event.stopPropagation();
	if (confirm('삭제하시겠습니까?')) {
		fetch(`/api/farm/farms/${farmId}`, {
			method: 'DELETE',
			credentials: 'include'
		})
			.then(res => res.json())
			.then(data => {
				if (data.success) {
					alert('삭제되었습니다.');

					// 현재 보고 있는 폴더 정보 가져오기
					const farmsListArea = document.getElementById('farms-list-area');
					const currentFolderId = farmsListArea.dataset.currentFolderId;
					const selectedFolderName = document.getElementById('selected-folder-name').textContent;

					// 현재 폴더의 농지 목록만 다시 로드
					if (currentFolderId === 'all') {
						showAllFarms();
					} else {
						const folderId = currentFolderId === 'null' ? null : parseInt(currentFolderId);
						showFarmsByFolder(folderId, selectedFolderName);
					}

					// 폴더 목록도 업데이트 (farmCount 변경)
					if (document.querySelector('.farm-folders-area').style.display !== 'none') {
						loadFarmFolders();
					}
				} else {
					alert('삭제 실패');
				}
			});
	}
};

// 전체 농지 보기
function showAllFarms() {
	const farmsListArea = document.getElementById('farms-list-area');
	const farmFoldersArea = document.querySelector('.farm-folders-area');
	const selectedFolderName = document.getElementById('selected-folder-name');
	const farmsList = document.getElementById('farms-list');

	farmFoldersArea.style.display = 'none';
	farmsListArea.style.display = 'block';
	selectedFolderName.textContent = '전체 농지';
	farmsListArea.dataset.currentFolderId = 'all';

	farmsList.innerHTML = `
				<div class="folder-loading">
					<i class="mdi mdi-loading mdi-spin"></i>
					<span>농지 목록을 불러오는 중...</span>
				</div>
			`;

	fetch('/api/farm/farms', {
		method: 'GET',
		credentials: 'include',
		headers: { "Content-Type": "application/json" }
	})
		.then(res => res.json())
		.then(data => {
			if (data.success) {
				renderFarms(data.data, 'all');
			} else {
				farmsList.innerHTML = `
						<div class="farm-empty">
							<i class="mdi mdi-alert-circle"></i>
							<p>농지 목록을 불러올 수 없습니다.</p>
						</div>
					`;
			}
		})
		.catch(err => {
			console.error('농지 목록 로드 오류:', err);
		});
}

// 농지를 지도에 표시
window.showFarmOnMap = function(farmId, event) {
	if (event) {
		event.stopPropagation();
	}

	// 농지 상세 정보 가져오기
	fetch(`/api/farm/farms/${farmId}`, {
		method: 'GET',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' }
	})
		.then(res => res.json())
		.then(data => {
			if (!data.success || !data.data) {
				alert('농지 정보를 불러올 수 없습니다.');
				return;
			}

			const farm = data.data;

			// centerPoint로 지도 이동
			if (farm.centerPoint) {
				// WKT 파싱
				const pointMatch = farm.centerPoint.match(/POINT\(([^ ]+) ([^ ]+)\)/);
				if (pointMatch) {
				    const x = parseFloat(pointMatch[1]);
				    const y = parseFloat(pointMatch[2]);

				    // 좌표 변환
				    const coords = ol.proj.fromLonLat([x, y]);

					// 지도 이동 및 줌
					map.getView().animate({
						center: coords,
						zoom: 18,
						duration: 500
					});
				}
			}

			// geometry를 지도에 표시
			if (farm.geomGeoJson) {
				try {
					const geoJson = JSON.parse(farm.geomGeoJson);
					const format = new ol.format.GeoJSON();
					const features = format.readFeatures(geoJson, {
						featureProjection: 'EPSG:3857'
					});

					// 기존 선택된 농지 제거
					farmlandSelectSource.clear();

					// 새로운 농지 표시
					farmlandSelectSource.addFeatures(features);
				} catch (err) {
					console.error('Geometry 파싱 오류:', err);
				}
			} else {
				// geometry가 없으면 선택 레이어만 클리어
				farmlandSelectSource.clear();
			}
		})
		.catch(err => {
			console.error('농지 정보 로드 오류:', err);
			alert('농지 정보를 불러오는 중 오류가 발생했습니다.');
		});
};

// 농지 상태 변경
let currentStatusFarmId;
window.updateFarmStatus = function(farmId, farmName, event) {
	event.stopPropagation();
	currentStatusFarmId = farmId;
	document.getElementById('status-change-modal').style.display = 'flex';
};

window.closeStatusModal = function() {
	document.getElementById('status-change-modal').style.display = 'none';
};

window.saveStatus = function() {
	const newStatus = document.getElementById('status-select').value;

	fetch(`/api/farm/farms/${currentStatusFarmId}`, {
		method: 'PUT',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ currentStatus: newStatus })
	})
		.then(res => res.json())
		.then(data => {
			if (data.success) {
				// 페이지 새로고침 대신 해당 농지 항목의 상태만 업데이트
				const farmItem = document.querySelector(`[data-farm-id="${currentStatusFarmId}"]`);
				if (farmItem) {
					const statusElement = farmItem.querySelector('.farm-status');
					if (statusElement) {
						const displayStatus = newStatus || '미지정';
						statusElement.textContent = displayStatus;
						// 기존 상태 클래스 제거
						statusElement.className = 'farm-status';
						// 새로운 상태 클래스 추가
						statusElement.classList.add(getStatusClass(displayStatus));
					}
				}
				closeStatusModal();
			} else {
				alert('상태 변경 실패: ' + (data.message || '알 수 없는 오류'));
			}
		})
		.catch(err => {
			console.error('상태 변경 오류:', err);
			alert('서버 오류가 발생했습니다: ' + err.message);
		});
};

// 농지 폴더 변경
let currentFolderChangeFarmId;
window.changeFarmFolder = function(farmId, farmName, event) {
	if (event) {
		event.stopPropagation();
	}

	currentFolderChangeFarmId = farmId;

	fetch('/api/farm/folders', {
		method: 'GET',
		credentials: 'include'
	})
		.then(res => res.json())
		.then(data => {
			if (!data.success) {
				alert('폴더 목록을 불러올 수 없습니다.');
				return;
			}

			const folderSelect = document.getElementById('folder-select');
			folderSelect.innerHTML = '<option value="">미지정</option>';
			data.data.forEach(folder => {
				const option = document.createElement('option');
				option.value = folder.id;
				option.textContent = folder.name;
				folderSelect.appendChild(option);
			});

			document.getElementById('folder-change-modal').style.display = 'flex';
		});
};

window.closeFolderModal = function() {
	document.getElementById('folder-change-modal').style.display = 'none';
};

window.saveFolder = function() {
	const newFolderId = document.getElementById('folder-select').value || null;
	const newFolderIdNum = newFolderId ? parseInt(newFolderId) : null;

	fetch(`/api/farm/farms/${currentFolderChangeFarmId}`, {
		method: 'PUT',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ folderId: newFolderIdNum })
	})
		.then(res => res.json())
		.then(data => {
			if (data.success) {
				// 현재 보이는 폴더 ID 확인
				const farmsListArea = document.getElementById('farms-list-area');
				const currentFolderId = farmsListArea.dataset.currentFolderId;

				// 현재 폴더가 표시되어 있고, 폴더가 변경된 경우
				if (currentFolderId !== undefined && currentFolderId !== 'all') {
					const currentFolderIdNum = currentFolderId === 'null' ? null : parseInt(currentFolderId);

					// 다른 폴더로 이동한 경우 목록에서 제거
					if (currentFolderIdNum !== newFolderIdNum) {
						const farmItem = document.querySelector(`[data-farm-id="${currentFolderChangeFarmId}"]`);
						if (farmItem) {
							farmItem.remove();

							// 목록이 비었는지 확인
							const farmsList = document.getElementById('farms-list');
							const remainingFarms = farmsList.querySelectorAll('.farm-item');
							if (remainingFarms.length === 0) {
								farmsList.innerHTML = `
										<div class="farm-empty">
											<i class="mdi mdi-sprout-outline"></i>
											<p>이 폴더에는 농지가 없습니다.</p>
										</div>
									`;
							}
						}
					} else {
						// 같은 폴더 내에서 변경된 경우 (거의 없지만) 목록 다시 로드
						const selectedFolderName = document.getElementById('selected-folder-name');
						showFarmsByFolder(currentFolderIdNum, selectedFolderName.textContent);
					}
				}

				// 폴더 목록도 업데이트 (farmCount 변경)
				if (document.querySelector('.farm-folders-area').style.display !== 'none') {
					loadFarmFolders();
				}

				closeFolderModal();
			} else {
				alert('폴더 변경 실패: ' + (data.message || '알 수 없는 오류'));
			}
		})
		.catch(err => {
			console.error('폴더 변경 오류:', err);
			alert('서버 오류가 발생했습니다: ' + err.message);
		});
};

// 폴더 목록으로 돌아가기
$(document).ready(function() {
	$('#btn-back-to-folders').on('click', function() {
		$('#farms-list-area').hide();
		$('.farm-folders-area').show();
	});

	// 폴더 수정
	$(document).on('click', '.btn-folder-edit', function() {
		var folderId = $('.farms-list-area').data('current-folder-id');
		var currentName = $('#selected-folder-name').text();

		if (!folderId || folderId === 'null') {
			alert('미지정 폴더는 수정할 수 없습니다.');
			return;
		}

		var newName = prompt('새 폴더 이름을 입력하세요', currentName);
		if (!newName || newName === currentName) return;

		fetch('/api/farm/folders/' + folderId + '', {
			method: 'PUT',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: newName })
		})
			.then(res => res.json())
			.then(data => {
				if (data.success) {
					alert('수정되었습니다.');
					$('#selected-folder-name').text(newName);
					loadFarmFolders();
				} else {
					alert('수정 실패');
				}
			});
	});

	// 폴더 삭제
	$(document).on('click', '.btn-folder-delete', function() {
		var folderId = $('.farms-list-area').data('current-folder-id');
		if (!folderId || folderId === 'null') {
			alert('미지정 폴더는 삭제할 수 없습니다.');
			return;
		}

		if (confirm('폴더를 삭제하시겠습니까?')) {
			fetch('/api/farm/folders/' + folderId + '', {
				method: 'DELETE',
				credentials: 'include'
			})
				.then(res => res.json())
				.then(data => {
					if (data.success) {
						alert('삭제되었습니다.');
						$('#farms-list-area').hide();
						$('.farm-folders-area').show();
						loadFarmFolders();
					} else {
						alert('삭제 실패');
					}
				});
		}
	});
});

// 현재 선택된 농지 정보 저장 (모달에서 사용)
let selectedFarmlandData = null;

// 농지를 내 농지에 추가하는 함수 (모달 열기)
function addFarmlandToMyFarms(farmlandId, pnu) {
	if (!farmlandId) {
		alert('농지 ID가 없습니다.');
		return;
	}

	// 선택된 농지 정보 저장
	selectedFarmlandData = {
		id: farmlandId,
		pnu: pnu
	};

	// 모달 열기
	openFarmlandModal();
}

// 농지 추가 모달 열기
function openFarmlandModal() {
	const modal = document.getElementById('farmland-add-modal');
	const nameInput = document.getElementById('farmland-name');
	const folderSelect = document.getElementById('farmland-folder');

	// 기본 이름 설정
	if (selectedFarmlandData) {
		nameInput.value = `농지_${selectedFarmlandData.pnu || selectedFarmlandData.id}`;
	}

	// 폴더 목록 로드
	loadFolderList();

	// 모달 표시
	modal.style.display = 'flex';

	// 이름 입력창에 포커스
	setTimeout(() => {
		nameInput.select();
	}, 100);
}

// 농지 추가 모달 닫기
function closeFarmlandModal() {
	const modal = document.getElementById('farmland-add-modal');
	const nameInput = document.getElementById('farmland-name');
	const folderSelect = document.getElementById('farmland-folder');

	// 입력값 초기화
	nameInput.value = '';
	folderSelect.value = '';

	// 모달 숨김
	modal.style.display = 'none';

	// 선택된 농지 정보 초기화
	selectedFarmlandData = null;
}

// 폴더 목록 로드
function loadFolderList() {
	const folderSelect = document.getElementById('farmland-folder');

	// 세션 userId 체크
	if (!sessionUserId) {
		console.warn('세션 userId가 없습니다.');
		return;
	}
	const url = '/api/farm/folders';
	fetch(url, {
		method: 'GET',
		credentials: 'include',
		headers: {
			"Content-Type": "application/json"
		}
	})
		.then(res => res.json())
		.then(data => {
			if (data.success) {
				// 기존 옵션 제거 (미지정 제외)
				while (folderSelect.options.length > 1) {
					folderSelect.remove(1);
				}

				// 폴더 목록 추가
				data.data.forEach(folder => {
					const option = document.createElement('option');
					option.value = folder.id;
					option.textContent = folder.name;
					folderSelect.appendChild(option);
				});
			} else {
				console.error('폴더 목록 로드 실패:', data.message);
			}
		})
		.catch(err => {
			console.error('폴더 목록 로드 오류:', err);
		});
}

// 농지 저장 처리
function saveFarmland() {
	const nameInput = document.getElementById('farmland-name');
	const folderSelect = document.getElementById('farmland-folder');
	const farmlandName = nameInput.value.trim();
	const folderId = folderSelect.value || null;

	// 유효성 검사
	if (!farmlandName) {
		alert('농지 이름을 입력해주세요.');
		nameInput.focus();
		return;
	}

	if (!selectedFarmlandData) {
		alert('선택된 농지 정보가 없습니다.');
		closeFarmlandModal();
		return;
	}

	// 세션 userId 체크
	if (!sessionUserId) {
		alert('로그인이 필요합니다.');
		return;
	}

	const requestBody = {
		name: farmlandName,
		pnu: selectedFarmlandData.pnu,
		farmlandId: selectedFarmlandData.id  // farmland_master 테이블 id
	};

	// folderId가 있을 때만 추가
	if (folderId) {
		requestBody.folderId = parseInt(folderId);
	}


	fetch('/api/farm/farms', {
		method: 'POST',
		credentials: 'include',
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(requestBody)
	})
		.then(async res => {
			const contentType = res.headers.get('content-type');

			// JSON이 아닌 응답 처리
			if (!contentType || !contentType.includes('application/json')) {
				const text = await res.text();
				console.error('JSON이 아닌 응답:', text.substring(0, 500));
				throw new Error('서버가 JSON이 아닌 응답을 반환했습니다. (Status: ' + res.status + ')');
			}

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.message || '서버 오류');
			}

			return data;
		})
		.then(data => {
			if (data.success) {
				alert('농지가 추가되었습니다!');
				closeFarmlandModal(); // 농지 추가 모달 닫기 
				overlay.setPosition(undefined); // 농지 정보 팝업 닫기 
				farmlandSelectSource.clear(); // 선택된 농지 벡터 레이어 지우기
				// TODO: 오른쪽 패널 농지 목록 갱신
			} else {
				alert('농지 추가 실패: ' + (data.message || '알 수 없는 오류'));
			}
		})
		.catch(err => {
			console.error('농지 추가 오류:', err);
			alert('서버 오류가 발생했습니다: ' + err.message);
		});
}

// 모달 이벤트 리스너 등록 (DOM 로드 후)
$(document).ready(function() {
	// X 버튼 클릭
	$('#modal-close-btn').on('click', closeFarmlandModal);

	// 취소 버튼 클릭
	$('#modal-cancel-btn').on('click', closeFarmlandModal);

	// 저장 버튼 클릭
	$('#modal-save-btn').on('click', saveFarmland);

	// Enter 키 입력 시 저장
	$('#farmland-name').on('keypress', function(e) {
		if (e.key === 'Enter') {
			saveFarmland();
		}
	});

	// ESC 키 입력 시 닫기
	$(document).on('keydown', function(e) {
		if (e.key === 'Escape') {
			const modal = document.getElementById('farmland-add-modal');
			if (modal.style.display === 'flex') {
				closeFarmlandModal();
			}
		}
	});
});

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

	// 농지 GeoJSON 벡터 레이어
	const farmSource = new ol.source.Vector();
	const farmLayer = new ol.layer.Vector({
		visible: false,
		minZoom: 14,
		source: farmSource,
		style: new ol.style.Style({
			fill: new ol.style.Fill({ color: 'rgba(34, 197, 94, 0.25)' }),
			stroke: new ol.style.Stroke({ color: '#16a34a', width: 1.5 })
		})
	});

	let farmLayerLoading = false;
	function loadFarmLayer() {
		if (!farmWmsVisible) return;
		const zoom = map.getView().getZoom();
		if (zoom < 14) return;

		const extent = map.getView().calculateExtent(map.getSize());
		fetch(`/api/farm/layer?minX=${extent[0]}&minY=${extent[1]}&maxX=${extent[2]}&maxY=${extent[3]}`, {
				headers: { 'X-Requested-With': 'XMLHttpRequest' }
			})
			.then(r => r.json())
			.then(geojson => {
				const features = new ol.format.GeoJSON().readFeatures(geojson, {
					dataProjection: 'EPSG:4326',
					featureProjection: 'EPSG:3857'
				});
				farmSource.clear();
				farmSource.addFeatures(features);
			})
			.catch(() => {});
	}

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

	// 그룹별 버튼 비활성화 함수
	function deactivateOtherGroups(activeGroup) {
		// 지적편집도 그룹
		if (activeGroup !== 'cadastre') {
			cadWmsVisible = false;
			document.getElementById("chAddCadaWMS").setAttribute('aria-pressed', false);
			cadastreLayer.setVisible(false);

			cadWfsClick = false;
			document.getElementById("chAddCadaClick").setAttribute('aria-pressed', false);
			selectCadastreFeatLayer.getSource().clear();
			selectCadastreFeatLayer.setVisible(false);

			hoverOn = false;
			document.getElementById("chAddHover").setAttribute('aria-pressed', false);
			cadastreFeatLayer.getSource().clear();
			cadastreFeatLayer.setVisible(false);
		}

		// 농지 그룹
		if (activeGroup !== 'farm') {
			farmWmsVisible = false;
			document.getElementById("chAddFarmWMS").setAttribute('aria-pressed', false);
			farmLayer.setVisible(false);

			farmlandClick = false;
			document.getElementById("chAddFarmClick").setAttribute('aria-pressed', false);
			if (farmlandSelectSource) farmlandSelectSource.clear();
		}

		// 측정 툴 그룹
		if (activeGroup !== 'measure') {
			drawLine = false;
			drawPoly = false;
			drawFarmland = false;
			document.getElementById("chLength").setAttribute('aria-pressed', false);
			document.getElementById("chArea").setAttribute('aria-pressed', false);
			document.getElementById("chDrawFarm").setAttribute('aria-pressed', false);

			if (draw) map.removeInteraction(draw);
			if (farmlandDraw) map.removeInteraction(farmlandDraw);
			if (helpTooltipElement) {
				helpTooltipElement.classList.add('hidden');
			}
		}

		// 팝업 닫기
		if (overlay) overlay.setPosition(undefined);
	}

	// 지적편집도 WMS 레이어 On/Off (표시만)
	const addCadastreWMS = document.getElementById("chAddCadaWMS");
	let cadWmsHintActive = false;

	addCadastreWMS.addEventListener("click", () => {
		deactivateOtherGroups('cadastre');
		const currentZoom = Math.round(map.getView().getZoom());

		if (!cadWmsVisible && currentZoom < 17) {
			// 켜려고 하는데 줌 레벨이 부족한 경우 - 힌트 표시
			cadWmsHintActive = true;
			showWmsHint('cadastre', currentZoom);
			return;
		}

		// 줌 레벨이 충분하면 토글
		cadWmsVisible = !cadWmsVisible;
		addCadastreWMS.setAttribute('aria-pressed', cadWmsVisible);

		if (cadWmsVisible) {
			// ON: 지적편집도 레이어 표시
			cadastreLayer.setVisible(true);
			refreshHint();
			cadWmsHintActive = false;
			wmsHintEl.style.display = 'none';
		} else {
			// OFF: 지적편집도 레이어 숨김
			cadastreLayer.setVisible(false);
			refreshHint();
			cadWmsHintActive = false;
			wmsHintEl.style.display = 'none';
		}
	});

	// 지적편집도 클릭 이벤트 On/Off (WFS 클릭 및 팝업)
	const addCadastreClick = document.getElementById("chAddCadaClick");
	addCadastreClick.addEventListener("click", () => {
		deactivateOtherGroups('cadastre');
		cadWfsClick = !cadWfsClick; // 토글
		addCadastreClick.setAttribute('aria-pressed', cadWfsClick);

		if (cadWfsClick) {
			// ON: 클릭 이벤트 활성화
			refreshHint(); // 줌 레벨 확인 후 안내문
			selectCadastreFeatLayer.getSource().clear();
			selectCadastreFeatLayer.setVisible(true);
		} else {
			// OFF: 클릭 이벤트 비활성화
			selectCadastreFeatLayer.getSource().clear();
			selectCadastreFeatLayer.setVisible(false);
			if (overlay) overlay.setPosition(undefined); // 팝업 닫기
		}
	});

	// 농지 WMS 레이어 On/Off
	const addFarmWMS = document.getElementById("chAddFarmWMS");
	let farmWmsHintActive = false;

	addFarmWMS.addEventListener("click", () => {
		deactivateOtherGroups('farm');
		const currentZoom = Math.round(map.getView().getZoom());

		if (!farmWmsVisible && currentZoom < 14) {
			farmWmsHintActive = true;
			showWmsHint('farm', currentZoom);
			return;
		}

		farmWmsVisible = !farmWmsVisible;
		addFarmWMS.setAttribute('aria-pressed', farmWmsVisible);

		if (farmWmsVisible) {
			farmLayer.setVisible(true);
			farmWmsHintActive = false;
			wmsHintEl.style.display = 'none';
			loadFarmLayer();
		} else {
			// OFF: 농지 레이어 숨김
			refreshHint();
			farmLayer.setVisible(false);
			farmWmsHintActive = false;
			wmsHintEl.style.display = 'none';
		}
	})

	// 농지 클릭 이벤트 On/Off
	const addFarmlandClick = document.getElementById("chAddFarmClick");
	addFarmlandClick.addEventListener("click", () => {
		deactivateOtherGroups('farm');
		farmlandClick = !farmlandClick; // 토글
		addFarmlandClick.setAttribute('aria-pressed', farmlandClick);

		if (farmlandClick) {
			refreshHint();
			// ON: 클릭 이벤트 활성화
		} else {
			refreshHint();
			// OFF: 클릭 이벤트 비활성화
			// 선택된 농지 폴리곤 제거
			if (farmlandSelectSource) {
				farmlandSelectSource.clear();
			}
			if (overlay) overlay.setPosition(undefined); // 팝업 닫기
		}
	});

	// 마우스 오버 이벤트 on/off
	const mousehovermode = document.getElementById("chAddHover");
	mousehovermode.addEventListener("click", () => {
		deactivateOtherGroups('cadastre');
		hoverOn = !hoverOn; // 토글
		mousehovermode.setAttribute('aria-pressed', hoverOn);

		if (!hoverOn) {
			cadastreFeatLayer.getSource().clear(); // 이전에 띄운 레이어 지우기
			cadastreFeatLayer.setVisible(false);
			refreshHint();
		} else {
			cadastreFeatLayer.setVisible(true);
			refreshHint();
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
			hybridLayer,
			farmLayer  // 농지 레이어 추가
		],
		view: new ol.View({
			center: ol.proj.fromLonLat([126.65, 35.97]), // 군산 좌표
			zoom: 17,
			projection: 'EPSG:3857'
		})
	});

	// 줌 레벨 안내 힌트 생성 (지적편집도 클릭용)
	const hintEl = document.createElement('div');
	hintEl.style.cssText =
		'position:absolute;bottom:12px;right:12px;z-index:1000;' +
		'background:#fff;border:1px solid #ddd;border-radius:6px;' +
		'padding:8px 10px;font:13px sans-serif;box-shadow:0 2px 6px rgba(0,0,0,0.1);';
	hintEl.style.display = 'none'; // 처음엔 숨기기

	// WMS 레이어 줌 레벨 안내 힌트 생성
	const wmsHintEl = document.createElement('div');
	wmsHintEl.style.cssText =
		'position:absolute;bottom:12px;right:12px;z-index:1000;' +
		'background:#fff3cd;border:1px solid #ffc107;border-radius:6px;' +
		'padding:10px 14px;font:13px sans-serif;box-shadow:0 2px 6px rgba(0,0,0,0.15);' +
		'color:#856404;';
	wmsHintEl.style.display = 'none'; // 처음엔 숨기기

	// 힌트 요소들을 지도에 추가
	const mapBox = document.getElementById('map');
	mapBox.style.position = 'relative';  // 부모 기준점
	mapBox.appendChild(hintEl);
	mapBox.appendChild(wmsHintEl);

	// WMS 레이어 힌트 표시 함수
	function showWmsHint(type, currentZoom) {
		const minZoom = type === 'cadastre' ? 17 : 14;
		const layerName = type === 'cadastre' ? '지적편집도' : '농지';

		wmsHintEl.innerHTML = `⚠️ <b>${layerName}</b> 레이어는 <b>줌 레벨 ${minZoom} 이상</b>에서 표시됩니다.<br>현재 줌: ${currentZoom} — 지도를 더 확대해주세요.`;
		wmsHintEl.style.display = 'block';
	}

	// 지적편집도 클릭 힌트 갱신
	function refreshHint() {
		// 지적편집도 클릭 이벤트가 꺼져있으면 힌트 숨김
		if (!cadWfsClick && !hoverOn && !cadWmsVisible && !farmWmsVisible && !farmlandClick) {
			hintEl.style.display = 'none';
			return;
		}
		const z = Math.round(map.getView().getZoom());
		hintEl.innerHTML = `레이어 및 클릭 조회 기능은 <b>줌 레벨 17 이상</b>에서 가능합니다.<br>현재 줌 레벨: ${z}`;
		if (z >= 18) hintEl.style.display = 'none';
		else hintEl.style.display = 'block';
	}

	// WMS 힌트 갱신 (줌 레벨 변경 시)
	function refreshWmsHint() {
		const z = Math.round(map.getView().getZoom());

		// 지적편집도 WMS 힌트가 활성화 상태면 업데이트
		if (cadWmsHintActive) {
			if (z >= 17) {
				// 충분한 줌 레벨에 도달하면 힌트 숨김
				cadWmsHintActive = false;
				wmsHintEl.style.display = 'none';
			} else {
				showWmsHint('cadastre', z);
			}
		}

		// 농지 레이어 힌트 (zoom < 14일 때)
		if (farmWmsHintActive) {
			if (z >= 14) {
				farmWmsHintActive = false;
				wmsHintEl.style.display = 'none';
				loadFarmLayer();
			} else {
				showWmsHint('farm', z);
			}
		}
	}

	// 줌/이동 시 농지 레이어 갱신
	map.getView().on('change:resolution', () => {
		refreshHint();
		refreshWmsHint();
		loadFarmLayer();
	});
	map.on('moveend', () => {
		loadFarmLayer();
	});

	refreshHint();



	// 연속지적도 WMS 레이어
	cadastreLayer = new ol.layer.Tile({
		visible: false,
		minZoom: 17,  // 줌 레벨 17 이상에서만 표시
		source: new ol.source.TileWMS({
			url: "gis/pnu",
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
	farmlandSelectSource = new ol.source.Vector();

	// 선택한 농지 표시용 벡터 레이어
	farmlandSelectLayer = new ol.layer.Vector({
		source: farmlandSelectSource,
		style: new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: 'rgba(76, 175, 80, 1)',  // 녹색
				width: 3
			}),
			fill: new ol.style.Fill({
				color: 'rgba(76, 175, 80, 0.2)'
			})
		})
	});

	map.addLayer(cadastreFeatLayer);
	map.addLayer(cadastreLayer);
	map.addLayer(selectCadastreFeatLayer);
	map.addLayer(farmlandSelectLayer);
	map.addLayer(drawVector);

	cadastreLayer.setZIndex(12);
	cadastreFeatLayer.setZIndex(20);
	selectCadastreFeatLayer.setZIndex(21);
	farmlandSelectLayer.setZIndex(22);

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

			fetch("/gis/pnufeat", {
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
					}

					const format = new ol.format.GeoJSON();
					const features = format.readFeatures(featureCollection);

					cadastreFeatLayer.getSource().clear(); // 이전 폴리곤 지우고 
					cadastreFeatLayer.getSource().addFeatures(features); // 그리고 
					cadastreFeatLayer.setVisible(true); // 보이게 하고 
				});
		}
	});

	popup = document.getElementById('map-popup');
	popupContent = document.getElementById('popup-content');

	overlay = new ol.Overlay({
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
		const [lon, lat] = evt.coordinate;
		const zoom = map.getView().getZoom();

		// 그리기 모드나 다른 특수 모드가 활성화되어 있지 않을 때만 폴리곤 지우기
		// 팝업이 표시 중이면 폴리곤을 유지
		const isPopupOpen = overlay && overlay.getPosition() !== undefined;
		if (!farmlandClick && !cadWfsClick && !drawLine && !drawPoly && !drawFarmland && !isPopupOpen) {
			// 표시된 농지 폴리곤 지우기
			if (farmlandSelectSource) {
				farmlandSelectSource.clear();
			}
		}

		// 농지 클릭 이벤트 처리
		if (farmlandClick) {
			if (zoom < 17) {
				return;
			}

			fetch("/gis/farmfeat", {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: `x=${lon}&y=${lat}`
			})
				.then(res => res.json())
				.then(data => {

					if (data.status !== 'OK' || !data.featureCollection) {
						alert('해당 위치에 농지가 없습니다.');
						return;
					}

					const format = new ol.format.GeoJSON();
					const features = format.readFeatures(data.featureCollection, {
						featureProjection: 'EPSG:3857'
					});

					farmlandSelectSource.clear();
					farmlandSelectSource.addFeatures(features);

					const props = data.featureCollection.features[0].properties;

					// 팝업 내용
					const contentHtml = `
						<div style="min-width:250px;">
							<h4>🌾 농지 정보</h4>
							<b>농지 ID:</b> ${props.id}<br>
							<b>PNU:</b> ${props.pnu || '-'}<br>
							<b>지목:</b> ${props.landCdNm || '-'} (${props.landCd || '-'})<br>
							<b>주소:</b> ${props.stdgAddr || '-'}<br>
							<b>면적:</b> ${props.flAr ? props.flAr.toFixed(2) + ' ㎡' : '-'}<br>
							<b>촬영일:</b> ${props.flightYmd || '-'}
							<hr style="margin:10px 0;">
							<button id="btn-add-farmland" style="background:#4CAF50;color:white;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;margin-right:8px;">
								농지 추가
							</button>
							<button id="btn-popup-close" style="background:#666;color:white;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;">
								닫기
							</button>
						</div>
					`; // FIXME

					popupContent.innerHTML = contentHtml;
					overlay.setPosition(evt.coordinate);
					overlay.setPositioning('top-center');

					// 닫기 버튼
					document.getElementById('btn-popup-close').addEventListener('click', () => {
						overlay.setPosition(undefined);
						farmlandSelectSource.clear();
					});

					// 농지 추가 버튼
					document.getElementById('btn-add-farmland').addEventListener('click', () => {
						addFarmlandToMyFarms(props.id, props.pnu);
					});
				})
				.catch(err => {
					console.error('농지 조회 오류:', err);
					alert('농지 조회 중 오류가 발생했습니다.');
				});

			return;  // 농지 클릭 처리 후 종료
		}

		// 지적편집도 클릭 이벤트 처리
		if (!cadWfsClick) return;

		if (zoom >= 17) {
			fetch("/gis/pnufeat", {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: `x=${lon}&y=${lat}`
			})
				.then(res => res.json())
				.then(data => {

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

	map.getViewport().addEventListener('mouseout', function() {
		if (helpTooltipElement) {
			helpTooltipElement.classList.add('hidden');
		}
	});



	/**
	 * Format length output.
	 * @param {LineString} line The line.
	 * @return {string} The formatted length.
	 */
	const formatLength = function(line) {
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
	const formatArea = function(polygon) {
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
		deactivateOtherGroups('measure');
		drawLine = !drawLine; // 토글
		chLength.setAttribute('aria-pressed', drawLine);

		if (drawLine) {
			// 면적 재기 해제
			drawPoly = false;
			chArea.setAttribute('aria-pressed', false);

			// 농지 그리기 해제
			drawFarmland = false;
			document.getElementById('chDrawFarm').setAttribute('aria-pressed', false);
			if (farmlandDraw) map.removeInteraction(farmlandDraw);

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
		deactivateOtherGroups('measure');
		drawPoly = !drawPoly; // 토글
		chArea.setAttribute('aria-pressed', drawPoly);

		if (drawPoly) {
			// 거리 재기 해제
			drawLine = false;
			chLength.setAttribute('aria-pressed', false);

			// 농지 그리기 해제
			drawFarmland = false;
			document.getElementById('chDrawFarm').setAttribute('aria-pressed', false);
			if (farmlandDraw) map.removeInteraction(farmlandDraw);

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

	// 농지 그리기 버튼 클릭시
	const chDrawFarm = document.getElementById('chDrawFarm');
	chDrawFarm.addEventListener('click', () => {
		deactivateOtherGroups('measure');
		drawFarmland = !drawFarmland; // 토글
		chDrawFarm.setAttribute('aria-pressed', drawFarmland);

		if (drawFarmland) {
			// 다른 도구 해제
			drawLine = false;
			drawPoly = false;
			chLength.setAttribute('aria-pressed', false);
			chArea.setAttribute('aria-pressed', false);

			// 이전 도구 제거
			if (draw) map.removeInteraction(draw);
			if (helpTooltipElement) {
				helpTooltipElement.remove();
			}

			// 농지 그리기 시작
			startFarmlandDrawing();
		} else {
			// 농지 그리기 종료
			if (farmlandDraw) {
				map.removeInteraction(farmlandDraw);
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

	// ===== 농지 그리기 기능 =====

	// 농지 그리기용 벡터 소스
	const farmlandDrawSource = new ol.source.Vector({
		projection: 'EPSG:3857'
	});

	const farmlandDrawLayer = new ol.layer.Vector({
		source: farmlandDrawSource,
		style: new ol.style.Style({
			fill: new ol.style.Fill({
				color: 'rgba(76, 175, 80, 0.3)'
			}),
			stroke: new ol.style.Stroke({
				color: '#4CAF50',
				width: 3
			})
		}),
		zIndex: 100
	});
	map.addLayer(farmlandDrawLayer);

	// 농지 그리기 툴팁 변수
	let farmlandTooltipElement;
	let farmlandTooltip;

	// 농지 그리기 툴팁 생성
	function createFarmlandTooltip() {
		if (farmlandTooltipElement) {
			farmlandTooltipElement.remove();
		}
		farmlandTooltipElement = document.createElement('div');
		farmlandTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
		farmlandTooltip = new ol.Overlay({
			element: farmlandTooltipElement,
			offset: [0, -15],
			positioning: 'bottom-center',
			stopEvent: false,
			insertFirst: false,
		});
		map.addOverlay(farmlandTooltip);
	}

	// 농지 그리기 시작
	function startFarmlandDrawing() {
		// 기존 그린 농지 초기화
		farmlandDrawSource.clear();
		drawnFarmlandFeature = null;

		// 툴팁 생성
		createFarmlandTooltip();

		// Draw interaction 생성
		farmlandDraw = new ol.interaction.Draw({
			source: farmlandDrawSource,
			type: 'Polygon',
			style: new ol.style.Style({
				fill: new ol.style.Fill({
					color: 'rgba(76, 175, 80, 0.2)'
				}),
				stroke: new ol.style.Stroke({
					color: '#4CAF50',
					width: 2,
					lineDash: [10, 10]
				}),
				image: new ol.style.Circle({
					radius: 5,
					stroke: new ol.style.Stroke({
						color: '#4CAF50'
					}),
					fill: new ol.style.Fill({
						color: 'rgba(76, 175, 80, 0.5)'
					})
				})
			})
		});

		let listener;
		// 그리기 시작 이벤트
		farmlandDraw.on('drawstart', function(evt) {
			const sketch = evt.feature;

			listener = sketch.getGeometry().on('change', function(evt) {
				const geom = evt.target;
				const output = formatArea(geom);
				const tooltipCoord = geom.getInteriorPoint().getCoordinates();
				farmlandTooltipElement.innerHTML = output;
				farmlandTooltip.setPosition(tooltipCoord);
			});
		});

		// 그리기 완료 이벤트
		farmlandDraw.on('drawend', function(evt) {
			drawnFarmlandFeature = evt.feature;
			const geom = drawnFarmlandFeature.getGeometry();
			const area = ol.sphere.getArea(geom);

			// 면적 계산
			const areaText = formatArea(geom);

			const currentElement = farmlandTooltipElement;
			const currentOverlay = farmlandTooltip;

			// 버튼들 추가 FIXME
			currentElement.innerHTML += '<br><button id="btn-redraw-farmland" style="margin-top:5px; padding:4px 8px; background:#f0ad4e; color:white; border:1px solid #eea236; cursor:pointer;">다시 그리기</button>';
			currentElement.innerHTML += ' <button id="btn-add-farmland-from-tooltip" style="padding:4px 8px; background:#5cb85c; color:white; border:1px solid #4cae4c; cursor:pointer;">농지 추가</button>';

			// X 버튼 추가
			currentElement.innerHTML += '<a id="farmland-popup-closer" class="ol-popup-closer"></a>';

			// 클릭 이벤트 (X 버튼 + 다시 그리기 + 농지 추가 버튼)
			let oElem = currentOverlay.getElement();
			oElem.addEventListener('click', function(e) {
				var target = e.target;
				if (target.className == "ol-popup-closer") {
					// 툴팁 삭제
					map.removeOverlay(currentOverlay);
					// 폴리곤 삭제
					farmlandDrawSource.removeFeature(drawnFarmlandFeature);
					drawnFarmlandFeature = null;
				} else if (target.id == "btn-redraw-farmland") {
					// 다시 그리기
					map.removeOverlay(currentOverlay);
					farmlandDrawSource.removeFeature(drawnFarmlandFeature);
					drawnFarmlandFeature = null;
				} else if (target.id == "btn-add-farmland-from-tooltip") {
					// 그리기 모드 종료
					if (farmlandDraw) {
						map.removeInteraction(farmlandDraw);
					}
					drawFarmland = false;
					document.getElementById('chDrawFarm').setAttribute('aria-pressed', false);

					// 모달 열기
					openDrawnFarmlandModal(areaText);
				}
			});

			currentElement.className = 'ol-tooltip ol-tooltip-static';
			currentOverlay.setOffset([0, -7]);

			// 다음 그리기를 위한 새 툴팁 생성
			farmlandTooltipElement = null;
			createFarmlandTooltip();
			ol.Observable.unByKey(listener);

		});

		map.addInteraction(farmlandDraw);
	}

	// 직접 그린 농지 추가 모달 열기
	function openDrawnFarmlandModal(areaText) {
		const modal = document.getElementById('drawn-farmland-modal');
		const nameInput = document.getElementById('drawn-farmland-name');
		const folderSelect = document.getElementById('drawn-farmland-folder');

		// 면적 정보 설정
		document.getElementById('drawn-area-text-modal').innerHTML = areaText || '-';

		// 기본 이름 설정
		const now = new Date();
		nameInput.value = `내 농지_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;

		// 폴더 목록 로드
		loadFolderListForDrawn();

		// 모달 표시
		modal.style.display = 'flex';

		// 이름 입력창에 포커스
		setTimeout(() => {
			nameInput.select();
		}, 100);
	}

	// 직접 그린 농지 모달 닫기
	function closeDrawnFarmlandModal() {
		const modal = document.getElementById('drawn-farmland-modal');
		modal.style.display = 'none';
	}

	// 모달 닫기 버튼들
	document.getElementById('drawn-modal-close-btn').addEventListener('click', closeDrawnFarmlandModal);
	document.getElementById('drawn-modal-cancel-btn').addEventListener('click', closeDrawnFarmlandModal);

	// 폴더 목록 로드 (직접 그린 농지용)
	function loadFolderListForDrawn() {
		const folderSelect = document.getElementById('drawn-farmland-folder');


		if (!sessionUserId) {
			console.warn('세션 userId가 없습니다.');
			return;
		}

		const url = '/api/farm/folders';

		fetch(url, {
			method: 'GET',
			credentials: 'include',
			headers: {
				"Content-Type": "application/json"
			}
		})
			.then(res => res.json())
			.then(data => {
				if (data.success) {
					// 기존 옵션 제거 (미지정 제외)
					while (folderSelect.options.length > 1) {
						folderSelect.remove(1);
					}

					// 폴더 목록 추가
					data.data.forEach(folder => {
						const option = document.createElement('option');
						option.value = folder.id;
						option.textContent = folder.name;
						folderSelect.appendChild(option);
					});
				} else {
					console.error('폴더 목록 로드 실패:', data.message);
				}
			})
			.catch(err => {
				console.error('폴더 목록 로드 오류:', err);
			});
	}

	// 직접 그린 농지 저장
	document.getElementById('drawn-modal-save-btn').addEventListener('click', function() {
		const nameInput = document.getElementById('drawn-farmland-name');
		const folderSelect = document.getElementById('drawn-farmland-folder');
		const farmlandName = nameInput.value.trim();
		const folderId = folderSelect.value || null;

		// 유효성 검사
		if (!farmlandName) {
			alert('농지 이름을 입력해주세요.');
			nameInput.focus();
			return;
		}

		if (!drawnFarmlandFeature) {
			alert('그려진 농지가 없습니다.');
			closeDrawnFarmlandModal();
			return;
		}

		if (!sessionUserId) {
			alert('로그인이 필요합니다.');
			return;
		}

		// 폴리곤 geometry를 WKT로 변환
		const geom = drawnFarmlandFeature.getGeometry();
		const format = new ol.format.WKT();
		const wkt = format.writeGeometry(geom);

		// 면적 계산
		const area = ol.sphere.getArea(geom);

		const requestBody = {
			name: farmlandName,
			userGeom: wkt,  // user_geom 컬럼에 저장
			area: area.toFixed(2),
			sourceType: 'USER_DRAWN'
		};

		if (folderId) {
			requestBody.folderId = parseInt(folderId);
		}


		fetch('/api/farm/farms/drawn', {
			method: 'POST',
			credentials: 'include',
			headers: {
				"Content-Type": "application/json",
				"userId": sessionUserId
			},
			body: JSON.stringify(requestBody)
		})
			.then(async res => {
				const contentType = res.headers.get('content-type');

				if (!contentType || !contentType.includes('application/json')) {
					const text = await res.text();
					console.error('JSON이 아닌 응답:', text.substring(0, 500));
					throw new Error('서버가 JSON이 아닌 응답을 반환했습니다.');
				}

				const data = await res.json();

				if (!res.ok) {
					throw new Error(data.message || '서버 오류');
				}

				return data;
			})
			.then(data => {
				if (data.success) {
					alert('농지가 추가되었습니다!');
					closeDrawnFarmlandModal();

					// 그린 농지 초기화
					farmlandDrawSource.clear();
					drawnFarmlandFeature = null;

					// 농지 그리기 모드 종료
					drawFarmland = false;
					document.getElementById('chDrawFarm').setAttribute('aria-pressed', false);
					if (farmlandDraw) {
						map.removeInteraction(farmlandDraw);
					}
				} else {
					alert('농지 추가 실패: ' + (data.message || '알 수 없는 오류'));
				}
			})
			.catch(err => {
				console.error('농지 추가 오류:', err);
				alert('서버 오류가 발생했습니다: ' + err.message);
			});
	});



	// 채널톡
	(function() { var w = window; if (w.ChannelIO) { return w.console.error("ChannelIO script included twice."); } var ch = function() { ch.c(arguments); }; ch.q = []; ch.c = function(args) { ch.q.push(args); }; w.ChannelIO = ch; function l() { if (w.ChannelIOInitialized) { return; } w.ChannelIOInitialized = true; var s = document.createElement("script"); s.type = "text/javascript"; s.async = true; s.src = "https://cdn.channel.io/plugin/ch-plugin-web.js"; var x = document.getElementsByTagName("script")[0]; if (x.parentNode) { x.parentNode.insertBefore(s, x); } } if (document.readyState === "complete") { l(); } else { w.addEventListener("DOMContentLoaded", l); w.addEventListener("load", l); } })();

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

	// 현재 위치 마커 레이어
	let currentLocationMarker = null;
	const currentLocationLayer = new ol.layer.Vector({
		source: new ol.source.Vector(),
		style: new ol.style.Style({
			image: new ol.style.Circle({
				radius: 8,
				fill: new ol.style.Fill({
					color: '#4285F4'
				}),
				stroke: new ol.style.Stroke({
					color: '#FFFFFF',
					width: 3
				})
			})
		}),
		zIndex: 100
	});
	map.addLayer(currentLocationLayer);

	// 현재 위치 버튼
	$('.btn-location').on('click', function() {
		const button = $(this);

		if (!navigator.geolocation) {
			alert('이 브라우저는 위치 서비스를 지원하지 않습니다.');
			return;
		}

		button.attr('aria-pressed', 'true');

		// 1차: GPS 정확도 우선 (enableHighAccuracy: true)
		navigator.geolocation.getCurrentPosition(
			function(position) {
				// 성공: GPS 또는 Geolocation으로 위치 획득
				const longitude = position.coords.longitude;
				const latitude = position.coords.latitude;
				const accuracy = position.coords.accuracy;

				const coords = ol.proj.fromLonLat([longitude, latitude]);

				// 기존 마커 제거
				currentLocationLayer.getSource().clear();

				// 현재 위치 마커 생성
				currentLocationMarker = new ol.Feature({
					geometry: new ol.geom.Point(coords)
				});
				currentLocationLayer.getSource().addFeature(currentLocationMarker);

				// 지도 이동 및 줌
				map.getView().animate({
					center: coords,
					zoom: 17,
					duration: 500
				});

				button.attr('aria-pressed', 'false');
			},
			function(error) {
				// 실패 처리
				console.error('위치 획득 실패:', error);
				let errorMsg = '위치를 가져올 수 없습니다.';

				switch (error.code) {
					case error.PERMISSION_DENIED:
						errorMsg = '위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.';
						break;
					case error.POSITION_UNAVAILABLE:
						errorMsg = '위치 정보를 사용할 수 없습니다.';
						break;
					case error.TIMEOUT:
						errorMsg = '위치 요청 시간이 초과되었습니다.';
						break;
				}

				alert(errorMsg);
				button.attr('aria-pressed', 'false');
			},
			{
				enableHighAccuracy: true,  // 1차: GPS 위성 정확도 우선
				timeout: 10000,            // 10초 타임아웃
				maximumAge: 0              // 캐시된 위치 사용 안함
			}
		);
	});

	// 통계 모달 - 폴더 선택 드롭다운 이벤트
	$('#folder-status-select').on('change', function() {
		const folderId = $(this).val();
		loadFolderStatusStats(folderId);
	});



	//============== 검색 ============

	const searchInput = document.getElementById('input_search');
	const searchButton = document.querySelector('.button-search');
	const resultBox = document.getElementById('search_results');

	searchInput.addEventListener('keydown', function(e) {
		if (e.key === 'Enter') {
			const q = searchInput.value.trim();
			doSearchWithResultPopup(q);
		}
	});

	searchButton.addEventListener('click', function() {
		const q = searchInput.value.trim();
		doSearchWithResultPopup(q);
	});

	// 검색창 밖 클릭하면 결과 닫기
	document.addEventListener('click', (e) => {
		if (!resultBox.contains(e.target) &&
			!searchInput.contains(e.target) &&
			!searchButton.contains(e.target)) {
			resultBox.style.display = 'none';
		}
	});

	async function doSearchWithResultPopup(query) {
		if (!query) {
			alert('검색할 주소를 입력해주세요.');
			return;
		}

		try {
			// 주소 검색 (전국단위)
			const res = await fetch(`/api/farm/search?q=${query}`);
			const data = await res.json();


			if (!data.response || data.response.status !== 'OK') {
				console.error(data);
				alert('주소 검색 중 오류가 발생했습니다.');
				return;
			}

			const items = data.response.result.items;

			if (!items || items.length === 0) {
				resultBox.style.display = 'none';
				alert('검색 결과가 없습니다.');
				return;
			}

			// 결과가 1개면 바로 이동, 여러 개면 리스트 표시
			if (items.length === 1) {
				onSelectSearchResult(items[0]);
				resultBox.style.display = 'none';
			} else {
				renderSearchResultList(items);
			}

		} catch (err) {
			console.error(err);
			alert('검색 중 오류가 발생했습니다.');
		}
	}

	function renderSearchResultList(items) {
		resultBox.innerHTML = '';

		items.forEach((item, idx) => {
			const div = document.createElement('div');
			div.className = 'search-result-item';

			const title = document.createElement('div');
			title.className = 'search-result-title';
			const mainAddr = item.address?.road ?? item.address?.parcel ?? item.title;
			title.textContent = mainAddr.replace(/<[^>]+>/g, ''); // 태그 제거

			const sub = document.createElement('div');
			sub.className = 'search-result-sub';
			const detailText = item.category || item.address?.bldnm || '';
			sub.textContent = detailText.replace(/<[^>]+>/g, '');

			div.appendChild(title);
			div.appendChild(sub);

			// 클릭 이벤트: 지도 이동 + 필지 로딩
			div.addEventListener('click', () => {
				onSelectSearchResult(item);
				resultBox.style.display = 'none';
			});

			resultBox.appendChild(div);
		});

		//resultBox.style.display = 'block';
	}

	function onSelectSearchResult(item) {
		const lon = parseFloat(item.point.x); // EPSG:900913 = 3857
		const lat = parseFloat(item.point.y);

		// 지도 이동
		map.getView().animate({
			center: [lon, lat],
			zoom: 18,
			duration: 600
		});

		// 농지 필지 조회 함수 호출
		fetch("/gis/farmfeat", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: `x=${lon}&y=${lat}`
		})
			.then(res => res.json())
			.then(data => {

				if (data.status !== 'OK' || !data.featureCollection) {
					alert('해당 위치에 농지가 없습니다.');
					return;
				}


				const format = new ol.format.GeoJSON();
				const features = format.readFeatures(data.featureCollection, {
					featureProjection: 'EPSG:3857'
				});


				farmlandSelectSource.clear();
				farmlandSelectSource.addFeatures(features);


				// 디버깅: 1초 후 다시 확인
				setTimeout(() => {
				}, 1000);

				const props = data.featureCollection.features[0].properties;

				// 팝업 내용
				const contentHtml = `
						<div style="min-width:250px;">
							<h4>🌾 농지 정보</h4>
							<b>농지 ID:</b> ${props.id}<br>
							<b>PNU:</b> ${props.pnu || '-'}<br>
							<b>지목:</b> ${props.landCdNm || '-'} (${props.landCd || '-'})<br>
							<b>주소:</b> ${props.stdgAddr || '-'}<br>
							<b>면적:</b> ${props.flAr ? props.flAr.toFixed(2) + ' ㎡' : '-'}<br>
							<b>촬영일:</b> ${props.flightYmd || '-'}
							<hr style="margin:10px 0;">
							<button id="btn-add-farmland" style="background:#4CAF50;color:white;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;margin-right:8px;">
								농지 추가
							</button>
							<button id="btn-popup-close" style="background:#666;color:white;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;">
								닫기
							</button>
						</div>
					`; // FIXME

				popupContent.innerHTML = contentHtml;
				overlay.setPosition([lon, lat]);
				overlay.setPositioning('top-center');

				// 닫기 버튼
				document.getElementById('btn-popup-close').addEventListener('click', () => {
					overlay.setPosition(undefined);
					farmlandSelectSource.clear();
				});

				// 농지 추가 버튼
				document.getElementById('btn-add-farmland').addEventListener('click', () => {
					addFarmlandToMyFarms(props.id, props.pnu);
				});
			})
			.catch(err => {
				console.error('농지 조회 오류:', err);
				alert('농지 조회 중 오류가 발생했습니다.');
			});

		return;  // 농지 클릭 처리 후 종료
	}



});

// ===== 통계 기능 =====

// 차트 인스턴스 저장
let folderAreaChart = null;
let folderStatusChart = null;

// 통계 모달 열기
function openStatsModal() {
	if (!sessionUserId) {
		alert('로그인이 필요합니다.');
		return;
	}

	$('#stats-modal').show();
	loadFolderStats();
}

// 통계 모달 닫기
function closeStatsModal() {
	$('#stats-modal').hide();
	// 차트 정리
	if (folderAreaChart) {
		folderAreaChart.destroy();
		folderAreaChart = null;
	}
	if (folderStatusChart) {
		folderStatusChart.destroy();
		folderStatusChart = null;
	}
}

// 폴더별 통계 로드
function loadFolderStats() {
	fetch('/api/farm/stats/folders', {
		method: 'GET',
		credentials: 'include'
	})
		.then(res => res.json())
		.then(data => {
			if (data.success) {
				const stats = data.data;

				// 전체 통계 표시
				$('#total-farm-count').text(stats.totalFarmCount + '개');
				$('#total-area').text(stats.totalArea.toFixed(1) + ' ㎡');

				// 폴더별 통계 테이블 표시
				const tbody = $('#folder-stats-tbody');
				tbody.empty();

				if (stats.folders && stats.folders.length > 0) {
					stats.folders.forEach(folder => {
						const row = `
						<tr>
							<td>${folder.folderName || '미지정'}</td>
							<td>${folder.farmCount}개</td>
							<td>${folder.countRatio}%</td>
							<td>${folder.totalArea.toFixed(1)} ㎡</td>
							<td>${folder.areaRatio}%</td>
						</tr>
					`;
						tbody.append(row);
					});

					// 도넛 차트 그리기
					createFolderAreaChart(stats.folders);

					// 폴더 선택 드롭다운 채우기
					const select = $('#folder-status-select');
					select.empty();
					select.append('<option value="">폴더를 선택하세요</option>');
					stats.folders.forEach(folder => {
						const option = `<option value="${folder.folderId || ''}">${folder.folderName || '미지정'}</option>`;
						select.append(option);
					});
				} else {
					tbody.append('<tr><td colspan="5" style="text-align:center; padding:40px;">등록된 농지가 없습니다.</td></tr>');
				}
			} else {
				alert('통계를 불러올 수 없습니다.');
			}
		})
		.catch(err => {
			console.error('통계 로드 에러:', err);
			alert('통계를 불러오는 중 오류가 발생했습니다.');
		});
}

// 폴더별 면적 도넛 차트 생성
function createFolderAreaChart(folders) {
	// 기존 차트 제거
	if (folderAreaChart) {
		folderAreaChart.destroy();
	}

	const ctx = document.getElementById('folder-area-chart');
	if (!ctx) return;

	// 데이터 준비
	const labels = folders.map(f => f.folderName || '미지정');
	const areas = folders.map(f => f.totalArea);
	const farmCounts = folders.map(f => f.farmCount);
	const areaRatios = folders.map(f => f.areaRatio);

	// 색상 팔레트
	const colors = [
		'rgba(75, 192, 192, 0.8)',
		'rgba(255, 99, 132, 0.8)',
		'rgba(255, 206, 86, 0.8)',
		'rgba(54, 162, 235, 0.8)',
		'rgba(153, 102, 255, 0.8)',
		'rgba(255, 159, 64, 0.8)',
		'rgba(201, 203, 207, 0.8)',
		'rgba(76, 175, 80, 0.8)'
	];

	folderAreaChart = new Chart(ctx, {
		type: 'doughnut',
		data: {
			labels: labels,
			datasets: [{
				data: areas,
				backgroundColor: colors.slice(0, folders.length),
				borderWidth: 2,
				borderColor: '#fff'
			}]
		},
		options: {
			responsive: true,
			maintainAspectRatio: true,
			plugins: {
				legend: {
					position: 'bottom',
					labels: {
						padding: 15,
						font: {
							size: 12
						}
					}
				},
				tooltip: {
					callbacks: {
						label: function(context) {
							const index = context.dataIndex;
							const folderName = labels[index];
							const area = areas[index].toFixed(1);
							const farmCount = farmCounts[index];
							const ratio = areaRatios[index];
							return [
								`${folderName}`,
								`농지 수: ${farmCount}개`,
								`면적: ${area} ㎡`,
								`비율: ${ratio}%`
							];
						}
					},
					backgroundColor: 'rgba(0, 0, 0, 0.8)',
					padding: 12,
					titleFont: {
						size: 14,
						weight: 'bold'
					},
					bodyFont: {
						size: 13
					},
					bodySpacing: 6
				}
			}
		}
	});
}

// 폴더별 상태 통계 로드
function loadFolderStatusStats(folderId) {
	if (!folderId && folderId !== '') {
		return;
	}

	const folderIdParam = folderId === '' ? 0 : folderId;

	fetch(`/api/farm/stats/folder/${folderIdParam}/status`, {
		method: 'GET',
		credentials: 'include'
	})
		.then(res => res.json())
		.then(data => {
			if (data.success) {
				const stats = data.data;
				const tbody = $('#folder-status-tbody');
				tbody.empty();

				if (stats.statusStats && stats.statusStats.length > 0) {
					stats.statusStats.forEach(item => {
						const row = `
						<tr>
							<td>${item.currentStatus || '-'}</td>
							<td>${item.cnt}개</td>
							<td>${item.ratio}%</td>
						</tr>
					`;
						tbody.append(row);
					});

					// 막대 그래프 그리기
					createFolderStatusChart(stats.statusStats);
				} else {
					tbody.append('<tr><td colspan="3" style="text-align:center; padding:40px;">상태 정보가 없습니다.</td></tr>');
					// 차트 제거
					if (folderStatusChart) {
						folderStatusChart.destroy();
						folderStatusChart = null;
					}
				}
			}
		})
		.catch(err => {
			console.error('폴더 상태 통계 로드 에러:', err);
		});
}

// 폴더별 상태 막대 그래프 생성
function createFolderStatusChart(statusStats) {
	// 기존 차트 제거
	if (folderStatusChart) {
		folderStatusChart.destroy();
	}

	const ctx = document.getElementById('folder-status-chart');
	if (!ctx) return;

	// 데이터 준비
	const labels = statusStats.map(s => s.currentStatus || '-');
	const counts = statusStats.map(s => s.cnt);
	const ratios = statusStats.map(s => s.ratio);

	// 상태별 색상 매핑
	const statusColors = {
		'씨뿌림': 'rgba(139, 195, 74, 0.8)',
		'모내기': 'rgba(3, 169, 244, 0.8)',
		'성장중': 'rgba(76, 175, 80, 0.8)',
		'수확완료': 'rgba(255, 152, 0, 0.8)',
		'휴경': 'rgba(158, 158, 158, 0.8)',
		'미지정': 'rgba(189, 189, 189, 0.8)'
	};

	const backgroundColors = labels.map(label =>
		statusColors[label] || 'rgba(96, 125, 139, 0.8)'
	);

	folderStatusChart = new Chart(ctx, {
		type: 'bar',
		data: {
			labels: labels,
			datasets: [{
				label: '농지 수',
				data: counts,
				backgroundColor: backgroundColors,
				borderColor: backgroundColors.map(c => c.replace('0.8', '1')),
				borderWidth: 2
			}]
		},
		options: {
			responsive: true,
			maintainAspectRatio: true,
			scales: {
				y: {
					beginAtZero: true,
					ticks: {
						stepSize: 1,
						font: {
							size: 12
						}
					},
					grid: {
						color: 'rgba(0, 0, 0, 0.05)'
					}
				},
				x: {
					ticks: {
						font: {
							size: 12
						}
					},
					grid: {
						display: false
					}
				}
			},
			plugins: {
				legend: {
					display: false
				},
				tooltip: {
					callbacks: {
						label: function(context) {
							const index = context.dataIndex;
							const status = labels[index];
							const count = counts[index];
							const ratio = ratios[index];
							return [
								`상태: ${status}`,
								`농지 수: ${count}개`,
								`비율: ${ratio}%`
							];
						}
					},
					backgroundColor: 'rgba(0, 0, 0, 0.8)',
					padding: 12,
					titleFont: {
						size: 14,
						weight: 'bold'
					},
					bodyFont: {
						size: 13
					},
					bodySpacing: 6
				}
			}
		}
	});
}

// ===== 가이드 기능 =====

// 가이드 모달 열기
function openGuideModal() {
	$('#guide-modal').show();
}

// 가이드 모달 닫기
function closeGuideModal() {
	$('#guide-modal').hide();
}

