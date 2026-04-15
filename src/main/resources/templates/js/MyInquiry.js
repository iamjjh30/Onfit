import { UserData } from "./Data.js";

const listContainer = document.getElementById("inquiry_list");

const renderInquiry = () => {
    // 1. 데이터 가져오기 및 최신순 정렬
    const inquiryData = UserData.inquiry || [];
    const sortedInquiry = [...inquiryData].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (sortedInquiry.length > 0) {
        listContainer.innerHTML = sortedInquiry.map(item => `
            <div class="item" id="item-${item.id}">
                <div class="ask" onclick="toggleAccordion(${item.id})">
                    <div class="header-left">
                        <p class="subject">${item.title}</p>
                        <span class="date">${item.date}</span>
                    </div>
                    <span class="status ${item.isAnswered ? 'done' : 'waiting'}">
                        ${item.isAnswered ? "답변 완료" : "답변 대기"}
                    </span>
                </div>

                <div class="content" id="content-${item.id}">
                    <div class="answer-box">
                        <p class="answer-text">${item.isAnswered ? item.answer : "곧 답변을 드릴 예정입니다. 조금만 기다려주세요."}</p>
                    </div>
                </div>
            </div>
        `).join('');
    } else {
        listContainer.innerHTML = '<p class="noItem">문의 내역이 없습니다.</p>';
    }
};

// 3. 아코디언 토글 (상태 유지 방식)
window.toggleAccordion = (id) => {
    const content = document.getElementById(`content-${id}`);
    const item = document.getElementById(`item-${id}`);

    // 현재 클릭한 것의 열림 여부 확인
    const isOpen = content.classList.contains('open');

    // 다른 모든 항목 닫기 (선택 사항: 하나만 열리게 하고 싶을 때)
    document.querySelectorAll('.content').forEach(el => el.classList.remove('open'));
    document.querySelectorAll('.item').forEach(el => el.classList.remove('active'));

    // 닫혀있었다면 열기
    if (!isOpen) {
        content.classList.add('open');
        item.classList.add('active');
    }
};

renderInquiry();