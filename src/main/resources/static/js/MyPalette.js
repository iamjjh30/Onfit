/* ============================================================
   MyPalette.js — 최종 완성본 (백엔드 Model 데이터 완벽 연동)
   ============================================================ */

/* ────────────────────────────────────────────
   1. 퍼스널컬러 시즌 테마 데이터
──────────────────────────────────────────── */
var SEASON_DATA = {
    spring_warm: {
        label: '봄 웜', en: 'Spring Warm', badgeSub: 'Spring Warm',
        accent: '#b84d00', accentLight: '#fff3ec', dot: '#ff7043',
        gradient: 'linear-gradient(135deg,#5c2a0e 0%,#c06020 100%)',
        colors: ['#f9c784','#e8956d','#f7e0b0','#d4a053','#f5cba7'],
        names:  ['피치','코랄','크림','카멜','살구'],
        keyword: '"밝고 화사하게"',
        tip: '코랄·피치·옐로 계열이 생기 있는 피부톤을 만들어줘요.'
    },
    summer_cool: {
        label: '써머 쿨', en: 'Summer Cool', badgeSub: 'Summer Cool',
        accent: '#006d82', accentLight: '#e0f7fa', dot: '#00bcd4',
        gradient: 'linear-gradient(135deg,#0d1b2e 0%,#1e3a5f 100%)',
        colors: ['#b0c4de','#778899','#e0e8f0','#4a6fa5','#d6e4f0'],
        names:  ['라이트 스틸','슬레이트','아이스','스틸 블루','미스티'],
        keyword: '"차갑고 선명하게"',
        tip: '블루·그레이·화이트 계열이 피부톤을 가장 밝게 살려줘요.'
    },
    autumn_warm: {
        label: '어텀 웜', en: 'Autumn Warm', badgeSub: 'Autumn Warm',
        accent: '#7d2000', accentLight: '#fff0e8', dot: '#bf360c',
        gradient: 'linear-gradient(135deg,#1e0e00 0%,#5c3010 100%)',
        colors: ['#c68642','#8b5e3c','#d4956a','#5c3d1e','#e8c49a'],
        names:  ['카멜','초콜릿','테라코타','다크 브라운','샌드'],
        keyword: '"깊고 풍성하게"',
        tip: '카멜·브라운·올리브 계열이 자연스럽고 따뜻한 인상을 만들어줘요.'
    },
    winter_cool: {
        label: '윈터 쿨', en: 'Winter Cool', badgeSub: 'Winter Cool',
        accent: '#1a237e', accentLight: '#eef0ff', dot: '#3f51b5',
        gradient: 'linear-gradient(135deg,#000005 0%,#1a1a3e 100%)',
        colors: ['#1a1a2e','#e8e8f0','#2c3e6b','#c0c0c8','#ffffff'],
        names:  ['미드나잇','아이스 화이트','딥 블루','실버','퓨어 화이트'],
        keyword: '"선명하고 강렬하게"',
        tip: '블랙·화이트·딥블루 계열의 강한 대비가 피부를 돋보이게 해줘요.'
    },
    neutral: {
        label: '뉴트럴', en: 'Neutral', badgeSub: 'Neutral',
        accent: '#555555', accentLight: '#f5f5f5', dot: '#bbbbbb',
        gradient: 'linear-gradient(135deg,#2a2520 0%,#5a5048 100%)',
        colors: ['#c8bfb0','#9e9488','#e8e4de','#6b6358','#d4cfc8'],
        names:  ['베이지','그레이지','오트밀','모카','라떼'],
        keyword: '"자연스럽고 편안하게"',
        tip: '베이지·그레이지 계열은 웜·쿨 모두 조화롭게 어울려요.'
    }
};

/* ────────────────────────────────────────────
   2. 🌟 가짜(더미) 데이터 삭제
──────────────────────────────────────────── */
var PRODUCTS = [];

/* ────────────────────────────────────────────
   3. 전역 변수 및 데이터 파싱 (DOMContentLoaded)
──────────────────────────────────────────── */
var dna       = null;
var hasDna    = false;
var dnaTop    = '미니멀';
var hasSeason = false;
var season    = null;
var sd        = null;

