/* ============================================================
   AIStyler.js — 퍼스널 컬러 & 가상 피팅 통합 솔루션
   상의/하의 동시 피팅 기능 추가
   ============================================================ */

document.addEventListener('DOMContentLoaded', async function () {
    const AI_SERVER_URL = "http://localhost:5000";

    // ✅ URL 파라미터 확인용 로그
    const urlParams = new URLSearchParams(window.location.search);
    const productIdFromUrl  = urlParams.get('productId');
    const categoryFromUrl   = urlParams.get('category');
    const imageUrlFromUrl   = urlParams.get('imageUrl');
    const nameFromUrl       = urlParams.get('name');
    // 1. 탭 네비게이션 로직
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.target).classList.add('active');
        });
    });

    // 2. 파일 변수 관리
    let faceFile   = null;  // 퍼스널 컬러용 얼굴 사진
    let bodyFile   = null;  // 가상 피팅용 전신 사진
    let topFile    = null;  // 🌟 상의 이미지
    let bottomFile = null;  // 🌟 하의 이미지

    // 미리보기 설정 유틸리티
    function setupPreview(inputId, previewId, placeholderId, fileVariableSetter) {
        const input = document.getElementById(inputId);
        if (!input) return;

        input.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                fileVariableSetter(file);
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.getElementById(previewId);
                    img.src = e.target.result;
                    img.style.display = 'block';
                    if (placeholderId) document.getElementById(placeholderId).style.display = 'none';
                };
                reader.readAsDataURL(file);
                updateTryOnBtn(); // 🌟 파일 변경 시 버튼 상태 업데이트
            }
        });
    }

    // 사진 업로드 설정
    setupPreview('face-input', 'face-preview', null, (f) => faceFile = f);
    setupPreview('body-input', 'body-preview', 'body-placeholder', (f) => { bodyFile = f; updateTryOnBtn(); });

    // ==============================================================
    // 🌟 상의/하의 버튼 상태 업데이트
    // ==============================================================
    function updateTryOnBtn() {
        const tryOnBtn = document.getElementById('try-on-btn');
        if (!tryOnBtn) return;
        // 전신 사진 + 상의 또는 하의 중 하나라도 있으면 활성화
        tryOnBtn.disabled = !(bodyFile && (topFile || bottomFile));
    }

    // ==============================================================
    // [A] 퍼스널 컬러 진단 로직
    // ==============================================================
    const diagnoseBtn = document.getElementById('diagnose-btn');
    if (diagnoseBtn) {
        diagnoseBtn.addEventListener('click', async () => {
            if (!faceFile) {
                alert("먼저 얼굴 사진을 업로드해주세요.");
                return;
            }

            diagnoseBtn.disabled = true;
            document.getElementById('diagnosis-loading').style.display = 'block';
            document.getElementById('initial-message').style.display = 'none';
            document.getElementById('diagnosis-result').style.display = 'none';

            const formData = new FormData();
            formData.append('image', faceFile);

            try {
                const response = await fetch(`${AI_SERVER_URL}/api/analyze-face`, {method: 'POST', body: formData});
                const data = await response.json();
                if (data.error) throw new Error(data.error);

                renderDiagnosisResult(data);
                loadRealRecommendedProducts(data.tone);

            } catch (error) {
                alert("진단 오류: " + error.message);
                document.getElementById('initial-message').style.display = 'block';
            } finally {
                diagnoseBtn.disabled = false;
                document.getElementById('diagnosis-loading').style.display = 'none';
            }
        });
    }

    const savePaletteBtn = document.getElementById('save-palette-btn');
    if (savePaletteBtn) {
        savePaletteBtn.addEventListener('click', () => {
            const currentTone = document.getElementById('result-tone').innerText;
            saveColorToDB(currentTone);
            alert("내 팔레트에 성공적으로 저장되었습니다!");
        });
    }

    function renderDiagnosisResult(data) {
        const warningEl = document.getElementById('diagnosis-warning');
        if (data.warning && data.warning.trim() !== "") {
            document.getElementById('warning-text').innerText = data.warning;
            warningEl.style.display = 'flex';
        } else {
            warningEl.style.display = 'none';
        }

        const resultToneEl = document.getElementById('result-tone');
        resultToneEl.innerText = data.tone;
        document.getElementById('result-features').innerText = data.features;

        let toneColor = "#111";
        const toneName = data.tone;

        if (toneName.includes('봄') || toneName.includes('Spring')) {
            toneColor = "#ef6c00";
        } else if (toneName.includes('여름') || toneName.includes('Summer')) {
            toneColor = "#00acc1";
        } else if (toneName.includes('가을') || toneName.includes('Autumn')) {
            toneColor = "#8d6e63";
        } else if (toneName.includes('겨울') || toneName.includes('Winter')) {
            toneColor = "#311b92";
        }

        resultToneEl.style.color = toneColor;
        resultToneEl.style.fontWeight = "900";
        resultToneEl.style.textShadow = `0 0 10px ${toneColor}33`;

        renderPalette('best-colors-container', data.best_colors);
        renderPalette('worst-colors-container', data.worst_colors);

        document.getElementById('diagnosis-result').style.display = 'block';
    }

    function renderPalette(containerId, colors) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        (colors || []).forEach(color => {
            const div = document.createElement('div');
            div.style.backgroundColor = color;
            div.title = color;
            container.appendChild(div);
        });
    }

    // ==============================================================
    // [DB 저장] 퍼스널 컬러 업데이트
    // ==============================================================
    async function saveColorToDB(tone) {
        try {
            const response = await fetch('/api/save-personal-color', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ tone: tone })
            });

            if (response.status === 401) {
                console.warn("로그인이 되어있지 않아 컬러 진단 결과가 저장되지 않았습니다.");
                return;
            }

            if (!response.ok) throw new Error(`서버 응답 오류: ${response.status}`);
            console.log("🎉 내 팔레트에 퍼스널 컬러 저장 완료!");

        } catch (error) {
            console.error("퍼스널 컬러 DB 저장 실패:", error);
        }
    }

    // ==============================================================
    // [B] 추천 상품 & 피팅룸 연동
    // ==============================================================
    async function loadRealRecommendedProducts(toneName) {
        try {
            const res = await fetch(`/api/ai/products/recommend?tone=${encodeURIComponent(toneName)}`);
            if (!res.ok) {
                console.error("서버에서 상품을 찾지 못했습니다.");
                return;
            }
            const products = await res.json();

            const grid = document.getElementById('recommendation-grid');
            if (grid) grid.innerHTML = '';

            if (products.length === 0) {
                if (grid) grid.innerHTML = '<p style="color:#888; font-size:0.9rem; grid-column:1/-1; text-align:center;">해당 톤에 추천할 상품이 아직 없습니다.</p>';
                return;
            }

            products.forEach(prod => {
                const div = document.createElement('div');
                div.className = 'cloth-item';
                div.innerHTML = `
                    <img src="${prod.imageUrl}" alt="${prod.name}">
                    <div class="cloth-label">${prod.name}</div>
                    <div class="cloth-category" style="font-size:0.75rem; color:#aaa;">${prod.category || ''}</div>
                `;
                div.addEventListener('click', () => setProductForFitting(prod.imageUrl, prod.name, prod.id, prod.category));
                if (grid) grid.appendChild(div);
            });

        } catch (e) {
            console.error("추천 상품 로드 에러:", e);
        }
    }

    // ==============================================================
    // 🌟 상의/하의 구분해서 피팅룸에 세팅
    // ==============================================================
    function isBottomCategory(category) {
        if (!category) return false;
        return category.toLowerCase() === 'pants';
    }

    function isTopCategory(category) {
        if (!category) return false;
        const lower = category.toLowerCase();
        return lower === 'hoodie' || lower === 'jacket' || lower === 'shirt';
    }
    async function setProductForFitting(url, name, productId, category, price = '') {
        const formattedPrice = price ? Number(price).toLocaleString() + '원' : '';
        // 1. 피팅 탭으로 이동
        const fittingTabBtn = document.querySelector('[data-target="tab-fitting"]');
        if (fittingTabBtn) fittingTabBtn.click();

        try {
            const res  = await fetch(url);
            const blob = await res.blob();
            const file = new File([blob], "product.jpg", {type: "image/jpeg"});

            // 2. 🌟 카테고리에 따라 상의/하의 구분
            if (isBottomCategory(category)) {
                // 하의 세팅
                bottomFile = file;
                if (document.getElementById('bottom-preview'))  document.getElementById('bottom-preview').src = url;
                if (document.getElementById('bottom-name'))     document.getElementById('bottom-name').innerText = name;
                if (document.getElementById('bottom-price'))    document.getElementById('bottom-price').innerText = formattedPrice; // ✅
                if (document.getElementById('bottom-product-id')) document.getElementById('bottom-product-id').value = productId;
                if (document.getElementById('bottom-display-wrap')) document.getElementById('bottom-display-wrap').style.display = 'flex';
            } else {
                // 상의 세팅
                topFile = file;
                if (document.getElementById('top-preview'))    document.getElementById('top-preview').src = url;
                if (document.getElementById('top-name'))       document.getElementById('top-name').innerText = name;
                if (document.getElementById('top-price'))      document.getElementById('top-price').innerText = formattedPrice; // ✅
                if (document.getElementById('top-product-id')) document.getElementById('top-product-id').value = productId;
                if (document.getElementById('top-display-wrap')) document.getElementById('top-display-wrap').style.display = 'flex';
            }
            updateTryOnBtn();

        } catch(e) {
            console.error("이미지 변환 실패", e);
        }
    }
    // ==============================================================
    // [C] 가상 피팅 실행 로직
    // ==============================================================
    const tryOnBtn = document.getElementById('try-on-btn');
    if (tryOnBtn) {
        tryOnBtn.addEventListener('click', async () => {
            if (!bodyFile) {
                alert("전신 사진이 필요합니다."); return;
            }
            if (!topFile && !bottomFile) {
                alert("상의 또는 하의 상품을 선택해주세요."); return;
            }

            tryOnBtn.disabled = true;
            document.getElementById('fitting-loading-overlay').style.display = 'flex';

            const formData = new FormData();
            formData.append('user_image', bodyFile);

            // 🌟 상의+하의 동시 or 단일 전송
            if (topFile && bottomFile) {
                formData.append('top_image', topFile);
                formData.append('bottom_image', bottomFile);
            } else {
                formData.append('cloth_image', topFile || bottomFile);
            }

            try {
                const response = await fetch(`${AI_SERVER_URL}/api/try-on`, {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();

                if (!response.ok) throw new Error(data.error || '피팅 처리 중 문제가 발생했습니다.');

                // 결과 표시
                const resultImg  = document.getElementById('fitting-result-img');
                const placeholder = document.getElementById('fitting-placeholder-main');
                if (resultImg) {
                    resultImg.src = data.result_url;
                    resultImg.style.display = 'block';
                }
                if (placeholder) placeholder.style.display = 'none';

                // DB 저장 (상의 우선, 없으면 하의 ID)
                const topId    = document.getElementById('top-product-id')?.value;
                const bottomId = document.getElementById('bottom-product-id')?.value;
                saveFittingToDB(topId, bottomId, data.result_url);

            } catch (error) {
                alert("가상 피팅 오류: " + error.message);
            } finally {
                tryOnBtn.disabled = false;
                updateTryOnBtn();
                document.getElementById('fitting-loading-overlay').style.display = 'none';
            }
        });
    }

    async function saveFittingToDB(topId, bottomId, resultB64) {
        const hasTop    = topId    && topId    !== 'undefined' && topId    != 0;
        const hasBottom = bottomId && bottomId !== 'undefined' && bottomId != 0;

        if (!hasTop && !hasBottom) {
            console.warn("유효한 상품 ID가 없어 피팅 기록을 저장하지 않습니다.");
            return;
        }

        try {
            const response = await fetch('/api/ai/save-fitting', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    topProductId:    hasTop    ? topId    : null,
                    bottomProductId: hasBottom ? bottomId : null,
                    resultImageUrl:  resultB64
                })
            });

            if (response.status === 401) {
                alert("로그인이 풀렸습니다! 피팅 기록을 저장하려면 로그인해주세요.");
                return;
            }
            if (!response.ok) throw new Error(`서버 응답 오류 (상태 코드: ${response.status})`);
            console.log("🎉 아카이브 저장 완료!");

        } catch (error) {
            console.error("아카이브 저장 실패:", error);
            alert("피팅 기록 저장 중 오류가 발생했습니다.");
        }
    }

    // ==============================================================
    // [드롭다운] 드롭다운 메뉴 채우기 & 열기/닫기 로직
    // ==============================================================
    function fillDropdown(prefix, products) {
        const trigger  = document.getElementById(`${prefix}-select-trigger`);
        const dropdown = document.getElementById(`${prefix}-select-dropdown`);
        const wrap     = document.getElementById(`${prefix}-select-wrap`);
        if (!trigger || !dropdown) return;

        // 🚨 데이터가 아예 없을 경우 빈칸 방지 (이게 없으면 안 열리는 것처럼 보임)
        if (!products || products.length === 0) {
            dropdown.innerHTML = `<div style="padding: 15px; text-align: center; color: #999; font-size: 0.9rem;">상품이 없습니다.</div>`;
            return;
        }

        dropdown.innerHTML = ''; // 초기화
        products.forEach(p => {
            // 🚨 DB 컬럼명이 imageUrl인지 imgUrl인지, id인지 productId인지 헷갈려도 무조건 작동하게 방어막 설치
            const imgTarget = p.imageUrl || p.imgUrl || '/img/default_product.png';
            const idTarget = p.id || p.productId;

            const item = document.createElement('div');
            item.className = 'custom-select-option';
            item.innerHTML = `
                <img src="${imgTarget}" alt="${p.name}" onerror="this.src='/img/default_product.png'">
                <div class="custom-select-option-info">
                    <div class="custom-select-option-name">${p.name}</div>
                    <div class="custom-select-option-price">${Number(p.price).toLocaleString()}원</div>
                </div>
            `;

            // 옵션 클릭 시 이벤트
            item.addEventListener('click', () => {
                dropdown.querySelectorAll('.custom-select-option').forEach(el => el.classList.remove('selected'));
                item.classList.add('selected');
                trigger.querySelector('span').textContent = p.name;
                wrap.classList.remove('open');

                // 피팅룸 세팅 (상의/하의 구분해서 들어감)
                setProductForFitting(imgTarget, p.name, idTarget, p.category, p.price);
            });
            dropdown.appendChild(item);
        });

        // 🌟 트리거 클릭 시 열고 닫기
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = wrap.classList.contains('open');
            // 다른 드롭다운 모두 닫기
            document.querySelectorAll('.custom-select-wrap.open').forEach(el => el.classList.remove('open'));
            if (!isOpen) wrap.classList.add('open');
        });
    }

