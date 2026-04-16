/* ================================================================
   Community.js — API 연동 / Share Fit 제거 / 다중 이미지 지원
================================================================ */

var API_BASE = 'http://localhost:8080';

function getToken() { return localStorage.getItem('token'); }
function authHeaders() {
    var token = getToken();
    var h = { 'Content-Type': 'application/json' };
    if (token && token !== 'null' && token !== 'undefined') {
        h['Authorization'] = 'Bearer ' + token;
    }
    return h;
}

/* ----------------------------------------------------------------
   상태
---------------------------------------------------------------- */
var state = {
    currentMenu: 'ALL',
    likedPosts:  {},
    posts:       []
};

/* ----------------------------------------------------------------
   초기화
---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
    loadUserProfile();
    loadLikedPosts();
    setupTabListeners();
    setupSearch();
    fetchPosts(null);
});

/* ----------------------------------------------------------------
   유저 프로필
---------------------------------------------------------------- */
function loadUserProfile() {
    var token   = getToken();
    var nameEl  = document.getElementById('userName');
    var imgEl   = document.getElementById('userProfileImg');
    if (!token) { if (nameEl) nameEl.textContent = '로그인 해주세요'; return; }

    fetch('/api/users/me', { headers: authHeaders() })
        .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
        .then(function (u) {
            if (nameEl) nameEl.textContent = u.nickname || u.name || '사용자';
            if (imgEl && u.profileImg) imgEl.src = u.profileImg;
        })
        .catch(function () { if (nameEl) nameEl.textContent = '로그인 해주세요'; });
}

function loadLikedPosts() {
    var s = localStorage.getItem('likedPosts');
    if (s) { try { state.likedPosts = JSON.parse(s); } catch (e) {} }
}

/* ----------------------------------------------------------------
   탭 이벤트
---------------------------------------------------------------- */
function setupTabListeners() {
    document.querySelectorAll('.tab-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');
            var menu = this.getAttribute('data-menu');
            state.currentMenu = menu;
            fetchPosts(menu === 'ALL' ? null : menu);
        });
    });
}

/* ----------------------------------------------------------------
   검색
---------------------------------------------------------------- */
function setupSearch() {
    var input = document.getElementById('searchInput');
    if (!input) return;
    var timer;
    input.addEventListener('input', function () {
        clearTimeout(timer);
        var kw = this.value.trim();
        timer = setTimeout(function () {
            if (kw.length === 0) {
                renderPosts(state.posts);
            } else {
                var filtered = state.posts.filter(function (p) {
                    return (p.content || '').includes(kw) || (p.title || '').includes(kw);
                });
                renderPosts(filtered);
            }
        }, 250);
    });
}

/* ----------------------------------------------------------------
   API 호출
---------------------------------------------------------------- */
function fetchPosts(type) {
    var container = document.getElementById('postListContainer');
    if (container) {
        container.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><span>게시글을 불러오는 중...</span></div>';
    }

    var url = '/api/posts';
    if (type) url += '?type=' + encodeURIComponent(type);

    fetch(url, { headers: authHeaders() })
        .then(function (r) { if (!r.ok) throw new Error('조회 실패'); return r.json(); })
        .then(function (data) {
            // Share Fit 타입 항상 제외
            data = data.filter(function (p) { return p.type !== 'Share Fit'; });

            // liked 동기화
            data.forEach(function (p) {
                if (typeof p.liked === 'boolean') state.likedPosts[p.postId] = p.liked;
            });
            localStorage.setItem('likedPosts', JSON.stringify(state.likedPosts));
            state.posts = data;
            renderPosts(data);
        })
        .catch(function () {
            if (container) container.innerHTML = '<div class="no_data">게시글을 불러오지 못했습니다.</div>';
        });
}

/* ----------------------------------------------------------------
   렌더링
---------------------------------------------------------------- */
function renderPosts(posts) {
    var container = document.getElementById('postListContainer');
    if (!container) return;

    if (!posts || posts.length === 0) {
        container.innerHTML = '<div class="no_data">게시글이 없습니다.</div>';
        return;
    }

    container.innerHTML = posts.map(createPostHTML).join('');
    attachCardListeners();

    // 상품 인용 비동기 렌더링
    posts.forEach(function (post) {
        var ids = extractProductIds(post.content || '');
        if (!ids.length) return;
        var el = document.getElementById('productPreview_' + post.postId);
        if (el) fetchAndRenderProducts(ids, el);
    });
}

