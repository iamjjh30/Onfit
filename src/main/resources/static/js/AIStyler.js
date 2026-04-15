/* ============================================================
   AIStyler.js — 퍼스널 컬러 & 가상 피팅 통합 솔루션
   ============================================================ */

document.addEventListener('DOMContentLoaded', async function () {
    const AI_SERVER_URL = "http://localhost:5000"; // 파이썬 Flask 서버

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
    let faceFile = null;  // 퍼스널 컬러용 얼굴 사진
    let bodyFile = null;  // 가상 피팅용 전신 사진
    let clothFile = null; // 가상 피팅용 옷 사진 (Blob으로 변환 예정)

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
            }
        });
    }

    // 사진 업로드 설정
    setupPreview('face-input', 'face-preview', null, (f) => faceFile = f);
    setupPreview('body-input', 'body-preview', 'body-placeholder', (f) => bodyFile = f);

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
                // 1. 파이썬 AI 서버 호출
                const response = await fetch(`${AI_SERVER_URL}/api/analyze-face`, {method: 'POST', body: formData});
                const data = await response.json();
                if (data.error) throw new Error(data.error);

                // 2. 화면 렌더링
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

        // 1. 결과 텍스트 넣기
        const resultToneEl = document.getElementById('result-tone');
        resultToneEl.innerText = data.tone;
        document.getElementById('result-features').innerText = data.features;

        // 🌟 2. 톤 이름에 따른 글자 색상 변경 로직
        let toneColor = "#111"; // 기본 검정색
        const toneName = data.tone;

        if (toneName.includes('봄') || toneName.includes('Spring')) {
            toneColor = "#ef6c00"; // 봄 웜톤: 따뜻한 오렌지/핑크
        } else if (toneName.includes('여름') || toneName.includes('Summer')) {
            toneColor = "#00acc1"; // 여름 쿨톤: 시원한 하늘/청록
        } else if (toneName.includes('가을') || toneName.includes('Autumn')) {
            toneColor = "#8d6e63"; // 가을 웜톤: 차분한 브라운/머스터드
        } else if (toneName.includes('겨울') || toneName.includes('Winter')) {
            toneColor = "#311b92"; // 겨울 쿨톤: 선명한 네이비/퍼플
        }

        // 색상 적용 및 강조 효과
        resultToneEl.style.color = toneColor;
        resultToneEl.style.fontWeight = "900"; // 더 두껍게
        resultToneEl.style.textShadow = `0 0 10px ${toneColor}33`; // 미세한 광택 효과 추가

        // 3. 컬러 팔레트 그리기
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

            if (!response.ok) {
                throw new Error(`서버 응답 오류: ${response.status}`);
            }

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
            if(grid) grid.innerHTML = '';

            if (products.length === 0) {
                if(grid) grid.innerHTML = '<p style="color:#888; font-size:0.9rem; grid-column:1/-1; text-align:center;">해당 톤에 추천할 상품이 아직 없습니다.</p>';
                return;
            }

            products.forEach(prod => {
                const div = document.createElement('div');
                div.className = 'cloth-item';
                div.innerHTML = `
                    <img src="${prod.imageUrl}" alt="${prod.name}">
                    <div class="cloth-label">${prod.name}</div>
                `;

                div.addEventListener('click', () => setProductForFitting(prod.imageUrl, prod.name, prod.id));

                if(grid) grid.appendChild(div);
            });

        } catch (e) {
            console.error("추천 상품 로드 에러:", e);
        }
    }

    async function setProductForFitting(url, name, productId) {

        // 1. 피팅 탭으로 이동
        const fittingTabBtn = document.querySelector('[data-target="tab-fitting"]');
        if (fittingTabBtn) fittingTabBtn.click();

        // 2. 상품 ID 세팅
        let targetInput = document.getElementById('target-product-id');
        if (!targetInput) {
            targetInput = document.createElement('input');
            targetInput.type = 'hidden';
            targetInput.id = 'target-product-id';
            document.body.appendChild(targetInput);
        }
        targetInput.value = productId;

        // 3. 화면 업데이트
        const displayWrap = document.getElementById('product-display-wrap');
        const preview = document.getElementById('cloth-preview-fixed');
        const nameText = document.getElementById('cloth-name-fixed');
        const placeholder = document.getElementById('cloth-placeholder');
        const tryOnBtn = document.getElementById('try-on-btn');

        if (displayWrap) displayWrap.style.display = 'block';
        if (preview) preview.src = url;
        if (nameText) nameText.innerText = name;
        if (placeholder) placeholder.style.display = 'none';
        if (tryOnBtn) tryOnBtn.disabled = false;

        // 4. 이미지 변환 로직
        try {
            const res = await fetch(url);
            const blob = await res.blob();
            clothFile = new File([blob], "selected_product.jpg", {type: "image/jpeg"});

            if (!bodyFile) {
                alert(`[${name}] 상품이 피팅룸에 준비되었습니다! 👕\n이제 '내 전신 사진'을 올려주세요.`);
            }
        } catch (e) {
            console.error("이미지 변환 실패", e);
        }
    }

    // ==============================================================
    // [C] 가상 피팅 실행 로직
    // ==============================================================
    const tryOnBtn = document.getElementById('try-on-btn');
    if(tryOnBtn) {
        tryOnBtn.addEventListener('click', async () => {
            if (!bodyFile || !clothFile) {
                alert("내 사진과 상품 정보가 모두 필요합니다."); return;
            }

            tryOnBtn.disabled = true;
            document.getElementById('fitting-loading-overlay').style.display = 'flex';

            const formData = new FormData();
            formData.append('user_image', bodyFile);
            formData.append('cloth_image', clothFile);

            try {
                // 1. 파이썬 AI 서버 호출
                const response = await fetch(`${AI_SERVER_URL}/api/try-on`, {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();

                if (!response.ok) throw new Error(data.error || '피팅 처리 중 문제가 발생했습니다.');

                // 2. 결과 표시
                const resultImg = document.getElementById('fitting-result-img');
                const placeholder = document.getElementById('fitting-placeholder-main');
                if (resultImg) {
                    resultImg.src = data.result_url;
                    resultImg.style.display = 'block';
                }
                if (placeholder) placeholder.style.display = 'none';

                // 3. 스프링 부트에 피팅 기록 저장
                const productId = document.getElementById('target-product-id')?.value || 0;
                saveFittingToDB(productId, data.result_url);

            } catch (error) {
                alert("가상 피팅 오류: " + error.message);
            } finally {
                tryOnBtn.disabled = false;
                document.getElementById('fitting-loading-overlay').style.display = 'none';
            }
        });
    }

    async function saveFittingToDB(productId, resultB64) {
        console.log("DB 저장 시도 중... 상품ID:", productId);

        // 🌟 [추가 1] 상품 ID가 undefined거나 없으면 아예 서버로 요청을 안 보내게 막습니다!
        if (!productId || productId === 'undefined' || productId == 0) {
            console.warn("상품 ID가 유효하지 않아 피팅 기록을 저장하지 않습니다.");
            return;
        }

        try {
            const response = await fetch('/api/ai/save-fitting', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: productId,
                    resultImageUrl: resultB64
                })
            });

            if (response.status === 401) {
                alert("로그인이 풀렸습니다! 피팅 기록을 저장하려면 로그인해주세요.");
                return;
            }

            if (!response.ok) {
                throw new Error(`서버 응답 오류 (상태 코드: ${response.status})`);
            }

            console.log("🎉 아카이브 저장 완료!");

        } catch (error) {
            console.error("아카이브 저장 실패:", error);
            alert("피팅 기록 저장 중 오류가 발생했습니다. (F12 콘솔창을 확인해주세요)");
        }
    }

    // ==============================================================
    // [D] 스토어 상세페이지에서 '피팅하기'로 넘어온 경우 처리
    // ==============================================================
    const urlParams = new URLSearchParams(window.location.search);
    const productIdFromUrl = urlParams.get('productId');

    if (productIdFromUrl) {
        const clothImgFromThymeleaf = document.getElementById('cloth-preview-fixed');
        if (clothImgFromThymeleaf && clothImgFromThymeleaf.src) {
            // 🌟 [추가 2] 3번째 파라미터로 productIdFromUrl을 넣어주어 undefined가 발생하지 않게 합니다!
            setProductForFitting(clothImgFromThymeleaf.src, "선택한 상품", productIdFromUrl);
        }
    }
});