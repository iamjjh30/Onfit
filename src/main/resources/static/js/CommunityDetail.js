/* ================================================================
   CommunityDetail.js — API 연동 / 다중 이미지 Swiper / Share Fit 제거
   GET  /api/posts/{postId}
   POST /api/posts/{postId}/like
   GET  /api/posts/{postId}/comments
   POST /api/posts/{postId}/comments
   DELETE /api/posts/{postId}/comments/{commentId}
   POST /api/posts/{postId}/comments/{commentId}/like
   DELETE /api/posts/{postId}
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

/* ── 상태 ── */
var ds = {
    postId:    null,
    post:      null,
    comments:  [],
    isLiked:   false,
    likeCount: 0,
    currentUser: null
};

/* ── 초기화 ── */
document.addEventListener('DOMContentLoaded', function () {
    // URL에서 postId 추출: /community/{postId}
    var parts  = window.location.pathname.split('/');
    ds.postId  = parseInt(parts[parts.length - 1]);

    if (!ds.postId) {
        alert('잘못된 접근입니다.');
        window.location.href = '/community';
        return;
    }

    loadCurrentUser();
    fetchPost();
    fetchComments();
    setupCommentInput();
});

/* ── 현재 유저 ── */
function loadCurrentUser() {
    var token = getToken();
    if (!token) return;
    fetch('/api/users/me', { headers: authHeaders() })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (u) {
            ds.currentUser = u;
            if (u && u.profileImg) {
                var el = document.getElementById('commentUserImg');
                if (el) el.src = u.profileImg;
            }
        })
        .catch(function () {});
}

/* ── 게시글 조회 ── */
function fetchPost() {
    fetch('/api/posts/' + ds.postId, { headers: authHeaders() })
        .then(function (r) { if (!r.ok) throw new Error('조회 실패'); return r.json(); })
        .then(function (post) {
            ds.post      = post;
            ds.isLiked   = !!post.liked;
            ds.likeCount = post.likeCount || 0;
            renderPost(post);
        })
        .catch(function () {
            alert('게시글을 불러올 수 없습니다.');
            window.location.href = '/community';
        });
}

function renderPost(post) {
    // 내비 카테고리 뱃지
    var navCat = document.getElementById('navCategory');
    if (navCat) navCat.textContent = post.type || '';

    // 작성자 정보
    var authorImg  = document.getElementById('postAuthorImg');
    var authorName = document.getElementById('postAuthorName');
    var postDate   = document.getElementById('postDate');
    if (authorImg)  authorImg.src = post.profileImg || '/img/interface/ProfileDefault.png';
    if (authorName) authorName.textContent = post.nickname || '작성자';
    if (postDate)   postDate.textContent   = post.createdAt ? post.createdAt.substring(0, 10) : '';

    // 본문
    var textEl = document.getElementById('postText');
    if (textEl) textEl.textContent = cleanProductTags(post.content || post.title || '');

    // 이미지
    renderImages(post.imgUrl);

    // 상품 인용
    renderProductArea(post.content || '');

    // 통계
    updateStats();

    // 수정/삭제 메뉴 (본인만)
    renderPostMenu(post);
}

/* ── 이미지 렌더링 ── */
function parseImages(imgUrl) {
    if (!imgUrl) return [];
    try {
        var p = JSON.parse(imgUrl);
        if (Array.isArray(p)) return p.filter(Boolean);
        if (typeof p === 'string' && p) return [p];
    } catch (e) {}
    return typeof imgUrl === 'string' && imgUrl.trim() ? [imgUrl.trim()] : [];
}

