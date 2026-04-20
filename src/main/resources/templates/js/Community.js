/* ================================================================
   Community.js — API 연동 버전
   GET /api/posts?type=xxx → 게시글 목록
   POST /api/posts/{postId}/like → 좋아요 토글
================================================================ */

var API_BASE = 'http://localhost:8080';

function getToken() { return localStorage.getItem('token'); }
function authHeaders() {
    var token = getToken();
    var headers = { 'Content-Type': 'application/json' };

    // 토큰이 존재하고 문자열 'null'이 아닐 때만 헤더 추가
    if (token && token !== 'null' && token !== 'undefined') {
        headers['Authorization'] = 'Bearer ' + token;
    }
    return headers;
}

/* ----------------------------------------------------------------
   1. 상태
---------------------------------------------------------------- */
var state = {
    currentMenu: 'HOME',
    likedPosts:  {},
    allPosts:    [],
    mediaPosts:  []
};

/* ----------------------------------------------------------------
   2. 초기화
---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function() {
    loadUserProfile();
    loadLikedPosts();
    setupEventListeners();
    fetchPosts();
});

/* ----------------------------------------------------------------
   3. 유저 프로필
---------------------------------------------------------------- */
function loadUserProfile() {
    // 1. 토큰 가져오기 (localStorage에 저장된 이름 확인)
    var token = localStorage.getItem('token');
    var nameEl = document.getElementById('userName');
    var profileEl = document.getElementById('userProfileImg');

    // 2. 토큰이 아예 없으면 서버에 묻지도 않고 종료
    if (!token) {
        if (nameEl) nameEl.textContent = "로그인 해주세요";
        return;
    }

    // 3. 토큰이 있을 때만 서버에 요청
    fetch('/api/users/me', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
    })
        .then(function(res) {
            if (!res.ok) throw new Error('인증 실패'); // 401이나 500 발생 시 catch로 이동
            return res.json();
        })
        .then(function(user) {
            if (nameEl) nameEl.textContent = user.nickname || user.name;
            if (profileEl && user.profileImg) {
                profileEl.src = user.profileImg;
            }
        })
        .catch(function(err) {
            console.warn('사용자 정보 로드 실패:', err);
            if (nameEl) nameEl.textContent = "로그인 해주세요";
        });
}

function loadLikedPosts() {
    var stored = localStorage.getItem('likedPosts');
    if (stored) state.likedPosts = JSON.parse(stored);
}

/* ----------------------------------------------------------------
   4. 게시글 목록 API 호출
---------------------------------------------------------------- */
function fetchPosts(type) {
    var url = API_BASE + '/api/posts';
    if (type && type !== 'HOME') {
        url += '?type=' + encodeURIComponent(type);
    }

    fetch(url, { headers: authHeaders() })
    .then(function(res) {
        if (!res.ok) throw new Error('게시글 조회 실패');
        return res.json();
    })
    .then(function(data) {
        // HOME에서는 Share Fit 게시글 제외
        if (!type || type === 'HOME') {
            data = data.filter(function(p) { return p.type !== 'Share Fit'; });
        }

        // API 응답의 liked 필드로 localStorage 동기화
        data.forEach(function(post) {
            if (typeof post.liked === 'boolean') {
                state.likedPosts[post.postId] = post.liked;
            }
        });
        localStorage.setItem('likedPosts', JSON.stringify(state.likedPosts));

        if (state.currentMenu === 'Share Fit') {
            state.mediaPosts = data;
        } else {
            state.allPosts = data;
        }
        renderPostList(data);
    })
    .catch(function(err) {
        console.error(err);
        var container = document.getElementById('postListContainer');
        if (container) container.innerHTML = '<div class="no_data">게시글을 불러오지 못했습니다.</div>';
    });
}

