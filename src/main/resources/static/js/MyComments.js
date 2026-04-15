import {UserData} from "./Data.js";

const CommentsContainer = document.getElementById("content");
const renderComments = () => {
    const commentsPosts = UserData.commentedPosts;

    if (commentsPosts && commentsPosts.length > 0) {
        const commentHTML = commentsPosts.map(item => {
            if(!item)
                return CommentsContainer.innerHTML = `
                    <p class="no-item">아직 남긴 댓글이 없습니다. <br /> 댓글을 작성해보세요!</p>
                `;
            return`
            <div class="item" data-id="${item.id}">
                <div class="PostTitle">
                    <p>${item.title}</p>
                </div>
                <div class="MyComments">
                    <span style="padding-right:14px">&#8627;</span><span>${item.MyComment}</span>
                </div>
            </div>
        `}).join('');
        CommentsContainer.innerHTML = `<div class="list">${commentHTML}</div>`;
    }};

CommentsContainer.addEventListener('click', (e) => {
    const item = e.target.closest('.item');
    if (item) {
        const postId = item.dataset.id;
        location.href = `./ShareFitDetail.html?id=${postId}`;
    }
});

// 실행
renderComments();