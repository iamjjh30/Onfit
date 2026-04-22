/* ================================================================
   Main.js  — OnFit 메인 페이지 전용 스크립트
   배너 슬라이드쇼 / 시즌 컬러 렌더링 / 탭 전환 + GNB 연동 /
   탭 파티클 마이크로 인터랙션 / 컬러 트렌드 팝업 / FAQ 토글
   ================================================================ */

/* ── 배너 슬라이드쇼 ── */
(function () {
    const slides = document.querySelectorAll('#banner .slide');
    const dots   = document.querySelectorAll('.banner-dot');
    let current  = 0, timer = null;

    function goTo(idx) {
        if (!slides.length) return;
        slides[current].classList.remove('active');
        if (dots[current]) dots[current].classList.remove('active');
        current = (idx + slides.length) % slides.length;
        slides[current].classList.add('active');
        if (dots[current]) dots[current].classList.add('active');
    }

    function startAuto() {
        clearInterval(timer);
        timer = setInterval(() => goTo(current + 1), 4000);
    }

    dots.forEach((dot, i) => dot.addEventListener('click', () => { goTo(i); startAuto(); }));

    const banner = document.getElementById('banner');
    if (banner) {
        banner.addEventListener('mouseenter', () => clearInterval(timer));
        banner.addEventListener('mouseleave', startAuto);
        startAuto();
    }
})();

/* ================================================================
   월별 시즌 컬러 데이터
   ================================================================ */
const MONTHLY_OUTFIT = {
    1:  { label: 'JAN',  season: 'WINTER', keyword: '딥 윈터 무드',    colors: ['#1a1a2e','#16213e','#4fc3f7','#e8eaf6'], names: ['미드나잇','딥 인디고','아이시 블루','오프 화이트'], accent: '#4fc3f7', bg: 'linear-gradient(135deg,#0d1117 0%,#1a1a2e 100%)' },
    2:  { label: 'FEB',  season: 'WINTER', keyword: '크리미 윈터',     colors: ['#f5e6d3','#d4a574','#8b6914','#2c2c2c'], names: ['크림','카멜','버번','차콜'],                     accent: '#d4a574', bg: 'linear-gradient(135deg,#1a1510 0%,#2c2416 100%)' },
    3:  { label: 'MAR',  season: 'SPRING', keyword: '얼리 스프링',     colors: ['#a8d5a2','#f8f9e8','#c8e6c9','#558b2f'], names: ['세이지','오트밀','민트','포레스트'],             accent: '#a8d5a2', bg: 'linear-gradient(135deg,#0d1a0d 0%,#1a2e1a 100%)' },
    4:  { label: 'APR',  season: 'SPRING', keyword: '블로섬 봄',       colors: ['#f8c8d4','#e91e8c','#ffecd2','#ff6b9d'], names: ['핑크블러쉬','로즈','피치','코랄핑크'],         accent: '#f8c8d4', bg: 'linear-gradient(135deg,#1a0d12 0%,#2e1a20 100%)' },
    5:  { label: 'MAY',  season: 'SPRING', keyword: '라이트 스프링',   colors: ['#fff176','#ffcc02','#ffe0b2','#ff8f00'], names: ['선샤인','버터','피치','탠저린'],               accent: '#ffcc02', bg: 'linear-gradient(135deg,#1a1500 0%,#2e2600 100%)' },
    6:  { label: 'JUN',  season: 'SUMMER', keyword: '써머 쿨',         colors: ['#00bcd4','#e0f7fa','#006064','#ffffff'], names: ['아쿠아','아이스','딥 틸','화이트'],             accent: '#00bcd4', bg: 'linear-gradient(135deg,#001a1e 0%,#002b33 100%)' },
    7:  { label: 'JUL',  season: 'SUMMER', keyword: '비비드 써머',     colors: ['#ff5722','#ff9800','#ffeb3b','#4caf50'], names: ['레드오렌지','오렌지','옐로','그린'],           accent: '#ff5722', bg: 'linear-gradient(135deg,#1a0800 0%,#2e1400 100%)' },
    8:  { label: 'AUG',  season: 'SUMMER', keyword: '트로피컬',         colors: ['#26a69a','#80cbc4','#fff8e1','#ff8a65'], names: ['틸','라이트 틸','크림','코랄'],               accent: '#26a69a', bg: 'linear-gradient(135deg,#001a18 0%,#002e2b 100%)' },
    9:  { label: 'SEP',  season: 'AUTUMN', keyword: '얼리 어텀',        colors: ['#bf8040','#8d6e63','#d7ccc8','#4e342e'], names: ['어텀 골드','코코아','베이지','초코'],         accent: '#bf8040', bg: 'linear-gradient(135deg,#1a0f00 0%,#2e1e00 100%)' },
    10: { label: 'OCT',  season: 'AUTUMN', keyword: '딥 어텀',          colors: ['#d84315','#bf360c','#e65100','#ff8f00'], names: ['번트 레드','딥 오렌지','러스트','앰버'],     accent: '#d84315', bg: 'linear-gradient(135deg,#1a0800 0%,#3d1200 100%)' },
    11: { label: 'NOV',  season: 'AUTUMN', keyword: '어텀 뉴트럴',      colors: ['#795548','#bcaaa4','#efebe9','#4e342e'], names: ['웜 브라운','로즈 베이지','오트밀','다크 브라운'], accent: '#795548', bg: 'linear-gradient(135deg,#120d0a 0%,#1e1510 100%)' },
    12: { label: 'DEC',  season: 'WINTER', keyword: '홀리데이 윈터',    colors: ['#c62828','#b71c1c','#f5f5f5','#212121'], names: ['크리스마스 레드','딥 레드','스노우','블랙'], accent: '#c62828', bg: 'linear-gradient(135deg,#0d0000 0%,#1a0000 100%)' },
};

