document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('submitBtn');

    btn.addEventListener('click', () => {
        const selected = document.querySelectorAll('input[type="radio"]:checked');

        if (selected.length < 4) {
            alert("모든 문항에 체크해주세요!");
            return;
        }

        const score = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

        selected.forEach(input => {
            const type = input.dataset.type;
            if (type in score) {
                score[type]++;
            }
        });

        const ei = score.E >= score.I ? 'E' : 'I';
        const sn = score.S >= score.N ? 'S' : 'N';
        const tf = score.T >= score.F ? 'T' : 'F';
        const jp = score.J >= score.P ? 'J' : 'P';

        const finalType = ei + sn + tf + jp;

        const resultArea = document.getElementById('result-area');
        const typeTag = document.getElementById('mbti-type');

        resultArea.style.display = 'block';
        typeTag.innerText = finalType;

        document.querySelectorAll('.mbti-result').forEach(el => {
            el.style.display = 'none';
        });

        const targetResult = document.getElementById('result-' + finalType);
        if (targetResult) {
            targetResult.style.display = 'block';
        }

        resultArea.scrollIntoView({ behavior: 'smooth' });
    });

    // 쇼핑하러 가기
    document.getElementById('btn-shop').addEventListener('click', () => {
        window.location.href = '/store.html';
    });

    // 한번 더 검사
    document.getElementById('btn-retry').addEventListener('click', () => {
        // 라디오 버튼 전체 초기화
        document.querySelectorAll('input[type="radio"]:checked').forEach(el => {
            el.checked = false;
        });
        // 결과 영역 숨기기
        document.getElementById('result-area').style.display = 'none';
        // 맨 위로 스크롤
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});