document.addEventListener('DOMContentLoaded', () => {
    let currentMode = "ID";
    window.changeMode = function() {
        currentMode = (currentMode === "ID") ? "PW" : "ID";
        document.getElementById('title').innerText = "Find " + currentMode;
        document.getElementById('toggle_mode').innerText = (currentMode === "ID") ? "비밀번호 찾기 전환" : "아이디 찾기 전환";
        resetSteps();
    };
    window.goNext = function(curr, next) {
        if (next > curr) {
            const input = document.querySelector(`#step${curr} input`);
            if (input && !input.value) {
                alert("정보를 입력해주세요.");
                input.focus();
                return;
            }
        }

        document.getElementById(`step${curr}`).style.display = 'none';
        document.getElementById(`step${next}`).style.display = 'block';

        if (next === 3) fetchFromDB();
    };
    function resetSteps() {
        document.querySelectorAll('.step').forEach((el, idx) => {
            el.style.display = (idx === 0) ? 'block' : 'none';
        });
        document.getElementById('name').value = "";
        document.getElementById('tel').value = "";
        document.getElementById('result').innerText = "";
    }
    async function fetchFromDB() {
        const resBox = document.getElementById('result');
        const nameVal = document.getElementById('name').value;
        const telVal = document.getElementById('tel').value;

        resBox.innerText = "조회 중...";

        try {
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

            if (data.success) {
                resBox.innerText = data.result; 
            } else {
                resBox.innerText = "정보를 찾을 수 없습니다.";
            }
        } catch (error) {
            resBox.innerText = "서버 연결 오류";
            console.error(error);
        }
    }
});