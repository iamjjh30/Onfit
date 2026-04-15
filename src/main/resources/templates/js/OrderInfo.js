import {UserData} from "./Data.js";

const STATE_CLASS = { '구매확정': 'confirm', '배달완료': 'done' };

const groupedOrders = (UserData.order ?? [])
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
        <div class="item_box">
            <a href="./OrderInfoDetail.html?ordId=${ordId}">
                <div class="item">
                    <div class="img_box">
                        <img src="${item[0].imgUrl}" alt="${item[0].name}">
                    </div>
                    <div class="info">
                        <p class="state ${STATE_CLASS[state] ?? 'ready'}">${state}</p>
                        <p class="name">${item[0].name}${item.length > 1 ? ` 외 ${item.length - 1}건` : ''}</p>
                        <p class="price">${totalPrice.toLocaleString()}원</p>
                    </div>
                    <div class="sub_info">
                        <p class="sub_text">주문 상세 &gt;</p>
                        <p class="sub_text">${date}</p>
                    </div>
                </div>
            </a>
        </div>
    `).join('')
    : "<p class='No_item'>구매 내역이 없습니다.</p>";

document.getElementById("Order_container").innerHTML = `
    <div id="box">${renderOrders()}</div>
`;