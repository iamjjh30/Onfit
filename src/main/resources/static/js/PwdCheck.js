// ✅ 세션 기반 서버 검증으로 교체
document.getElementById('btn').addEventListener('click', async (e) => {
    e.preventDefault();

    const input = document.getElementById('pwd');
    const msg = document.getElementById('msg');

    try {
        const res = await fetch('/api/check-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: input.value })
        });

        const data = await res.json();

        if (res.status === 401) {
            // 세션 만료 → 로그인 페이지로
            location.href = '/login';
            return;
        }

        if (data.success) {
            location.replace('/UserDetail');  // 타임리프 라우팅으로 변경
        } else {
            input.value = '';
            msg.innerHTML = `
                <div id="msg_box">
                    <span>비밀번호가 틀립니다.</span>
                </div>
            `;
            setTimeout(() => { msg.textContent = ''; }, 3000);
        }

    } catch (err) {
        console.error(err);
        msg.innerHTML = `<div id="msg_box"><span>서버 오류가 발생했습니다.</span></div>`;
    }
});