function renderSeasonalColors(monthLabelId, badgeId, paletteId, keywordId, seasonTextId) {
    const month = new Date().getMonth() + 1;
    const d     = MONTHLY_OUTFIT[month];

    const mlEl = document.getElementById(monthLabelId);
    const bdEl = document.getElementById(badgeId);
    const plEl = document.getElementById(paletteId);
    const kwEl = document.getElementById(keywordId);
    const stEl = document.getElementById(seasonTextId);

    if (!mlEl || !plEl) return;

    mlEl.textContent = d.label;
    if (bdEl) { bdEl.textContent = d.season; bdEl.style.borderColor = d.accent; bdEl.style.color = d.accent; }
    if (kwEl) { kwEl.textContent = d.keyword; kwEl.style.color = d.accent; }
    if (stEl) stEl.textContent = d.season;

    const section = plEl.closest('.seasonal-colors-section');
    if (section) {
        section.style.setProperty('--season-glow',
            `radial-gradient(ellipse 60% 80% at 30% 50%, ${d.accent}44 0%, transparent 70%)`);
    }

    plEl.innerHTML = d.colors.map((c, i) => `
        <div class="season-chip-group">
            <div class="season-chip" style="background:${c}"></div>
            <span class="season-chip-name">${d.names[i]}</span>
        </div>
    `).join('');
}

/* ================================================================
   탭 전환 + GNB 연동 + 마이크로 파티클
   ================================================================ */
const MICRO_THEMES = { neutral: null, spring_warm: 'spring', summer_cool: 'summer', autumn_warm: 'autumn', winter_cool: 'winter' };

const TAB_THEME = {
    neutral:     null,
    spring_warm: { bg: 'rgba(255,220,235,0.35)', border: 'rgba(230,80,150,0.35)',  shadow: 'rgba(230,80,150,0.15)' },
    summer_cool: { bg: 'rgba(200,235,255,0.35)', border: 'rgba(0,180,220,0.35)',   shadow: 'rgba(0,180,220,0.15)' },
    autumn_warm: { bg: 'rgba(255,210,170,0.35)', border: 'rgba(210,100,30,0.35)',  shadow: 'rgba(210,100,30,0.15)' },
    winter_cool: { bg: 'rgba(200,215,255,0.35)', border: 'rgba(80,100,220,0.35)',  shadow: 'rgba(80,100,220,0.15)' },
};

let microTimer = null;

