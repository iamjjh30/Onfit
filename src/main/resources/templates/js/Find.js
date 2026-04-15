document.addEventListener('DOMContentLoaded', () => {
    let currentMode = "ID";

    // 1. 모드 전환 (아이디 찾기 <-> 비밀번호 찾기)
    window.changeMode = function() {
        currentMode = (currentMode === "ID") ? "PW" : "ID";
        document.getElementById('title').innerText = "Find " + currentMode;
        document.getElementById('toggle_mode').innerText = (currentMode === "ID") ? "비밀번호 찾기 전환" : "아이디 찾기 전환";
        resetSteps();
    };

    // 2. 단계 이동 로직
    window.goNext = function(curr, next) {
        // 다음 단계로 넘어갈 때 입력값 검증
        if (next > curr) {
            const input = document.querySelector(`#step${curr} input`);
            if (input && !input.value) {
                alert("정보를 입력해주세요.");
                input.focus();
                return;
            }
        }

        // 화면 전환
        document.getElementById(`step${curr}`).style.display = 'none';
        document.getElementById(`step${next}`).style.display = 'block';

        // 🌟 3단계(결과창)로 진입할 때 DB 조회 실행
        if (next === 3) {
            fetchFromDB();
        }
    };

    // 3. 입력창 및 화면 초기화
    function resetSteps() {
        document.querySelectorAll('.step').forEach((el, idx) => {
            el.style.display = (idx === 0) ? 'block' : 'none';
        });
        document.getElementById('name').value = "";
        document.getElementById('tel').value = "";
        document.getElementById('result').innerHTML = ""; // innerHTML로 초기화

        const guideText = document.querySelector('#step3 .guide');
        if (guideText) guideText.innerText = "정보를 찾고 있습니다...";
    }

    // 4. DB 조회 및 결과 화면 렌더링 (가장 중요한 부분!)
    async function fetchFromDB() {
        const resBox = document.getElementById('result');
        const guideText = document.querySelector('#step3 .guide'); // 상단 제목 텍스트
        const nameVal = document.getElementById('name').value;
        const telVal = document.getElementById('tel').value;

        // 로딩 상태 표시
        resBox.innerHTML = "<p class='found-text' style='text-align:center;'>조회 중입니다...</p>";

        try {
            // 스프링 부트로 POST 요청 전송
            const response = await fetch('/api/find-account', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode: currentMode,
                    name: nameVal,
                    tel: telVal
                })
            });

            const data = await response.json();

            // 🌟 백엔드에서 success: true 를 보냈을 때 (조회 성공)
            if (data.success) {
                if (guideText) guideText.innerText = "회원님의 정보를 찾았습니다!";

                // 모드(ID/PW)에 따라 안내 문구를 다르게 설정
                const typeText = (currentMode === "ID") ? "가입하신 아이디는" : "회원님의 비밀번호는";

                // CSS 클래스를 적용해서 예쁘게 출력
                resBox.innerHTML = `
                    <p class="found-text">${typeText}</p>
                    <p class="found-id-highlight">${data.result}</p>
                    <p class="found-text">입니다.</p>
                `;
            }
            // 🌟 백엔드에서 success: false 를 보냈을 때 (조회 실패)
            else {
                if (guideText) guideText.innerText = "정보를 찾을 수 없습니다.";

                resBox.innerHTML = `
                    <p class="not-found-text">입력하신 정보와 일치하는 계정이 없습니다.</p>
                    <p class="found-text" style="font-size:0.9em; margin-top:10px;">다시 확인하시거나 회원가입을 진행해주세요.</p>
                `;
            }
        } catch (error) {
            // 🌟 서버 연결 자체에 실패했을 때 (에러)
            if (guideText) guideText.innerText = "오류가 발생했습니다.";

            resBox.innerHTML = `
                <p class="not-found-text">서버 통신에 실패했습니다.</p>
                <p class="found-text" style="font-size:0.9em; margin-top:10px;">잠시 후 다시 시도해주세요.</p>
            `;
            console.error(error);
        }
    }
});