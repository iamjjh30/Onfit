/* ================================================================
   Community.js — module 없이 동작하는 버전
   (Data.js의 UserData / ShareData / ShareFitData 인라인 포함)
================================================================ */

/* ----------------------------------------------------------------
   0. 데이터 (기존 Data.js 내용 인라인)
---------------------------------------------------------------- */
var UserData = {
    id: "hong1",
    pwd: "0000",
    nick: "동글동글",
    name: "홍길동",
    color: "C",
    profile: "../img/interface/ProfileDefault.png",
    birth: "1998.04.21",
    phone: "01012345678",
    email: "hong1@gmail.com",
    post: [
        { postId: 1, postDesc: "오늘 입은 코디 어떤가요?", heartCount: 5, commentCount: 2 },
        { postId: 2, postDesc: "겨울 쿨톤 외투 추천해주세요! \n 대충 기본템 다 있다는 가정 하에!!", heartCount: 12, commentCount: 8 }
    ],
    commentedPosts: [
        { id: 3, title: "퍼스널 컬러 진단 후기", MyComment: "정보 감사합니다!" }
    ],
    heartPosts: [
        { id: 6, title: "질문", UserName: "test1" },
        { id: 7, title: "맂곰", UserName: "test2" }
    ],
    inquiry: [
        { id: 1, title: "배송은 얼마나 걸리나요?", date: "2026.02.01", isAnswered: true, answer: "안녕하세요, OnfitAI입니다. \n 보통 영업일 기준 3~5일 소요됩니다. \n 문의 감사합니다." },
        { id: 2, title: "사이즈 교환 문의", date: "2026.02.10", isAnswered: false, answer: "" }
    ],
    cartItem: [
        { prdId: 1, prdName: "s100 colorful", imgUrl: "../img/product/shirt/s100_colorful.png", personalColor: "Neutral", price: 120000, qty: 2, size: "M" },
        { prdId: 2, prdName: "s200 ivory",    imgUrl: "../img/product/shirt/s200_ivory.png",    personalColor: "Cool",    price: 110000, qty: 1, size: "M" },
        { prdId: 3, prdName: "s200 white",    imgUrl: "../img/product/shirt/s200_white.png",    personalColor: "Cool",    price: 12000,  qty: 3, size: "S" },
        { prdId: 4, prdName: "c450 ig",       imgUrl: "../img/product/cap/c450_ivory_green.png", personalColor: "Warm",   price: 100000, qty: 1, size: "L" },
        { prdId: 5, prdName: "c400 ig",       imgUrl: "../img/product/cap/c400_ivory_green.png", personalColor: "Neutral",price: 129000, qty: 1, size: "Free" }
    ],
    order: [
        { ordId: 1, state: "배달완료", date: "2026-03-01", name: "s500 데님 긴팔 셔츠",   imgUrl: "../img/product/shirt/s500_denim2_long.png", price: 100000, qty: 1, size: "M",   customerName: "홍길동", address: "충청남도 아산시 탕정면 남서울대학교 공학관", phone: "01012345678", payMethod: "무통장입금", deliFee: 0 },
        { ordId: 1, state: "배달완료", date: "2026-03-01", name: "s500 데님 긴셔츠",      imgUrl: "../img/product/shirt/s500_denim_long.png",   price: 140000, qty: 3, size: "S",   customerName: "홍길동", address: "충청남도 아산시 탕정면 남서울대학교 공학관", phone: "01012345678", payMethod: "무통장입금", deliFee: 0 },
        { ordId: 1, state: "배달완료", date: "2026-03-01", name: "s500 데님 반팔 셔츠",   imgUrl: "../img/product/shirt/s500_denim_short.png",  price: 99000,  qty: 2, size: "M",   customerName: "홍길동", address: "충청남도 아산시 탕정면 남서울대학교 공학관", phone: "01012345678", payMethod: "무통장입금", deliFee: 0 },
        { ordId: 2, state: "배달중",   date: "2026-03-02", name: "h100 하양",             imgUrl: "../img/product/hoodie/h100_white.png",        price: 100000, qty: 2, size: "250mm", customerName: "홍길동", address: "충청남도 아산시 탕정면 남서울대학교 공학관", phone: "01012345678", payMethod: "무통장입금", deliFee: 0 },
        { ordId: 3, state: "구매확정", date: "2026-03-04", name: "j200 파랑",             imgUrl: "../img/product/jacket/fit_j200_blue.jpg",    price: 100000, qty: 2, size: "260mm", customerName: "홍길동", address: "충청남도 아산시 탕정면 남서울대학교 공학관", phone: "01012345678", payMethod: "무통장입금", deliFee: 0 }
    ]
};