function launchMicro(season, tabEl) {
    const old = tabEl.querySelector('.tab-particles');
    if (old) old.remove();
    if (microTimer) clearTimeout(microTimer);

    const cont = document.createElement('div');
    cont.className = 'tab-particles';
    tabEl.appendChild(cont);
    const W = tabEl.offsetWidth;

    function mkParticle(cls, extra) {
        const p = document.createElement('span');
        p.className = 'tab-p ' + cls;
        p.style.left = (Math.random() * W) + 'px';
        p.style.setProperty('--dx', ((Math.random() - 0.5) * 36) + 'px');
        p.style.animationDelay = (Math.random() * 0.4) + 's';
        if (extra) Object.assign(p.style, extra);
        cont.appendChild(p);
    }

    if (season === 'spring')      { for (let i = 0; i < 12; i++) mkParticle('tp-petal'); }
    else if (season === 'summer') { for (let i = 0; i < 14; i++) mkParticle('tp-drop'); }
    else if (season === 'autumn') {
        const cols = ['#d84315','#e65100','#ff8f00','#795548'];
        for (let i = 0; i < 10; i++) mkParticle('tp-leaf', { background: cols[i % 4] });
    }
    else if (season === 'winter') {
        const fl = ['❄','❅','❆','✦'];
        for (let i = 0; i < 12; i++) {
            const p = document.createElement('span');
            p.className = 'tab-p tp-snow';
            p.textContent = fl[i % 4];
            p.style.left = (Math.random() * W) + 'px';
            p.style.setProperty('--dx', ((Math.random() - 0.5) * 30) + 'px');
            p.style.animationDelay = (Math.random() * 0.4) + 's';
            cont.appendChild(p);
        }
        const snowman = document.getElementById('snowmanEmoji');
        if (snowman) { snowman.classList.add('active'); setTimeout(() => snowman.classList.remove('active'), 600); }
    }

    microTimer = setTimeout(() => cont.remove(), 1500);
}

/* ================================================================
   컬러 트렌드 팝업 데이터
   ================================================================ */
const COLOR_TREND_DATA = {
    neutral: {
        img: '/img/Main/ss.png',
        badge: 'NEUTRAL',
        badgeColor: '#555',
        title: '뉴트럴 — 무채색의 힘',
        desc: '블랙, 화이트, 그레이, 베이지. 어디서나 통하는 뉴트럴 팔레트는 이번 시즌도 강세입니다. 톤온톤 레이어드와 텍스처 믹스로 깊이감을 더하세요.',
        colors: ['#212121','#616161','#9e9e9e','#e0e0e0','#f5f0e8'],
        names:  ['Noir','Charcoal','Gray','Silver','Cream'],
        tags:   ['#미니멀','#톤온톤','#모노크롬','#베이직'],
        keywords: ['블랙&화이트 컨트라스트','머스타드 포인트 컬러','베이지 레이어드'],
    },
    spring_warm: {
        img: '/img/Main/sp_img.jpg',
        badge: 'SPRING WARM',
        badgeColor: '#ff8a65',
        title: '스프링 웜 — 생기로운 코랄',
        desc: '코랄, 살구, 피치. 따뜻하고 화사한 봄 웜톤의 시즌이 돌아왔습니다. 아이보리 베이스에 코랄 포인트로 생동감 넘치는 룩을 완성하세요.',
        colors: ['#ff8a65','#ffab91','#ffe0b2','#fff8e1','#f8bbd0'],
        names:  ['Coral','Apricot','Peach','Ivory','Blush'],
        tags:   ['#코랄룩','#봄웜톤','#피치코디','#화사한'],
        keywords: ['코랄+아이보리 레이어드','피치 그라디에이션','봄 캐주얼'],
    },
    summer_cool: {
        img: '/img/Main/s_img.jpg',
        badge: 'SUMMER COOL',
        badgeColor: '#00bcd4',
        title: '써머 쿨 — 청량한 아쿠아',
        desc: '아쿠아, 아이시 블루, 틸. 차갑고 시원한 써머 쿨 팔레트로 여름을 맞이하세요. 화이트와의 매치로 선명하고 깔끔한 인상을 완성하세요.',
        colors: ['#00bcd4','#80deea','#b2ebf2','#e0f7fa','#b39ddb'],
        names:  ['Aqua','Ice','Powder','Mist','Lavender'],
        tags:   ['#아쿠아룩','#써머쿨','#마린코디','#청량한'],
        keywords: ['아쿠아+화이트 클린룩','라벤더 포인트','뮤트 블루 레이어드'],
    },
    autumn_warm: {
        img: '/img/Main/f_img.jpg',
        badge: 'AUTUMN WARM',
        badgeColor: '#e64a19',
        title: '어텀 웜 — 깊은 어스 톤',
        desc: '번트 오렌지, 러스트, 카멜, 올리브. 풍부하고 원숙한 어텀 웜 팔레트로 가을의 깊이감을 표현하세요. 자연에서 온 어스 톤이 올 시즌 핵심입니다.',
        colors: ['#bf360c','#e64a19','#f9a825','#795548','#827717'],
        names:  ['Burnt','Rust','Mustard','Mocha','Olive'],
        tags:   ['#어스톤','#어텀웜','#러스트코디','#빈티지'],
        keywords: ['번트오렌지+올리브 레이어드','카멜 무드 코디','머스타드 포인트'],
    },
    winter_cool: {
        img: '/img/Main/w_img.jpg',
        badge: 'WINTER COOL',
        badgeColor: '#3f51b5',
        title: '윈터 쿨 — 선명한 인디고',
        desc: '미드나잇 블루, 인디고, 퓨어 블랙, 스노우 화이트. 강렬한 명도 대비로 에디토리얼한 윈터 룩을 완성하세요. 흐린 색은 걷어내고 선명함으로 승부하세요.',
        colors: ['#1a1a2e','#3f51b5','#7986cb','#e91e63','#f5f5f5'],
        names:  ['Midnight','Indigo','Slate','Fuchsia','Snow'],
        tags:   ['#모노크롬','#윈터쿨','#인디고룩','#에디토리얼'],
        keywords: ['블랙+화이트 하이콘트라스트','인디고 올인원','미드나잇 레이어드'],
    },
};