document.addEventListener('DOMContentLoaded', function() {

    console.log("🎨 MyPalette 초기화 시작...");

    try {
        var rawSeason = window.DB_SEASON || localStorage.getItem('onfit_season');
        var rawDna    = window.DB_DNA || localStorage.getItem('onfit_dna');

        if (rawDna && rawDna !== "미진단") {
            try {
                dna = (typeof rawDna === 'string') ? JSON.parse(rawDna) : rawDna;
                hasDna = true;
            } catch (e) {
                console.warn("DNA 데이터 JSON 파싱 실패. 일반 텍스트로 간주합니다.");
                hasDna = false;
            }
        }

        if (rawSeason && rawSeason !== "미진단") {
            var s = rawSeason.toLowerCase();
            if (s.includes('spring') || s.includes('봄')) season = 'spring_warm';
            else if (s.includes('summer') || s.includes('여름')) season = 'summer_cool';
            else if (s.includes('autumn') || s.includes('가을')) season = 'autumn_warm';
            else if (s.includes('winter') || s.includes('겨울')) season = 'winter_cool';
            else season = rawSeason;

            if (season) {
                hasSeason = true;
                sd = SEASON_DATA[season];
            }
        }

        dnaTop = window.DB_DNA_TOP || localStorage.getItem('onfit_dna_top') || '미니멀';

    } catch(e) {
        console.error("데이터 초기화 에러:", e);
    }

    applyTheme();
    renderHero();
    renderDNA();
    initCuration(); // 🌟 실제 데이터를 가져오는 함수 실행!
    initScrollAnimations();
    renderRecentProducts();
});

/* ────────────────────────────────────────────
   4. 테마 색상 적용
──────────────────────────────────────────── */
function applyTheme() {
    if (sd) {
        document.documentElement.style.setProperty('--accent', sd.accent);
        document.documentElement.style.setProperty('--accent-light', sd.accentLight);
    } else {
        document.documentElement.style.setProperty('--accent', '#555555');
        document.documentElement.style.setProperty('--accent-light', '#f0f0f0');
    }
}

/* ────────────────────────────────────────────
   5. 히어로 섹션 렌더링
──────────────────────────────────────────── */
function renderHero() {
    var dot       = document.getElementById('badgeDot');
    var label     = document.getElementById('badgeLabel');
    var sub       = document.getElementById('badgeSub');
    var bg        = document.getElementById('heroCardBg');
    var hcSeason  = document.getElementById('hcSeason');
    var hcKeyword = document.getElementById('hcKeyword');
    var hcTip     = document.getElementById('hcTip');
    var chips     = document.getElementById('heroPaletteChips');
    var hcColors  = document.getElementById('hcColors');

    if (hasSeason && sd) {
        if (dot) dot.style.background = sd.dot;
        if (label) label.innerText = sd.label + "톤";
        if (sub) sub.innerText = sd.badgeSub;
        if (bg) bg.style.background = sd.gradient;
        if (hcSeason) hcSeason.innerText = sd.en.toUpperCase();
        if (hcKeyword) hcKeyword.innerText = sd.keyword;
        if (hcTip) hcTip.innerText = sd.tip;

        if (chips) {
            chips.innerHTML = sd.colors.map((color, i) =>
                `<div class="hero-chip" style="background:${color}" title="${sd.names[i]}"></div>`
            ).join('');
        }

        if (hcColors) {
            hcColors.innerHTML = sd.colors.slice(0, 4).map((color, i) => `
                <div class="hc-color-item">
                    <div class="hc-chip" style="background:${color}"></div>
                    <span>${sd.names[i]}</span>
                </div>
            `).join('');
        }
    } else {
        if (dot) dot.style.background = '#aaaaaa';
        if (label) label.innerText = '미진단';
        if (sub) sub.innerText = 'Not analyzed';
        if (bg) bg.style.background = 'linear-gradient(135deg,#1a1a1a 0%,#3a3a3a 100%)';
        if (hcSeason) hcSeason.innerText = 'UNKNOWN';
        if (hcKeyword) hcKeyword.innerText = '"퍼스널컬러 진단이 필요해요"';
        if (hcTip) hcTip.innerText = 'AI 퍼스널컬러 진단을 받으면 나만의 컬러 팁을 알려드려요.';
        if (hcColors) {
            hcColors.innerHTML = [0,1,2,3].map(() => `
                <div class="hc-color-item">
                    <div class="hc-chip" style="background:#888;"></div>
                    <span style="color:rgba(255,255,255,0.35)">?</span>
                </div>
            `).join('');
        }
    }
}

