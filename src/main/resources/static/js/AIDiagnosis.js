let selectedFile = null;

// 1. 이미지 미리보기 기능
function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        selectedFile = file;
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('image-preview').src = e.target.result;
            document.getElementById('image-preview').style.display = 'block';
            document.getElementById('upload-text').style.display = 'none';
            document.getElementById('analyze-btn').disabled = false; // 버튼 활성화
        }
        reader.readAsDataURL(file);
    }
}

// 2. AI 분석 요청 기능
// 2. AI 분석 요청 기능
async function startAnalysis() {
    if (!selectedFile) return;

    // UI 상태 변경 (로딩 켜기)
    document.getElementById('analyze-btn').style.display = 'none';
    document.getElementById('result-box').style.display = 'none';
    document.getElementById('loading-box').style.display = 'block';

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
        const response = await fetch('http://localhost:5000/api/analyze-face', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('서버 응답 오류');

        const data = await response.json();

        // ★ 추가된 핵심 로직: AI가 에러 메시지를 보냈는지 확인
        if (data.error) {
            // 브라우저 경고 팝업 띄우기
            alert(data.error);

            // UI 원상복구 (로딩 끄고 버튼 살리기)
            document.getElementById('loading-box').style.display = 'none';
            document.getElementById('analyze-btn').style.display = 'block';
            return; // 렌더링 단계로 넘어가지 않고 여기서 함수 즉시 종료!
        }

        // 에러가 없다면 정상적으로 결과 렌더링
        renderResult(data);

    } catch (error) {
        alert("분석 중 오류가 발생했습니다. 다시 시도해주세요.");
        console.error(error);
        document.getElementById('analyze-btn').style.display = 'block';
        document.getElementById('loading-box').style.display = 'none';
    }
    // finally 블록에 있던 로딩 끄는 코드는 에러 분기 처리를 위해 삭제하거나 위처럼 try/catch 내부로 이동하는 것이 좋습니다.
}
// 3. 화면 렌더링 함수
function renderResult(data) {
    // ★ 가장 중요: AI가 진짜로 뭐라고 보냈는지 브라우저 콘솔에 출력해서 확인
    console.log("🤖 AI가 보낸 원본 데이터:", data);

    // AI가 응답을 객체 안에 한 번 더 감싸서 보냈을 경우를 대비한 처리
    // (예: data.result 안에 진짜 데이터가 있는 경우)
    const aiData = data.result || data.personal_color || data;

    // 텍스트 채우기 (값이 없으면 기본 텍스트 출력)
    document.getElementById('res-tone').innerText = aiData.tone || aiData.Tone || "톤 분석 결과 없음";
    document.getElementById('res-features').innerText = aiData.features || aiData.Features || "특징 분석 결과 없음";

    // 베스트 컬러 동그라미 그리기 (안전장치: 값이 없으면 빈 배열 []로 처리해서 에러 방지)
    const bestContainer = document.getElementById('best-colors');
    bestContainer.innerHTML = '';
    const bestColors = aiData.best_colors || aiData.bestColors || aiData.best || [];
    bestColors.forEach(colorHex => {
        bestContainer.innerHTML += `<div class="color-circle" style="background-color: ${colorHex};" title="${colorHex}"></div>`;
    });

    // 워스트 컬러 동그라미 그리기
    const worstContainer = document.getElementById('worst-colors');
    worstContainer.innerHTML = '';
    const worstColors = aiData.worst_colors || aiData.worstColors || aiData.worst || [];
    worstColors.forEach(colorHex => {
        worstContainer.innerHTML += `<div class="color-circle" style="background-color: ${colorHex};" title="${colorHex}"></div>`;
    });

    // 추천 스타일 해시태그 그리기
    const stylesContainer = document.getElementById('recommended-styles');
    stylesContainer.innerHTML = '';
    const recommendedStyles = aiData.recommended_styles || aiData.recommendedStyles || aiData.styles || [];
    recommendedStyles.forEach(style => {
        stylesContainer.innerHTML += `<span class="style-tag">#${style}</span>`;
    });

    // 결과 박스 보여주기
    document.getElementById('result-box').style.display = 'block';
    document.getElementById('analyze-btn').style.display = 'block';
    document.getElementById('analyze-btn').innerText = '다른 사진으로 다시 분석하기';
}