var ShareData = [
    { id: 1,  ctg: "잡담", profile: "../img/interface/ProfileDefault.png", name: "test1",  date: "2026-02-01", desc: "잡담이란 이런거다 예시", heartCnt: 4,  commentCnt: 5, viewCnt: 401 },
    { id: 2,  ctg: "잡담", profile: "../img/interface/ProfileDefault.png", name: "test2",  date: "2026-02-01", desc: "잡담이란 이런거다 예시", heartCnt: 4,  commentCnt: 0, viewCnt: 60  },
    { id: 3,  ctg: "잡담", profile: "../img/interface/ProfileDefault.png", name: "test3",  date: "2026-02-01", desc: "잡담이란 이런거다 예시", heartCnt: 0,  commentCnt: 0, viewCnt: 109 },
    { id: 4,  ctg: "잡담", profile: "../img/interface/ProfileDefault.png", name: "test4",  date: "2026-02-04", desc: "잡담이란 이런거다 예시", heartCnt: 4,  commentCnt: 0, viewCnt: 401 },
    { id: 5,  ctg: "잡담", profile: "../img/interface/ProfileDefault.png", name: "test5",  date: "2026-02-03", desc: "잡담이란 이런거다 예시", heartCnt: 10, commentCnt: 0, viewCnt: 401 },
    { id: 6,  ctg: "Q&A",  profile: "../img/interface/ProfileDefault.png", name: "test6",  date: "2026-02-10", desc: "Q&A이란 이런거다 예시",  heartCnt: 0,  commentCnt: 0, viewCnt: 13  },
    { id: 7,  ctg: "Q&A",  profile: "../img/interface/ProfileDefault.png", name: "test7",  date: "2026-02-09", desc: "Q&A이란 이런거다 예시",  heartCnt: 2,  commentCnt: 0, viewCnt: 14  },
    { id: 8,  ctg: "Q&A",  profile: "../img/interface/ProfileDefault.png", name: "test8",  date: "2026-02-05", desc: "Q&A이란 이런거다 예시",  heartCnt: 0,  commentCnt: 0, viewCnt: 41  },
    { id: 9,  ctg: "Q&A",  profile: "../img/interface/ProfileDefault.png", name: "test9",  date: "2026-02-04", desc: "Q&A이란 이런거다 예시",  heartCnt: 0,  commentCnt: 0, viewCnt: 21  },
    { id: 10, ctg: "Q&A",  profile: "../img/interface/ProfileDefault.png", name: "test10", date: "2026-02-03", desc: "Q&A이란 이런거다 예시",  heartCnt: 1,  commentCnt: 0, viewCnt: 82  },
    { id: 11, ctg: "공유",  profile: "../img/interface/ProfileDefault.png", name: "test11", date: "2026-02-04", desc: "긴 글 예시 \n 를 \n 해 \n 보 \n 겠 \n습 \n니 \n다 \n. \n이\n정\n도\n면\n긴\n거\n라\n고\n해\n줘\n야\n함\n진\n짜", heartCnt: 0, commentCnt: 0, viewCnt: 102 },
    { id: 12, ctg: "공유",  profile: "../img/interface/ProfileDefault.png", name: "test12", date: "2026-02-03", desc: "공유란 이런거다 예시", heartCnt: 0, commentCnt: 0, viewCnt: 82  },
    { id: 13, ctg: "공유 ", profile: "../img/interface/ProfileDefault.png", name: "test13", date: "2026-02-06", desc: "공유란 이런거다 예시", heartCnt: 0, commentCnt: 0, viewCnt: 85  },
    { id: 14, ctg: "공유",  profile: "../img/interface/ProfileDefault.png", name: "test14", date: "2026-02-07", desc: "공유란 이런거다 예시", heartCnt: 0, commentCnt: 0, viewCnt: 123 },
    { id: 15, ctg: "공유",  profile: "../img/interface/ProfileDefault.png", name: "test15", date: "2026-02-09", desc: "공유란 이런거다 예시", heartCnt: 0, commentCnt: 0, viewCnt: 46  }
];

