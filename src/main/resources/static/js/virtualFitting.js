document.addEventListener('DOMContentLoaded', function() {

    // ==========================================
    // 1. 이미지 업로드 시 미리보기 기능
    // ==========================================
    function setupImagePreview(inputId, previewId) {
        const fileInput = document.getElementById(inputId);
        const previewImg = document.getElementById(previewId);

        fileInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                // FileReader를 이용해 이미지를 브라우저에 띄움
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImg.src = e.target.result;
                    previewImg.classList.add('preview-active'); // CSS를 적용해 꽉 차게 만듦
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 내 사진과 옷 사진 각각에 미리보기 이벤트 연결
    setupImagePreview('user-file', 'user-preview');
    setupImagePreview('cloth-file', 'cloth-preview');


    // ==========================================
    // 2. 가상 피팅 API 호출 기능
    // ==========================================
    const btnTryOn = document.getElementById('btn-try-on');
    const loadingOverlay = document.getElementById('loading-overlay');
    const resultSection = document.getElementById('result-section');
    const resultImg = document.getElementById('result-img');

    btnTryOn.addEventListener('click', async function() {
        // 업로드된 파일 가져오기
        const userFile = document.getElementById('user-file').files[0];
        const clothFile = document.getElementById('cloth-file').files[0];

        // 1단계: 파일이 모두 있는지 검증
        if (!userFile || !clothFile) {
            alert('내 사진과 옷 사진을 모두 업로드해주세요!');
            return;
        }

        // 2단계: UI 변경 (로딩창 켜기, 버튼 비활성화, 기존 결과 숨기기)
        loadingOverlay.style.display = 'flex';
        btnTryOn.disabled = true;
        resultSection.style.display = 'none';

        // 3단계: 폼 데이터 생성 (파이썬 서버가 받을 수 있는 형태로 포장)
        const formData = new FormData();
        formData.append('user_image', userFile);
        formData.append('cloth_image', clothFile);

        try {
            // 4단계: 파이썬 API로 전송! (★ 파이썬 서버 주소가 맞는지 확인)
            const response = await fetch('http://localhost:5000/api/try-on', {
                method: 'POST',
                body: formData
            });

            // 서버에서 에러를 보냈을 경우
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || '피팅 처리 중 오류가 발생했습니다.');
            }

            // 5단계: 성공적으로 이미지를 받아와서 화면에 렌더링
            const imageBlob = await response.blob();
            const imageUrl = URL.createObjectURL(imageBlob);

            resultImg.src = imageUrl;
            resultSection.style.display = 'block';

            // 센스있는 UX: 결과가 나오면 결과 화면으로 부드럽게 스크롤 이동!
            resultSection.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error('Fitting Error:', error);
            alert('❌ ' + error.message);
        } finally {
            // 6단계: 성공/실패 상관없이 로딩창 끄고 버튼 다시 활성화
            loadingOverlay.style.display = 'none';
            btnTryOn.disabled = false;
        }
    });

});