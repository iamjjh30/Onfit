import { UserData } from "./Data.js";

let formData = {
    img: UserData.profile,
    nick: UserData.nick,
    name: UserData.name,
    birth: UserData.birth,
    phone: UserData.phone,
    email: UserData.email
};

const fileInput = document.getElementById('file-input');
const profileImg = document.getElementById('profile-img-preview');
const nickInput = document.getElementById('user-nick');
const phoneInput = document.getElementById('user-phone');
const emailInput = document.getElementById('user-email');
const form = document.getElementById('item-box');

const init = () => {
    profileImg.src = formData.img;
    nickInput.value = formData.nick;
    phoneInput.value = formData.phone;
    emailInput.value = formData.email;
    // 이름과 생년월일은 수정 불가한 <p> 태그라면 textContent로 주입
    document.getElementById('user-name-text').textContent = formData.name;
    document.getElementById('user-birth-text').textContent = formData.birth;
};

// 4. 이미지 클릭 핸들러 (handleImageClick)
profileImg.addEventListener('click', () => {
    fileInput.click();
});

// 5. 파일 변경 핸들러 (handleFileChange)
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result;
            profileImg.src = result;
            formData.img = result;
        };
        reader.readAsDataURL(file);
    }
});

form.addEventListener('submit', (e) => {
    e.preventDefault();

    formData.nick = nickInput.value;
    formData.phone = phoneInput.value;
    formData.email = emailInput.value;

    Object.assign(UserData, formData);

    console.log("최종 저장 데이터:", UserData);
});

document.getElementById('save-btn').addEventListener('click', (e) => {
    e.preventDefault();

    // 1. 데이터 업데이트 로직 (필요시)
    UserData.nick = document.getElementById('user-nick').value;
    UserData.phone = document.getElementById('user-phone').value;
    UserData.email = document.getElementById('user-email').value;

    // 2. 메시지 출력 전용 요소 선택
    const msg = document.getElementById('msg');

    // 3. 메시지 박스 주입 (innerHTML 사용)
    msg.innerHTML = `
        <div id="msg_box">
            <span>저장되었습니다.</span>
        </div>
    `;

    // 4. 3초 후 초기화
    setTimeout(() => {
        msg.innerHTML = '';
    }, 3000);
});

init();