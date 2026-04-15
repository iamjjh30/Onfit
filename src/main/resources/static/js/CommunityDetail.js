/* ================================================================
   CommunityDetail.js — API 연동 버전
   - GET  /api/posts/{postId}                         게시글 상세
   - GET  /api/posts/{postId}/comments                댓글 목록
   - POST /api/posts/{postId}/comments                댓글/대댓글 작성
   - DELETE /api/posts/{postId}/comments/{commentId}  댓글 삭제
   - POST /api/posts/{postId}/like                    게시글 좋아요
   - POST /api/posts/{postId}/comments/{commentId}/like 댓글 좋아요
   - DELETE /api/posts/{postId}                       게시글 삭제 (작성자만)
================================================================ */

var API_BASE = 'http://localhost:8080';
function getToken() {return 'session-mode'}
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
var detailState = {
    currentPost: null,
    comments:    [],
    isMedia:     false,
    currentUser: null   // { userId, nickname, profileImg }
};

var urlParams = new URLSearchParams(window.location.search);
var pathSegments = window.location.pathname.split('/');
var PAGE_POST_ID = urlParams.get('id'); // 🌟 주소창의 ?id= 뒤에 있는 숫자만 정확히 쏙 뽑아옵니다!
var PAGE_TYPE    = urlParams.get('type') || 'all';

console.log("추출된 PAGE_POST_ID:", PAGE_POST_ID); // 이제 null이 아니어야 합니다!

/* ----------------------------------------------------------------
   2. 초기화
---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function() {
    detailState.isMedia  = (PAGE_TYPE === 'media');
    detailState.isShorts = (PAGE_TYPE === 'shorts');

    loadCurrentUser(function() {
        fetchPostDetail(PAGE_POST_ID);
        fetchComments(PAGE_POST_ID);
        setupDetailEventListeners();
    });
});

/* ----------------------------------------------------------------
   3. 현재 유저 정보
---------------------------------------------------------------- */
function loadCurrentUser(callback) {
    var token = getToken();
    if (!token) { callback(); return; }

    fetch(API_BASE + '/api/users/me', { headers: authHeaders() })
    .then(function(res) { return res.json(); })
    .then(function(user) {
        detailState.currentUser = user;
        callback();
    })
    .catch(function() { callback(); });
}

function isMyPost() {
    if (!detailState.currentUser || !detailState.currentPost) return false;
    return detailState.currentUser.userId === detailState.currentPost.userId;
}

/* ----------------------------------------------------------------
   4. 게시글 상세 조회
---------------------------------------------------------------- */
function fetchPostDetail(postId) {
    fetch(API_BASE + '/api/posts/' + postId, { headers: authHeaders() })
        .then(res => res.json())
        .then(post => {
            detailState.currentPost = post;

            // 게시글 타입이 'Share Fit'인지 확인 (DB의 type 컬럼 기준)
            if (post.type === 'Share Fit') {
                detailState.isMedia = true;
                renderShortsLayout(post);
            } else {
                detailState.isMedia = false;
                renderNormalLayout(post); // 일반 레이아웃 실행
            }

            renderDeleteButton();
        })
        .catch(err => {
            console.error(err);
            alert('게시글을 불러오지 못했습니다.');
        });
}

/* ----------------------------------------------------------------
   5. 레이아웃 렌더링
---------------------------------------------------------------- */

