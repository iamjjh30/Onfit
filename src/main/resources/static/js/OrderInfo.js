/* ================================================================
   OrderInfo.js — 주문 목록
   GET /api/orders → 내 주문 목록 조회
================================================================ */

var API_BASE = '';

// 주문 상태 → CSS 클래스 매핑
var STATE_CLASS = {
    '결제완료': 'ready',
    '배송중':   'ready',
    '구매확정': 'confirm',
    '배달완료': 'done',
    '취소':     'done'
};

/* ----------------------------------------------------------------
   주문 목록 조회
---------------------------------------------------------------- */
function fetchOrders() {
    // 백엔드 API 호출 (HttpSession 방식을 위해 credentials: 'include' 유지)
    fetch(API_BASE + '/api/orders', {
        method: 'GET',
        credentials: 'include' // 🌟 쿠키(세션 ID)를 서버로 보내기 위해 필수
    })
        .then(function(res) {
            if (res.status === 401) throw new Error('UNAUTHORIZED');
            if (!res.ok)            throw new Error('FETCH_FAIL');
            return res.json();
        })
        .then(function(orders) {
            renderOrders(orders);
        })
        .catch(function(err) {
            console.error(err);
            var msg = err.message === 'UNAUTHORIZED'
                ? '로그인이 만료되었습니다. 다시 로그인해 주세요.'
                : '주문 내역을 불러오지 못했습니다.';

            document.getElementById('Order_container').innerHTML =
                '<div id="box"><p class="No_item">' + msg + '</p></div>';

            if (err.message === 'UNAUTHORIZED') {
                // 비로그인 상태일 경우 로그인 페이지로 이동 (경로는 맞춰서 수정하세요)
                // window.location.href = '/login';
            }
        });
}

/* ----------------------------------------------------------------
   렌더링
---------------------------------------------------------------- */
function renderOrders(orders) {
    var container = document.getElementById('Order_container');

    if (!orders || orders.length === 0) {
        container.innerHTML = '<div id="box"><p class="No_item">구매 내역이 없습니다.</p></div>';
        return;
    }

    var html = orders.map(function(order) {
        var state      = order.status || '확인중';
        var items      = order.items  || [];
        var stateClass = STATE_CLASS[state] || 'ready';
        var firstItem  = items[0] || {};
        var extraText  = items.length > 1 ? ' 외 ' + (items.length - 1) + '건' : '';

        // 🌟 Spring Boot 날짜 형식 안전망 추가 (String, Array 모두 대응)
        var date = '';
        if (order.createdAt) {
            if (typeof order.createdAt === 'string') {
                date = order.createdAt.substring(0, 10);
            } else if (Array.isArray(order.createdAt)) {
                // 배열 형태 [2026, 4, 14, 15, 30] 로 올 경우 방어
                var y = order.createdAt[0];
                var m = String(order.createdAt[1]).padStart(2, '0');
                var d = String(order.createdAt[2]).padStart(2, '0');
                date = y + '-' + m + '-' + d;
            }
        }

        var imgSrc  = firstItem.imageUrl    || '';
        var imgAlt  = firstItem.productName || '상품명 없음';
        var name    = firstItem.productName || '상품명 없음';
        var price   = order.totalAmount != null
            ? order.totalAmount.toLocaleString() + '원'
            : '-';

        return (
            '<div class="item_box">' +
            '<a href="/OrderInfoDetail?orderId=' + order.orderId + '">' +
            '<div class="item">' +
            '<div class="img_box">' +
            '<img src="'  + imgSrc + '" alt="' + imgAlt + '" ' +
            'onerror="this.style.background=\'#f0f0f0\'">' +
            '</div>' +
            '<div class="info">' +
            '<p class="state ' + stateClass + '">' + state + '</p>' +
            '<p class="name">'  + name  + extraText + '</p>' +
            '<p class="price">' + price + '</p>' +
            '</div>' +
            '<div class="sub_info">' +
            '<p class="sub_text">주문 상세 &gt;</p>' +
            '<p class="sub_text">' + date + '</p>' +
            '</div>' +
            '</div>' +
            '</a>' +
            '</div>'
        );
    }).join('');

    container.innerHTML = '<div id="box">' + html + '</div>';
}

/* ----------------------------------------------------------------
   초기 실행
---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function() {
    fetchOrders();
});