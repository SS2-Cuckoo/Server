# 간편한 메모, 쉬운 리마인드 : Cuckoo (Server)

iOS 앱 API 요청 처리용 백엔드 서버 🧑‍💻

## 구성 언어 및 라이브러리와 런타임

-   Javascript
-   Express
-   Node.js

## 주의 사항

-   `.env`파일 초기 정보 작성 필요

```javascript
// src/config
module.exports = {
    // About Service
    SERVICE_IP: process.env.SERVICE_IP, // Default : localhost
    SERVICE_PORT: Number(process.env.SERVICE_PORT), // Default : 8081

    // About DB
    DB_ID: process.env.DATABASE_ID,
    DB_PW: process.env.DATABASE_PW,
    DB_NAME: process.env.DATABASE_NAME,
    DB_HOST: process.env.DATABASE_HOST,
    DB_PORT: process.env.DATABASE_PORT,
};
```

## 설치 방법

### 우선 git Clone

```sh
$ git clone https://github.com/SS2-Cuckoo/Server.git
$ cd Server
```

## 진행 사항

-   [x] 개발 디렉토리 및 Git Repo 커밋.
-   [x] express를 활용하여 API 통신 테스트
-   [x] Docker BoilerPlate로 DB와 Sync
-   [x] DB 활성화 (설치 및 연동 + migration)
-   [x] DB Connect
-   [x] API 등록 및 유닛 테스트
-   [ ] API 연동 테스트
-   [ ] 기타 등등

## 기타 사항

-   서버 담당 : 표지원에게 연락 (010-2221-7086)
