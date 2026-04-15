import { UserData } from "./Data.js";

document.getElementById('btn').addEventListener('click', (e) => {
    e.preventDefault();

    const input = document.getElementById('pwd');
    const msg = document.getElementById('msg');

    const isCorrect = input.value === UserData.pwd;

    if (isCorrect) {
        location.replace('./UserDetail.html');
    } else {
        input.value = '';
        msg.innerHTML = `
        <div id="msg_box">
            <span>비밀번호가 틀립니다.</span>
        </div>
        `;
        setTimeout(() => { msg.textContent = ''; }, 3000);
    }
});