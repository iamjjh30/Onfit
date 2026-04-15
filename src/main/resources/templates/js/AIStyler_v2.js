document.addEventListener('DOMContentLoaded', async function () {

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

    let faceFile = null;
    let bodyFile = null;
    let clothFile = null;

    function setupPreview(inputId, previewId, placeholderId, fileVariableSetter) {
        document.getElementById(inputId).addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                fileVariableSetter(file);
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.getElementById(previewId);
                    img.src = e.target.result;
                    img.style.display = 'block';
                    if(placeholderId) document.getElementById(placeholderId).style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    setupPreview('face-input', 'face-preview', null, (f) => faceFile = f);
    setupPreview('body-input', 'body-preview', 'body-placeholder', (f) => bodyFile = f);
    setupPreview('cloth-input', 'cloth-preview', 'cloth-placeholder', (f) => clothFile = f);

    // ==============================================================
    // 스토어 상세 페이지에서 넘어온 옷 자동 세팅 로직
    // ==============================================================
    const savedClothUrl = localStorage.getItem('selectedClothForFitting');

    if (savedClothUrl) {
        const fittingTabBtn = Array.from(tabBtns).find(btn => btn.dataset.target === 'tab-fitting');
        if (fittingTabBtn) fittingTabBtn.click();

        const clothPreview = document.getElementById('cloth-preview');
        const clothPlaceholder = document.getElementById('cloth-placeholder');

        if (clothPreview) {
            clothPreview.src = savedClothUrl;
            clothPreview.style.display = 'block';
            if(clothPlaceholder) clothPlaceholder.style.display = 'none';
        }

        fetch(savedClothUrl)
            .then(res => {
                if (!res.ok) throw new Error("이미지 경로를 찾을 수 없음 (404)");
                return res.blob();
            })
            .then(blob => {
                clothFile = new File([blob], "selected_cloth.jpg", {type: "image/jpeg"});
                setTimeout(() => {
                    if(!bodyFile) {
                        alert("선택하신 상품이 피팅룸에 준비되었습니다! \n이제 '내 상반신 사진'을 올려주세요.");
                    }
                }, 300);
            })
            .catch(error => {
                console.error("옷 이미지 로드 실패:", error);
            });

        localStorage.removeItem('selectedClothForFitting');
    }

    // ==============================================================
    // 퍼스널 컬러 진단
    // ==============================================================
    const diagnoseBtn = document.getElementById('diagnose-btn');
    diagnoseBtn.addEventListener('click', async () => {
        if (!faceFile) { alert("먼저 얼굴 사진을 업로드해주세요."); return; }

        diagnoseBtn.disabled = true;
        document.getElementById('diagnosis-loading').style.display = 'block';
        document.getElementById('initial-message').style.display = 'none';
        document.getElementById('diagnosis-result').style.display = 'none';

        const formData = new FormData();
        formData.append('image', faceFile);

        try {
            const response = await fetch('http://localhost:5000/api/analyze-face', {method: 'POST', body: formData});
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            renderDiagnosisResult(data);
            createRecommendationItems(data.recommended_styles, data.tone);
        } catch (error) {
            alert("진단 오류: " + error.message);
            document.getElementById('initial-message').style.display = 'block';
        } finally {
            diagnoseBtn.disabled = false;
            document.getElementById('diagnosis-loading').style.display = 'none';
        }
    });

    function getThemeColor(toneName) {
        if (toneName.includes('봄')) return '#ff9f43';
        if (toneName.includes('여름')) return '#74b9ff';
        if (toneName.includes('가을')) return '#d35400';
        if (toneName.includes('겨울')) return '#e84393';
        return '#000000';
    }

    function renderDiagnosisResult(data) {
        // 경고 배너
        const warningEl = document.getElementById('diagnosis-warning');
        if (data.warning && data.warning.trim() !== "") {
            document.getElementById('warning-text').innerText = data.warning;
            warningEl.style.display = 'flex';
        } else {
            warningEl.style.display = 'none';
        }

        // 결과 텍스트
        document.getElementById('result-tone').innerText = data.tone;
        document.getElementById('result-features').innerText = data.features;

        // 테마 컬러 변경
        const themeColor = getThemeColor(data.tone);
        document.documentElement.style.setProperty('--primary-color', themeColor);

        // Best Colors
        const bestContainer = document.getElementById('best-colors-container');
        bestContainer.innerHTML = '';
        (data.best_colors || []).forEach(color => {
            bestContainer.innerHTML += `<div style="background-color: ${color};" title="${color}"></div>`;
        });

        // Worst Colors
        const worstContainer = document.getElementById('worst-colors-container');
        worstContainer.innerHTML = '';
        (data.worst_colors || []).forEach(color => {
            worstContainer.innerHTML += `<div style="background-color: ${color};" title="${color}"></div>`;
        });

        // 결과창 표시
        document.getElementById('diagnosis-result').style.display = 'block';

        // ✅ 저장 버튼 세팅
        const saveBtn = document.getElementById('save-palette-btn');
        saveBtn.innerText = '✨ 내 팔레트에 저장하기';
        saveBtn.style.cssText = `
            display: inline-block;
            padding: 14px 32px;
            background: #111;
            color: white;c
            border: none;
            border-radius: 50px;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            transition: background 0.2s, transform 0.2s;
            letter-spacing: 0.03em;
        `;

        // 이벤트 중복 방지 (cloneNode로 기존 이벤트 제거)
        const newBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newBtn, saveBtn);
        newBtn.style.cssText = `
            display: inline-block;
            padding: 14px 32px;
            background: #111;
            color: white;
            border: none;
            border-radius: 50px;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            transition: background 0.2s, transform 0.2s;
            letter-spacing: 0.03em;
        `;
        newBtn.innerText = '✨ 내 팔레트에 저장하기';
        newBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('/api/save-personal-color', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tone: data.tone })
                });

                if (response.status === 401) {
                    alert('로그인 후 저장할 수 있습니다.');
                    return;
                }

                newBtn.innerText = '✅ 저장 완료!';
                newBtn.style.background = '#4caf50';

                setTimeout(() => {
                    newBtn.innerText = '✨ 내 팔레트에 저장하기';
                    newBtn.style.background = '#111';
                }, 2000);

            } catch (e) {
                alert('저장 중 오류가 발생했습니다.');
            }
        });
    }

    // ==============================================================
    // 톤별 추천 의상
    // ==============================================================
    const clothesByTone = {
        spring: ["../img/Main/beigeTranchCoat.png", "../img/Main/coralShirt.png", "../img/Main/yellowSweater.png"],
        summer: ["../img/Main/skyblueShirt.png", "../img/Main/mintShirt.png", "../img/Main/whitePants.png"],
        autumn: ["../img/Main/camelJacket.png", "../img/Main/p100_olive.png", "../img/Main/burgundyNit.png"],
        winter: ["../img/Main/navySuit.png", "../img/Main/charcoalGreyCoat.png", "../img/Main/blackTurtleNeck.png"],
    };
    const keywordsByTone = {
        spring: ["클래식 더블 버튼 베이지 트렌치코트", "피치 코랄 코튼 셔츠", "버터 옐로우 텍스처 라운드 스웨터"],
        summer: ["스탠다드 핏 옥스퍼드 블루 셔츠", "소프트 파스텔 민트 라운드 니트", "히든 밴딩 세미와이드 화이트 슬랙스"],
        autumn: ["클래식 카멜 재킷", "올리브 와이드 팬츠", "케이블 버건디 니트"],
        winter: ["에센셜 네이비 테일러드 재킷", "모던 울 블렌드 차콜 코트", "베이직 캐시미어 블랙 터틀넥"],
    };

    function getClothesForTone(toneName) {
        if (!toneName) return clothesByTone.spring;
        if (toneName.includes('봄')) return clothesByTone.spring;
        if (toneName.includes('여름')) return clothesByTone.summer;
        if (toneName.includes('가을')) return clothesByTone.autumn;
        if (toneName.includes('겨울')) return clothesByTone.winter;
        return clothesByTone.spring;
    }

    function getKeywordsForTone(toneName) {
        if (!toneName) return keywordsByTone.spring;
        if (toneName.includes('봄')) return keywordsByTone.spring;
        if (toneName.includes('여름')) return keywordsByTone.summer;
        if (toneName.includes('가을')) return keywordsByTone.autumn;
        if (toneName.includes('겨울')) return keywordsByTone.winter;
        return keywordsByTone.spring;
    }

    function createRecommendationItems(stylesKeywords, toneName) {
        const grid = document.getElementById('recommendation-grid');
        grid.innerHTML = '';

        const targetClothes = getClothesForTone(toneName);
        const targetKeywords = getKeywordsForTone(toneName);

        targetKeywords.slice(0, 3).forEach((keyword, index) => {
            const clothUrl = targetClothes[index % targetClothes.length];
            const div = document.createElement('div');
            div.className = 'cloth-item';
            div.innerHTML = `<img src="${clothUrl}"><div class="cloth-label">#${keyword}</div>`;

            div.addEventListener('click', async () => {
                document.querySelector('[data-target="tab-fitting"]').click();
                document.getElementById('cloth-preview').src = clothUrl;
                document.getElementById('cloth-preview').style.display = 'block';
                document.getElementById('cloth-placeholder').style.display = 'none';

                const res = await fetch(clothUrl);
                const blob = await res.blob();
                clothFile = new File([blob], "recommended_cloth.jpg", {type: "image/jpeg"});

                if(!bodyFile) {
                    alert("선택하신 옷이 피팅룸으로 이동되었습니다! 이제 '내 상반신 사진'을 올려주세요.");
                }
            });
            grid.appendChild(div);
        });
    }

    // ==============================================================
    // 가상 피팅
    // ==============================================================
    const tryOnBtn = document.getElementById('try-on-btn');
    tryOnBtn.addEventListener('click', async () => {
        if (!bodyFile || !clothFile) {
            alert("내 사진과 옷 사진을 모두 업로드해주세요."); return;
        }

        tryOnBtn.disabled = true;
        document.getElementById('fitting-loading-overlay').style.display = 'flex';

        const formData = new FormData();
        formData.append('user_image', bodyFile);
        formData.append('cloth_image', clothFile);

        try {
            const response = await fetch('http://localhost:5000/api/try-on', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '피팅 처리 중 문제가 발생했습니다.');
            }

            const resultImg = document.getElementById('fitting-result-img');
            const placeholder = document.getElementById('fitting-placeholder-main');

            if (resultImg) {
                resultImg.src = data.result_url;
                resultImg.style.display = 'block';
            }
            if (placeholder) {
                placeholder.style.display = 'none';
            }

        } catch (error) {
            alert("가상 피팅 오류: " + error.message);
            console.error(error);
        } finally {
            tryOnBtn.disabled = false;
            document.getElementById('fitting-loading-overlay').style.display = 'none';
        }
    });

});