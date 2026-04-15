INSERT INTO products
(name, price, category, image_url, hover_image_url, recommended_seasons, style_tags, stock_quantity)
VALUES
/* --- 셔츠 (SHIRT) --- */
-- 옥스포드 셔츠: 단정하고 깔끔한 느낌
('모던 배색 옥스포드 셔츠', 45000, 'SHIRT', '../img/Main/s100_whiteNblack.png', '../img/Main/s100_whiteNblack.png', 'WINTER_COOL, SUMMER_COOL, NEUTRAL', 'FORMAL, MINIMAL', 100),
-- 하프 셔츠: 시원하고 편안한 느낌
('오션 브리즈 코튼 하프 셔츠', 39000, 'SHIRT', '../img/Main/s200_green.png', '../img/Main/s200_green.png', 'SPRING_WARM, AUTUMN_WARM', 'CASUAL', 100),
-- 베이직 릴렉스 셔츠: 기본템 + 편안한 핏
('에센셜 베이직 릴렉스 셔츠', 42000, 'SHIRT', '../img/Main/s300_white.png', '../img/Main/s300_white.png', 'SPRING_WARM, SUMMER_COOL, AUTUMN_WARM, WINTER_COOL, NEUTRAL', 'MINIMAL, CASUAL', 100),
-- 빈티지 워싱 데님 셔츠: 워싱이 들어간 데님
('빈티지 워싱 데님 셔츠', 55000, 'SHIRT', '../img/Main/s500_denim_long.png', '../img/Main/s500_denim_long.png', 'WINTER_COOL, SUMMER_COOL, NEUTRAL', 'VINTAGE, CASUAL', 100),

/* --- 자켓 (JACKET) --- */
-- 미니멀 셔켓: 이름 그대로 미니멀하고 가벼운 아우터
('미니멀 투포켓 집업 셔켓', 79000, 'JACKET', '../img/Main/fit_j100_brown.png', '../img/Main/fit_j100_brown.png', 'AUTUMN_WARM, SPRING_WARM', 'MINIMAL, CASUAL', 100),
-- 유틸리티 자켓: 포켓이 많고 실용적인 워크웨어/스트릿 무드
('아이스 블루 유틸리티 자켓', 85000, 'JACKET', '../img/Main/fit_j200_blue.png', '../img/Main/fit_j200_blue.png', 'SUMMER_COOL, WINTER_COOL', 'STREET, CASUAL', 100),
-- 블루종: 도시적이고 깔끔한 핏
('어반 컴포트 릴렉스 블루종', 82000, 'JACKET', '../img/Main/fit_j300_black.png', '../img/Main/fit_j300_black.png', 'WINTER_COOL, SUMMER_COOL, NEUTRAL', 'MINIMAL, CASUAL', 100),

/* --- 후드 (HOODIE) --- */
-- 기본 프리미엄 후디: 군더더기 없는 릴렉스핏 기본템
('프리미엄 코튼 릴렉스 핏 후디', 49000, 'HOODIE', '../img/Main/h100_white.png', '../img/Main/h100_white.png', 'SPRING_WARM, SUMMER_COOL, NEUTRAL', 'MINIMAL, CASUAL', 100),
-- 미니멀 아카이브 후디: 깔끔하지만 디자인 포인트가 있는 느낌
('미니멀 아카이브 풀오버 후디', 54000, 'HOODIE', '../img/Main/h200_cyan.png', '../img/Main/h200_cyan.png', 'SUMMER_COOL, WINTER_COOL', 'MINIMAL, STREET', 100),
-- 파카: 오리지널 밀리터리나 레트로한 무드가 강한 아우터급 후드
('오리지널 퍼 후드 보머 파카', 129000, 'HOODIE', '../img/Main/h300_khaki.png', '../img/Main/h300_khaki.png', 'AUTUMN_WARM, NEUTRAL', 'VINTAGE, STREET', 100),
-- 시티보이 후디: 시티보이 룩 특유의 넉넉하고 편안한 무드
('시티보이 무드 데일리 후디', 52000, 'HOODIE', '../img/Main/h400_grey.png', '../img/Main/h400_grey.png', 'SUMMER_COOL, WINTER_COOL, NEUTRAL', 'CASUAL, STREET', 100),
-- 어반 스트릿 후디: 힙하고 무거운 느낌의 스트릿 전용
('어반 스트릿 헤비 후디', 65000, 'HOODIE', '../img/Main/h500_khaki.png', '../img/Main/h500_khaki.png', 'AUTUMN_WARM, SPRING_WARM', 'STREET', 100),
-- 컬러 포인트 후디: 기본 스타일에 색감으로만 포인트를 줌
('에센셜 컬러 포인트 후디', 48000, 'HOODIE', '../img/Main/h600_orange.png', '../img/Main/h600_orange.png', 'SPRING_WARM, AUTUMN_WARM', 'CASUAL, MINIMAL', 100),
-- 기모 후디: 따뜻하고 부드러운 일상용 후드
('소프트 터치 기모 후디', 59000, 'HOODIE', '../img/Main/h700_ivory.png', '../img/Main/h700_ivory.png', 'SPRING_WARM, AUTUMN_WARM, NEUTRAL', 'CASUAL', 100);