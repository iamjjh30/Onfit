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

INSERT INTO products (
    name, price, stock_quantity, description, category, color,
    available_sizes, view_count,
    image_url, hover_image_url,
    recommended_seasons, style_tags,
    created_at
) VALUES

      ('블랙 배럴핏 데님 팬츠', 69000, 100,
       '워싱 처리된 블랙 배럴핏 데님. 루즈한 실루엣과 테이퍼드 밑단이 스트릿 무드를 완성합니다.',
       'PANTS', 'BLACK', 'S,M,L,XL', 0,
       '/img/product/pants/p100_black.jpg', '/img/product/pants/p100_black.jpg',
       'AUTUMN_WARM,WINTER_COOL', 'STREET,CASUAL', NOW()),

      ('스카이 블루 테이퍼드 슬랙스', 59000, 100,
       '선명한 스카이 블루 컬러의 테이퍼드 슬랙스. 깔끔한 실루엣으로 포멀과 세미캐주얼 모두 소화 가능합니다.',
       'PANTS', 'BLUE', 'S,M,L,XL', 0,
       '/img/product/pants/p200_blue.jpg', '/img/product/pants/p200_blue.jpg',
       'SPRING_WARM,SUMMER_COOL', 'FORMAL,MINIMAL', NOW()),

      ('블랙 코튼 스웨트 반바지', 39000, 100,
       '두꺼운 코튼 소재의 블랙 스웨트 반바지. 롤업 밑단 디테일로 깔끔한 캐주얼 룩을 완성합니다.',
       'SHORTS', 'BLACK', 'S,M,L,XL', 0,
       '/img/product/pants/p300_black.jpg', '/img/product/pants/p300_black.jpg',
       'SPRING_WARM,SUMMER_COOL,AUTUMN_WARM,WINTER_COOL', 'CASUAL,STREET', NOW()),

      ('블랙 페이크 레더 카고 팬츠', 89000, 100,
       '광택감 있는 페이크 레더 소재에 카고 포켓과 벨트가 포함된 스트릿 무드의 팬츠입니다.',
       'PANTS', 'BLACK', 'S,M,L,XL', 0,
       '/img/product/pants/p500_black.jpg', '/img/product/pants/p500_black.jpg',
       'WINTER_COOL,AUTUMN_WARM', 'STREET,FORMAL', NOW()),

      ('베이지 워싱 카고 팬츠', 65000, 100,
       '빈티지 워싱된 베이지 카고 팬츠. 드로우코드 밑단과 넉넉한 카고 포켓이 캐주얼 무드를 살려줍니다.',
       'PANTS', 'BEIGE', 'S,M,L,XL', 0,
       '/img/product/pants/p600_beige.jpg', '/img/product/pants/p600_beige.jpg',
       'SPRING_WARM,AUTUMN_WARM', 'CASUAL,VINTAGE', NOW()),

      ('네이비 사이드라인 트랙 팬츠', 55000, 100,
       '크림 사이드 라인이 포인트인 네이비 와이드 트랙 팬츠. 루즈한 실루엣으로 편안하게 착용할 수 있습니다.',
       'PANTS', 'NAVY', 'S,M,L,XL', 0,
       '/img/product/pants/p700_blue.png', '/img/product/pants/p700_blue.png',
       'WINTER_COOL,SUMMER_COOL', 'CASUAL,STREET', NOW()),

      ('블랙 와이드 치노 팬츠', 62000, 100,
       '깔끔한 블랙 와이드 치노 팬츠. 군더더기 없는 심플한 디자인으로 어떤 상의와도 잘 어울립니다.',
       'PANTS', 'BLACK', 'S,M,L,XL', 0,
       '/img/product/pants/p800_black.png', '/img/product/pants/p800_black.png',
       'AUTUMN_WARM,WINTER_COOL,SPRING_WARM,SUMMER_COOL', 'MINIMAL,FORMAL', NOW()),

      ('인디고 와이드 데님 숏츠', 49000, 100,
       '넉넉한 와이드 실루엣의 인디고 워싱 데님 반바지. 버뮤다 기장으로 빈티지 서퍼 무드를 연출합니다.',
       'SHORTS', 'DENIM', 'S,M,L,XL', 0,
       '/img/product/pants/p900_denim.png', '/img/product/pants/p900_denim.png',
       'SPRING_WARM,SUMMER_COOL', 'VINTAGE,CASUAL', NOW());