/* ────────────────────────────────────────────
   6. 스타일 DNA 레이더 차트 렌더링 (오각형 5개 축)
──────────────────────────────────────────── */
function renderDNA() {
    var dnaSection = document.querySelector('.dna-section');
    if (!dnaSection) return;

    var isDataEmpty = false;
    try {
        if (typeof dna === 'undefined' || !dna || Object.keys(dna).length === 0) {
            isDataEmpty = true;
        } else {
            var sum = Object.values(dna).reduce(function(a, b) { return a + b; }, 0);
            if (sum === 0) isDataEmpty = true;
        }
    } catch (e) {
        isDataEmpty = true;
    }

    if (isDataEmpty) {
        var header  = dnaSection.querySelector('.section-header');
        var dnaWrap = dnaSection.querySelector('.dna-wrap');
        var badgeRw = dnaSection.querySelector('.dna-badge-row');

        if (header)  header.style.display  = 'none';
        if (dnaWrap) dnaWrap.style.display = 'none';
        if (badgeRw) badgeRw.style.display = 'none';

        if (dnaSection.querySelector('.dna-locked')) return;

        var locked = document.createElement('div');
        locked.className = 'dna-locked';
        locked.style.cssText = 'text-align:center; padding: 60px 20px; background: #fff; border-radius: 16px; margin-top: 20px;';
        locked.innerHTML =
            '<span style="display:block; font-size:0.75rem; font-weight:800; letter-spacing:0.15em; color:#999; text-transform:uppercase; margin-bottom:12px;">STYLE ANALYSIS</span>' +
            '<h2 style="font-size:1.6rem; font-weight:800; color:#111; letter-spacing:-0.03em; margin-bottom:16px;">아직 데이터가 쌓이는 중이에요</h2>' +
            '<p style="font-size:0.95rem; color:#666; line-height:1.6; max-width:400px; margin:0 auto;">상품 탐색, 가상 피팅, 찜하기 활동을 시작해 보세요.<br>나만의 패션 DNA 차트가 완성됩니다.</p>';

        dnaSection.appendChild(locked);
        return;
    }

    var fixedLabels = ['미니멀', '캐주얼', '스트릿', '포멀', '빈티지'];
    var fixedValues = [];

    fixedLabels.forEach(function(label) {
        fixedValues.push(dna[label] || 0);
    });

    var statsEl = document.querySelector('.dna-stats');
    if (statsEl) {
        var sortedLabels = fixedLabels.slice().sort(function(a, b) {
            return (dna[b] || 0) - (dna[a] || 0);
        });

        statsEl.innerHTML = sortedLabels.map(function(k) {
            var val = dna[k] || 0;
            return `
            <div class="dna-stat-item" data-pct="${val}">
                <div class="dsi-label">
                    <span class="dsi-name">${k}</span>
                    <span class="dsi-pct">${val}%</span> 
                </div>
                <div class="dsi-bar"><div class="dsi-fill" style="--pct:${val}%"></div></div>
            </div>
            `;
        }).join('');

        setTimeout(function() {
            document.querySelectorAll('.dsi-fill').forEach(function(f) {
                f.classList.add('animated');
            });
        }, 300);
    }

    var ctx = document.getElementById('radarChart');
    if (!ctx) return;

    var accentColor = (typeof sd !== 'undefined' && sd !== null && sd.accent) ? sd.accent : '#555555';

    var tryChart = setInterval(function() {
        if (typeof Chart === 'undefined') return;
        clearInterval(tryChart);

        new Chart(ctx.getContext('2d'), {
            type: 'radar',
            data: {
                labels: fixedLabels,
                datasets: [{
                    label: '스타일 분석도(%)',
                    data: fixedValues,
                    backgroundColor: accentColor + '33',
                    borderColor: accentColor,
                    borderWidth: 2,
                    pointBackgroundColor: accentColor,
                    pointBorderColor: '#fff',
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: false,
                scales: {
                    r: {
                        min: 0, max: 100,
                        ticks: { display: false, stepSize: 20 },
                        grid: { color: 'rgba(0,0,0,0.07)' },
                        pointLabels: { font: { size: 12, weight: '600' }, color: '#333' }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.raw + '%';
                            }
                        }
                    }
                },
                animation: { duration: 1500, easing: 'easeOutQuart' }
            }
        });
    }, 50);
}

/* ────────────────────────────────────────────
   7. 🌟 AI 큐레이션 렌더링 (서버 Model 연동 로직)
──────────────────────────────────────────── */
function buildTag() {
    if (hasDna && hasSeason) return (sd ? sd.label : '') + ' 베스트 추천';
    return 'AI 맞춤 추천';
}