function createPostHTML(post) {
    var isLiked    = !!state.likedPosts[post.postId];
    var likeCount  = post.likeCount || 0;
    var commentCnt = post.commentCount || 0;
    var profileSrc = post.profileImg || '/img/interface/ProfileDefault.png';
    var dateStr    = post.createdAt ? post.createdAt.substring(0, 10) : '';
    var cleanText  = cleanProductTags(post.content || post.title || '');

    // 다중 이미지 파싱
    var images = parseImages(post.imgUrl);
    var imagesHTML = buildImagesHTML(images);

    // 상품 인용
    var productIds = extractProductIds(post.content || '');
    var productHTML = productIds.length
        ? '<div class="quoted-product-list" id="productPreview_' + post.postId + '"><span class="quoted-product-loading">상품 불러오는 중...</span></div>'
        : '';

    return '<article class="post_card" data-post-id="' + post.postId + '">' +
        '<div class="wrapper">' +
        '<div class="post_header">' +
        '<div class="author_img"><img src="' + profileSrc + '" alt="author" onerror="this.src=\'/img/interface/ProfileDefault.png\'"></div>' +
        '<div class="author_info">' +
        '<div class="post_meta">' +
        '<span class="category-badge">' + (post.type || '일반') + '</span>' +
        '<span class="author-name">' + escHtml(post.nickname || '') + '</span>' +
        '<span class="post-date">' + dateStr + '</span>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="post_body">' +
        '<p class="post_text">' + escHtml(cleanText) + '</p>' +
        imagesHTML +
        productHTML +
        '</div>' +
        '<div class="post_footer">' +
        '<button class="stat-btn ' + (isLiked ? 'liked' : '') + '" data-post-id="' + post.postId + '" data-action="like">' +
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="' + (isLiked ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>' +
        likeCount +
        '</button>' +
        '<button class="stat-btn" data-post-id="' + post.postId + '" data-action="comment">' +
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>' +
        commentCnt +
        '</button>' +
        '</div>' +
        '</div>' +
        '</article>';
}

/* ── 이미지 파싱 & HTML ── */
function parseImages(imgUrl) {
    if (!imgUrl) return [];
    try {
        var parsed = JSON.parse(imgUrl);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
        if (typeof parsed === 'string' && parsed) return [parsed];
    } catch (e) {}
    if (typeof imgUrl === 'string' && imgUrl.trim()) return [imgUrl.trim()];
    return [];
}

function buildImagesHTML(images) {
    if (!images.length) return '';
    var MAX_SHOW = 4;
    var count    = images.length;
    var shown    = images.slice(0, MAX_SHOW);
    var cls      = 'post_images count-' + (count === 1 ? '1' : count === 2 ? '2' : count === 3 ? '3' : 'many');

    var inner = shown.map(function (url, idx) {
        if (idx === MAX_SHOW - 1 && count > MAX_SHOW) {
            return '<div class="img_more_badge"><img src="' + url + '" alt="more"><span>+' + (count - MAX_SHOW + 1) + '</span></div>';
        }
        return '<img src="' + url + '" alt="post image" loading="lazy">';
    }).join('');

    return '<div class="' + cls + '">' + inner + '</div>';
}

/* ── 상품 인용 ── */
function extractProductIds(content) {
    var ids = [];
    if (!content) return ids;
    content.replace(/\[상품:(\d+)\](?![:\]])/g, function (m, id) { ids.push(parseInt(id)); });
    content.replace(/\[상품:(\d+):[^\]]+\]/g, function (m, id) {
        var n = parseInt(id);
        if (ids.indexOf(n) === -1) ids.push(n);
    });
    return ids;
}

function cleanProductTags(content) {
    return content.replace(/\[상품:\d+:[^\]]*\]\n?/g, '').replace(/\[상품:\d+\]\n?/g, '').trim();
}

function fetchAndRenderProducts(ids, containerEl) {
    Promise.all(ids.map(function (id) {
        return fetch('/api/products/' + id)
            .then(function (r) { return r.ok ? r.json() : null; })
            .catch(function () { return null; });
    })).then(function (products) {
        var valid = products.filter(Boolean);
        if (!valid.length) { containerEl.innerHTML = ''; return; }
        containerEl.innerHTML = valid.map(function (p) {
            return '<a href="/product/' + p.productId + '" class="quoted-product-card" onclick="event.stopPropagation()">' +
                '<img src="' + (p.imgUrl || '') + '" alt="' + escHtml(p.name) + '">' +
                '<div class="quoted-product-info">' +
                '<span class="quoted-product-name">' + escHtml(p.name) + '</span>' +
                '<span class="quoted-product-price">₩' + (p.price || 0).toLocaleString() + '</span>' +
                '</div></a>';
        }).join('');
    });
}

/* ── 이벤트 ── */
function attachCardListeners() {
    document.querySelectorAll('.post_card').forEach(function (card) {
        card.addEventListener('click', function (e) {
            var btn = e.target.closest('.stat-btn, .quoted-product-card');
            if (btn) return;
            window.location.href = '/community/' + this.getAttribute('data-post-id');
        });
    });

    document.querySelectorAll('.stat-btn[data-action="like"]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var postId = parseInt(this.getAttribute('data-post-id'));
            toggleLike(postId);
        });
    });

    document.querySelectorAll('.stat-btn[data-action="comment"]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var postId = this.getAttribute('data-post-id');
            window.location.href = '/community/' + postId + '#comments';
        });
    });
}

function toggleLike(postId) {
    if (!getToken()) { alert('로그인이 필요합니다.'); return; }

    fetch('/api/posts/' + postId + '/like', { method: 'POST', headers: authHeaders() })
        .then(function (r) { return r.json(); })
        .then(function (data) {
            state.likedPosts[postId] = data.liked;
            localStorage.setItem('likedPosts', JSON.stringify(state.likedPosts));
            state.posts = state.posts.map(function (p) {
                return p.postId === postId ? Object.assign({}, p, { liked: data.liked, likeCount: data.likeCount }) : p;
            });
            renderPosts(state.posts);
        })
        .catch(function () {});
}

/* ── 유틸 ── */
function escHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