function renderImages(imgUrl) {
    var area = document.getElementById('imageArea');
    if (!area) return;

    var images = parseImages(imgUrl);
    if (!images.length) { area.innerHTML = ''; return; }

    if (images.length === 1) {
        area.innerHTML = '<div class="single-image"><img src="' + images[0] + '" alt="게시글 이미지" loading="lazy"></div>';
        return;
    }

    // Swiper
    var slides = images.map(function (src) {
        return '<div class="swiper-slide"><img src="' + src + '" alt="게시글 이미지" loading="lazy"></div>';
    }).join('');

    area.innerHTML =
        '<div class="swiper-wrap">' +
        '<div class="swiper" id="postSwiper">' +
        '<div class="swiper-wrapper">' + slides + '</div>' +
        '<div class="swiper-button-next"></div>' +
        '<div class="swiper-button-prev"></div>' +
        '<div class="swiper-pagination"></div>' +
        '</div>' +
        '</div>';

    new Swiper('#postSwiper', {
        loop: images.length > 1,
        navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
        pagination: { el: '.swiper-pagination', clickable: true }
    });
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

function renderProductArea(content) {
    var area = document.getElementById('productArea');
    if (!area) return;
    var ids = extractProductIds(content);
    if (!ids.length) { area.innerHTML = ''; return; }

    area.innerHTML = '<div class="product-area" id="productCards"><span style="font-size:0.82rem;color:#bbb;">상품 불러오는 중...</span></div>';

    Promise.all(ids.map(function (id) {
        return fetch('/api/products/' + id)
            .then(function (r) { return r.ok ? r.json() : null; })
            .catch(function () { return null; });
    })).then(function (products) {
        var valid = products.filter(Boolean);
        var container = document.getElementById('productCards');
        if (!container) return;
        if (!valid.length) { container.innerHTML = ''; return; }
        container.innerHTML = valid.map(function (p) {
            return '<a href="/product/' + p.productId + '" class="product-card">' +
                '<img src="' + (p.imgUrl || '') + '" alt="' + escHtml(p.name) + '">' +
                '<div class="product-card-info">' +
                '<span class="product-card-name">' + escHtml(p.name) + '</span>' +
                '<span class="product-card-price">₩' + (p.price || 0).toLocaleString() + '</span>' +
                '</div></a>';
        }).join('');
    });
}

/* ── 게시글 메뉴 ── */
function renderPostMenu(post) {
    var anchor = document.getElementById('postMenuAnchor');
    if (!anchor) return;

    if (!ds.currentUser || ds.currentUser.userId !== post.userId) {
        anchor.innerHTML = '';
        return;
    }

    anchor.innerHTML =
        '<div style="position:relative;">' +
        '<button class="post-menu-btn" id="postMenuToggle">⋯</button>' +
        '<div class="post-menu-dropdown" id="postMenuDropdown" style="display:none;">' +
        '<button id="editPostBtn">수정</button>' +
        '<button class="danger" id="deletePostBtn">삭제</button>' +
        '</div>' +
        '</div>';

    document.getElementById('postMenuToggle').addEventListener('click', function (e) {
        e.stopPropagation();
        var dd = document.getElementById('postMenuDropdown');
        dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
    });
    document.addEventListener('click', function () {
        var dd = document.getElementById('postMenuDropdown');
        if (dd) dd.style.display = 'none';
    });

    document.getElementById('editPostBtn').addEventListener('click', function () {
        window.location.href = '/community/write?edit=' + ds.postId;
    });
    document.getElementById('deletePostBtn').addEventListener('click', function () {
        if (!confirm('게시글을 삭제할까요?')) return;
        fetch('/api/posts/' + ds.postId, { method: 'DELETE', headers: authHeaders() })
            .then(function (r) { if (!r.ok) throw new Error(); })
            .then(function () { window.location.href = '/community'; })
            .catch(function () { alert('삭제에 실패했습니다.'); });
    });
}

/* ── 통계 업데이트 ── */
function updateStats() {
    var heartBtn   = document.getElementById('postHeartBtn');
    var heartCount = document.getElementById('postHeartCount');
    var commentCnt = document.getElementById('totalCommentCount');
    var labelCnt   = document.getElementById('commentCountLabel');

    if (heartBtn) {
        heartBtn.className = 'stat-btn' + (ds.isLiked ? ' liked' : '');
        heartBtn.querySelector('svg').setAttribute('fill', ds.isLiked ? 'currentColor' : 'none');
        heartBtn.onclick = handleLike;
    }
    if (heartCount) heartCount.textContent = ds.likeCount;

    var total = ds.comments.reduce(function (acc, c) { return acc + 1 + (c.replies ? c.replies.length : 0); }, 0);
    if (commentCnt)  commentCnt.textContent = total;
    if (labelCnt)    labelCnt.textContent   = total;
}

function handleLike() {
    if (!getToken()) { alert('로그인이 필요합니다.'); return; }
    fetch('/api/posts/' + ds.postId + '/like', { method: 'POST', headers: authHeaders() })
        .then(function (r) { return r.json(); })
        .then(function (data) {
            ds.isLiked   = data.liked;
            ds.likeCount = data.likeCount;
            updateStats();
        })
        .catch(function () {});
}

/* ── 댓글 ── */
function fetchComments() {
    fetch('/api/posts/' + ds.postId + '/comments', { headers: authHeaders() })
        .then(function (r) { return r.ok ? r.json() : []; })
        .then(function (data) {
            ds.comments = data || [];
            renderComments();
            updateStats();
        })
        .catch(function () {});
}

function renderComments() {
    var container = document.getElementById('commentsSection');
    if (!container) return;

    if (!ds.comments.length) {
        container.innerHTML = '<div class="no-comments">첫 댓글을 남겨보세요!</div>';
        return;
    }

    container.innerHTML = ds.comments.map(function (c) { return buildCommentHTML(c); }).join('');
    attachCommentListeners();
}

function buildCommentHTML(c) {
    var repliesHTML = '';
    if (c.replies && c.replies.length) {
        repliesHTML = '<div class="replies-container">' +
            c.replies.map(function (r) { return buildReplyHTML(r, c.commentId); }).join('') +
            '</div>';
    }

    var isOwner = ds.currentUser && ds.currentUser.userId === c.userId;
    var deleteBtn = isOwner
        ? '<button class="action-btn" data-action="delete-comment" data-comment-id="' + c.commentId + '">삭제</button>'
        : '';

    return '<div class="comment-thread" data-comment-id="' + c.commentId + '">' +
        '<div class="comment">' +
        '<div class="comment-avatar"><img src="' + (c.profileImg || '/img/interface/ProfileDefault.png') + '" alt="author"></div>' +
        '<div class="comment-body">' +
        '<div class="comment-header">' +
        '<span class="comment-author">' + escHtml(c.nickname || c.author || '') + '</span>' +
        '<span class="comment-date">' + formatDate(c.createdAt) + '</span>' +
        '</div>' +
        '<p class="comment-text">' + highlightMention(escHtml(c.content || '')) + '</p>' +
        '<div class="comment-actions">' +
        '<button class="action-btn' + (c.liked ? ' liked' : '') + '" data-action="like-comment" data-comment-id="' + c.commentId + '">' +
        '♥ ' + (c.likeCount || 0) +
        '</button>' +
        '<button class="action-btn" data-action="reply" data-comment-id="' + c.commentId + '" data-author="' + escHtml(c.nickname || '') + '">답글</button>' +
        deleteBtn +
        '</div>' +
        '<div class="reply-input-wrap" id="replyWrap_' + c.commentId + '">' +
        '<div class="reply-input-row">' +
        '<input type="text" class="reply-input" id="replyInput_' + c.commentId + '" placeholder="답글을 입력하세요...">' +
        '<button class="reply-submit" data-comment-id="' + c.commentId + '">등록</button>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        repliesHTML +
        '</div>';
}

function buildReplyHTML(r, parentId) {
    return '<div class="reply">' +
        '<div class="comment-avatar"><img src="' + (r.profileImg || '/img/interface/ProfileDefault.png') + '" alt="author"></div>' +
        '<div class="comment-body">' +
        '<div class="comment-header">' +
        '<span class="comment-author">' + escHtml(r.nickname || r.author || '') + '</span>' +
        '<span class="comment-date">' + formatDate(r.createdAt) + '</span>' +
        '</div>' +
        '<p class="comment-text">' + highlightMention(escHtml(r.content || '')) + '</p>' +
        '</div>' +
        '</div>';
}

function attachCommentListeners() {
    document.querySelectorAll('[data-action="like-comment"]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var cId = parseInt(this.getAttribute('data-comment-id'));
            toggleCommentLike(cId);
        });
    });

    document.querySelectorAll('[data-action="reply"]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var cId    = parseInt(this.getAttribute('data-comment-id'));
            var author = this.getAttribute('data-author');
            toggleReplyInput(cId, author);
        });
    });

    document.querySelectorAll('[data-action="delete-comment"]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var cId = parseInt(this.getAttribute('data-comment-id'));
            deleteComment(cId);
        });
    });

    document.querySelectorAll('.reply-submit').forEach(function (btn) {
        btn.addEventListener('click', function () { submitReply(parseInt(this.getAttribute('data-comment-id'))); });
    });
    document.querySelectorAll('.reply-input').forEach(function (input) {
        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') submitReply(parseInt(this.id.replace('replyInput_', '')));
        });
    });
}

