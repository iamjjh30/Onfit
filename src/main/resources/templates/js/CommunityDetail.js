import { UserData, ShareData, ShareFitData } from "./Data.js";

/**
 * 1. 상태 관리 객체
 */
const detailState = {
    currentPost: null,
    postHeart: 0,
    isPostLiked: false,
    comments: [],
    currentUser: UserData
};

/**
 * 2. 초기 로드 및 실행
 */
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type'); // 'all' 또는 'media'
    const postId = urlParams.get('id');

    loadPostData(postId, type);
    setupDetailEventListeners();

    renderPostDetail(type); // 타입에 따른 레이아웃 렌더링
    renderComments();
});

/**
 * 데이터 로드: URL의 type에 따라 적절한 데이터셋(ShareData vs ShareFitData) 참조
 */
function loadPostData(postId, type) {
    const sourceData = (type === 'media') ? ShareFitData : ShareData;
    const postFound = sourceData.find(p => p.id == postId);

    if (postFound) {
        detailState.currentPost = postFound;
        detailState.postHeart = postFound.heartCnt || 0;
        detailState.comments = postFound.comments || [];
        sessionStorage.setItem('currentPost', JSON.stringify(postFound));
    } else {
        alert("게시글을 찾을 수 없습니다.");
        window.location.href = "./Community.html";
    }
}

/**
 * 레이아웃 렌더링: 타입에 따라 구성 요소의 display와 스타일 변경
 */
function renderPostDetail(type) {
    const post = detailState.currentPost;
    if (!post) return;

    const wrapper = document.getElementById('detailContentWrapper');
    const postImageBox = document.getElementById('postImageBox');
    const postImg = document.getElementById('postImage');
    const productBox = document.getElementById('productBox');

    // 공통 텍스트 삽입
    document.getElementById('postAuthorImg').src = post.profile || '../img/interface/ProfileDefault.png';
    document.getElementById('postAuthorName').textContent = post.name || "작성자";
    document.getElementById('postDate').textContent = post.date || "";
    document.getElementById('postText').textContent = post.desc || "";

    if (type === 'media') {
        wrapper.classList.add('media_layout');
        if (post.product) {
            productBox.style.display = 'flex';
            document.getElementById('productImg').src = post.product.img;
            document.getElementById('productName').textContent = post.product.name;
            document.getElementById('productPrice').textContent = post.product.price;
        } else {
            productBox.style.display = 'none';
        }

        if (post.img) {
            postImageBox.style.display = 'block';
            postImg.src = post.img;
            postImg.style.objectFit = "cover";
        }
    } else {
        wrapper.classList.remove('media_layout');

        if (post.img && post.img.trim() !== "") {
            postImageBox.style.display = 'block';
            postImg.src = post.img;
            postImageBox.style.aspectRatio = "unset";
            postImg.style.objectFit = "contain";
        } else {
            postImageBox.style.display = 'none';
        }
        if (post.product) {
            productBox.style.display = 'flex';
            document.getElementById('productImg').src = post.product.img;
            document.getElementById('productName').textContent = post.product.name;
            document.getElementById('productPrice').textContent = post.product.price;
        } else {
            productBox.style.display = 'none';
        }
    }
    updatePostStats();
}


// 멘션(@이름)을 찾아 span 태그로 감싸 시각적으로 강조하는 함수
function highlightMention(content) {
    const mentionRegex = /(@[^\s]+)/g;
    return content.replace(mentionRegex, '<span class="mention">$1</span>');
}

function createCommentHTML(comment) {
    const highlightedContent = highlightMention(comment.content);
    const repliesHTML = comment.replies?.map(reply => createReplyHTML(reply, comment.id)).join('') || '';

    return `
        <div class="comment_thread">
            <div class="comment">
                <div class="comment_img">
                    <img src="${comment.profile || '../img/interface/ProfileDefault.png'}" alt="profile" />
                </div>
                <div class="comment_content">
                    <div class="comment_header">
                        <span class="comment_author">${comment.author}</span>
                        <span class="comment_date">${comment.date}</span>
                    </div>
                    <p class="comment_text">${highlightedContent}</p>
                    <div class="comment_actions">
                        <button class="heart_btn ${comment.heartCnt > 0 ? 'active' : ''}" data-comment-id="${comment.id}">
                            <img src="${comment.heartCnt > 0 ? '../img/community/heart-fill.png' : '../img/community/heart.png'}" />
                            ${comment.heartCnt > 0 ? `<span>${comment.heartCnt}</span>` : ''}
                        </button>
                        <button class="reply_btn" data-comment-id="${comment.id}" data-target-author="${comment.author}">
                            <img src="../img/community/bubble.png" />
                            ${comment.replies?.length > 0 ? `<span>${comment.replies.length}</span>` : ''}
                        </button>
                    </div>
                    <div class="reply_input_box" id="replyInput_${comment.id}" style="display: none;">
                        <div class="reply_input_wrapper">
                            <input type="text" class="reply_input" placeholder="답글을 입력하세요..." data-comment-id="${comment.id}" />
                            <button class="reply_submit_btn" data-comment-id="${comment.id}">등록</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="replies_container">
                ${repliesHTML}
            </div>
        </div>
    `;
}