function renderCuration() {
    var grid = document.querySelector('.curation-grid');
    if (!grid) return;

    if (PRODUCTS.length === 0) {
        grid.innerHTML = '<p style="text-align:center; padding: 40px; color:#888; grid-column: 1 / -1;">어울리는 추천 상품을 찾지 못했습니다.</p>';
        return;
    }

    var picked = PRODUCTS.slice(0, 3);

    grid.innerHTML = picked.map(p => {
        var tag = buildTag();
        return `
            <div class="curation-card">
                <div class="cc-img-wrap">
                    <div class="product-card">
                        <a href="/itemDetail?id=${p.id}" style="text-decoration: none; color: inherit; display: block;">
                            <img src="${p.img}" alt="${p.name}" class="prod-img" style="border-radius:12px;">
                            <div class="prod-info">
                                <span class="cc-tag" style="background:var(--accent-light);color:var(--accent);">${tag}</span>
                                <span class="prod-name">${p.name}</span>
                            </div>
                        </a>
                    </div>
                </div>
                <div class="cc-info">
                    <div class="cc-reasons">
                        <p class="cc-reason cc-r1" style="font-size:0.8rem;margin-bottom:6px;">🧬 ${p.dnaNote}</p>
                        <p class="cc-reason cc-r2" style="font-size:0.8rem;">🎨 ${p.colorNote}</p>
                    </div>
                    <div class="cc-footer" style="margin-top:15px;">
                        <span class="cc-price" style="font-weight:bold;">${(p.price || 0).toLocaleString()}원</span>
                    </div>
                </div>
            </div>`;
    }).join('');
}

// 🌟 백엔드가 넘겨준 데이터를 바로 사용합니다 (fetch 없음!)
// 🌟 개인화 멘트가 듬뿍 들어간 initCuration 함수
function initCuration() {
    var m = new Date().getMonth() + 1 + '월';
    var sub = document.getElementById('curationSub');

    // HTML에서 넘겨준 이름 가져오기 (없으면 '고객'으로 기본값 세팅)
    var userName = window.USER_NAME || '고객';

    // 1. 개인화된 추천 타이틀 멘트 셋팅
    if (sub) {
        if (hasDna && hasSeason && sd) {
            sub.textContent = `✨ ${userName}님의 ${sd.label}톤 피부와 ${dnaTop} 취향을 완벽하게 저격할 ${m} 맞춤 코디입니다.`;
        } else if (hasSeason && sd) {
            sub.textContent = `🎨 ${userName}님의 ${sd.label}톤 피부를 가장 화사하게 밝혀줄 ${m} 맞춤 코디입니다.`;
        } else if (hasDna && dnaTop !== '미진단') {
            sub.textContent = `🧬 ${userName}님의 ${dnaTop} 스타일 DNA에 찰떡같이 어울리는 ${m} 맞춤 코디입니다.`;
        } else {
            sub.textContent = `🎁 ${userName}님을 위해 특별히 준비한 ${m} 인기 아이템입니다.`;
        }
    }

    try {
        var toneQuery = (hasSeason && sd) ? (sd.label + '톤') : '뉴트럴톤';

        // 🌟 2. 각 상품마다 다르게 보여줄 멘트 템플릿 3가지 준비!
        const dnaTemplates = [
            (name, style) => `${style} 무드를 즐기시는 ${name}님 옷장에 꼭 필요한 아이템이에요.`,
            (name, style) => `${name}님의 1픽인 ${style} DNA와 완벽한 시너지를 내는 코디입니다.`,
            (name, style) => `요즘 유행하는 ${style} 룩, ${name}님만의 감성으로 소화해 보세요.`
        ];

        const colorTemplates = [
            (name, tone) => `${tone}의 매력을 극대화해 줄 찰떡 컬러감입니다.`,
            (name, tone) => `얼굴빛을 형광등처럼 환하게 켜주는 ${tone} 베스트 팔레트예요.`,
            (name, tone) => `${tone}인 ${name}님에게 절대 실패 없는 인생 컬러 조합이랍니다.`
        ];

        // HTML 타임리프에서 넘겨준 전역 변수 읽기
        var realData = window.DB_RECOMMENDATIONS || [];

        if (realData.length > 0) {
            // 가져온 진짜 상품들을 매핑 (index를 활용해 멘트를 돌려가며 씁니다)
            PRODUCTS = realData.map((item, index) => {

                // 상품에 태그가 있으면 첫 번째 태그를, 없으면 나의 1등 DNA를 사용
                const styleStr = item.styleTags ? item.styleTags.split(',')[0].trim() : dnaTop;

                // 순서(index)에 따라 0, 1, 2번 멘트를 번갈아가며 적용
                const dynamicDnaNote = dnaTemplates[index % dnaTemplates.length](userName, styleStr);
                const dynamicColorNote = colorTemplates[index % colorTemplates.length](userName, toneQuery);

                return {
                    id: item.productId || item.id,
                    name: item.productName || item.name,
                    price: item.price || 0,
                    img: item.imageUrl || item.imgUrl,
                    dnaNote: dynamicDnaNote,       // 🌟 다채로워진 DNA 코멘트
                    colorNote: dynamicColorNote    // 🌟 다채로워진 컬러 코멘트
                };
            });
        }
    } catch (e) {
        console.error("추천 상품 데이터를 매핑하는데 실패했습니다.", e);
    }

    renderCuration(); // 데이터 준비 후 화면 그리기
}

