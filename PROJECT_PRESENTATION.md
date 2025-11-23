# 우리밭 (Woori Farm) 프로젝트 발표자료

## 📋 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [시스템 아키텍처](#시스템-아키텍처)
3. [기술 스택](#기술-스택)
4. [주요 기능](#주요-기능)
5. [데이터베이스 설계](#데이터베이스-설계)
6. [데이터 흐름](#데이터-흐름)
7. [핵심 구현 내용](#핵심-구현-내용)
8. [트러블 슈팅](#트러블-슈팅)
9. [향후 개선 방향](#향후-개선-방향)

---

## 프로젝트 개요

### 프로젝트명
**우리밭 (Woori Farm)** - 농지 관리 지도 기반 웹 애플리케이션

### 개발 목적
- 농민들이 자신의 농지를 지도 기반으로 쉽게 관리
- 농지 위치, 면적, 상태 등을 시각적으로 파악
- 지적편집도 및 농지 정보 통합 조회
- 농작업 상태 기록 및 폴더별 농지 분류 관리

### 개발 기간
- 초기 개발: [날짜 입력]
- 주요 기능 구현 및 고도화 진행 중

---

## 시스템 아키텍처

### 전체 구조
```
┌─────────────────────────────────────────────────┐
│              Client (Browser)                    │
│  ┌──────────────┐  ┌─────────────────────────┐ │
│  │   JSP View   │  │   JavaScript (OpenLayers)│ │
│  └──────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────┘
                        ↕ HTTP/AJAX
┌─────────────────────────────────────────────────┐
│         Spring MVC Application Server            │
│  ┌──────────────┐  ┌──────────────────────┐    │
│  │  Controller  │→ │   Service Layer      │    │
│  └──────────────┘  └──────────────────────┘    │
│         ↓                    ↓                   │
│  ┌──────────────┐  ┌──────────────────────┐    │
│  │   MyBatis    │  │   DTO/Model          │    │
│  │   Mapper     │  └──────────────────────┘    │
│  └──────────────┘                               │
└─────────────────────────────────────────────────┘
                        ↕ JDBC
┌─────────────────────────────────────────────────┐
│              MySQL Database                      │
│  - farm.farms (농지 테이블)                      │
│  - farm.farm_folders (폴더 테이블)               │
└─────────────────────────────────────────────────┘

         External Services
┌──────────────────────────┐  ┌─────────────────┐
│  GeoServer (WMS/WFS)     │  │  Google OAuth   │
│  - 지적편집도 데이터      │  │  - 사용자 인증  │
│  - 농지 레이어           │  └─────────────────┘
└──────────────────────────┘
```

### MVC 패턴 적용
- **Model**: DTO (FarmDto, FarmFolderDto)
- **View**: JSP (mainMap.jsp)
- **Controller**: Spring Controller (FarmController, GisController)

---

## 기술 스택

### Backend
- **Framework**: Spring MVC 4.x
- **ORM**: MyBatis
- **Language**: Java 8+
- **Build Tool**: Maven
- **Database**: MySQL
- **Server**: Tomcat

### Frontend
- **View Template**: JSP (JSTL, EL)
- **JavaScript Libraries**:
  - OpenLayers 6.x (지도 라이브러리)
  - jQuery 3.1.1
- **CSS**: 커스텀 CSS (네이버 지도 스타일 참고)
- **Icons**: Material Design Icons

### External APIs
- **Google OAuth 2.0**: 사용자 인증
- **GeoServer**: 지적편집도 및 농지 WMS/WFS 서비스

---

## 주요 기능

### 1. 사용자 인증
- Google OAuth 2.0 기반 로그인
- 세션 기반 사용자 상태 관리

### 2. 지도 기능
#### 2.1 지도 레이어
- **일반 지도**: OpenStreetMap 기반
- **위성 지도**: Vworld 위성영상
- **지적편집도**: GeoServer WMS 레이어
- **농지 레이어**: 커스텀 농지 데이터

#### 2.2 지도 도구
- 지적편집도 클릭 조회
- 농지 클릭 조회
- 마우스 호버 미리보기
- 거리 측정
- 면적 측정
- 농지 직접 그리기

#### 2.3 상호 배타적 그룹 관리
- **지적편집도 그룹**: WMS, 클릭, 호버 (동시 활성화 불가)
- **농지 그룹**: WMS, 클릭
- **측정 도구 그룹**: 거리, 면적, 농지 그리기

### 3. 농지 관리
#### 3.1 폴더 관리
- 폴더 생성/수정/삭제
- 폴더별 농지 분류
- 미지정 폴더 (기본 폴더)

#### 3.2 농지 CRUD
- 지도에서 농지 클릭하여 등록
- 직접 그려서 농지 등록
- 농지 정보 수정
- 농지 삭제 (논리 삭제)
- 전체 농지 보기

#### 3.3 농지 상태 관리
- 상태 종류: 씨뿌림, 모내기, 성장중, 수확완료, 휴경
- 드롭다운 UI로 간편 변경
- 상태별 색상 구분 표시

#### 3.4 농지 이동
- 드롭다운으로 폴더 선택하여 이동
- 실시간 UI 업데이트

---

## 데이터베이스 설계

### ERD 주요 테이블

#### 1. farm_folders (농지 폴더)
```sql
CREATE TABLE farm.farm_folders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    del_yn CHAR(1) DEFAULT 'N'
);
```

#### 2. farms (농지)
```sql
CREATE TABLE farm.farms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(255) NOT NULL,
    folder_id INT NULL,
    name VARCHAR(100) NOT NULL,
    pnu VARCHAR(50),
    farmland_id VARCHAR(50),
    address TEXT,
    center_point POINT,
    user_geom GEOMETRY,
    area DECIMAL(15,2),
    current_status VARCHAR(50),
    memo TEXT,
    source_type VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    del_yn CHAR(1) DEFAULT 'N',
    FOREIGN KEY (folder_id) REFERENCES farm_folders(id)
);
```

### 논리 삭제 (Soft Delete) 패턴
- `del_yn` 컬럼 사용
- 'N': 정상 데이터
- 'Y': 삭제된 데이터
- 실제 DELETE 대신 UPDATE로 처리
- 데이터 복구 가능성 확보

---

## 데이터 흐름

### 1. 농지 조회 플로우
```
사용자 요청
    ↓
FarmController.getFarmsByUserId()
    ↓
FarmService.getFarmsByUserId()
    ↓
FarmMapper.getFarmsByUserId()
    ↓
SELECT * FROM farms WHERE user_id = ? AND del_yn = 'N'
    ↓
List<FarmDto> 반환
    ↓
JSON 응답 → 클라이언트
    ↓
JavaScript로 지도에 렌더링
```

### 2. 농지 추가 플로우 (지도 클릭)
```
사용자가 지도에서 농지 클릭
    ↓
WFS 요청으로 농지 정보 조회
    ↓
모달 창 표시 (이름, 폴더 선택)
    ↓
POST /api/farm/farms
    ↓
FarmController.createFarm()
    ↓
FarmService.createFarm()
    ↓
INSERT INTO farms (...)
    ↓
성공 응답 → 목록 새로고침
```

### 3. 농지 직접 그리기 플로우
```
사용자가 그리기 도구 활성화
    ↓
폴리곤 그리기 (OpenLayers Draw Interaction)
    ↓
그리기 완료 → 면적 계산
    ↓
모달 창 표시
    ↓
POST /api/farm/farms/drawn
    ↓
WKT 형식으로 geometry 저장
    ↓
ST_GeomFromText()로 DB 저장
```

### 4. 지적편집도 조회 플로우
```
사용자가 지적편집도 클릭
    ↓
클릭 좌표로 WFS GetFeature 요청
    ↓
GeoServer에서 지적 정보 반환
    ↓
팝업 표시 (PNU, 지번, 면적 등)
```

---

## 핵심 구현 내용

### 1. RESTful API 설계
```java
// 농지 API
GET    /api/farm/farms           - 전체 농지 조회
GET    /api/farm/farms/{id}      - 특정 농지 조회
POST   /api/farm/farms           - 농지 생성
PUT    /api/farm/farms/{id}      - 농지 수정
DELETE /api/farm/farms/{id}      - 농지 삭제

// 폴더 API
GET    /api/farm/folders         - 폴더 목록
POST   /api/farm/folders         - 폴더 생성
PUT    /api/farm/folders/{id}    - 폴더 수정
DELETE /api/farm/folders/{id}    - 폴더 삭제
```

### 2. OpenLayers 지도 통합
```javascript
// 지도 초기화
map = new ol.Map({
    target: 'map',
    layers: [baseLayer, satelliteLayer, cadastreLayer, farmLayer],
    view: new ol.View({
        center: ol.proj.fromLonLat([126.65, 35.97]),
        zoom: 17
    })
});
```

### 3. WMS/WFS 레이어 구성
```javascript
// 지적편집도 WMS 레이어
const cadastreLayer = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: 'http://localhost:8080/geoserver/wms',
        params: {
            'LAYERS': 'cite:lsmd_cont_ldreg',
            'TILED': true
        }
    })
});
```

### 4. 상호 배타적 버튼 그룹
```javascript
function deactivateOtherGroups(activeGroup) {
    // 다른 그룹의 모든 버튼 비활성화
    if (activeGroup !== 'cadastre') {
        // 지적편집도 그룹 비활성화
    }
    if (activeGroup !== 'farm') {
        // 농지 그룹 비활성화
    }
    if (activeGroup !== 'measure') {
        // 측정 도구 그룹 비활성화
    }
}
```

### 5. 논리 삭제 구현
```xml
<!-- MyBatis Mapper -->
<delete id="deleteFarm">
    UPDATE farm.farms
    SET del_yn = 'Y', updated_at = CURRENT_TIMESTAMP
    WHERE id = #{id}
</delete>

<select id="getFarmsByUserId">
    SELECT * FROM farm.farms
    WHERE user_id = #{userId} AND del_yn = 'N'
</select>
```

### 6. 농지 상태별 스타일링
```javascript
function getStatusClass(status) {
    const statusMap = {
        '씨뿌림': 'status-planting',
        '모내기': 'status-transplanting',
        '성장중': 'status-growing',
        '수확완료': 'status-harvested',
        '휴경': 'status-fallow'
    };
    return statusMap[status] || 'status-unspecified';
}
```

---

## 트러블 슈팅

### 1. 폴더 추가 버튼 작동 안함
**문제**: 폴더 추가 버튼 클릭 시 아무 반응 없음

**원인**:
- 이벤트 핸들러가 `$(document).ready()` 외부에 선언됨
- DOM 로드 전에 이벤트 바인딩 시도

**해결**:
```javascript
// Before
$('#btn-add-folder').on('click', function() { ... });

// After
$(document).ready(function() {
    $('#btn-add-folder').on('click', function() { ... });
});
```

### 2. 농지 폴더 변경 시 "미지정" 폴더도 변경 불가
**문제**: 실제 폴더도 "미지정 폴더는 수정할 수 없습니다" 에러 발생

**원인**:
- `dataset.currentFolderId`가 null을 문자열 "null"로 저장
- `if (!folderId)` 체크가 문자열 "null"을 truthy로 판단

**해결**:
```javascript
// Before
if (!folderId) { ... }

// After
if (!folderId || folderId === 'null') { ... }
```

### 3. 폴더 카운트(farmCount) 업데이트 안됨
**문제**: 농지 추가/삭제/이동 후 폴더의 농지 개수가 업데이트 안됨

**원인**:
- 쿼리에서 farmCount를 계산하지 않음
- 프론트엔드에서만 표시

**해결** (예정):
```sql
SELECT
    f.*,
    COUNT(fa.id) as farmCount
FROM farm_folders f
LEFT JOIN farms fa ON f.id = fa.folder_id AND fa.del_yn = 'N'
WHERE f.user_id = ? AND f.del_yn = 'N'
GROUP BY f.id
```

### 4. 레이어/도구 버튼 중복 활성화 문제
**문제**: 여러 레이어나 도구를 동시에 켤 수 있어 충돌 발생

**원인**: 각 버튼이 독립적으로 동작

**해결**:
```javascript
// 3개 그룹 정의 및 상호 배타적 처리
function deactivateOtherGroups(activeGroup) {
    // 현재 활성화하려는 그룹 외 모두 비활성화
}
```

### 5. 농지 상태 변경 UI 불편
**문제**: prompt()로 숫자 입력 방식이 사용자 친화적이지 않음

**원인**: 초기 구현 시 간단히 prompt 사용

**해결**:
```javascript
// Before: prompt로 숫자 입력
let input = prompt('1:씨뿌림, 2:모내기...');

// After: 드롭다운 모달
<select id="status-select">
    <option value="씨뿌림">씨뿌림</option>
    ...
</select>
```

### 6. 툴팁 표시 없어 버튼 기능 불명확
**문제**: 아이콘만 있어 버튼 기능을 알기 어려움

**해결**:
```css
/* CSS 툴팁 추가 */
.widget-button:hover::after {
    content: attr(title);
    position: absolute;
    right: calc(100% + 10px);
    background: rgba(0, 0, 0, 0.8);
    color: #fff;
    ...
}
```

### 7. 농지/폴더 삭제 시 실제 데이터 손실
**문제**: DELETE 쿼리 사용으로 복구 불가

**해결**:
```xml
<!-- Hard Delete → Soft Delete -->
<delete id="deleteFarmFolder">
    UPDATE farm.farm_folders
    SET del_yn = 'Y', updated_at = CURRENT_TIMESTAMP
    WHERE id = #{id}
</delete>
```

---

## 향후 개선 방향

### 기능 개선
1. **농지 카운트 자동 계산**
   - DB 쿼리에서 JOIN으로 실시간 계산

2. **검색 기능 강화**
   - 농지명, 주소로 검색
   - 지도 이동 기능 연동

3. **통계 대시보드**
   - 농지별 작업 이력 통계
   - 상태별 농지 현황 그래프

4. **알림 기능**
   - 작업 알림 (파종, 수확 시기)
   - 날씨 정보 연동

### 기술 개선
1. **프론트엔드 모듈화**
   - ES6 모듈로 JavaScript 리팩토링
   - Webpack/Vite 도입

2. **상태 관리 개선**
   - 페이지 새로고침 없이 실시간 업데이트
   - WebSocket 연동 고려

3. **성능 최적화**
   - 지도 타일 캐싱
   - lazy loading 적용
   - API 응답 캐싱

4. **보안 강화**
   - CSRF 토큰 적용
   - XSS 방어 강화
   - SQL Injection 방어

5. **테스트 코드 작성**
   - JUnit 단위 테스트
   - Integration 테스트
   - E2E 테스트 (Selenium)

---

## 결론

### 프로젝트 성과
- 지도 기반 직관적인 농지 관리 시스템 구축
- RESTful API 설계로 확장 가능한 구조
- 사용자 친화적인 UI/UX 구현

### 배운 점
- Spring MVC와 MyBatis를 활용한 웹 애플리케이션 개발
- OpenLayers를 활용한 GIS 웹 서비스 구현
- WMS/WFS 표준 기반 공간정보 서비스 통합
- 실무 중심의 문제 해결 능력 향상

### 향후 계획
- 사용자 피드백 수렴 및 기능 개선
- 모바일 최적화
- 농작업 일지 기능 추가
- 농지 공유/협업 기능 구현

---

**문서 작성일**: 2025-01-23
**프로젝트 Repository**: [GitHub 링크]
**담당자**: [이름]