/* ----------------------------------------------------------------
   5. 이벤트 리스너
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

function handleMenuChange(menu) {
    state.currentMenu = menu;
    var menuItems = document.querySelectorAll('.menu_item');
    menuItems.forEach(function(item) {
        item.classList.toggle('active', item.getAttribute('data-menu') === menu);
    });
    fetchPosts(menu === 'HOME' ? null : menu);
}

function handleSearch(keyword) {
    var posts = state.currentMenu === 'Share Fit' ? state.mediaPosts : state.allPosts;
    var filtered = posts.filter(function(p) {
        return (p.title && p.title.includes(keyword)) ||
               (p.content && p.content.includes(keyword));
    });
    renderPostList(filtered);
}

/* ----------------------------------------------------------------
   6. 렌더링
---------------------------------------------------------------- */
function renderPostList(posts) {
    var container = document.getElementById('postListContainer');
    if (!container) return;

    var isMediaMode = state.currentMenu === 'Share Fit';
    container.className = isMediaMode ? 'list_container media_grid' : 'list_container';

    if (!posts || posts.length === 0) {
        container.innerHTML = '<div class="no_data">등록된 게시글이 없습니다.</div>';
        return;
    }

    container.innerHTML = posts.map(function(post) {
        return isMediaMode ? createMediaPostHTML(post) : createPostHTML(post);
    }).join('');

    attachPostEventListeners();

    // 상품 인용 카드 비동기 렌더링 (일반 모드만)
    if (!isMediaMode) {
        posts.forEach(function(post) {
            var ids = extractProductIdsFromContent(post.content || '');
            if (ids.length === 0) return;
            var container = document.getElementById('productPreview_' + post.postId);
            if (!container) return;
            fetchAndRenderProductPreview(ids, container);
        });
    }
}

function createPostHTML(post) {
    var isLiked    = state.likedPosts[post.postId];
    var heartCount = post.likeCount || 0;  // 서버값 그대로 사용
    var heartSrc   = isLiked ? '../img/community/heart-fill.png' : '../img/community/heart.png';

    // 상품 인용 ID 추출
    var productIds = extractProductIdsFromContent(post.content || '');
    var productPreviewId = 'productPreview_' + post.postId;

    return (
        '<article class="post_card" data-post-id="' + post.postId + '">' +
            '<div class="wrapper">' +
                '<div class="post_header">' +
                    '<div class="author_img">' +
                        '<img src="' + (post.profileImg || '../img/interface/ProfileDefault.png') + '" alt="author" />' +
                    '</div>' +
                    '<div class="author_info">' +
                        '<span class="category">' + (post.type || '') + '</span>' +
                        '<div class="meta">' +
                            '<span class="name">' + (post.nickname || '') + '</span>' +
                            '<span class="date">' + (post.createdAt ? post.createdAt.substring(0, 10) : '') + '</span>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="post_body">' +
                    '<p class="text">' + cleanProductTagsFromContent(post.content || post.title || '') + '</p>' +
                    (post.imgUrl ? '<div class="body_img"><img src="' + post.imgUrl + '" alt="content" /></div>' : '') +
                    // 상품 인용 미리보기 영역 (ID가 있으면 렌더링)
                    (productIds.length > 0 ? '<div class="quoted-product-list" id="' + productPreviewId + '"><div class="quoted-product-loading">상품 불러오는 중...</div></div>' : '') +
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

function getFirstImgUrl(imgUrl) {
    if (!imgUrl) return '../img/community/no-image.png';
    try {
        var parsed = JSON.parse(imgUrl);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : imgUrl;
    } catch (e) {
        return imgUrl;
    }
}

function createMediaPostHTML(post) {
    var firstImg = getFirstImgUrl(post.imgUrl);
    return (
        '<article class="media_card" data-post-id="' + post.postId + '">' +
            '<div class="media_img_wrapper">' +
                '<img src="' + firstImg + '" alt="media" />' +
                '<div class="media_overlay">' +
                    '<div class="overlay_stats">' +
                        '<span>♥ ' + (post.likeCount    || 0) + '</span>' +
                        '<span>● ' + (post.commentCount || 0) + '</span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</article>'
    );
}

/* ----------------------------------------------------------------
   7. 이벤트 — 클릭/좋아요
---------------------------------------------------------------- */
function attachPostEventListeners() {
    var cards = document.querySelectorAll('.post_card, .media_card');
    cards.forEach(function(card) {
        card.addEventListener('click', function(e) {
            if (e.target.closest('.heart_btn')) return;
            var postId = this.getAttribute('data-post-id');
            // Share Fit은 숏츠 모드로
            var type = state.currentMenu === 'Share Fit' ? 'shorts' : 'all';
            window.location.href = './community/' + postId;
        });
    });

    var heartBtns = document.querySelectorAll('.heart_btn');
    heartBtns.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleHeart(parseInt(this.getAttribute('data-post-id')));
        });
    });
}

