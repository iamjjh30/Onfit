import { UserData } from './Data.js';

const savedResult = localStorage.getItem('personalColorResult');
if (savedResult) {
    const result = JSON.parse(savedResult);
    const tone = result.tone;

    if (tone.includes('봄') || tone.includes('가을')) UserData.color = 'W';
    else if (tone.includes('여름') || tone.includes('겨울')) UserData.color = 'C';
    else UserData.color = 'N';

    UserData.toneName = tone;
    UserData.bestColors = result.best_colors || [];
}

const COLOR_MAP = {
    C: { id: 'Cool',    name: '쿨' },
    W: { id: 'Warm',    name: '웜' },
    N: { id: 'Neutral', name: '뉴트럴' },
};
const color = COLOR_MAP[UserData.color];
const previewItems = UserData.cartItem?.slice(0, 4) ?? [];

const renderProfile = () => `
    <div id="user_img_box">
        <img src="${UserData.profile}" alt="사용자 프로필 사진">
    </div>
    <div id="user_text">
        <p id="user_nick">${UserData.nick}</p>
        <a href="./PwdCheck.html">내 정보</a>
    </div>
`;

const renderColor = () => color ? `
    <p class="color_title">내 컬러는 <span id="${color.id}">${UserData.toneName || color.name + '톤'}</span></p>
    <div class="color_box">
        <p class="color_text">추천하는 컬러 팔레트를 알아보세요.</p>
        <div id="color_item_box">
            ${UserData.bestColors?.length > 0
    ? UserData.bestColors.slice(0, 5).map(c =>
        `<div style="background-color:${c}; width:40px; height:40px; border-radius:50%; display:inline-block;" title="${c}"></div>`
    ).join('')
    : Array.from({ length: 5 }, (_, i) => `<div id="color_item${i + 1}"></div>`).join('')
}
        </div>
    </div>
    <div class="color_box">
        <p class="color_text">퍼스널 컬러에 맞는 옷을 알아볼까요?</p>
        <div id="color_product_box">
            ${previewItems.map(({ prdId, imgUrl, prdName }) => `
                <a href="./Product_detail${prdId}">
                    <div class="color_prd_wrapper">
                        <div class="color_prd">
                            <img src="${imgUrl}" alt="${prdName}">
                        </div>
                    </div>
                </a>
            `).join('')}
        </div>
    </div>
    <a href="/" class="link">진단 다시 받기 &gt;</a>
` : `
    <p class="color_title">내 컬러는 ?</p>
    <div id="color-box">
        <p class="color-text">진단 결과가 없습니다. <br/>간단하게 진단을 받아보세요!</p>
        <a href="/" class="link">진단 바로가기 &gt;</a>
    </div>
`;
const renderCart = () => previewItems.length > 0 ? `
    ${previewItems.map(({ prdId, imgUrl, prdName, price }) => `
        <a href="./Product_detail${prdId}">
            <div class="Cart_item">
                <img src="${imgUrl}" alt="${prdName}">
                <p class="Cart_item_name">${prdName}</p>
                <p class="Cart_item_price">${price?.toLocaleString()}원</p>
            </div>
        </a>
    `).join('')}
` : "<p class='No_item'>장바구니가 비어있습니다.</p>";

// 주문내역
const today = new Date();
const lastWeek = new Date(today);
lastWeek.setDate(today.getDate() - 7);

const STATE_CLASS = { '구매확정': 'confirm', '배달완료': 'done' };

const groupedOrders = (UserData.order ?? [])
    .filter(({ date }) => { const d = new Date(date); return d >= lastWeek && d <= today; })
    .reduce((acc, cur) => {
        const found = acc.find(({ ordId }) => ordId === cur.ordId);
        found
            ? (found.item.push(cur), found.totalPrice += cur.price * cur.qty)
            : acc.push({ ...cur, item: [cur], totalPrice: cur.price * cur.qty });
        return acc;
    }, [])
    .sort((a, b) => new Date(b.date) - new Date(a.date));

const renderOrders = () => groupedOrders.length > 0 ?
    groupedOrders.map(({ ordId, state, item, totalPrice, date }) => `
        <div class="Order_wrap">
            <a href="./OrderInfoDetail.html?ordId=${ordId}">
                <div class="Order_item">
                    <div class="Order_img_box">
                        <img src="${item[0].imgUrl}" alt="${item[0].name}">
                    </div>
                    <div class="Order_info">
                        <p class="Order_state ${STATE_CLASS[state] ?? 'ready'}">${state}</p>
                        <p class="Order_name">${item[0].name}${item.length > 1 ? ` 외 ${item.length - 1}건` : ''}</p>
                        <p class="Order_price">${totalPrice.toLocaleString()}원</p>
                    </div>
                    <div class="Order_sub_info">
                        <p class="Order_sub_text">주문 상세 &gt;</p>
                        <p class="Order_sub_text">${date}</p>
                    </div>
                </div>
            </a>
        </div>
    `).join('')
    : "<p class='No_item'>최근 일주일 간 구매 내역이 없습니다.</p>";


document.getElementById('main').innerHTML = `
    <section id="user">
        <div id="user_profile">${renderProfile()}</div>
        <div id="user_color">${renderColor()}</div>
    </section>

    <section id="Cart_container">
        <p class="title">장바구니</p>
        <div id="Cart_box">${renderCart()}</div>
         ${previewItems.length > 0 ? `<a href="./Cart.html" class="link">전체보기 &gt;</a>` : ''}
    </section>

    <section id="Order_container">
        <p class="title">주문내역</p>
        <div id="Order_box">${renderOrders()}</div>
        <a href="./OrderInfo.html" class="link">전체보기 &gt;</a>
    </section>

    <form id="inquiryForm">
        <p class="title">문의하기</p>
        <div id="inquiry_box">
            <p id="inquiry_text">문의할 내용이 있으신가요?</p>
            <div id="inquiry_wrap">
                <textarea id="content" placeholder="문의 내용을 입력하세요"></textarea>
                <button type="submit">문의하기</button>
            </div>
        </div>
        <a href="./MyInquiry.html">문의 내역 조회</a>
    </form>
`;

document.getElementById('inquiryForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const content = document.getElementById('content');
    const msgContainer = document.getElementById('msg');
    const isValid = content.value.trim();

    msgContainer.innerHTML = `
        <div class="msg-box">
            <span>${isValid ? '문의가 정상적으로 접수되었습니다.' : '내용을 입력해주세요.'}</span>
        </div>
    `;
    if (isValid) { console.log('전송 내용:', content.value); content.value = ''; }
    setTimeout(() => { msgContainer.innerHTML = ''; }, 3000);
});