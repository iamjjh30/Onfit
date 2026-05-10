document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('submitBtn');

    btn.addEventListener('click', () => {
        const selected = document.querySelectorAll('input[type="radio"]:checked');

        if (selected.length < 4) {
            alert("4가지 질문에 모두 답해주세요!");
            return;
        }

        const score = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
        selected.forEach(input => {
            const type = input.dataset.type;
            if (type in score) score[type]++;
        });

        const finalType =
            (score.E >= score.I ? 'E' : 'I') +
            (score.S >= score.N ? 'S' : 'N') +
            (score.T >= score.F ? 'T' : 'F') +
            (score.J >= score.P ? 'J' : 'P');

        const resultArea = document.getElementById('result-area');
        const typeTag = document.getElementById('mbti-type');

        resultArea.style.display = 'block';
        typeTag.innerText = finalType;

        // 결과 상세 노출 로직 (기존 id 기반 노출 방식 유지)
        document.querySelectorAll('.mbti-result').forEach(el => el.style.display = 'none');
        const target = document.getElementById('result-' + finalType);
        if (target) target.style.display = 'block';

        resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // 쇼핑 및 재검사 이벤트
    document.getElementById('btn-shop')?.addEventListener('click', () => location.href = '/store');
    document.getElementById('btn-retry')?.addEventListener('click', () => location.reload());
});