/* ── 숏츠 모드 ── */
function renderShortsLayout(post) {
    document.getElementById('wrap').style.display        = 'none';

    var shortsEl = document.getElementById('shortsLayout');
    if (!shortsEl) {
        shortsEl = document.createElement('div');
        shortsEl.id = 'shortsLayout';
        document.body.appendChild(shortsEl);
    }

    var imgs = [];
    if (post.imgUrl) {
        try {
            var parsed = JSON.parse(post.imgUrl);
            imgs = Array.isArray(parsed) ? parsed : [post.imgUrl];
        } catch (e) {
            imgs = [post.imgUrl];
        }
    }

    var productIds = extractProductIds(post.content || '');
    var cleanText  = cleanProductTags(post.content || '');
    var likedClass = post.liked ? 'active' : '';
    var likedImg   = post.liked ? '../img/community/heart-fill.png' : '../img/community/heart.png';

    shortsEl.innerHTML =
        '<button class="shorts-back" onclick="history.back()">←</button>' +

        // 이미지 영역 (cover로 꽉 채움)
        '<div class="shorts-img-area">' +
            (imgs.length > 1
                ? '<div class="swiper shortsSwiper"><div class="swiper-wrapper">' +
                    imgs.map(function(src) {
                        return '<div class="swiper-slide"><img src="' + src + '" alt="fit"/></div>';
                    }).join('') +
                  '</div><div class="swiper-pagination shorts-pagination"></div></div>'
                : (imgs[0] ? '<img class="shorts-single-img" src="' + imgs[0] + '" alt="fit"/>' : '')
            ) +
        '</div>' +

        // 오른쪽 액션 바 (드롭다운은 위로 열림)
        '<div class="shorts-actions">' +
            '<div id="shortsMenuAnchor" class="shorts-menu-top"></div>' +
            '<button class="shorts-action-btn stat_btn ' + likedClass + '" id="shortsHeartBtn">' +
                '<img src="' + likedImg + '" alt="heart"/>' +
                '<span id="shortsHeartCount">' + (post.likeCount || 0) + '</span>' +
            '</button>' +
            '<button class="shorts-action-btn stat_btn" id="shortsCommentBtn">' +
                '<img src="../img/community/bubble.png" alt="comment"/>' +
                '<span id="shortsTotalComment">' + (post.commentCount || 0) + '</span>' +
            '</button>' +
        '</div>' +

        // 하단 정보
        '<div class="shorts-info">' +
            '<div class="shorts-author">' +
                '<div class="author_img"><img src="' + (post.profileImg || '../img/interface/ProfileDefault.png') + '"/></div>' +
                '<span class="author_name">' + (post.nickname || '작성자') + '</span>' +
                '<span class="post_date">' + (post.createdAt ? post.createdAt.substring(0,10) : '') + '</span>' +
            '</div>' +
            '<p class="shorts-text">' + cleanText + '</p>' +
            '<div class="quoted-product-list" id="shortsProductCards"></div>' +
        '</div>' +

        // 댓글 패널 (기본 숨김, 버튼 클릭 시 표시)
        '<div class="shorts-comment-panel" id="shortsCommentPanel">' +
            '<div class="shorts-comment-header">' +
                '<span>댓글 <span id="shortsTotalComment2">' + (post.commentCount || 0) + '</span></span>' +
                '<button class="shorts-comment-close" id="shortsCommentClose">✕</button>' +
            '</div>' +
            '<div class="shorts-comment-list" id="shortsCommentList"></div>' +
            '<div class="shorts-comment-input">' +
                '<div class="shorts-comment-input-profile">' +
                    '<img src="' + ((detailState.currentUser && detailState.currentUser.profileImg) || '../img/interface/ProfileDefault.png') + '" ' +
                        'onerror="this.src=\'../img/interface/ProfileDefault.png\'">' +
                '</div>' +
                '<input type="text" id="shortsCommentInput" placeholder="댓글을 남겨보세요."/>' +
                '<button id="shortsCommentSubmit">등록</button>' +
            '</div>' +
        '</div>';

    if (imgs.length > 1) {
        new Swiper('.shortsSwiper', {
            slidesPerView: 1, loop: true,
            pagination: { el: '.shorts-pagination', clickable: true, dynamicBullets: true }
        });
    }

    fetchAndRenderProductCards(productIds, document.getElementById('shortsProductCards'));

    // 좋아요
    document.getElementById('shortsHeartBtn').onclick = togglePostHeart;

    // 댓글 패널 열기/닫기
    var commentPanel = document.getElementById('shortsCommentPanel');
    document.getElementById('shortsCommentBtn').onclick = function() {
        commentPanel.classList.toggle('open');
        if (commentPanel.classList.contains('open')) {
            renderShortsComments();
        }
    };
    document.getElementById('shortsCommentClose').onclick = function() {
        commentPanel.classList.remove('open');
    };

    // 댓글 등록 — handleCommentSubmit 재활용 (isShorts 분기로 자동 처리)
    var shortsInput  = document.getElementById('shortsCommentInput');
    var shortsSubmit = document.getElementById('shortsCommentSubmit');
    shortsSubmit.onclick = handleCommentSubmit;
    shortsInput.onkeypress = function(e) { if (e.key === 'Enter') handleCommentSubmit(); };

    detailState.isMedia  = false;
    detailState.isShorts = true;
}