window.openColorTrendPopup = function (key) {
    const d = COLOR_TREND_DATA[key];
    if (!d) return;

    document.getElementById('ctpopupImg').src         = d.img;
    document.getElementById('ctpopupBadge').textContent = d.badge;
    document.getElementById('ctpopupBadge').style.borderColor = d.badgeColor;
    document.getElementById('ctpopupBadge').style.color       = d.badgeColor;
    document.getElementById('ctpopupTitle').textContent = d.title;
    document.getElementById('ctpopupDesc').textContent  = d.desc;

    document.getElementById('ctpopupPalette').innerHTML = d.colors.map((c, i) => `
        <div class="ctpopup-swatch">
            <div class="ctpopup-swatch-dot" style="background:${c}"></div>
            <span class="ctpopup-swatch-name">${d.names[i]}</span>
        </div>`).join('');

    document.getElementById('ctpopupTags').innerHTML = d.tags.map(t =>
        `<span class="ctpopup-tag">${t}</span>`).join('');

    document.getElementById('ctpopupKeywords').innerHTML = d.keywords.map(kw => `
        <div class="ctpopup-kw-row">
            <span class="ctpopup-kw-dot" style="background:${d.badgeColor}"></span>${kw}
        </div>`).join('');

    document.getElementById('color-trend-popup-overlay').classList.add('active');
};

window.closeColorTrendPopup = function (e) {
    if (e && e.forceClose) {
        document.getElementById('color-trend-popup-overlay').classList.remove('active');
        return;
    }
    if (e && e.target === document.getElementById('color-trend-popup-overlay')) {
        document.getElementById('color-trend-popup-overlay').classList.remove('active');
    }
};

/* ================================================================
   FAQ 토글
   ================================================================ */
window.toggleFaq = function (btn) {
    const item   = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
};

