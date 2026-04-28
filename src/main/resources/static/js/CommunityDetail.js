/* ================================================================
   CommunityDetail.js — 세션 기반 인증으로 수정 (JWT 토큰 방식 제거)
   GET    /api/posts/{postId}
   POST   /api/posts/{postId}/like
   GET    /api/posts/{postId}/comments
   POST   /api/posts/{postId}/comments
   DELETE /api/posts/{postId}/comments/{commentId}
   POST   /api/posts/{postId}/comments/{commentId}/like
   DELETE /api/posts/{postId}
================================================================ */

/* ── 상태 ── */
var ds = {
    postId:      null,
    post:        null,
    comments:    [],
    isLiked:     false,
    likeCount:   0,
    currentUser: null   // /api/member/me 응답으로 채워짐
};

/* ── 초기화 ── */
document.addEventListener('DOMContentLoaded', function () {
    var parts = window.location.pathname.split('/');
    ds.postId = parseInt(parts[parts.length - 1]);

    if (!ds.postId) {
        toast('잘못된 접근입니다.');
        window.location.href = '/community';
        return;
    }

    loadCurrentUser();
    fetchPost();
    fetchComments();
    setupCommentInput();
});

/* ── 현재 유저 로드 ── */
function loadCurrentUser() {
    fetch('/api/members/me', {
        credentials: 'include'
    })
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
    fetch('/api/posts/' + ds.postId, {
        credentials: 'include'
    })
        .then(function (r) { if (!r.ok) throw new Error('조회 실패'); return r.json(); })
        .then(function (post) {
            ds.post      = post;
            ds.isLiked   = !!post.liked;
            ds.likeCount = post.likeCount || 0;
            renderPost(post);
        })
        .catch(function () {
            toast('게시글을 불러올 수 없습니다.');
            window.location.href = '/community';
        });
}

function renderPost(post) {
    var navCat = document.getElementById('navCategory');
    if (navCat) navCat.textContent = post.type || '';

    var authorImg  = document.getElementById('postAuthorImg');
    var authorName = document.getElementById('postAuthorName');
    var postDate   = document.getElementById('postDate');
    if (authorImg)  authorImg.src         = post.profileImg || '/img/interface/ProfileDefault.png';
    if (authorName) authorName.textContent = post.nickname || '작성자';
    if (postDate)   postDate.textContent   = post.createdAt ? post.createdAt.substring(0, 10) : '';

    var textEl = document.getElementById('postText');
    if (textEl) textEl.textContent = cleanProductTags(post.content || post.title || '');

    renderImages(post.imgUrl);
    renderProductArea(post.content || '');
    updateStats();
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

    area.innerHTML = '<span class="quoted-product-loading">상품 불러오는 중...</span>';

    Promise.all(ids.map(function (id) {
        return fetch('/api/products/' + id, { credentials: 'include' })
            .then(function (r) { return r.ok ? r.json() : null; })
            .catch(function () { return null; });
    })).then(function (products) {
        var valid = products.filter(Boolean);
        if (!valid.length) { area.innerHTML = ''; return; }

        area.className = 'quoted-product-list';
        area.innerHTML = valid.map(function (p) {
            return '<a href="/itemDetail?id=' + p.id + '" class="quoted-product-card">' +
                '<img src="' + (p.imageUrl || '') + '" alt="' + escHtml(p.name) + '" onerror="this.style.display=\'none\'">' +
                '<div class="quoted-product-info">' +
                '<span class="quoted-product-name">' + escHtml(p.name) + '</span>' +
                '<span class="quoted-product-price">₩' + (p.price || 0).toLocaleString() + '</span>' +
                '</div></a>';
        }).join('');

        addWheelScroll(area);
    });
}

/* ── 가로 스크롤 (휠 + 마우스 드래그) ── */
function addWheelScroll(el) {
    if (el._scrollAdded) return;
    el._scrollAdded = true;

    // 휠
    el.addEventListener('wheel', function (e) {
        if (e.deltaY === 0) return;
        e.preventDefault();
        el.scrollLeft += e.deltaY;
    }, { passive: false });

    // 마우스 드래그
    var isDragging = false, startX, startScrollLeft;
    el.addEventListener('mousedown', function (e) {
        isDragging = true;
        startX = e.pageX;
        startScrollLeft = el.scrollLeft;
        el.style.userSelect = 'none';
        el.style.cursor = 'grabbing';
        e.stopPropagation();
    });
    window.addEventListener('mousemove', function (e) {
        if (!isDragging) return;
        el.scrollLeft = startScrollLeft - (e.pageX - startX);
    });
    window.addEventListener('mouseup', function () {
        if (!isDragging) return;
        isDragging = false;
        el.style.userSelect = '';
        el.style.cursor = '';
    });

    // 터치 버블링 차단
    el.addEventListener('touchstart', function (e) { e.stopPropagation(); }, { passive: true });
    el.addEventListener('touchmove',  function (e) { e.stopPropagation(); }, { passive: true });
}