function renderShortsComments() {
    // 기존 fetchComments → renderComments → attachCommentEventListeners 그대로 재활용
    // getCommentContainerId()가 isShorts일 때 'shortsCommentList' 반환하므로 자동 적용
    fetchComments(PAGE_POST_ID);
}


function renderNormalLayout(post) {
    var shortsEl = document.getElementById('shortsLayout');
    if (shortsEl) {
        shortsEl.style.display = 'none';
    }

    // 2. wrap(일반 레이아웃)도 안전하게 체크 후 보여줍니다.
    var wrapEl = document.getElementById('wrap');
    if (wrapEl) {
        wrapEl.style.display = 'block';
    }

    setElText('postAuthorName2', post.nickname || '작성자');
    setElText('postDate2',       post.createdAt ? post.createdAt.substring(0, 10) : '');
    setElText('postHeartCount2', post.likeCount || 0);
    setElText('totalCommentCount2', post.commentCount || 0);

    var authorImg2 = document.getElementById('postAuthorImg2');
    if (authorImg2) authorImg2.src = post.profileImg || '../img/interface/ProfileDefault.png';

    /* 좋아요 초기 상태 */
    var hb2 = document.getElementById('postHeartBtn2');
    if (hb2) {
        var img2 = hb2.querySelector('img');
        if (post.liked) {
            hb2.classList.add('active');
            if (img2) img2.src = '../img/community/heart-fill.png';
        } else {
            hb2.classList.remove('active');
            if (img2) img2.src = '../img/community/heart.png';
        }
    }

    /* 제목 표시 */
    var titleEl = document.getElementById('postTitle2');
    if (titleEl) titleEl.textContent = post.title || '';

    /* 상품 태그 제거 후 본문 텍스트 */
    var productIds2 = extractProductIds(post.content || post.title || '');
    var textEl2 = document.getElementById('postText2');
    if (textEl2) textEl2.textContent = cleanProductTags(post.content || post.title || '');

    /* 이미지 — 본문 텍스트 아래에 배치 */
    var normalImageBox = document.getElementById('normalImageBox');
    var normalImage = document.getElementById('normalImage');
    if (post.imgUrl && normalImage) {
        var realUrl = post.imgUrl.replace(/[\[\]"]/g, "");
        normalImage.src = realUrl;
        document.getElementById('normalImageBox').style.display = 'block';
    } else if (normalImageBox) {
        normalImageBox.style.display = 'none';
    }

    /* 상품 카드 — 이미지 아래에 배치 */
    var productCardBox2 = document.getElementById('postProductCards2');
    if (!productCardBox2) {
        productCardBox2 = document.createElement('div');
        productCardBox2.id = 'postProductCards2';
        productCardBox2.className = 'quoted-product-list';
    }
    // 이미지가 있으면 이미지 아래, 없으면 텍스트 아래
    var anchorEl = (post.imgUrl && normalImageBox) ? normalImageBox : textEl2;
    if (anchorEl) anchorEl.insertAdjacentElement('afterend', productCardBox2);

    fetchAndRenderProductCards(productIds2, productCardBox2);
}

function setElText(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
}

/* ----------------------------------------------------------------
   6. ⋯ 드롭다운 메뉴 (공유 + 내 게시글이면 삭제 포함)
---------------------------------------------------------------- */
function renderDeleteButton() {
    var anchorId = detailState.isShorts ? 'shortsMenuAnchor'
                 : detailState.isMedia  ? 'mediaMenuAnchor'
                 : 'normalMenuAnchor';
    var anchor = document.getElementById(anchorId);
    if (!anchor) return;

    var deleteItem = isMyPost()
        ? '<button class="post-menu-item delete" id="postDeleteMenuItem">🗑 게시글 삭제</button>'
        : '';

    anchor.innerHTML =
        '<div class="post-menu-wrap">' +
            '<button class="post-menu-btn" id="postMenuBtn">' +
                '<img src="../img/community/menu_btn.png" alt="메뉴" ' +
                    'onerror="this.style.display=\'none\';this.parentElement.innerHTML=\'⋯\';">' +
            '</button>' +
            '<div class="post-menu-dropdown" id="postMenuDropdown">' +
                '<button class="post-menu-item" id="postShareMenuItem">🔗 공유하기</button>' +
                deleteItem +
            '</div>' +
        '</div>';

    var menuBtn      = document.getElementById('postMenuBtn');
    var menuDropdown = document.getElementById('postMenuDropdown');

    menuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        menuDropdown.classList.toggle('open');
    });
    document.addEventListener('click', function() {
        menuDropdown.classList.remove('open');
    });

    // 공유하기
    document.getElementById('postShareMenuItem').addEventListener('click', function() {
        menuDropdown.classList.remove('open');
        var url = window.location.href;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(function() {
                showShareToast('링크가 복사됐어요!');
            });
        } else {
            showShareToast(url);
        }
    });

    // 삭제
    var deleteMenuItem = document.getElementById('postDeleteMenuItem');
    if (deleteMenuItem) {
        deleteMenuItem.addEventListener('click', function() {
            menuDropdown.classList.remove('open');
            handleDeletePost();
        });
    }
}

