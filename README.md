"""# 🏋️ OnFit Project (Standard Version)

##  프로젝트 개요
- **OnFit**은 사용자의 운동 기록 관리 및 커뮤니티 기능을 제공하는 웹 플랫폼입니다.
- 본 저장소는 팀 프로젝트의 **표준 버전**이며, 모든 팀원은 이 구조와 규칙을 준수해야 합니다.

## ⚙️ 개발 환경 (Tech Stack)
- **Language**: Java 17
- **Framework**: Spring Boot 3.5.9
- **Build Tool**: Gradle
- **Database**: MySQL 8.0 / MyBatis / JPA (Spring Data JPA)
- **Template Engine**: Thymeleaf

##  표준 프로젝트 구조 (Directory Structure)
팀원들은 파일을 추가할 때 반드시 아래 경로를 지켜주세요.
- `src/main/java/com/example/onfit/controller`: 컨트롤러 (페이지 이동 및 API)
- `src/main/java/com/example/onfit/entity`: JPA 엔티티 클래스
- `src/main/java/com/example/onfit/repository`: JPA 레포지토리 인터페이스
- `src/main/java/com/example/onfit/service`: 비즈니스 로직 서비스
- `src/main/resources/templates`: **HTML 파일** (Thymeleaf 전용)
- `src/main/resources/templates/fragments`: **공통 컴포넌트(Header, Footer 등) 위치**
- `src/main/resources/static/css`: **CSS 파일**
- `src/main/resources/static/js`: **Javascript 파일**
- `src/main/resources/static/img`: **이미지 리소스**

##  팀 협업 규칙 (Convention) - 필독!

### 1. 경로 작성 (Thymeleaf Path)
상대 경로(`../`)는 절대 사용하지 않습니다. 모든 경로는 루트(`/`)에서 시작하는 **절대 경로**로 작성하세요.
- **잘못된 예**: `<link rel="stylesheet" href="../css/style.css">`
- **올바른 예**: `<link rel="stylesheet" th:href="@{/css/style.css}">`

### 2. 파일 명명 규칙 (Naming)
- **HTML/CSS/JS**: 대소문자를 구분하므로 가급적 **CamelCase**(`CommunityEditor.html`) 또는 **소문자**로 통일합니다.
- **Controller**: `@GetMapping("/주소")`와 같이 명확한 경로를 지정하고, 리턴하는 파일명과 실제 파일명의 대소문자가 일치해야 합니다.

### 3. 데이터베이스 (DB)
- `application.properties`의 DB 비밀번호는 본인 로컬 환경에 맞게 수정하여 사용하되, **서버에 올릴 때는 공통 설정을 준수**합니다.
- 엔티티의 ID 필드명은 `id`로 통일하며, 중복 매핑(`order_id` 중복 등)이 발생하지 않도록 주의합니다.

##  Git 사용 방법 (GitHub Desktop)
1. **작업 시작 전**: `Fetch origin` 후 `Pull`을 눌러 최신 코드를 먼저 받습니다.
2. **작업 완료 후**: 변경된 파일을 확인하고 `Summary`를 작성한 뒤 `Commit` 합니다.
3. **최종 업로드**: `Push origin`을 눌러 본인의 코드를 서버에 반영합니다.

## ⚠️ 주의 사항
- `.gitignore`에 등록된 파일(build, .idea 등)은 공유하지 않습니다.
