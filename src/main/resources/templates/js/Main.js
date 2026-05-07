/* ============================================================
   OnFit — Main.js (통합 수정본)
   ============================================================ */

var CT_DATA = {
    neutral: {
        badge:'2026 S/S · NEUTRAL', bc:'#555', bg:'#f0f0f0',
        title:'뉴트럴 트렌드',
        desc:'그레이, 블랙, 크림을 중심으로 한 무채색 팔레트입니다.',
        palette:[{c:'#212121',n:'Noir'},{c:'#616161',n:'Charcoal'},{c:'#9e9e9e',n:'Gray'},{c:'#e0e0e0',n:'Silver'},{c:'#f5f0e8',n:'Cream',b:1}],
        tags:['#미니멀룩','#모노톤','#베이직'],
        kw:[{t:'TIMELESS',bg:'#f0f0f0',c:'#555'},{t:'MINIMAL',bg:'#111',c:'#fff'}]
    },
    spring_warm: {
        badge:'2026 S/S · SPRING WARM', bc:'#b84d00', bg:'#fff3ec',
        title:'스프링 웜 트렌드',
        desc:'화사하고 생동감 있는 컬러로 봄 스타일링을 완성하세요.',
        palette:[{c:'#ff8a65',n:'Coral'},{c:'#ffab91',n:'Peach'},{c:'#ffe0b2',n:'Apricot'}],
        tags:['#스프링웜','#코랄룩','#봄코디'],
        kw:[{t:'WARM',bg:'#fff3ec',c:'#b84d00'},{t:'VIBRANT',bg:'#ff7043',c:'#fff'}]
    },
    summer_cool: {
        badge:'2026 S/S · SUMMER COOL', bc:'#006d82', bg:'#e0f7fa',
        title:'써머 쿨 트렌드',
        desc:'시원하고 청량한 써머 쿨 팔레트입니다.',
        palette:[{c:'#00bcd4',n:'Aqua'},{c:'#0097a7',n:'Teal'},{c:'#80deea',n:'Sky'}],
        tags:['#써머쿨','#아쿠아룩','#쿨톤코디'],
        kw:[{t:'COOL',bg:'#e0f7fa',c:'#006d82'},{t:'CRISP',bg:'#00bcd4',c:'#fff'}]
    },
    autumn_warm: {
        badge:'2026 F/W · AUTUMN WARM', bc:'#7d2000', bg:'#fff0e8',
        title:'어텀 웜 트렌드',
        desc:'따스한 대지의 온기를 담은 깊이 있는 레이어드.',
        palette:[{c:'#bf360c',n:'Rust'},{c:'#e64a19',n:'Burnt'},{c:'#ff8f00',n:'Amber'}],
        tags:['#어텀웜','#테라코타','#가을코디'],
        kw:[{t:'EARTHY',bg:'#fff0e8',c:'#7d2000'},{t:'RICH',bg:'#bf360c',c:'#fff'}]
    },
    winter_cool: {
        badge:'2026 F/W · WINTER COOL', bc:'#1a237e', bg:'#eef0ff',
        title:'윈터 쿨 트렌드',
        desc:'선명하고 강렬한 윈터 쿨 팔레트입니다.',
        palette:[{c:'#3f51b5',n:'Indigo'},{c:'#1a237e',n:'Deep Blue'},{c:'#7c4dff',n:'Violet'}],
        tags:['#윈터쿨','#인디고룩','#겨울코디'],
        kw:[{t:'BOLD',bg:'#eef0ff',c:'#1a237e'},{t:'INTENSE',bg:'#3f51b5',c:'#fff'}]
    }
};

// 팝업 열기 함수 (안전 장치 추가)
window.openColorTrendPopup = function(key) {
    var d = CT_DATA[key];
    if (!d) return;

    var badge = document.getElementById('ct-badge');
    if(badge) {
        badge.textContent = d.badge;
        badge.style.cssText = 'color:'+d.bc+';background:'+d.bg+';border:1.5px solid '+d.bc+';padding:4px 13px;border-radius:100px;font-size:0.7rem;font-weight:700;display:inline-block;';
    }

    if(document.getElementById('ct-title')) document.getElementById('ct-title').textContent = d.title;
    if(document.getElementById('ct-desc')) document.getElementById('ct-desc').textContent = d.desc;

    var palette = document.getElementById('ct-palette');
    if(palette) {
        palette.innerHTML = d.palette.map(function(s){
            return '<div class="ct-sw-wrap"><div class="ct-sw" style="background:'+s.c+';'+(s.b?'border:2px solid #ccc;':'')+'"></div><span class="ct-sw-name">'+s.n+'</span></div>';
        }).join('');
    }

    var tags = document.getElementById('ct-tags');
    if(tags) {
        tags.innerHTML = d.tags.map(function(t){
            return '<span class="ct-tag">'+t+'</span>';
        }).join('');
    }

    var keywords = document.getElementById('ct-keywords');
    if(keywords) {
        keywords.innerHTML = d.kw.map(function(k){
            return '<span class="ct-kw" style="background:'+k.bg+';color:'+k.c+'">'+k.t+'</span>';
        }).join('');
    }

    // 이미지 처리 (오류 방지 핵심)
    var cardImg = document.querySelector('.trend-single-img[onclick*="\''+key+'\'"] img');
    var popImg  = document.getElementById('ct-img');
    if (popImg && cardImg) {
        popImg.src = cardImg.src;
    }

    var ov = document.getElementById('ct-overlay');
    if(ov) {
        ov.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
};

window.ctClose = function() {
    var ov = document.getElementById('ct-overlay');
    if (ov) ov.style.display = 'none';
    document.body.style.overflow = '';
};

window.ctOverlayClick = function(e) {
    if (e.target.id === 'ct-overlay') window.ctClose();
};

// ESC 닫기
document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') window.ctClose();
});

// 배너 슬라이드 데이터
const slideData = [
    { title: "New start with OnFit", subtitle: "2026 Seasonal Sale" },
    { title: "AI 코디 플래너", subtitle: "오늘의 TPO에 딱 맞는 스타일링" },
    { title: "퍼스널 컬러 진단", subtitle: "당신의 숨겨진 톤을 찾아드립니다" }
];

// 배너 로직 (DOMContentLoaded 안에서 실행)
document.addEventListener('DOMContentLoaded', function() {
    const banner = document.getElementById('banner');
    if(!banner) return;

    const slides = banner.querySelectorAll('img');
    const titleEl = document.getElementById('banner-title');
    const subtitleEl = document.getElementById('banner-subtitle');
    let currentSlide = 0;

    function showSlide(index) {
        slides.forEach((s, i) => s.style.opacity = (i === index ? 1 : 0));
        if(titleEl && slideData[index]) titleEl.textContent = slideData[index].title;
        if(subtitleEl && slideData[index]) subtitleEl.textContent = slideData[index].subtitle;

        document.querySelectorAll('.banner-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
        currentSlide = index;
    }

    setInterval(() => {
        let next = (currentSlide + 1) % slides.length;
        showSlide(next);
    }, 5000);

    showSlide(0);
});
