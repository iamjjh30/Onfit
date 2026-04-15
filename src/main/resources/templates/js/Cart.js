import {UserData} from "./Data.js";

const item = UserData.cartItem;

let deliPrice = 5000;
const CartContainer = document.getElementById("Cart_container");

if (item && item.length > 0) {
    const CartHtml =
        item.map(item => {
            const prdPrice = item.price * item.qty;
            return `
             <div class="box">
                <a class="link" href="./ProductDetail.html">
                    <img src="${item.imgUrl}" alt=${item.prdName}>
                </a>
                <div class="text">
                    <p class="name">${item.prdName}</p>
                    <p class="size">${item.size}</p>
                    <p class="qty">${item.qty}개</p>
                    <button class="opt_btn">옵션변경</button>
                </div>     
                <div class="sub">
                    <p class="price">${prdPrice.toLocaleString()}원</p>
                    <button class="del_btn">삭제</button>
                </div>
             </div>
    `}).join('');

    const sumPrice = item.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);

    if (sumPrice >= 50000) {
        deliPrice = 0;
    }
    const totalPrice = sumPrice + deliPrice;

    CartContainer.innerHTML = `
        <div id="Cart_wrap">
            <div id="list_section">${CartHtml}</div>
            <div id="info_box">
                <div class="info_row">
                    <p>상품금액</p>
                    <p>${sumPrice.toLocaleString()}원</p>
                </div>
                <div class="info_row">
                    <p>배송비</p>
                    <p>${deliPrice === 0 ? "무료배송" : `${deliPrice.toLocaleString()}원`}</p>
                </div>
                <div id="total">
                    <p>총 금액</p>
                    <p>${totalPrice.toLocaleString()}원</p>
                </div>
                <button id="buy" type="button">구매하기</button>
            </div>
        </div>
    `;
}
else {
    CartContainer.innerHTML = `
        <div class="box">
            <p id="no_item">장바구니에 상품이 없습니다.</p>
        </div>`;
}