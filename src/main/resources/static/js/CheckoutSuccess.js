/* ================================================================
   CheckoutSuccess.js — 결제 성공 후 DB 저장 처리
================================================================ */
var API_BASE = '';

var params     = new URLSearchParams(window.location.search);
var paymentKey = params.get('paymentKey');
var orderId    = params.get('orderId');
var amount     = Number(params.get('amount'));
var recvName   = params.get('recvName') || '';
var phone      = params.get('phone')    || '';
var address    = params.get('address')  || '';
var deliFee    = Number(params.get('deliFee')) || 0;

var rawItems = [];
try {
    rawItems = JSON.parse(decodeURIComponent(params.get('items') || '[]'));
} catch(e) { console.error("아이템 파싱 에러:", e); }

// 🌟 [핵심] productId 누락 방지 (id가 있으면 productId로 복사)
var items = rawItems.map(function(item) {
    return {
        productId: item.productId || item.id,
        size: item.size || 'FREE',
        qty: item.qty || item.quantity || 1
    };
});

document.addEventListener('DOMContentLoaded', function() {
    if (!paymentKey || !orderId || !amount) {
        showFail('결제 정보가 올바르지 않습니다.');
        return;
    }

    // 세션 방식이므로 토큰 없이 바로 호출
    callConfirm();

    // 재로그인 버튼 이벤트 연결
    var reloginBtn = document.getElementById('btn-relogin');
    if (reloginBtn) reloginBtn.addEventListener('click', reloginAndRetry);
});

function callConfirm() {
    fetch(API_BASE + '/api/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // 🌟 세션 유지를 위해 필수!
        body: JSON.stringify({
            paymentKey: paymentKey,
            orderId:    orderId,
            amount:     amount,
            recvName:   recvName,
            phone:      phone,
            address:    address,
            deliFee:    deliFee,
            items:      items
        })
    })
        .then(function(res) {
            if (res.status === 401) {
                showRelogin();
                return null;
            }
            if (!res.ok) {
                return res.json().then(function(json) {
                    throw new Error(json.message || '주문 처리 중 오류가 발생했습니다.');
                });
            }
            return res.json();
        })
        .then(function(data) {
            if (data) showSuccess(data, amount);
        })
        .catch(function(err) {
            console.error("최종 에러:", err);
            showFail(err.message);
        });
}

// ... 나머지 showSuccess, showFail, reloginAndRetry 함수들도 그대로 아래에 붙여넣으세요 ...