function toggleReplyInput(commentId, author) {
    var wrap  = document.getElementById('replyWrap_' + commentId);
    var input = document.getElementById('replyInput_' + commentId);
    if (!wrap) return;
    var open = wrap.style.display === 'block';
    document.querySelectorAll('.reply-input-wrap').forEach(function (w) { w.style.display = 'none'; });
    if (!open) {
        wrap.style.display = 'block';
        if (input) { input.value = author ? '@' + author + ' ' : ''; input.focus(); }
    }
}

function submitReply(commentId) {
    var input = document.getElementById('replyInput_' + commentId);
    if (!input || !input.value.trim()) return;
    if (!getToken()) { alert('로그인이 필요합니다.'); return; }

    fetch('/api/posts/' + ds.postId + '/comments', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ content: input.value.trim(), parentId: commentId })
    })
        .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
        .then(function () { fetchComments(); })
        .catch(function () { alert('답글 등록에 실패했습니다.'); });
}

function toggleCommentLike(commentId) {
    if (!getToken()) { alert('로그인이 필요합니다.'); return; }
    fetch('/api/posts/' + ds.postId + '/comments/' + commentId + '/like', {
        method: 'POST', headers: authHeaders()
    })
        .then(function (r) { return r.json(); })
        .then(function () { fetchComments(); })
        .catch(function () {});
}

