import { UserData } from "./Data.js";

// 1. URL에서 ordId 파라미터 가져오기
const params = new URLSearchParams(window.location.search);
const currentOrdId = params.get('ordId');

const container = document.getElementById("OrderInfoDetail_box");

const orderItems = (UserData.order ?? []).filter(o => o.ordId == currentOrdId);

if (orderItems.length > 0) {
    const orderData = orderItems[0];
    const sumPrice = orderItems.reduce((acc, cur) => acc + (cur.price * cur.qty), 0);
    const deliFee = orderData.deliFee;
    const totalPrice = sumPrice + deliFee;
    const payMethod = orderData.payMethod;

    const productsHTML = orderItems.map((product, idx) => `
        <div class="item-unit">
            <div class="img">
                <img src="${product.imgUrl}" alt="${product.name}" />
            </div>
            <div class="item-info">
                <p class="item-name">${product.name}</p>
                <p class="item-size">${product.size}</p>
                <p class="item-qty">${product.qty}개</p>
            </div>
            <div class="item-sub-info">
                <p class="item-price">${(product.price).toLocaleString()}원</p>
            </div>
        </div>
    `).join('');

    // 4. 전체 레이아웃 주입
    container.innerHTML = `
        <div class="item">
            <p class="date">${orderData.date}</p>
            <p class="id">주문번호: ${orderData.ordId}</p>
        </div>
        <div class="item">
            <p class="item-title">주문상품</p>
            <div class="item-box">
                ${productsHTML}
            </div>
        </div>
        <div class="item">
            <p class="item-title">배송지</p>
            <div class="deli-box">
                <p class="deli-name">${orderData.customerName || '받는 분 성함 없음'}</p>
                <p class="deli-address">${orderData.address || '주소 정보 없음'}</p>
                <p class="deli-tel">${orderData.phone || '연락처 정보 없음'}</p>
            </div>
        </div>
        <div class="pay">
            <p class="item-title">결제정보</p>
            <div class="pay-box">
                <div class="pay-left">
                    <p class="pay-text">상품금액</p>
                    <p class="pay-text">배송비</p>
                    <p class="pay-bold">결제금액</p>
                    <p class="pay-text">결제수단</p>
                </div>
                <div class="pay-right">
                    <p class="pay-text">${sumPrice.toLocaleString()}원</p>
                    <p class="pay-text">${deliFee === 0 ? "무료배송" : `${deliFee.toLocaleString()}원`}</p>
                    <p class="pay-bold">${totalPrice.toLocaleString()}원</p>
                    <p class="pay-text">${payMethod}</p>
                </div>
            </div>
        </div>
    `;
} else {
    container.innerHTML = `<div class="no-data">주문 정보를 찾을 수 없습니다.</div>`;
}