var ShareFitData = [
    { id: 1,  profile: "../img/interface/ProfileDefault.png", name: "test1",  date: "2026-03-13", img: "../img/community/ShareFit1.jpg", desc: "test1", heartCnt: 4, commentCnt: 2, viewCnt: 401, product: [{ id: 1, name: "s600_black",        img: "../img/product/shirt/s600_black.jpg",          price: 59000  }] },
    { id: 2,  profile: "../img/interface/ProfileDefault.png", name: "test2",  date: "2026-03-12", img: "../img/community/ShareFit2.png", desc: "test2", heartCnt: 4, commentCnt: 0, viewCnt: 401, product: [{ id: 1, name: "fit_j200_brown",    img: "../img/product/jacket/fit_j200_brown.jpg",     price: 129000 }] },
    { id: 3,  profile: "../img/interface/ProfileDefault.png", name: "test3",  date: "2026-03-11", img: "../img/community/ShareFit3.png", desc: "test3", heartCnt: 4, commentCnt: 0, viewCnt: 10,  product: [{ id: 1, name: "h500_khaki_long",  img: "../img/product/hoodie/h500_khaki_long.png",   price: 89000  }] },
    { id: 4,  profile: "../img/interface/ProfileDefault.png", name: "test4",  date: "2026-03-10", img: "/", desc: "test3", heartCnt: 0, commentCnt: 0, viewCnt: 1  },
    { id: 5,  profile: "../img/interface/ProfileDefault.png", name: "test5",  date: "2026-03-10", img: "/", desc: "test3", heartCnt: 0, commentCnt: 0, viewCnt: 0  },
    { id: 6,  profile: "../img/interface/ProfileDefault.png", name: "test6",  date: "2026-03-10", img: "/", desc: "test3", heartCnt: 0, commentCnt: 0, viewCnt: 0  },
    { id: 7,  profile: "../img/interface/ProfileDefault.png", name: "test7",  date: "2026-03-10", img: "/", desc: "test3", heartCnt: 0, commentCnt: 0, viewCnt: 0  },
    { id: 8,  profile: "../img/interface/ProfileDefault.png", name: "test8",  date: "2026-03-10", img: "/", desc: "test3", heartCnt: 0, commentCnt: 0, viewCnt: 0  },
    { id: 9,  profile: "../img/interface/ProfileDefault.png", name: "test9",  date: "2026-03-10", img: "/", desc: "test3", heartCnt: 0, commentCnt: 0, viewCnt: 0  },
    { id: 10, profile: "../img/interface/ProfileDefault.png", name: "test10", date: "2026-03-10", img: "/", desc: "test3", heartCnt: 0, commentCnt: 0, viewCnt: 0  }
];

/* ----------------------------------------------------------------
   1. 상태 관리 객체
---------------------------------------------------------------- */
var state = {
    currentMenu: "HOME",
    likedPosts: {},
    userData: UserData,
    allPosts: [],
    mediaPosts: []
};

/* ----------------------------------------------------------------
   2. 초기 로드 및 실행
---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function() {
    loadLikedPosts();
    setupEventListeners();
    fetchPostsFromBackend("HOME");
});

/* ----------------------------------------------------------------
   3. 사용자 및 좋아요 데이터 로드
---------------------------------------------------------------- */

function loadLikedPosts() {
    var stored = localStorage.getItem('likedPosts');
    if (stored) {
        state.likedPosts = JSON.parse(stored);
    }
}

