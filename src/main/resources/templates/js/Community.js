import { UserData, ShareData, ShareFitData } from "./Data.js";

/**
 * 1. 상태 관리 객체
 */
const state = {
    currentMenu: "HOME",
    likedPosts: {},
    userData: UserData,
    allPosts: [],      // 일반 게시글 데이터 (ShareData)
    mediaPosts: []     // 미디어 중심 데이터 (ShareFitData)
};

/**
 * 2. 초기 로드 및 실행
 */
document.addEventListener('DOMContentLoaded', function() {
    state.allPosts = ShareData;
    state.mediaPosts = ShareFitData;

    loadUserData();
    loadLikedPosts();
    setupEventListeners();
    renderPostList();
});

/**
 * 3. 사용자 및 좋아요 데이터 로드
 */
function loadUserData() {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
        state.userData = JSON.parse(storedUserData);
        document.getElementById('userName').textContent = state.userData.nick;
        document.getElementById('userProfileImg').src = state.userData.profile;
    }
}

function loadLikedPosts() {
    const stored = localStorage.getItem('likedPosts');
    if (stored) {
        state.likedPosts = JSON.parse(stored);
    }
}

/**
 * 4. 이벤트 리스너 설정
 */
function setupEventListeners() {
    const menuItems = document.querySelectorAll('.menu_item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const menu = this.getAttribute('data-menu');
            handleMenuChange(menu);
        });
    });

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            handleSearch(this.value);
        });
    }
}

/**
 * 5. 메뉴 및 검색 핸들링
 */
function handleMenuChange(menu) {
    state.currentMenu = menu;

    document.querySelectorAll('.menu_item').forEach(item => {
        if (item.getAttribute('data-menu') === menu) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    renderPostList();
}

function handleSearch(searchTerm) {
    console.log('검색어:', searchTerm);
    // 필요 시 검색 필터링 로직 추가
}

/**
 * 6. 렌더링 엔진 (리스트 vs 미디어 그리드)
 */
function renderPostList() {
    const container = document.getElementById('postListContainer');
    if (!container) return;

    let currentData = [];
    let isMediaMode = false;

    // 메뉴에 따라 데이터 소스 및 모드 결정
    if (state.currentMenu === "Share Fit") {
        currentData = state.mediaPosts;
        isMediaMode = true;
        container.className = "list_container media_grid"; // CSS 클래스 전환
    } else {
        currentData = state.allPosts;
        isMediaMode = false;
        container.className = "list_container";
    }

    // 최신순 정렬
    const sortedList = [...currentData].sort((a, b) => new Date(b.date) - new Date(a.date));

    // 카테고리 필터링 (HOME과 Share Fit은 전체 출력)
    const filteredPosts = (state.currentMenu === "HOME" || state.currentMenu === "Share Fit")
        ? sortedList
        : sortedList.filter(post => post.ctg === state.currentMenu);

    if (!filteredPosts || filteredPosts.length === 0) {
        container.innerHTML = '<div class="no_data">등록된 게시글이 없습니다.</div>';
        return;
    }

    // 모드에 맞는 HTML 생성 및 주입
    container.innerHTML = filteredPosts.map(post =>
        isMediaMode ? createMediaPostHTML(post) : createPostHTML(post)
    ).join('');

    attachPostEventListeners();
}

/**
 * 7. HTML 생성 함수
 */

// [기본] 글 위주의 포스트 카드
function createPostHTML(post) {
    const isLiked = state.likedPosts[post.id];
    const heartCount = isLiked ? (post.heartCnt || 0) + 1 : (post.heartCnt || 0);

    return `
        <article class="post_card" data-post-id="${post.id}">
            <div class="wrapper">
                <div class="post_header">
                    <div class="author_img">
                        <img src="${post.profile || '../img/interface/ProfileDefault.png'}" alt="author" />
                    </div>
                    <div class="author_info">
                        <span class="category">${post.ctg}</span>
                        <div class="meta">
                            <span class="name">${post.name}</span>
                            <span class="date">${post.date}</span>
                        </div>
                    </div>
                </div>
                <div class="post_body">
                    <p class="text">${post.desc}</p>
                    ${post.img ? `<div class="body_img"><img src="${post.img}" alt="content" /></div>` : ''}
                </div>
                <div class="post_footer">
                    <div class="stats_left">
                        <button class="heart_btn ${isLiked ? 'active' : ''}" data-post-id="${post.id}">
                            <img src="${isLiked ? '../img/community/heart-fill.png' : '../img/community/heart.png'}" />
                            <span>${heartCount}</span>
                        </button>
                        <span class="stat_item"><img src="../img/community/bubble.png" /> ${post.commentCnt || 0}</span>
                    </div>
                    <div class="stats_right">
                        <span class="stat_item"><img src="../img/community/view.png" /> ${post.viewCnt || 0}</span>
                    </div>
                </div>
            </div>
        </article>
    `;
}

// [미디어] 이미지 중심의 그리드 카드
function createMediaPostHTML(post) {
    return `
        <article class="media_card" data-post-id="${post.id}">
            <div class="media_img_wrapper">
                <img src="${post.img || '../img/community/no-image.png'}" alt="media" />
                <div class="media_overlay">
                    <div class="overlay_stats">
                        <span>♥ ${post.heartCnt || 0}</span>
                        <span>● ${post.commentCnt || 0}</span>
                    </div>
                </div>
            </div>
        </article>
    `;
}

/**
 * 8. 상호작용 및 상세 페이지 이동
 */
function attachPostEventListeners() {
    const cards = document.querySelectorAll('.post_card, .media_card');
    cards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.closest('.heart_btn')) return; // 좋아요 버튼 클릭 시 상세 이동 방지
            handleDetailView(this.getAttribute('data-post-id'));
        });
    });

    const heartButtons = document.querySelectorAll('.heart_btn');
    heartButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleHeart(parseInt(this.getAttribute('data-post-id')));
        });
    });
}

function handleDetailView(postId) {
    const type = (state.currentMenu === "Share Fit") ? "media" : "all";

    window.location.href = `./CommunityDetail.html?id=${postId}&type=${type}`;

    const sourceData = (type === "media") ? state.mediaPosts : state.allPosts;
    const post = sourceData.find(p => p.id == postId);

    if (post) {
        sessionStorage.setItem('currentPost', JSON.stringify(post));
    }
}

function toggleHeart(postId) {
    state.likedPosts[postId] = !state.likedPosts[postId];
    localStorage.setItem('likedPosts', JSON.stringify(state.likedPosts));

    if (state.currentMenu !== "Share Fit") {
        renderPostList();
    }
}