/* ================================================================
   DOMContentLoaded — 탭 / 시즌 컬러 / GNB 연동
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
    const headerElement = document.querySelector('#header');
    const tabs          = document.querySelectorAll('#tab_button li');
    const contents      = document.querySelectorAll('.content');

    // 시즌 컬러 렌더링
    renderSeasonalColors('scMonthName', 'scBadge',   'scPalette',   'scKeyword',   'scSeasonText');
    renderSeasonalColors('scMonthSW',   'scBadgeSW', 'scPaletteSW', 'scKeywordSW', null);
    renderSeasonalColors('scMonthSC',   'scBadgeSC', 'scPaletteSC', 'scKeywordSC', null);
    renderSeasonalColors('scMonthAW',   'scBadgeAW', 'scPaletteAW', 'scKeywordAW', null);
    renderSeasonalColors('scMonthWC',   'scBadgeWC', 'scPaletteWC', 'scKeywordWC', null);

    // 탭 클릭 이벤트
    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const target = this.getAttribute('data-tab');

            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            contents.forEach(c => c.classList.remove('active'));
            const show = document.querySelector(`[data-tab-content="${target}"]`);
            if (show) show.classList.add('active');

            // GNB 컬러 변경
            const theme = TAB_THEME[target];
            if (headerElement) {
                if (theme) {
                    headerElement.style.setProperty('background',   theme.bg,     'important');
                    headerElement.style.setProperty('border-color', theme.border, 'important');
                    headerElement.style.setProperty('box-shadow',   `0 15px 40px -10px ${theme.shadow}`, 'important');
                } else {
                    headerElement.style.setProperty('background',   'rgba(255, 255, 255, 0.4)', 'important');
                    headerElement.style.setProperty('border-color', 'rgba(255, 255, 255, 0.4)', 'important');
                    headerElement.style.setProperty('box-shadow',   '0 8px 32px rgba(0, 0, 0, 0.04)', 'important');
                }
            }

            // 파티클 인터랙션
            const season = MICRO_THEMES[target];
            if (season) launchMicro(season, this);
        });
    });
});

/* ================================================================
   장바구니 모달 — 공통 유틸
   ================================================================ */

// 사이즈 버튼 렌더링 (sizes: "S,M,L,XL" 또는 null)
function renderSizeBtns(container, sizes) {
    container.innerHTML = '';
    if (!sizes || sizes.trim() === '' || sizes.trim().toLowerCase() === 'null') {
        // 사이즈 없으면 FREE 자동 선택
        container.innerHTML = '<button class="size-btn active" data-size="FREE">FREE</button>';
        return;
    }
    sizes.split(',').forEach((s, i) => {
        const btn = document.createElement('button');
        btn.className = 'size-btn' + (i === 0 ? ' active' : '');
        btn.dataset.size = s.trim();
        btn.textContent = s.trim();
        btn.addEventListener('click', function () {
            container.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
        container.appendChild(btn);
    });
}

function getSelectedSize(container) {
    const active = container.querySelector('.size-btn.active');
    return active ? active.dataset.size : null;
}

function showCartToast(msg, success = true) {
    const toast = document.getElementById('main-cart-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.className = 'cart-toast-show' + (success ? '' : ' cart-toast-error');
    setTimeout(() => { toast.className = ''; }, 2500);
}

async function addToCartApi(productId, size, qty) {
    const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, size, quantity: qty })
    });
    if (res.status === 401) throw new Error('LOGIN_REQUIRED');
    if (!res.ok) throw new Error('FAIL');
    return res;
}

/* ================================================================
   BEST PICKS 단일 상품 모달
   ================================================================ */
let _cartModalProductId = null;

window.openCartModal = function (btn) {
    _cartModalProductId = btn.dataset.productId;
    const sizes         = btn.dataset.availableSizes;
    const name          = btn.dataset.productName;

    document.getElementById('cartModalProductName').textContent = name || '상품';
    document.getElementById('cartModalQty').textContent = '1';
    renderSizeBtns(document.getElementById('cartModalSizeBtns'), sizes);

    document.getElementById('cart-modal-overlay').classList.add('active');
};

window.closeCartModal = function (e) {
    if (e && e.target === document.getElementById('cart-modal-overlay'))
        document.getElementById('cart-modal-overlay').classList.remove('active');
};
window.closeCartModalForce = function () {
    document.getElementById('cart-modal-overlay').classList.remove('active');
};

window.changeQty = function (delta) {
    const el  = document.getElementById('cartModalQty');
    const val = Math.max(1, parseInt(el.textContent) + delta);
    el.textContent = val;
};