function createReplyHTML(reply, parentId) {
    const highlightedContent = highlightMention(reply.content);
    return `
        <div class="reply">
            <div class="comment_img">
                <img src="${reply.profile || '../img/interface/ProfileDefault.png'}" alt="profile" />
            </div>
            <div class="comment_content">
                <div class="comment_header">
                    <span class="comment_author">${reply.author}</span>
                    <span class="comment_date">${reply.date}</span>
                </div>
                <p class="comment_text">${highlightedContent}</p>
                <div class="comment_actions">
                    <button class="heart_btn ${reply.heartCnt > 0 ? 'active' : ''}" data-comment-id="${parentId}" data-reply-id="${reply.id}">
                        <img src="${reply.heartCnt > 0 ? '../img/community/heart-fill.png' : '../img/community/heart.png'}" />
                        ${reply.heartCnt > 0 ? `<span>${reply.heartCnt}</span>` : ''}
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderComments() {
    const container = document.getElementById('commentsSection');
    if (!container) return;
    if (detailState.comments.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">첫 댓글을 남겨보세요!</div>';
        return;
    }
    container.innerHTML = detailState.comments.map(comment => createCommentHTML(comment)).join('');
    attachCommentEventListeners();
}

function updatePostStats() {
    const heartCount = document.getElementById('postHeartCount');
    const commentCount = document.getElementById('totalCommentCount');
    if (heartCount) heartCount.textContent = detailState.postHeart;
    if (commentCount) {
        const count = detailState.comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);
        commentCount.textContent = count;
    }
}

function attachCommentEventListeners() {
    document.querySelectorAll('.heart_btn').forEach(btn => {
        btn.onclick = function() {
            const cId = parseInt(this.dataset.commentId);
            const rId = this.dataset.replyId ? parseInt(this.dataset.replyId) : null;
            toggleCommentHeart(cId, rId);
        };
    });
    document.querySelectorAll('.reply_btn').forEach(btn => {
        btn.onclick = function() {
            const cId = parseInt(this.dataset.commentId);
            const targetAuthor = this.dataset.targetAuthor;
            toggleReplyInput(cId, targetAuthor);
        };
    });
    document.querySelectorAll('.reply_submit_btn').forEach(btn => {
        btn.onclick = function() { handleReplySubmit(parseInt(this.dataset.commentId)); };
    });
    document.querySelectorAll('.reply_input').forEach(input => {
        input.onkeypress = function(e) { if (e.key === 'Enter') handleReplySubmit(parseInt(this.dataset.commentId)); };
    });
}

function toggleReplyInput(commentId, targetAuthor = null) {
    const box = document.getElementById(`replyInput_${commentId}`);
    const input = box.querySelector('.reply_input');
    if (box.style.display === 'none' || box.style.display === '') {
        document.querySelectorAll('.reply_input_box').forEach(el => el.style.display = 'none');
        box.style.display = 'block';
        input.value = targetAuthor ? `@${targetAuthor} ` : '';
        input.focus();
    } else {
        box.style.display = 'none';
    }
}

function handleCommentSubmit() {
    const input = document.getElementById('commentInput');
    const text = input.value.trim();
    if (!text) return;
    const newComment = { id: Date.now(), author: detailState.currentUser.nick || "사용자", date: "방금 전", content: text, profile: detailState.currentUser.profile, heartCnt: 0, replies: [] };
    detailState.comments.push(newComment);
    input.value = '';
    renderComments();
    updatePostStats();
}

function handleReplySubmit(commentId) {
    const input = document.querySelector(`#replyInput_${commentId} .reply_input`);
    const text = input.value.trim();
    if (!text) return;
    const newReply = { id: Date.now(), author: detailState.currentUser.nick || "사용자", date: "방금 전", content: text, profile: detailState.currentUser.profile, heartCnt: 0 };
    detailState.comments = detailState.comments.map(c => c.id === commentId ? { ...c, replies: [...(c.replies || []), newReply] } : c);
    renderComments();
    updatePostStats();
}

function toggleCommentHeart(cId, rId) {
    detailState.comments = detailState.comments.map(c => {
        if (c.id === cId && !rId) return { ...c, heartCnt: c.heartCnt ? 0 : 1 };
        if (c.id === cId && rId) return { ...c, replies: c.replies.map(r => r.id === rId ? { ...r, heartCnt: r.heartCnt ? 0 : 1 } : r) };
        return c;
    });
    renderComments();
}

function setupDetailEventListeners() {
    const postHeartBtn = document.getElementById('postHeartBtn');
    if (postHeartBtn) postHeartBtn.onclick = () => {
        detailState.isPostLiked = !detailState.isPostLiked;
        detailState.postHeart += detailState.isPostLiked ? 1 : -1;
        updatePostStats();
    };
    const submitBtn = document.getElementById('submitCommentBtn');
    if (submitBtn) submitBtn.onclick = handleCommentSubmit;
    const mainInput = document.getElementById('commentInput');
    if (mainInput) mainInput.onkeypress = (e) => { if (e.key === 'Enter') handleCommentSubmit(); };
}