/* ────────────────────────────────────────────
   8. 부가 기능 (애니메이션, FAQ 등)
──────────────────────────────────────────── */
function initScrollAnimations() {
    var targets = document.querySelectorAll('.section-card, .palette-hero, .recent-section');
    targets.forEach(el => {
        el.style.opacity = '0'; el.style.transform = 'translateY(28px)';
        el.style.transition = 'opacity 0.7s ease, transform 0.7s cubic-bezier(0.16,1,0.3,1)';
    });

    var fadeIO = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            e.target.style.opacity = '1';
            e.target.style.transform = 'translateY(0)';
            fadeIO.unobserve(e.target);
        });
    }, { threshold: 0.12 });

    targets.forEach(el => fadeIO.observe(el));
}

function toggleFaq(btn) {
    var item = btn.closest('.faq-item');
    var open = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
    if (!open) item.classList.add('open');
}

/* ────────────────────────────────────────────
   9. 최근 본 상품
──────────────────────────────────────────── */
function renderRecentProducts() {
    const gallery = document.querySelector('.scroll-gallery');
    const dotsContainer = document.getElementById('recentDots');
    if (!gallery) return;

    let recentData = JSON.parse(localStorage.getItem('recentProducts') || '[]');

    const uniqueRecent = [];
    const seenIds = new Set();

    recentData.forEach(item => {
        const stringId = String(item.id);
        if (!seenIds.has(stringId)) {
            uniqueRecent.push(item);
            seenIds.add(stringId);
        }
    });

    localStorage.setItem('recentProducts', JSON.stringify(uniqueRecent));

    if (uniqueRecent.length === 0) {
        gallery.innerHTML = `
            <div style="width:100%; padding:60px 0; text-align:center; color:var(--gray);">
                <p style="font-size:0.9rem; margin-bottom:15px;">최근에 확인한 상품이 없습니다.</p>
                <a href="/store" style="color:var(--accent); font-weight:700; text-decoration:underline;">스토어 구경가기</a>
            </div>`;
        if (dotsContainer) dotsContainer.style.display = 'none';
        return;
    }

    gallery.innerHTML = uniqueRecent.map(item => `
        <div class="recent-card product-card">
            <a href="/itemDetail?id=${item.id}">
                <img src="${item.imgUrl}" class="prod-img" alt="${item.name}">
            </a>
            <div class="prod-info">
                <span class="prod-name">${item.name}</span>
                <span class="prod-price">₩${item.price.toLocaleString()}</span>
                <button class="prod-cart-btn" onclick="addCartDirect(${item.id})">장바구니 담기</button>
            </div>
        </div>
    `).join('');

    if (dotsContainer) {
        const itemsPerPage = 4;
        const dotCount = Math.ceil(uniqueRecent.length / itemsPerPage);

        if (dotCount <= 1) {
            dotsContainer.style.display = 'none';
        } else {
            dotsContainer.style.display = 'flex';
            dotsContainer.innerHTML = Array(dotCount).fill(0).map((_, i) =>
                `<div class="scroll-dot ${i === 0 ? 'active' : ''}"></div>`
            ).join('');
        }
    }
}

function addCartDirect(productId) {
    const requestData = {
        productId: productId,
        size: "FREE",
        quantity: 1
    };

    fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
    })
        .then(response => {
            if (response.ok) {
                if (confirm('장바구니에 상품이 추가되었습니다!\n장바구니로 이동하시겠습니까?')) {
                    window.location.href = '/Cart';
                }
            } else if (response.status === 401) {
                alert('로그인이 필요합니다!');
                window.location.href = '/Login';
            } else {
                alert('장바구니 담기에 실패했습니다.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('서버 오류가 발생했습니다.');
        });
}