/* ── 게시글 수정/삭제 메뉴 ── */
function renderPostMenu(post) {
    var anchor = document.getElementById('postMenuAnchor');
    if (!anchor) return;


    if (!ds.currentUser || ds.currentUser.id !== post.memberId) {
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
        fetch('/api/posts/' + ds.postId, {
            method: 'DELETE',
            credentials: 'include'
        })
            .then(function (r) { if (!r.ok) throw new Error(); })
            .then(function () { window.location.href = '/community'; })
            .catch(function () { toast('삭제에 실패했습니다.'); });
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
    if (commentCnt) commentCnt.textContent = total;
    if (labelCnt)   labelCnt.textContent   = total;
}

function handleLike() {

    fetch('/api/posts/' + ds.postId + '/like', {
        method: 'POST',
        credentials: 'include'
    })
        .then(function (r) {
            if (r.status === 401) { toast('로그인이 필요합니다.', '/login'); return null; }
            return r.json();
        })
        .then(function (data) {
            if (!data) return;
            ds.isLiked   = data.liked;
            ds.likeCount = data.likeCount;
            updateStats();
        })
        .catch(function () {});
}

/* ── 댓글 ── */
function fetchComments() {
    fetch('/api/posts/' + ds.postId + '/comments', {
        credentials: 'include'
    })
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


    var isOwner = ds.currentUser && ds.currentUser.id === c.memberId;
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

    var isOwner = ds.currentUser && ds.currentUser.id === r.memberId;
    var deleteBtn = isOwner
        ? '<button class="action-btn" data-action="delete-comment" data-comment-id="' + r.commentId + '">삭제</button>'
        : '';

    return '<div class="reply">' +
        '<div class="comment-avatar"><img src="' + (r.profileImg || '/img/interface/ProfileDefault.png') + '" alt="author"></div>' +
        '<div class="comment-body">' +
        '<div class="comment-header">' +
        '<span class="comment-author">' + escHtml(r.nickname || r.author || '') + '</span>' +
        '<span class="comment-date">' + formatDate(r.createdAt) + '</span>' +
        '</div>' +
        '<p class="comment-text">' + highlightMention(escHtml(r.content || '')) + '</p>' +

        '<div class="comment-actions">' +
        '<button class="action-btn' + (r.liked ? ' liked' : '') + '" data-action="like-comment" data-comment-id="' + r.commentId + '">' +
        '♥ ' + (r.likeCount || 0) +
        '</button>' +
        deleteBtn +
        '</div>' +
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

    fetch('/api/posts/' + ds.postId + '/comments', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input.value.trim(), parentId: commentId })
    })
        .then(function (r) {
            if (r.status === 401) { toast('로그인이 필요합니다.', '/login'); return null; }
            if (!r.ok) throw new Error();
            return r.json();
        })
        .then(function (data) { if (data) fetchComments(); })
        .catch(function () { toast('답글 등록에 실패했습니다.'); });
}

function toggleCommentLike(commentId) {
    fetch('/api/posts/' + ds.postId + '/comments/' + commentId + '/like', {
        method: 'POST',
        credentials: 'include'
    })
        .then(function (r) {
            if (r.status === 401) { toast('로그인이 필요합니다.', '/login'); return null; }
            return r.json();
        })
        .then(function (data) { if (data) fetchComments(); })
        .catch(function () {});
}

function deleteComment(commentId) {
    if (!confirm('댓글을 삭제할까요?')) return;
    fetch('/api/posts/' + ds.postId + '/comments/' + commentId, {
        method: 'DELETE',
        credentials: 'include'
    })
        .then(function (r) { if (!r.ok) throw new Error(); })
        .then(function () { fetchComments(); })
        .catch(function () { toast('삭제에 실패했습니다.'); });
}

/* ── 댓글 입력 ── */
function setupCommentInput() {
    var btn   = document.getElementById('submitCommentBtn');
    var input = document.getElementById('commentInput');
    if (btn)   btn.addEventListener('click', submitComment);
    if (input) input.addEventListener('keypress', function (e) { if (e.key === 'Enter') submitComment(); });
}

function submitComment() {
    var input = document.getElementById('commentInput');
    if (!input || !input.value.trim()) return;

    fetch('/api/posts/' + ds.postId + '/comments', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input.value.trim(), parentId: null })
    })
        .then(function (r) {
            if (r.status === 401) { toast('로그인이 필요합니다.', '/login'); return null; }
            if (!r.ok) throw new Error();
            return r.json();
        })
        .then(function (data) { if (data) { input.value = ''; fetchComments(); } })
        .catch(function () { toast('댓글 등록에 실패했습니다.'); });
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
    return dateStr.substring(0, 16).replace('T', ' ');
}

function toast(msg, redirect) {
    const toastEl = document.getElementById('toast');
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.className = 'toast-show';
    setTimeout(() => {
        toastEl.className = '';
        if (redirect) window.location.href = redirect;
    }, 1200);
}