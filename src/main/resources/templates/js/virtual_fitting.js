document.addEventListener('DOMContentLoaded', () => {
    // 요소 선택
    const userUploadArea = document.getElementById('user-upload-area');
    const userFile = document.getElementById('user-file');
    const userPreview = document.getElementById('user-preview');

    const clothUploadArea = document.getElementById('cloth-upload-area');
    const clothFile = document.getElementById('cloth-file');
    const clothPreview = document.getElementById('cloth-preview');

    const btnTryOn = document.getElementById('btn-try-on');
    const loadingOverlay = document.getElementById('loading-overlay');
    const resultSection = document.getElementById('result-section');
    const resultImg = document.getElementById('result-img');

    // 1. 미리보기 함수 (공통)
    function handleFileSelect(input, previewImg) {
        const file = input.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                previewImg.src = e.target.result;
                previewImg.classList.add('preview-active'); // CSS로 꽉 차게 스타일링
            };
            reader.readAsDataURL(file);
        }
    }

    // 2. 이벤트 리스너: 내 사진 업로드
    userUploadArea.addEventListener('click', () => userFile.click());
    userFile.addEventListener('change', () => handleFileSelect(userFile, userPreview));

    // 3. 이벤트 리스너: 옷 사진 업로드
    clothUploadArea.addEventListener('click', () => clothFile.click());
    clothFile.addEventListener('change', () => handleFileSelect(clothFile, clothPreview));

    // 4. 피팅 시작하기 버튼 클릭
    btnTryOn.addEventListener('click', async () => {
        // 유효성 검사
        if (!userFile.files[0] || !clothFile.files[0]) {
            alert("내 사진과 옷 사진을 모두 업로드해주세요!");
            return;
        }

        // 로딩 표시
        loadingOverlay.style.display = 'flex';
        resultSection.style.display = 'none';

        // 데이터 준비
        const formData = new FormData();
        formData.append('userImage', userFile.files[0]);
        formData.append('clothImage', clothFile.files[0]);

        try {
            // 서버 요청 (Spring Boot Controller)
            const response = await fetch('/api/fitting/try-on', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                // 이미지 데이터(Blob) 받기
                const blob = await response.blob();
                const imageUrl = URL.createObjectURL(blob);

                resultImg.onload = function () {
                    loadingOverlay.style.display = 'none'; // 로딩 끄기
                    resultSection.style.display = 'block'; // 결과 보이기
                    resultSection.scrollIntoView({behavior: 'smooth'});
                };

                // 결과 표시
                resultImg.src = imageUrl;
                resultSection.style.display = 'block';

                // 스크롤을 결과 화면으로 이동
                resultSection.scrollIntoView({behavior: 'smooth'});
            } else {
                const errorData = await response.json();
                alert("피팅 실패: " + (errorData.error || "서버 오류"));
                loadingOverlay.style.display = 'none';
            }
        } catch (error) {
            console.error("Error:", error);
            alert("서버 통신 오류");
            loadingOverlay.style.display = 'none';
        }
    });
});