INSERT INTO products (
    name, price, stock_quantity, description, category, color,
    available_sizes, view_count,
    image_url, hover_image_url,
    recommended_seasons, style_tags,
    created_at
) VALUES

      ('OF 블랙 볼캡', 35000, 100,
       '톤온톤 OF 로고가 새겨진 미니멀한 블랙 볼캡. 어떤 룩에도 자연스럽게 녹아드는 데일리 캡입니다.',
       'CAP', 'BLACK', 'FREE', 0,
       '/img/product/cap/c100_black.png', '/img/product/cap/c100_black.png',
       'AUTUMN_WARM,WINTER_COOL', 'MINIMAL,STREET', NOW()),

      ('그래픽 로고 블랙 볼캡', 38000, 100,
       '입체 자수 그래픽 로고가 포인트인 블랙 스트럭처드 캡. 스트릿 룩의 마무리로 완벽합니다.',
       'CAP', 'BLACK', 'FREE', 0,
       '/img/product/cap/c150_black_logo.png', '/img/product/cap/c150_black_logo.png',
       'WINTER_COOL,AUTUMN_WARM', 'STREET,CASUAL', NOW()),

      ('OF 빅로고 레드 볼캡', 36000, 100,
       '굵직한 OF 빅 자수 로고가 시선을 사로잡는 레드 볼캡. 강렬한 포인트 아이템으로 활용하세요.',
       'CAP', 'RED', 'FREE', 0,
       '/img/product/cap/c200_red.png', '/img/product/cap/c200_red.png',
       'SPRING_WARM,AUTUMN_WARM', 'STREET,CASUAL', NOW()),

      ('OF 코듀로이 투톤 캡', 42000, 100,
       '레드 코듀로이 크라운에 네이비 챙이 조화로운 투톤 볼캡. 빈티지 감성을 물씬 풍깁니다.',
       'CAP', 'RED', 'FREE', 0,
       '/img/product/cap/c250_red_black.png', '/img/product/cap/c250_red_black.png',
       'AUTUMN_WARM,WINTER_COOL', 'VINTAGE,CASUAL', NOW()),

      ('OF 헤링본 올리브 캡', 39000, 100,
       '헤링본 패턴 원단으로 제작된 올리브 톤의 볼캡. 톤온톤 로고로 절제된 빈티지 무드를 완성합니다.',
       'CAP', 'GRAY', 'FREE', 0,
       '/img/product/cap/c300_gray.png', '/img/product/cap/c300_gray.png',
       'AUTUMN_WARM,SPRING_WARM', 'VINTAGE,MINIMAL', NOW()),

      ('CAP 스냅백 아이보리/그린', 40000, 100,
       '아이보리 바디에 그린 챙이 포인트인 스냅백. CAP 빅 자수 로고로 복고풍 캠퍼스 무드를 연출합니다.',
       'CAP', 'IVORY', 'FREE', 0,
       '/img/product/cap/c400_ivory_green.png', '/img/product/cap/c400_ivory_green.png',
       'SPRING_WARM,SUMMER_COOL', 'VINTAGE,CASUAL', NOW()),

      ('퍼즐 로고 투톤 볼캡', 41000, 100,
       '아이보리 크라운과 그린 챙의 투톤 구성에 블랙 퍼즐 로고가 포인트. 유니크한 캐주얼 캡입니다.',
       'CAP', 'IVORY', 'FREE', 0,
       '/img/product/cap/c450_ivory_green.png', '/img/product/cap/c450_ivory_green.png',
       'SPRING_WARM,SUMMER_COOL', 'CASUAL,STREET', NOW()),

      ('OF 올드잉글리시 베이지 캡', 37000, 100,
       '올드 잉글리시 서체의 OF 자수 로고가 클래식한 베이지 볼캡. 빈티지와 캐주얼을 동시에 잡는 아이템입니다.',
       'CAP', 'BEIGE', 'FREE', 0,
       '/img/product/cap/c500_beige.png', '/img/product/cap/c500_beige.png',
       'SPRING_WARM,AUTUMN_WARM', 'VINTAGE,CASUAL', NOW());