function toggleHeart(postId) {
    var token = getToken();
    if (!token) { alert('로그인이 필요합니다.'); return; }

    fetch(API_BASE + '/api/posts/' + postId + '/like', {
        method:  'POST',
        headers: authHeaders()
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
        state.likedPosts[postId] = data.liked;
        localStorage.setItem('likedPosts', JSON.stringify(state.likedPosts));

        var posts = state.currentMenu === 'Share Fit' ? state.mediaPosts : state.allPosts;
        posts = posts.map(function(p) {
            if (p.postId === postId) {
                return Object.assign({}, p, {
                    liked:     data.liked,
                    likeCount: data.likeCount  // ← 서버에서 받은 정확한 값 사용
                });
            }
            return p;
        });
        if (state.currentMenu === 'Share Fit') {
            state.mediaPosts = posts;
        } else {
            state.allPosts = posts;
        }
        renderPostList(posts);
    })
    .catch(function(err) { console.error('좋아요 실패:', err); });
}

/* ----------------------------------------------------------------
   상품 인용 — 목록용 헬퍼
---------------------------------------------------------------- */
var PC_LABEL_COMMUNITY = {
    N: '뉴트럴', SW: '봄 웜톤', SC: '여름 쿨톤', AW: '가을 웜톤', WC: '겨울 쿨톤'
};

function extractProductIdsFromContent(content) {
    var ids = [];
    if (!content) return ids;
    // 신버전: [상품:169]
    content.replace(/\[상품:(\d+)\](?![:\]])/g, function(match, id) {
        ids.push(parseInt(id));
    });
    // 구버전: [상품:169:이름:url:가격]
    content.replace(/\[상품:(\d+):[^\]]+\]/g, function(match, id) {
        var parsed = parseInt(id);
        if (ids.indexOf(parsed) === -1) ids.push(parsed);
    });
    return ids;
}

function cleanProductTagsFromContent(content) {
    if (!content) return '';
    var cleaned = content.replace(/\[상품:\d+:[^\]]*\]\n?/g, '');
    cleaned = cleaned.replace(/\[상품:\d+\]\n?/g, '');
    return cleaned.trim();
}

function createProductPreviewCardHTML(p) {
    var pcLabel = p.personalColor ? (PC_LABEL_COMMUNITY[p.personalColor] || p.personalColor) : '';
    var inStock = p.inStock !== false;
    return (
        '<a href="./product/' + p.productId + '" class="quoted-product-card" onclick="event.stopPropagation()">' +
            '<img src="' + (p.imgUrl || '') + '" alt="' + p.name + '" ' +
                'onerror="this.style.display=\'none\'"' +
                (inStock ? '' : ' style="filter:grayscale(60%);opacity:0.7;"') + '>' +
            '<div class="quoted-product-info">' +
                '<span class="quoted-product-name">' + p.name + '</span>' +
                '<span class="quoted-product-price">₩' + (p.price || 0).toLocaleString() + '</span>' +
                (pcLabel ? '<span class="quoted-product-pc">' + pcLabel + '</span>' : '') +
                (!inStock ? '<span class="quoted-product-soldout">품절</span>' : '') +
            '</div>' +
        '</a>'
    );
}

function fetchAndRenderProductPreview(productIds, containerEl) {
    if (!productIds || productIds.length === 0 || !containerEl) return;

    Promise.all(
        productIds.map(function(id) {
            return fetch(API_BASE + '/api/products/' + id)
                .then(function(res) { return res.ok ? res.json() : null; })
                .catch(function() { return null; });
        })
    ).then(function(products) {
        var valid = products.filter(Boolean);
        if (valid.length === 0) { containerEl.innerHTML = ''; return; }
        containerEl.innerHTML = valid.map(createProductPreviewCardHTML).join('');
    });
}