/* ----------------------------------------------------------------
   4. 이벤트 리스너 설정
---------------------------------------------------------------- */
function setupEventListeners() {
    var menuItems = document.querySelectorAll('.menu_item');
    menuItems.forEach(function(item) {
        item.addEventListener('click', function() {
            handleMenuChange(this.getAttribute('data-menu'));
        });
    });

    var searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            handleSearch(this.value);
        });
    }
}

/* ----------------------------------------------------------------
   5. 메뉴 및 검색 핸들링
---------------------------------------------------------------- */
function handleMenuChange(menu) {
    state.currentMenu = menu;

    document.querySelectorAll('.menu_item').forEach(function(item) {
        item.classList.toggle('active', item.getAttribute('data-menu') === menu);
    });

    // 🌟 메뉴가 바뀔 때마다 서버에서 해당 카테고리 글을 새로 가져옵니다.
    fetchPostsFromBackend(menu);
}

// 🌟 새로 추가하는 함수: 백엔드 스프링 서버와 통신합니다!
function fetchPostsFromBackend(menuType) {
    let url = '/api/posts';

    // HOME이나 Share Fit이 아닐 때만 카테고리 필터 쿼리 추가
    if (menuType !== 'HOME' && menuType !== 'Share Fit') {
        url += '?type=' + encodeURIComponent(menuType);
    }

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error('서버 응답 실패');
            return response.json();
        })
        .then(data => {
            // 🌟 1. 데이터를 받으면 즉시 상태 업데이트
            const postData = (data && Array.isArray(data)) ? data : [];

            if (menuType === "Share Fit") {
                state.mediaPosts = postData;
            } else {
                state.allPosts = postData;
            }

            // 🌟 2. 상태 업데이트 후에만 화면을 그립니다.
            renderPostList();
        })
        .catch(error => {
            console.error("게시글 불러오기 실패:", error);
            // 에러 발생 시 리스트를 비우고 '없음' 문구 유도
            state.allPosts = [];
            state.mediaPosts = [];
            renderPostList();
        });

    // 🚨 [주의] 이 자리에 state.allPosts = [] 같은 코드가 있다면 반드시 지우세요!
    // fetch는 기다려주지 않고 이 밑으로 바로 넘어가 버리기 때문입니다.
}

/* ----------------------------------------------------------------
   6. 렌더링 엔진 (Share Fit 전용 필터 강화 버전)
---------------------------------------------------------------- */
function renderPostList() {
    var container = document.getElementById('postListContainer');
    if (!container) return;

    var isMediaMode = (state.currentMenu === "Share Fit");
    // 🌟 서버에서 받아온 전체 데이터(allPosts)를 사용합니다.
    var currentData = state.allPosts || [];

    // 1. 카테고리 필터링 (Share Fit은 'Share Fit'만, 그 외엔 해당 메뉴만)
    var filteredPosts = currentData.filter(function(post) {
        if (state.currentMenu === "HOME") return true; // HOME은 전체
        return post.type === state.currentMenu; // 그 외에는 딱 그 타입만!
    });

    // 2. 데이터가 없으면 깔끔하게 비우기
    if (filteredPosts.length === 0) {
        container.innerHTML = '<div class="no_data">등록된 게시글이 없습니다.</div>';
        return;
    }

    // 3. 최신순 정렬 (날짜가 없으면 undefined 안 뜨게 방어)
    var sortedList = filteredPosts.slice().sort(function(a, b) {
        var dateA = new Date(a.createdAt || a.date || 0);
        var dateB = new Date(b.createdAt || b.date || 0);
        return dateB - dateA;
    });

    // 4. 리스트 레이아웃 설정
    container.className = isMediaMode ? "list_container media_grid" : "list_container";

    // 5. 실제 HTML 생성
    container.innerHTML = sortedList.map(function(post) {
        return isMediaMode ? createMediaPostHTML(post) : createPostHTML(post);
    }).join('');

    attachPostEventListeners();
}

/* ----------------------------------------------------------------
   7. HTML 생성 함수
---------------------------------------------------------------- */