window.submitCartModal = async function () {
    const size = getSelectedSize(document.getElementById('cartModalSizeBtns'));
    const qty  = parseInt(document.getElementById('cartModalQty').textContent);
    const btn  = document.getElementById('cartModalSubmit');

    if (!size) { showCartToast('사이즈를 선택해주세요.', false); return; }

    btn.disabled = true;
    btn.textContent = '담는 중...';
    try {
        await addToCartApi(_cartModalProductId, size, qty);
        closeCartModalForce();
        showCartToast('장바구니에 담겼습니다 🛒');
    } catch (e) {
        if (e.message === 'LOGIN_REQUIRED') {
            showCartToast('로그인이 필요합니다.', false);
            setTimeout(() => { location.href = '/login'; }, 1200);
        } else {
            showCartToast('오류가 발생했습니다.', false);
        }
    } finally {
        btn.disabled = false;
        btn.textContent = '장바구니 담기';
    }
};

/* ================================================================
   OUTFIT 코디 세트 모달 (TOP + BOTTOM 동시 담기)
   ================================================================ */
let _outfitTopId = null, _outfitBottomId = null;

window.openOutfitCartModal = function (btn) {
    _outfitTopId    = btn.dataset.topId;
    _outfitBottomId = btn.dataset.bottomId;

    document.getElementById('outfitModalQty').textContent = '1';
    renderSizeBtns(document.getElementById('outfitTopSizeBtns'),    btn.dataset.topSizes);
    renderSizeBtns(document.getElementById('outfitBottomSizeBtns'), btn.dataset.bottomSizes);

    // 사이즈 없으면 섹션 숨기기
    const topHasSizes    = btn.dataset.topSizes    && btn.dataset.topSizes    !== 'null';
    const bottomHasSizes = btn.dataset.bottomSizes && btn.dataset.bottomSizes !== 'null';
    document.getElementById('outfitTopSizeSection').style.display    = topHasSizes    ? '' : 'none';
    document.getElementById('outfitBottomSizeSection').style.display = bottomHasSizes ? '' : 'none';

    document.getElementById('outfit-modal-overlay').classList.add('active');
};

window.closeOutfitModal = function (e) {
    if (e && e.target === document.getElementById('outfit-modal-overlay'))
        document.getElementById('outfit-modal-overlay').classList.remove('active');
};
window.closeOutfitModalForce = function () {
    document.getElementById('outfit-modal-overlay').classList.remove('active');
};

window.changeOutfitQty = function (delta) {
    const el  = document.getElementById('outfitModalQty');
    const val = Math.max(1, parseInt(el.textContent) + delta);
    el.textContent = val;
};

window.submitOutfitModal = async function () {
    const topSize    = getSelectedSize(document.getElementById('outfitTopSizeBtns'));
    const bottomSize = getSelectedSize(document.getElementById('outfitBottomSizeBtns'));
    const qty        = parseInt(document.getElementById('outfitModalQty').textContent);
    const btn        = document.getElementById('outfitModalSubmit');

    if (!topSize || !bottomSize) { showCartToast('사이즈를 선택해주세요.', false); return; }

    btn.disabled = true;
    btn.textContent = '담는 중...';
    try {
        await addToCartApi(_outfitTopId,    topSize,    qty);
        await addToCartApi(_outfitBottomId, bottomSize, qty);
        closeOutfitModalForce();
        showCartToast('코디 세트가 장바구니에 담겼습니다 🛒');
    } catch (e) {
        if (e.message === 'LOGIN_REQUIRED') {
            showCartToast('로그인이 필요합니다.', false);
            setTimeout(() => { location.href = '/login'; }, 1200);
        } else {
            showCartToast('오류가 발생했습니다.', false);
        }
    } finally {
        btn.disabled = false;
        btn.textContent = '코디 세트 담기';
    }
};

/* ================================================================
   장바구니 모달 CSS (동적 주입)
   ================================================================ */