function showShareToast(msg) {
    var toast = document.getElementById('toast') || document.createElement('div');
    if (!toast.id) {
        toast.id = 'shareToast';
        toast.style.cssText =
            'position:fixed;bottom:40px;left:50%;transform:translateX(-50%) translateY(20px);' +
            'background:rgba(0,0,0,0.82);color:#fff;padding:13px 28px;border-radius:30px;' +
            'font-size:14px;opacity:0;pointer-events:none;transition:opacity 0.3s,transform 0.3s;z-index:99999;';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 2500);
}

/* ----------------------------------------------------------------
   7. 게시글 삭제
---------------------------------------------------------------- */
function handleDeletePost() {
    if (!confirm('게시글을 삭제하시겠습니까?')) return;

    fetch(API_BASE + '/api/posts/' + PAGE_POST_ID, {
        method:  'DELETE',
        headers: authHeaders()
    })
    .then(function(res) {
        if (!res.ok) throw new Error('삭제 실패');
        alert('게시글이 삭제되었습니다.');
        window.location.href = './Community.html';
    })
    .catch(function(err) {
        console.error(err);
        alert('삭제에 실패했습니다. 다시 시도해주세요.');
    });
}

/* ----------------------------------------------------------------
   9. 댓글 목록 조회
---------------------------------------------------------------- */
function fetchComments(postId) {
    fetch(API_BASE + '/api/posts/' + postId + '/comments', { headers: authHeaders() })
    .then(function(res) { return res.json(); })
    .then(function(comments) {
        detailState.comments = comments;
        renderComments();
        updatePostStats();
    })
    .catch(function(err) { console.error('댓글 로드 실패:', err); });
}

/* ----------------------------------------------------------------
   10. 댓글 렌더링
---------------------------------------------------------------- */
function getCommentContainerId() {
    if (detailState.isShorts) return 'shortsCommentList';
    return detailState.isMedia ? 'commentsSection' : 'commentsSection2';
}

function highlightMention(content) {
    return (content || '').replace(/(@[^\s]+)/g, '<span class="mention">$1</span>');
}

/* ----------------------------------------------------------------
   상품 태그 파싱
   신버전: [상품:ID]
   구버전: [상품:ID:이름:이미지URL:가격]  (하위 호환)
---------------------------------------------------------------- */
function extractProductIds(content) {
    if (!content) return [];
    var ids = [];
    // 신버전: [상품:169]
    content.replace(/\[상품:(\d+)\](?![:」])/g, function(match, id) {
        ids.push(parseInt(id));
    });
    // 구버전: [상품:169:이름:url:가격]
    content.replace(/\[상품:(\d+):[^\]]+\]/g, function(match, id) {
        var parsed = parseInt(id);
        if (ids.indexOf(parsed) === -1) ids.push(parsed);
    });
    return ids;
}

function cleanProductTags(content) {
    if (!content) return '';
    // 구버전 태그 먼저 제거 (더 구체적인 패턴 먼저)
    var cleaned = content.replace(/\[상품:\d+:[^\]]*\]\n?/g, '');
    // 신버전 태그 제거
    cleaned = cleaned.replace(/\[상품:\d+\]\n?/g, '');
    return cleaned.trim();
}

/* 퍼스널컬러 ENUM → 한글 */
var PC_LABEL_MAP = {
    N: '뉴트럴', SW: '봄 웜톤', SC: '여름 쿨톤', AW: '가을 웜톤', WC: '겨울 쿨톤'
};