// 외부 클릭 시 드롭다운 닫기
    document.addEventListener('click', () => {
        document.querySelectorAll('.custom-select-wrap.open').forEach(el => el.classList.remove('open'));
    });

// ==============================================================
    // [API] 백엔드에서 상품 리스트 가져오기
    // ==============================================================
    async function loadProductDropdowns() {
        try {
            const res = await fetch('/api/products/all');

            // 🚨 백엔드 API가 아직 없거나 에러가 날 때, 화면이 먹통되지 않도록 가짜(Test) 데이터 강제 주입!
            if (!res.ok) {
                console.warn("🚨 /api/products/all 백엔드 API가 없거나 에러가 발생했습니다!");
                console.warn("UI 테스트를 위해 임시 데이터를 화면에 띄웁니다.");

                const mockProducts = [
                    { id: 1, name: "[테스트] 에센셜 화이트 셔츠", price: 35000, category: "SHIRT", imageUrl: "/img/product/shirt/sx_white.jpg" },
                    { id: 2, name: "[테스트] 미니멀 블랙 하프 셔츠", price: 89000, category: "JACKET", imageUrl: "/img/product/shirt/sn_black.jpg" },
                    { id: 3, name: "[테스트] 빈티지 그린 코튼 셔츠", price: 45000, category: "SHIRT", imageUrl: "/img/product/shirt/s450_green.jpg" }
                ];

                fillDropdown('top', mockProducts.filter(p => isTopCategory(p.category)));
                fillDropdown('bottom', mockProducts.filter(p => isBottomCategory(p.category)));
                return;
            }

            const products = await res.json();
            const tops    = products.filter(p => isTopCategory(p.category));
            const bottoms = products.filter(p => isBottomCategory(p.category));

            fillDropdown('top', tops);
            fillDropdown('bottom', bottoms);

        } catch (e) {
            console.error("상품 드롭다운 로드 실패:", e);
        }
    }