(function injectCartModalCSS() {
    const style = document.createElement('style');
    style.textContent = `
        /* ── 오버레이 ── */
        #cart-modal-overlay,
        #outfit-modal-overlay {
            display: none;
            position: fixed; inset: 0;
            background: rgba(0,0,0,0.45);
            backdrop-filter: blur(4px);
            z-index: 9000;
            align-items: center;
            justify-content: center;
        }
        #cart-modal-overlay.active,
        #outfit-modal-overlay.active { display: flex; }

        /* ── 모달 박스 ── */
        .cart-modal {
            position: relative;
            background: #fff;
            border-radius: 16px;
            padding: 36px 32px 28px;
            width: 90%;
            max-width: 420px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.18);
            animation: cartModalIn .22s ease;
        }
        @keyframes cartModalIn {
            from { opacity:0; transform: translateY(20px) scale(.97); }
            to   { opacity:1; transform: translateY(0)    scale(1); }
        }

        /* ── 닫기 버튼 ── */
        .cart-modal-close {
            position: absolute; top: 14px; right: 18px;
            background: none; border: none;
            font-size: 18px; cursor: pointer; color: #888;
            line-height: 1;
        }
        .cart-modal-close:hover { color: #111; }

        /* ── 헤더 ── */
        .cart-modal-label {
            font-size: 11px; letter-spacing: .12em;
            color: #888; margin: 0 0 4px;
        }
        .cart-modal-title {
            font-size: 17px; font-weight: 700;
            color: #111; margin: 0 0 2px;
        }
        .cart-modal-subtitle {
            font-size: 12px; color: #999; margin: 0 0 20px;
        }

        /* ── 사이즈 ── */
        .cart-modal-size-label {
            font-size: 12px; font-weight: 600;
            color: #555; margin: 0 0 8px;
            letter-spacing: .05em;
        }
        .cart-modal-size-btns {
            display: flex; flex-wrap: wrap; gap: 8px;
            margin-bottom: 20px;
        }
        .size-btn {
            padding: 7px 16px;
            border: 1.5px solid #ddd;
            border-radius: 8px;
            background: #fff;
            font-size: 13px; font-weight: 500;
            cursor: pointer; transition: all .15s;
        }
        .size-btn:hover { border-color: #111; }
        .size-btn.active {
            background: #111; color: #fff;
            border-color: #111;
        }

        /* ── 수량 ── */
        .cart-modal-qty-section { margin-bottom: 24px; }
        .cart-modal-qty-wrap {
            display: flex; align-items: center; gap: 16px;
        }
        .cart-modal-qty-btn {
            width: 32px; height: 32px;
            border: 1.5px solid #ddd; border-radius: 8px;
            background: #fff; font-size: 18px;
            cursor: pointer; display: flex;
            align-items: center; justify-content: center;
            transition: background .15s;
        }
        .cart-modal-qty-btn:hover { background: #f5f5f5; }
        .cart-modal-qty-val {
            font-size: 16px; font-weight: 600;
            min-width: 24px; text-align: center;
        }

        /* ── 담기 버튼 ── */
        .cart-modal-submit {
            width: 100%;
            padding: 14px;
            background: #111; color: #fff;
            border: none; border-radius: 10px;
            font-size: 15px; font-weight: 600;
            cursor: pointer; transition: background .2s;
        }
        .cart-modal-submit:hover { background: #333; }
        .cart-modal-submit:disabled { background: #bbb; cursor: not-allowed; }

        /* ── OUTFIT 모달 전용 ── */
        .outfit-modal-item { margin-bottom: 4px; }
        .outfit-modal-part-label {
            font-size: 13px; font-weight: 700;
            color: #333; margin-bottom: 10px !important;
        }
        .outfit-modal-divider {
            height: 1px; background: #f0f0f0;
            margin: 12px 0 16px;
        }

        /* ── 토스트 ── */
        #main-cart-toast {
            position: fixed;
            bottom: 80px; left: 50%;
            transform: translateX(-50%) translateY(20px);
            background: #111; color: #fff;
            padding: 12px 24px;
            border-radius: 50px;
            font-size: 14px; font-weight: 500;
            opacity: 0; pointer-events: none;
            transition: all .3s; z-index: 9999;
            white-space: nowrap;
        }
        #main-cart-toast.cart-toast-show {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        #main-cart-toast.cart-toast-error { background: #111; }
    `;
    document.head.appendChild(style);
})();