function createMediaPostHTML(post) {
    // 🌟 서버에서 내려주는 정확한 이름으로 매칭
    var postId = post.postId || post.id;
    var imgUrl = post.imgUrl || '../img/community/no-image.png'; // 사진 없으면 기본 이미지
    var likes  = post.likeCount || 0;
    var comments = post.commentCount || 0;

    return (
        '<article class="media_card" data-post-id="' + postId + '">' +
        '<div class="media_img_wrapper">' +
        '<img src="' + imgUrl + '" alt="Share Fit Image" onerror="this.src=\'../img/community/no-image.png\'" />' +
        '<div class="media_overlay">' +
        '<div class="overlay_stats">' +
        '<span>♥ ' + likes + '</span>' +
        '<span>● ' + comments + '</span>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</article>'
    );
}

// [일반 카드] HOME, 잡담, Q&A용
function createPostHTML(post) {
    var isLiked    = post.liked || false;
    var heartCount = post.likeCount || 0;
    var heartSrc   = isLiked ? '../img/community/heart-fill.png' : '../img/community/heart.png';
    var nickname   = post.nickname || post.name || '익명';
    var createdAt  = post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '날짜 정보 없음';

    return (
        '<article class="post_card" data-post-id="' + post.postId + '">' +
        '<div class="wrapper">' +
        '<div class="post_header">' +
        '<div class="author_img">' +
        '<img src="' + (post.profileImg || '../img/interface/ProfileDefault.png') + '" alt="author" />' +
        '</div>' +
        '<div class="author_info">' +
        '<span class="category">' + (post.type || '일반') + '</span>' +
        '<div class="meta">' +
        '<span class="name">'  + nickname + '</span>' +
        '<span class="date">'  + createdAt + '</span>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="post_body">' +
        '<p class="text">' + (post.content || '내용이 없습니다.') + '</p>' +
        (post.imgUrl ? '<div class="body_img"><img src="' + post.imgUrl + '" /></div>' : '') +
        '</div>' +
        '<div class="post_footer">' +
        '<div class="stats_left">' +
        '<button class="heart_btn ' + (isLiked ? 'active' : '') + '" data-post-id="' + post.postId + '">' +
        '<img src="' + heartSrc + '" />' +
        '<span>' + heartCount + '</span>' +
        '</button>' +
        '<span class="stat_item"><img src="../img/community/bubble.png" /> ' + (post.commentCount || 0) + '</span>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</article>'
    );
}

/* ----------------------------------------------------------------
   8. 상호작용 및 상세 페이지 이동 (수정됨: 서버와 연동)
---------------------------------------------------------------- */
function attachPostEventListeners() {
    var cards = document.querySelectorAll('.post_card, .media_card');
    cards.forEach(function(card) {
        card.addEventListener('click', function(e) {
            if (e.target.closest('.heart_btn')) return;
            handleDetailView(this.getAttribute('data-post-id'));
        });
    });

    var heartButtons = document.querySelectorAll('.heart_btn');
    heartButtons.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleHeart(parseInt(this.getAttribute('data-post-id')));
        });
    });
}

function handleDetailView(postId) {
    var type = (state.currentMenu === "Share Fit") ? "media" : "all";

    // 🚨 주의: /api/posts/1 은 "JSON 데이터"만 뱉는 주소입니다!
    // 화면을 보여주는 PageController(View) 주소로 이동해야 합니다.
    // 예: window.location.href = '/CommunityDetail?id=' + postId;
    window.location.href = '/Community/detail?id=' + postId + '&type=' + type;
}

// 🌟 서버로 좋아요 토글 요청 보내기
function toggleHeart(postId) {
    fetch('/api/posts/' + postId + '/like', {
        method: 'POST'
    })
        .then(response => {
            if (response.status === 401) {
                alert("로그인이 필요합니다.");
                window.location.href = '/login'; // 로그인 페이지로 튕겨내기
                return null;
            }
            return response.json();
        })
        .then(data => {
            if (data) {
                // 서버에서 처리 후 최신 데이터를 다시 불러와서 하트 색깔과 숫자를 새로고침합니다.
                fetchPostsFromBackend(state.currentMenu);
            }
        })
        .catch(error => console.error("좋아요 처리 실패:", error));
}