/* 상품 카드 HTML 생성 (API 응답 기준) */
function createProductCardHTML(p) {
    var pcLabel = p.personalColor ? (PC_LABEL_MAP[p.personalColor] || p.personalColor) : '';
    var inStock = p.inStock !== false; // inStock 필드 없으면 true로 간주
    return (
        '<a href="./product/' + p.productId + '" class="quoted-product-card">' +
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

/* 상품 ID 배열 → API 조회 → 카드 영역에 렌더링 */
function fetchAndRenderProductCards(productIds, containerEl) {
    if (!productIds || productIds.length === 0 || !containerEl) return;

    containerEl.innerHTML = '<div class="quoted-product-loading">상품 정보를 불러오는 중...</div>';

    Promise.all(
        productIds.map(function(id) {
            return fetch(API_BASE + '/api/products/' + id)
                .then(function(res) { return res.ok ? res.json() : null; })
                .catch(function() { return null; });
        })
    ).then(function(products) {
        var valid = products.filter(Boolean);
        if (valid.length === 0) {
            containerEl.innerHTML = '';
            return;
        }
        containerEl.innerHTML = valid.map(createProductCardHTML).join('');
    });
}

function renderComments() {
    var cId       = getCommentContainerId();
    var container = document.getElementById(cId);
    if (!container) return;

    if (!detailState.comments || detailState.comments.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:#999;">첫 댓글을 남겨보세요!</div>';
        return;
    }
    container.innerHTML = detailState.comments.map(function(c) {
        return createCommentHTML(c);
    }).join('');
    attachCommentEventListeners();
}

function createCommentHTML(comment) {
    var highlighted = highlightMention(comment.content);
    var repliesHTML = '';
    if (comment.replies && comment.replies.length > 0) {
        repliesHTML = comment.replies.map(function(r) {
            return createReplyHTML(r, comment.commentId);
        }).join('');
    }

    var isMine = detailState.currentUser &&
                 detailState.currentUser.userId === comment.userId;

    return (
        '<div class="comment_thread">' +
        '<div class="comment">' +
            '<div class="comment_img"><img src="' + (comment.profileImg || '../img/interface/ProfileDefault.png') + '" alt="profile"/></div>' +
            '<div class="comment_content">' +
                '<div class="comment_header">' +
                    '<span class="comment_author">' + (comment.nickname || '익명') + '</span>' +
                    '<span class="comment_date">'   + (comment.createdAt ? comment.createdAt.substring(0,10) : '') + '</span>' +
                    (isMine ? '<button class="comment_delete_btn" data-comment-id="' + comment.commentId + '" style="margin-left:8px;border:none;background:none;color:#ccc;cursor:pointer;font-size:0.75rem;" onmouseover="this.style.color=\'#e74c3c\'" onmouseout="this.style.color=\'#ccc\'">삭제</button>' : '') +
                '</div>' +
                '<p class="comment_text">' + highlighted + '</p>' +
                '<div class="comment_actions">' +
                    '<button class="heart_btn ' + (comment.liked ? 'active' : '') + '" data-comment-id="' + comment.commentId + '">' +
                        '<img src="' + (comment.liked ? '../img/community/heart-fill.png' : '../img/community/heart.png') + '"/>' +
                        (comment.likeCount > 0 ? '<span>' + comment.likeCount + '</span>' : '') +
                    '</button>' +
                    '<button class="reply_btn" data-comment-id="' + comment.commentId + '" data-target-author="' + (comment.nickname||'') + '">' +
                        '<img src="../img/community/bubble.png"/>' +
                        (comment.replies && comment.replies.length > 0 ? '<span>' + comment.replies.length + '</span>' : '') +
                    '</button>' +
                '</div>' +
                '<div class="reply_input_box" id="replyInput_' + comment.commentId + '" style="display:none;">' +
                    '<div class="reply_input_wrapper">' +
                        '<input type="text" class="reply_input" placeholder="답글을 입력하세요..." data-comment-id="' + comment.commentId + '"/>' +
                        '<button class="reply_submit_btn" data-comment-id="' + comment.commentId + '">등록</button>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
        '<div class="replies_container">' + repliesHTML + '</div>' +
        '</div>'
    );
}

function createReplyHTML(reply, parentId) {
    var highlighted = highlightMention(reply.content);
    var isMine = detailState.currentUser &&
                 detailState.currentUser.userId === reply.userId;

    return (
        '<div class="reply">' +
            '<div class="comment_img"><img src="' + (reply.profileImg || '../img/interface/ProfileDefault.png') + '" alt="profile"/></div>' +
            '<div class="comment_content">' +
                '<div class="comment_header">' +
                    '<span class="comment_author">' + (reply.nickname || '익명') + '</span>' +
                    '<span class="comment_date">'   + (reply.createdAt ? reply.createdAt.substring(0,10) : '') + '</span>' +
                    (isMine ? '<button class="comment_delete_btn" data-comment-id="' + reply.commentId + '" style="margin-left:8px;border:none;background:none;color:#ccc;cursor:pointer;font-size:0.75rem;" onmouseover="this.style.color=\'#e74c3c\'" onmouseout="this.style.color=\'#ccc\'">삭제</button>' : '') +
                '</div>' +
                '<p class="comment_text">' + highlighted + '</p>' +
                '<div class="comment_actions">' +
                    '<button class="heart_btn ' + (reply.liked ? 'active' : '') + '" data-comment-id="' + reply.commentId + '">' +
                        '<img src="' + (reply.liked ? '../img/community/heart-fill.png' : '../img/community/heart.png') + '"/>' +
                        (reply.likeCount > 0 ? '<span>' + reply.likeCount + '</span>' : '') +
                    '</button>' +
                '</div>' +
            '</div>' +
        '</div>'
    );
}

function updatePostStats() {
    var total = detailState.comments.reduce(function(acc, c) {
        return acc + 1 + (c.replies ? c.replies.length : 0);
    }, 0);
    setElText('totalCommentCount',  total);
    setElText('totalCommentCount2', total);
    setElText('shortsTotalComment',  total);
    setElText('shortsTotalComment2', total);
}

/* ----------------------------------------------------------------
   11. 이벤트 리스너
---------------------------------------------------------------- */
function attachCommentEventListeners() {
    /* 댓글 삭제 */
    document.querySelectorAll('.comment_delete_btn').forEach(function(btn) {
        btn.onclick = function(e) {
            e.stopPropagation();
            handleDeleteComment(parseInt(this.dataset.commentId));
        };
    });
    /* 좋아요 */
    document.querySelectorAll('.heart_btn').forEach(function(btn) {
        btn.onclick = function() {
            toggleCommentLike(parseInt(this.dataset.commentId));
        };
    });
    /* 답글 */
    document.querySelectorAll('.reply_btn').forEach(function(btn) {
        btn.onclick = function() {
            toggleReplyInput(parseInt(this.dataset.commentId), this.dataset.targetAuthor);
        };
    });
    /* 답글 등록 */
    document.querySelectorAll('.reply_submit_btn').forEach(function(btn) {
        btn.onclick = function() { handleReplySubmit(parseInt(this.dataset.commentId)); };
    });
    document.querySelectorAll('.reply_input').forEach(function(input) {
        input.onkeypress = function(e) {
            if (e.key === 'Enter') handleReplySubmit(parseInt(this.dataset.commentId));
        };
    });
}

function setupDetailEventListeners() {
    var hb  = document.getElementById('postHeartBtn');
    var hb2 = document.getElementById('postHeartBtn2');
    if (hb)  hb.onclick  = togglePostHeart;
    if (hb2) hb2.onclick = togglePostHeart;

    var sb  = document.getElementById('submitCommentBtn');
    var sb2 = document.getElementById('submitCommentBtn2');
    var ci  = document.getElementById('commentInput');
    var ci2 = document.getElementById('commentInput2');
    if (sb)  sb.onclick  = handleCommentSubmit;
    if (sb2) sb2.onclick = handleCommentSubmit;
    if (ci)  ci.onkeypress  = function(e) { if (e.key === 'Enter') handleCommentSubmit(); };
    if (ci2) ci2.onkeypress = function(e) { if (e.key === 'Enter') handleCommentSubmit(); };
}

/* ----------------------------------------------------------------
   12. 게시글 좋아요
---------------------------------------------------------------- */
function togglePostHeart() {
    if (!getToken()) { alert('로그인이 필요합니다.'); return; }

    fetch(API_BASE + '/api/posts/' + PAGE_POST_ID + '/like', {
        method: 'POST', headers: authHeaders()
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
        var post = detailState.currentPost;
        if (!post) return;
        post.liked     = data.liked;
        post.likeCount = data.likeCount;  // 서버값 그대로 사용
        setElText('postHeartCount',   post.likeCount);
        setElText('postHeartCount2',  post.likeCount);
        setElText('shortsHeartCount', post.likeCount);

        // 커뮤니티 목록에서 하트 active 상태 유지용 localStorage 업데이트
        var likedPosts = {};
        try { likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}'); } catch(e) {}
        likedPosts[PAGE_POST_ID] = data.liked;
        localStorage.setItem('likedPosts', JSON.stringify(likedPosts));

        ['postHeartBtn', 'postHeartBtn2', 'shortsHeartBtn'].forEach(function(id) {
            var btn = document.getElementById(id);
            if (!btn) return;
            var img = btn.querySelector('img');
            if (img) img.src = data.liked ? '../img/community/heart-fill.png' : '../img/community/heart.png';
            btn.classList.toggle('active', data.liked);
        });
    })
    .catch(function(err) { console.error('좋아요 실패:', err); });
}

/* ----------------------------------------------------------------
   13. 댓글 작성
---------------------------------------------------------------- */
function handleCommentSubmit() {
    var inputId = detailState.isShorts ? 'shortsCommentInput'
                : detailState.isMedia  ? 'commentInput'
                : 'commentInput2';
    var input = document.getElementById(inputId);
    var text  = input ? input.value.trim() : '';
    if (!text) return;
    if (!getToken()) { alert('로그인이 필요합니다.'); return; }

    fetch(API_BASE + '/api/posts/' + PAGE_POST_ID + '/comments', {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ content: text })
    })
    .then(function(res) { return res.json(); })
    .then(function() {
        if (input) input.value = '';
        fetchComments(PAGE_POST_ID);
    })
    .catch(function(err) { console.error('댓글 작성 실패:', err); });
}

