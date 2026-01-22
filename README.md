# 🎨 OnFit (온핏) - AI 퍼스널 컬러 진단 쇼핑몰

> **사용자의 퍼스널 컬러를 AI로 분석하고, 그에 최적화된 의류를 제안하는 스마트 쇼핑 플랫폼입니다.**

---

## 🚀 1. 핵심 기능
* **AI 퍼스널 컬러 진단**: MediaPipe 및 Google GenAI를 활용하여 사용자의 피부톤과 이목구비를 분석, 퍼스널 컬러를 판별합니다.
* **스마트 상품 추천**: 진단된 퍼스널 컬러에 맞는 색상의 의류를 우선적으로 노출합니다.
* **3D 가상 피팅**: 사용자의 상반신 사진을 기반으로 의류를 가상으로 착용해볼 수 있는 기능을 제공합니다.
* **커뮤니티 및 공유**: 자신의 진단 결과와 코디를 공유하고 피드백을 주고받는 공간입니다.

## 🛠 2. 기술 스택
### Backend
* **Language**: Java 17
* **Framework**: Spring Boot 3.5.x
* **Build Tool**: Gradle
* **Database**: MySQL, Spring Data JPA
* **AI Integration**: Spring AI (Google GenAI / Gemini), MediaPipe

### Frontend
* **UI**: HTML5, CSS3, JavaScript
* **Template Engine**: Thymeleaf
* **3D Rendering**: Three.js

---

## 📂 3. 프로젝트 구조 (Project Structure)
```text
src/main/java/com/example/onfit
├── config          # 보안 및 웹 설정
├── controller      # URL 매핑 및 화면 전환
├── service         # 핵심 비즈니스 로직
├── repository      # DB 접근 (JPA)
└── entity          # DB 테이블 매핑 클래스

src/main/resources
├── static          # CSS, JS, Images
└── templates       # HTML (Thymeleaf)
