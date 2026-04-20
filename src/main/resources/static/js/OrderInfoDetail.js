/* ================================================================
   OrderInfoDetail.js — 주문 상세
   GET /api/orders/{orderId} → 주문 상세 조회
================================================================ */

var API_BASE = ''; // 같은 도메인이면 비워두는 것이 안전합니다.

/* ----------------------------------------------------------------
   초기 실행
---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function() {
    var container = document.getElementById('OrderInfoDetail_box');
    var params  = new URLSearchParams(window.location.search);
    var orderId = params.get('orderId'); // URL에서 orderId 추출

    if (!orderId) {
        container.innerHTML = '<div class="no-data">주문 정보를 찾을 수 없습니다.</div>';
        return;
    }

    fetchOrderDetail(orderId, container);
});

/* ----------------------------------------------------------------
   주문 상세 조회
---------------------------------------------------------------- */
function fetchOrderDetail(orderId, container) {
    // 🌟 세션 방식을 위해 credentials: 'include' 사용
    fetch(API_BASE + '/api/orders/' + orderId, {
        method: 'GET',
        credentials: 'include'
    })
        .then(function(res) {
            if (res.status === 401) throw new Error('UNAUTHORIZED');
            if (res.status === 404) throw new Error('NOT_FOUND');
            if (!res.ok)            throw new Error('FETCH_FAIL');
            return res.json();
        })
        .then(function(order) {
            renderOrderDetail(order, container);
        })
        .catch(function(err) {
            console.error(err);
            var msg = {
                'UNAUTHORIZED': '로그인이 필요합니다.',
                'NOT_FOUND':    '해당 주문을 찾을 수 없습니다.',
            }[err.message] || '주문 정보를 불러오지 못했습니다.';
            container.innerHTML = '<div class="no-data">' + msg + '</div>';
        });
}

/* ----------------------------------------------------------------
   렌더링 (엔티티 필드명에 맞게 수정)
---------------------------------------------------------------- */
function renderOrderDetail(order, container) {
    var items       = order.items || [];
    var totalAmount = order.totalAmount || 0; // 🌟 totalPrice -> totalAmount
    var fullAddress   = order.receiverAddress || '';
    var addressParts  = fullAddress.split('||');
    var baseAddr      = addressParts[0] || '-';
    var detailAddr    = addressParts[1] ? ' ' + addressParts[1] : '';

    // 날짜 처리 (String 또는 Array 대응)
    var date = '';
    if (order.createdAt) {
        date = Array.isArray(order.createdAt)
            ? order.createdAt[0] + '-' + String(order.createdAt[1]).padStart(2,'0') + '-' + String(order.createdAt[2]).padStart(2,'0')
            : order.createdAt.substring(0, 10);
    }

    // 상품 합계 계산 (배송비 제외)
    var sumPrice = items.reduce(function(acc, i) {
        return acc + (i.price || 0) * (i.quantity || 1); // 🌟 qty -> quantity
    }, 0);

    /* ── 상품 목록 HTML ── */
    var productsHTML = items.map(function(item) {
        var unitPrice = ((item.price || 0) * (item.quantity || 1)).toLocaleString();
        return (
            '<div class="item-unit">' +
            '<div class="img">' +
            '<img src="' + (item.imageUrl || '') + '" ' + // 🌟 imgUrl -> imageUrl
            'alt="' + (item.productName || '') + '" ' +
            'onerror="this.src=\'../img/interface/no-image.png\'">' +
            '</div>' +
            '<div class="item-info">' +
            '<p class="item-name">' + (item.productName || '상품명 없음') + '</p>' +
            '<p class="item-size">사이즈: ' + (item.size || '-') + '</p>' +
            '<p class="item-qty">수량: '  + (item.quantity || 1)  + '개</p>' +
            '</div>' +
            '<div class="item-sub-info">' +
            '<p class="item-price">' + unitPrice + '원</p>' +
            '</div>' +
            '</div>'
        );
    }).join('');

    container.innerHTML =
        /* ── 주문 번호 / 날짜 ── */
        '<div class="section">' +
        '<p class="date">'     + date + '</p>' +
        '<p class="order-id">주문번호: ' + order.orderId + '</p>' +
        '</div>' +

        /* ── 주문 상품 ── */
        '<div class="section">' +
        '<p class="section-title">주문 상품</p>' +
        '<div class="item-box">' + productsHTML + '</div>' +
        '</div>' +

        /* ── 배송지 (엔티티 필드명 매핑) ── */
        '<div class="section">' +
        '<p class="section-title">배송 정보</p>' +
        '<div class="deli-box">' +
        '<p class="deli-name">받는 분: '    + (order.receiverName || '-') + '</p>' +
        '<p class="deli-address">주소: ' + baseAddr + detailAddr + '</p>'
        '<p class="deli-tel">연락처: '     + (order.receiverPhone    || '-') + '</p>' +
        '</div>' +
        '</div>' +

        /* ── 결제 정보 ── */
        '<div class="section">' +
        '<p class="section-title">결제 정보</p>' +
        '<div class="pay-box">' +
        '<div class="pay-row">' +
        '<p class="pay-label">상품합계</p>' +
        '<p class="pay-value">' + sumPrice.toLocaleString()   + '원</p>' +
        '</div>' +
        '<div class="pay-row pay-total">' +
        '<p class="pay-label">총 결제금액</p>' +
        '<p class="pay-value">' + totalAmount.toLocaleString() + '원</p>' +
        '</div>' +
        '<div class="pay-row">' +
        '<p class="pay-label">결제수단</p>' +
        '<p class="pay-value">' + (order.payMethod || '-') + '</p>' +
        '</div>' +
        '</div>' +
        '</div>';
}