function deleteComment(commentId) {
    if (!confirm('댓글을 삭제할까요?')) return;
    fetch('/api/posts/' + ds.postId + '/comments/' + commentId, {
        method: 'DELETE', headers: authHeaders()
    })
        .then(function (r) { if (!r.ok) throw new Error(); })
        .then(function () { fetchComments(); })
        .catch(function () { alert('삭제에 실패했습니다.'); });
}

/* ── 댓글 입력 ── */
function setupCommentInput() {
    var btn   = document.getElementById('submitCommentBtn');
    var input = document.getElementById('commentInput');
    if (btn) btn.addEventListener('click', submitComment);
    if (input) input.addEventListener('keypress', function (e) { if (e.key === 'Enter') submitComment(); });
}

function submitComment() {
    var input = document.getElementById('commentInput');
    if (!input || !input.value.trim()) return;
    if (!getToken()) { alert('로그인이 필요합니다.'); return; }

    fetch('/api/posts/' + ds.postId + '/comments', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ content: input.value.trim(), parentId: null })
    })
        .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
        .then(function () { input.value = ''; fetchComments(); })
        .catch(function () { alert('댓글 등록에 실패했습니다.'); });
}

/* ── 유틸 ── */
function escHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function highlightMention(text) {
    return text.replace(/(@[^\s<]+)/g, '<span class="mention">$1</span>');
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    return dateStr.substring(0, 10);
}
