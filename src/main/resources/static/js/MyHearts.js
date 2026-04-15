import {UserData} from "./Data.js";

const HeartsContainer = document.getElementById("content");
const renderHearts = () => {
    const HeartsPosts = UserData.heartPosts;

    if (HeartsPosts && HeartsPosts.length > 0) {
        const HeartsHTML = HeartsPosts.map(item =>{
            if (!item)
                return HeartsContainer.innerHTML = `
                    <p class="no-item">아직 남긴 좋아요 없습니다. <br> 좋아요를 눌러보세요!</p>
            `;
            return`
                <div class="item" data-id="${item.id}">
                    <div class="PostTitle">
                        <p>${item.title}</p>
                    </div>
                    <div class="name">
                        <span>${item.UserName}</span>
                    </div>
                </div>
            `}).join('');
            HeartsContainer.innerHTML = `<div class="list">${HeartsHTML}</div>`;
        }};

HeartsContainer.addEventListener('click', (e) => {
    const item = e.target.closest('.item');
    if (item) {
        const postId = item.dataset.id;
        location.href = `./ShareFitDetail.html?id=${postId}`;
    }
});

// 실행
renderHearts();