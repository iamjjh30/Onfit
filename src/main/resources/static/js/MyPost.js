import {UserData} from "./Data.js";

const PostContainer = document.getElementById("content");
const renderPosts = () => {
    const posts = UserData.post;

    if (posts && posts.length > 0) {
        const postHTML = posts.map(item =>{
            if(!item)
                return PostContainer.innerHTML = `
                    <p class="no-item">아직 남긴 게시글이 없습니다. <br /> 게시글을 작성해보세요!</p>
                `;
            return`
            <div class="item" data-id="${item.postId}">
                <div class="info">
                    <p>${item.postDesc}</p>
                </div>
                <div class="sub-info">
                    <img src="../img/community/heart.png" alt="heart">
                    <span class="cnt">${item.heartCount}</span>
                    <img src="../img/community/bubble.png" alt="bubble">
                    <span class="cnt">${item.commentCount}</span>
                    
                    <div class="menu-container">
                        <button class="menu-dot-btn" data-id="${item.postId}">
                            <img src="../img/community/menu_btn.png" alt="menu">
                        </button>
                        <div id="dropdown-${item.postId}" class="menu-dropdown" style="display: none;">
                            <button onclick="handleAction('공유', ${item.postId})">공유</button>
                            <button onclick="handleAction('수정', ${item.postId})">수정</button>
                            <button onclick="handleAction('삭제', ${item.postId})" class="delete-btn">삭제</button>
                        </div>
                    </div>
                </div>
            </div>
        `}).join('');
        PostContainer.innerHTML = `<div class="list">${postHTML}</div>`;
    }};

// 2. 상세 페이지 이동 (이벤트 위임 활용)
PostContainer.addEventListener('click', (e) => {
    const item = e.target.closest('.item');
    // 메뉴 버튼이나 드롭다운을 누른 게 아닐 때만 상세 이동
    if (item && !e.target.closest('.menu-container')) {
        const postId = item.dataset.id;
        location.href = `./ShareFitDetail.html?id=${postId}`;
    }
});

// 3. 메뉴 토글 기능 (전역 클릭 이벤트)
window.addEventListener('click', (e) => {
    // 점 세개 버튼을 눌렀을 때
    if (e.target.closest('.menu-dot-btn')) {
        e.stopPropagation();
        const id = e.target.closest('.menu-dot-btn').dataset.id;
        const dropdown = document.getElementById(`dropdown-${id}`);

        // 다른 열려있는 드롭다운 닫기
        document.querySelectorAll('.menu-dropdown').forEach(el => {
            if (el !== dropdown) el.style.display = 'none';
        });

        // 현재 드롭다운 토글
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    } else {
        // 배경을 누르면 모든 드롭다운 닫기
        document.querySelectorAll('.menu-dropdown').forEach(el => el.style.display = 'none');
    }
});

// 4. 액션 처리 함수 (공유, 수정, 삭제)
window.handleAction = (type, id) => {
    alert(`${type} 기능 준비 중입니다. ID: ${id}`);
};

// 실행
renderPosts();