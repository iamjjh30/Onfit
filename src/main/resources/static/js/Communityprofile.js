/* ================================================================
   CommunityProfile.js
   - 내 프로필 조회 & 이미지 변경
   - 탭: 내 게시글 / 내 댓글 / 좋아요한 글
================================================================ */

var currentTab = 'posts';
var profileData = null;

/* ── 초기화 ── */
document.addEventListener('DOMContentLoaded', function () {
    fetchProfile();
    setupTabs();
    setupAvatarUpload();
});

/* ── 프로필 로드 ── */
function fetchProfile() {
    fetch('/api/members/me', { credentials: 'include' })
        .then(function (r) {
            if (r.status === 401) {
                toast('로그인이 필요합니다.', '/login');
                return null;
            }
            if (!r.ok) throw new Error();
            return r.json();
        })
        .then(function (data) {
            if (!data) return;
            profileData = data;
            renderProfile(data);
            // 세 탭 카운트 병렬 로드
            fetchAllCounts();
            // 기본 탭은 posts
            loadTab('posts');
        })
        .catch(function () {
            toast('프로필을 불러오지 못했습니다.');
        });
}

function renderProfile(data) {
    var img = document.getElementById('profileImg');
    if (img && data.profileImg) img.src = data.profileImg;

    var name = document.getElementById('profileName');
    if (name) name.textContent = data.name || '—';

    var email = document.getElementById('profileEmail');
    if (email) email.textContent = data.email || '—';
}

/* ── 전체 카운트 병렬 로드 ── */
function fetchAllCounts() {
    var urlMap = {
        posts:    '/api/posts/my/posts',
        comments: '/api/posts/my/comments',
        likes:    '/api/posts/my/likes'
    };
    Object.keys(urlMap).forEach(function (tab) {
        fetch(urlMap[tab], { credentials: 'include' })
            .then(function (r) { return r.ok ? r.json() : []; })
            .then(function (data) { updateStat(tab, data.length); })
            .catch(function () {});
    });
}

/* ── 탭 ── */
function setupTabs() {
    document.querySelectorAll('.profile-tab').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.profile-tab').forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');
            currentTab = this.getAttribute('data-tab');
            loadTab(currentTab);
        });
    });
}

function loadTab(tab) {
    var content = document.getElementById('tabContent');
    content.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><span>불러오는 중...</span></div>';

    var urlMap = {
        posts:    '/api/posts/my/posts',
        comments: '/api/posts/my/comments',
        likes:    '/api/posts/my/likes'
    };

    fetch(urlMap[tab], { credentials: 'include' })
        .then(function (r) {
            if (r.status === 401) { toast('로그인이 필요합니다.', '/login'); return null; }
            if (!r.ok) throw new Error();
            return r.json();
        })
        .then(function (data) {
            if (!data) return;

            if (!data.length) {
                var emptyMsg = { posts: '작성한 게시글이 없어요.', comments: '작성한 댓글이 없어요.', likes: '좋아요한 게시글이 없어요.' };
                content.innerHTML = '<div class="no-data">' + emptyMsg[tab] + '</div>';
                return;
            }

            if (tab === 'posts')    renderPosts(data, content);
            if (tab === 'comments') renderComments(data, content);
            if (tab === 'likes')    renderPosts(data, content);
        })
        .catch(function () {
            content.innerHTML = '<div class="no-data">불러오지 못했습니다.</div>';
        });
}

function updateStat(tab, count) {
    var idMap = { posts: 'statPosts', comments: 'statComments', likes: 'statLikes' };
    var el = document.getElementById(idMap[tab]);
    if (el) el.textContent = count;
}

/* ── 게시글 렌더링 ── */
function renderPosts(posts, container) {
    container.innerHTML = posts.map(function (p) {
        var dateStr   = p.createdAt ? p.createdAt.substring(0, 10) : '';
        var cleanText = (p.content || p.title || '').replace(/\[상품:\d+:[^\]]*\]/g, '').replace(/\[상품:\d+\]/g, '').trim();

        // 첫 번째 이미지 추출
        var thumbUrl = '';
        if (p.imgUrl) {
            try {
                var parsed = JSON.parse(p.imgUrl);
                thumbUrl = Array.isArray(parsed) ? parsed[0] : parsed;
            } catch (e) {
                thumbUrl = p.imgUrl;
            }
        }
        var thumbHTML = thumbUrl
            ? '<div class="post-item-thumb"><img src="' + thumbUrl + '" alt="썸네일" onerror="this.parentElement.style.display=\'none\'"></div>'
            : '';

        return '<div class="post-item" data-post-id="' + p.postId + '">' +
            '<div class="post-item-inner">' +
            '<div class="post-item-body">' +
            '<div class="post-item-meta">' +
            '<span class="category-badge">' + escHtml(p.type || '일반') + '</span>' +
            '<span class="post-item-date">' + dateStr + '</span>' +
            '</div>' +
            (cleanText ? '<p class="post-item-text">' + escHtml(cleanText) + '</p>' : '') +
            '</div>' +
            thumbHTML +
            '</div>' +
            '<div class="post-item-footer">' +
            '<span class="post-item-stat">' +
            '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>' +
            (p.likeCount || 0) + '</span>' +
            '<span class="post-item-stat">' +
            '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>' +
            (p.commentCount || 0) + '</span>' +
            '</div>' +
            '</div>';
    }).join('');

    container.querySelectorAll('.post-item').forEach(function (el) {
        el.addEventListener('click', function () {
            window.location.href = '/community/' + this.getAttribute('data-post-id');
        });
    });
}