// clearSlot에서 드롭다운 트리거 텍스트도 초기화
    window.clearSlot = function(type) {
        const trigger = document.getElementById(`${type}-select-trigger`);
        if (trigger) trigger.querySelector('span').textContent = '-- 상품 선택 --';

        document.querySelectorAll(`#${type}-select-dropdown .custom-select-option`)
            .forEach(el => el.classList.remove('selected'));

        if (type === 'top') {
            topFile = null;
            document.getElementById('top-preview').src = '';
            document.getElementById('top-name').innerText = '';
            document.getElementById('top-price').innerText = '';
            document.getElementById('top-product-id').value = '';
            document.getElementById('top-display-wrap').style.display = 'none';
        } else {
            bottomFile = null;
            document.getElementById('bottom-preview').src = '';
            document.getElementById('bottom-name').innerText = '';
            document.getElementById('bottom-price').innerText = '';
            document.getElementById('bottom-product-id').value = '';
            document.getElementById('bottom-display-wrap').style.display = 'none';
        }
        updateTryOnBtn();
    };
    if (productIdFromUrl && imageUrlFromUrl) {
        const fittingTabBtn = document.querySelector('[data-target="tab-fitting"]');
        if (fittingTabBtn) fittingTabBtn.click();

        const category = (categoryFromUrl || '').toLowerCase();

        if (category === 'cap') {
            alert('모자는 현재 가상 피팅을 지원하지 않습니다.');
        } else {
            // ✅ 드롭다운이 로드된 후 실행되도록 대기
            const waitForDropdown = setInterval(() => {
                const dropdown = document.getElementById(
                    isBottomCategory(category) ? 'bottom-select-dropdown' : 'top-select-dropdown'
                );
                if (!dropdown || dropdown.children.length === 0) return;
                clearInterval(waitForDropdown);

                const prefix = isBottomCategory(category) ? 'bottom' : 'top';

                // 드롭다운에서 해당 상품 선택 상태 표시
                dropdown.querySelectorAll('.custom-select-option').forEach(el => {
                    el.classList.remove('selected');
                });

                // 트리거 텍스트 업데이트
                const trigger = document.getElementById(`${prefix}-select-trigger`);
                if (trigger) trigger.querySelector('span').textContent = decodeURIComponent(nameFromUrl || '선택한 상품');

                // 피팅룸에 세팅
                setProductForFitting(
                    decodeURIComponent(imageUrlFromUrl),
                    decodeURIComponent(nameFromUrl || '선택한 상품'),
                    productIdFromUrl,
                    categoryFromUrl || ''
                );
            }, 100); // 100ms마다 드롭다운 로드 확인

            // 5초 후 타임아웃
            setTimeout(() => clearInterval(waitForDropdown), 5000);
        }
    }
    loadProductDropdowns();


    console.log('URL 파라미터 확인:', {
        productIdFromUrl,
        categoryFromUrl,
        imageUrlFromUrl,
        nameFromUrl
    });
});