/* ----------------------------------------------------------------
   14. 대댓글 작성
---------------------------------------------------------------- */
function toggleReplyInput(commentId, targetAuthor) {
    var box   = document.getElementById('replyInput_' + commentId);
    var input = box ? box.querySelector('.reply_input') : null;
    if (!box || !input) return;

    if (box.style.display === 'none' || box.style.display === '') {
        document.querySelectorAll('.reply_input_box').forEach(function(el) { el.style.display = 'none'; });
        box.style.display = 'block';
        input.value = targetAuthor ? '@' + targetAuthor + ' ' : '';
        input.focus();
    } else {
        box.style.display = 'none';
    }
}

function handleReplySubmit(parentCommentId) {
    var input = document.querySelector('#replyInput_' + parentCommentId + ' .reply_input');
    var text  = input ? input.value.trim() : '';
    if (!text) return;
    if (!getToken()) { alert('로그인이 필요합니다.'); return; }

    fetch(API_BASE + '/api/posts/' + PAGE_POST_ID + '/comments', {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ content: text, parentId: parentCommentId })
    })
    .then(function(res) { return res.json(); })
    .then(function() { fetchComments(PAGE_POST_ID); })
    .catch(function(err) { console.error('대댓글 작성 실패:', err); });
}

/* ----------------------------------------------------------------
   15. 댓글 삭제
---------------------------------------------------------------- */
function handleDeleteComment(commentId) {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;

    fetch(API_BASE + '/api/posts/' + PAGE_POST_ID + '/comments/' + commentId, {
        method: 'DELETE', headers: authHeaders()
    })
    .then(function(res) {
        if (!res.ok) throw new Error('삭제 실패');
        fetchComments(PAGE_POST_ID);
    })
    .catch(function(err) {
        console.error(err);
        alert('댓글 삭제에 실패했습니다.');
    });
}

/* ----------------------------------------------------------------
   16. 댓글 좋아요
---------------------------------------------------------------- */
function toggleCommentLike(commentId) {
    if (!getToken()) { alert('로그인이 필요합니다.'); return; }

    fetch(API_BASE + '/api/posts/' + PAGE_POST_ID + '/comments/' + commentId + '/like', {
        method: 'POST', headers: authHeaders()
    })
    .then(function(res) { return res.json(); })
    .then(function() { fetchComments(PAGE_POST_ID); })
    .catch(function(err) { console.error('댓글 좋아요 실패:', err); });
}