/* ── 댓글 렌더링 ── */
function renderComments(comments, container) {
    container.innerHTML = comments.map(function (c) {
        var dateStr = c.createdAt ? c.createdAt.substring(0, 10) : '';
        return '<div class="comment-item" data-post-id="' + c.postId + '">' +
            '<div class="comment-origin">' +
            '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>' +
            '<strong>' + escHtml(c.postTitle || '게시글') + '</strong>에 남긴 댓글' +
            '</div>' +
            '<p class="comment-text">' + escHtml(c.content || '') + '</p>' +
            '<p class="comment-date">' + dateStr + '</p>' +
            '</div>';
    }).join('');

    container.querySelectorAll('.comment-item').forEach(function (el) {
        el.addEventListener('click', function () {
            window.location.href = '/community/' + this.getAttribute('data-post-id') + '#comments';
        });
    });
}

/* ── 프로필 이미지 변경 (크롭) ── */
function setupAvatarUpload() {
    var btn     = document.getElementById('avatarEditBtn');
    var input   = document.getElementById('avatarFileInput');
    var img     = document.getElementById('profileImg');
    var overlay = document.getElementById('cropModalOverlay');
    var cropImg = document.getElementById('cropImage');
    var saveBtn = document.getElementById('cropSave');
    var cancelBtn = document.getElementById('cropCancel');
    var closeBtn  = document.getElementById('cropModalClose');
    var cropper = null;

    if (btn) btn.addEventListener('click', function () { input.click(); });

    if (input) {
        input.addEventListener('change', function () {
            var file = this.files[0];
            if (!file) return;

            if (file.size > 5 * 1024 * 1024) {
                toast('이미지는 5MB 이하만 업로드 가능해요.');
                this.value = '';
                return;
            }

            var reader = new FileReader();
            reader.onload = function (e) {
                cropImg.src = e.target.result;
                overlay.classList.add('active');

                // 이전 cropper 제거 후 새로 생성
                if (cropper) { cropper.destroy(); cropper = null; }
                cropper = new Cropper(cropImg, {
                    aspectRatio: 1,
                    viewMode: 1,
                    dragMode: 'move',
                    autoCropArea: 1,
                    cropBoxResizable: false,
                    cropBoxMovable: false,
                    toggleDragModeOnDblclick: false,
                    background: false,
                });
            };
            reader.readAsDataURL(file);
            this.value = '';
        });
    }

    function closeCropModal() {
        overlay.classList.remove('active');
        if (cropper) { cropper.destroy(); cropper = null; }
    }

    if (cancelBtn) cancelBtn.addEventListener('click', closeCropModal);
    if (closeBtn)  closeBtn.addEventListener('click',  closeCropModal);
    if (overlay)   overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeCropModal();
    });

    if (saveBtn) {
        saveBtn.addEventListener('click', function () {
            if (!cropper) return;
            saveBtn.disabled = true;
            saveBtn.textContent = '저장 중...';

            var canvas = cropper.getCroppedCanvas({ width: 400, height: 400 });
            var base64 = canvas.toDataURL('image/jpeg', 0.85);

            fetch('/api/members/me/profile-image', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profileImg: base64 })
            })
                .then(function (r) {
                    if (r.status === 401) { toast('로그인이 필요합니다.', '/login'); return null; }
                    if (r.status === 400) return r.json().then(function (d) { throw new Error(d.message); });
                    if (!r.ok) throw new Error();
                    return r.json();
                })
                .then(function (data) {
                    if (!data) return;
                    if (img) img.src = base64;
                    closeCropModal();
                    toast('프로필 이미지가 변경됐어요.');
                })
                .catch(function (e) {
                    toast(e.message || '이미지 업로드에 실패했습니다.');
                })
                .finally(function () {
                    saveBtn.disabled = false;
                    saveBtn.textContent = '저장';
                });
        });
    }
}

/* ── 유틸 ── */
function escHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function toast(msg, redirect) {
    var toastEl = document.getElementById('toast');
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.className = 'toast-show';
    setTimeout(function () {
        toastEl.className = '';
        if (redirect) window.location.href = redirect;
    }, 1200);
}