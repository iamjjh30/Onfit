/* ================================================================
   Checkout.js — 토스페이먼츠 v1 API 개별 연동 버전
   결제수단을 버튼으로 선택 → 해당 수단으로 토스 결제창 호출
   → CheckoutSuccess에서 POST /api/confirm → 실제 결제수단 DB 저장
   mode=direct : itemDetail 즉시구매
   mode=cart   : 장바구니 구매 (기본값)
================================================================ */

var API_BASE = 'http://localhost:8080';

// !! 본인의 API 개별 연동 클라이언트 키로 교체하세요
var CLIENT_KEY = 'test_ck_DpexMgkW36wNbepd4OWdVGbR5ozO';

function getToken() { return localStorage.getItem('token'); }
function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
    };
}

/* ----------------------------------------------------------------
   1. 상태
---------------------------------------------------------------- */
var cartItems         = [];
var sumPrice          = 0;
var deliPrice         = 0;
var totalPrice        = 0;
var selectedPayMethod = '카드';  // 기본값

var urlParams = new URLSearchParams(window.location.search);
var MODE      = urlParams.get('mode') === 'direct' ? 'direct' : 'cart';

// 토스 결제수단 코드 매핑
// 버튼 data-method → 토스 requestPayment() 첫 번째 인자
var PAY_METHOD_MAP = {
    '카드':     '카드',
    '카카오페이': '카카오페이',
    '네이버페이': '네이버페이',
    '토스페이':  '토스페이',
    '계좌이체':  '계좌이체'
};

/* ----------------------------------------------------------------
   2. 진입점
---------------------------------------------------------------- */
function init() {
    initPayMethodBtns();
    if (MODE === 'direct') {
        initDirect();
    } else {
        fetchCartAndInit();
    }
}

/* ----------------------------------------------------------------
   3. 결제수단 버튼 이벤트
---------------------------------------------------------------- */
function initPayMethodBtns() {
    document.querySelectorAll('.pay-method-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.pay-method-btn')
                .forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            selectedPayMethod = btn.dataset.method;
        });
    });
}

/* ----------------------------------------------------------------
   4-A. 직접구매
---------------------------------------------------------------- */
function initDirect() {
    var productId = urlParams.get('productId');
    var name      = urlParams.get('name')   || '상품';
    var price     = Number(urlParams.get('price'))  || 0;
    var imgUrl    = urlParams.get('imgUrl') || '';
    var size      = urlParams.get('size')   || '';
    var qty       = Number(urlParams.get('qty'))    || 1;

    if (!productId) { alert('잘못된 접근입니다.'); history.back(); return; }

    cartItems = [{
        productId: Number(productId), productName: name,
        price: price, imgUrl: imgUrl, size: size, qty: qty
    }];

    sumPrice   = price * qty;
    deliPrice  = sumPrice >= 50000 ? 0 : 5000;
    totalPrice = sumPrice + deliPrice;

    renderCheckoutItems();
    renderSummary();
    positionSummary();
}

/* ----------------------------------------------------------------
   4-B. 장바구니 구매
---------------------------------------------------------------- */
function fetchCartAndInit() {
    fetch(API_BASE + '/api/cart', { headers: authHeaders() })
    .then(function(res) {
        if (!res.ok) throw new Error('장바구니 조회 실패');
        return res.json();
    })
    .then(function(data) {
        cartItems  = data;
        sumPrice   = cartItems.reduce(function(acc, i) { return acc + i.price * i.qty; }, 0);
        deliPrice  = (sumPrice === 0 || sumPrice >= 50000) ? 0 : 5000;
        totalPrice = sumPrice + deliPrice;
        renderCheckoutItems();
        renderSummary();
        positionSummary();
    })
    .catch(function(err) {
        console.error(err);
        alert('장바구니 정보를 불러오지 못했습니다. 로그인 상태를 확인해주세요.');
    });
}

/* ----------------------------------------------------------------
   5. 주문 상품 렌더링 (Checkout.js)
---------------------------------------------------------------- */
function renderCheckoutItems() {
    var container = document.getElementById('checkout-items');
    if (!container) return;
    container.innerHTML = cartItems.map(function(item) {
        // 🌟 수정: item.name과 item.productName 모두 호환되도록 변경
        var itemName = item.name || item.productName || '상품명 없음';

        return (
            '<div class="checkout-item">' +
            '<img src="' + item.imgUrl + '" alt="' + itemName + '">' +
            '<div class="checkout-item-info">' +
            '<p class="checkout-item-name">' + itemName + '</p>' +
            '<p class="checkout-item-meta">' + item.size + ' · ' + item.qty + '개</p>' +
            '</div>' +
            '<p class="checkout-item-price">' +
            (item.price * item.qty).toLocaleString() + '원' +
            '</p>' +
            '</div>'
        );
    }).join('');
}

/* ----------------------------------------------------------------
   6. 금액 요약 렌더링
---------------------------------------------------------------- */
function renderSummary() {
    var pd = document.getElementById('summary-product');
    var dd = document.getElementById('summary-delivery');
    var td = document.getElementById('summary-total');
    if (pd) pd.textContent = sumPrice.toLocaleString() + '원';
    if (dd) dd.textContent = deliPrice === 0 ? '무료배송' : deliPrice.toLocaleString() + '원';
    if (td) td.textContent = totalPrice.toLocaleString() + '원';
}

/* ----------------------------------------------------------------
   7. 결제 요청 (토스 v1 requestPayment) 일부 수정
---------------------------------------------------------------- */
function requestPayment() {
    var btn      = document.getElementById('pay-btn');
    var recvName = document.getElementById('input-name').value.trim();
    var phone    = document.getElementById('input-phone').value.trim();
    var address  = document.getElementById('input-address').value.trim();

    if (!recvName || !phone || !address) {
        alert('배송지 정보를 모두 입력해주세요.');
        return;
    }
    if (!cartItems.length) {
        alert('주문 상품이 없습니다.');
        return;
    }

    // 🌟 수정: 토스 결제창에 넘어가는 대표 주문명도 호환되도록 변경
    var firstItemName = cartItems[0].name || cartItems[0].productName || '상품';
    var orderName = cartItems.length > 1
        ? firstItemName + ' 외 ' + (cartItems.length - 1) + '건'
        : firstItemName;

    var orderId = 'ONFIT-' + Date.now();

    // 🌟 스프링 부트 컨트롤러로 넘길 배송지 + 상품 정보 세팅
    var extraQuery = new URLSearchParams({
        recvName: recvName,
        phone:    phone,
        address:  address,
        deliFee:  deliPrice,
        items:    JSON.stringify(cartItems.map(function(item) {
            console.log("아이템 데이터 확인:", item);

            var actualId = item.productId || item.id || item.itemNo;

            return {
                productId: actualId,
                size:      item.size || 'FREE',
                qty:       item.qty || item.quantity || 1
            };
        }))
    }).toString();

    // 🌟 변경된 부분: 정적 HTML 대신 스프링 부트 API 주소로 리다이렉트
    var successUrl = window.location.origin + '/api/payment/success?' + extraQuery;
    var failUrl    = window.location.origin + '/api/payment/fail';

    btn.disabled    = true;
    btn.textContent = '결제 처리 중...';

    var tossPayments = TossPayments(CLIENT_KEY);
    var tossMethods  = PAY_METHOD_MAP[selectedPayMethod] || '카드';

    tossPayments.requestPayment(tossMethods, {
        amount:           totalPrice,
        orderId:          orderId,
        orderName:        orderName,
        customerName:     recvName,
        successUrl:       successUrl,
        failUrl:          failUrl,
    })
        .catch(function(err) {
            btn.disabled    = false;
            btn.textContent = '결제하기';
            if (err.code === 'USER_CANCEL') return;
            console.error('결제 오류:', err);
            var failParams = new URLSearchParams({
                code:    err.code    || 'UNKNOWN',
                message: err.message || '결제 요청 중 오류가 발생했습니다.',
                orderId: orderId
            });
            window.location.href = failUrl + '?' + failParams.toString();
        });
}

/* ----------------------------------------------------------------
   8. summary 위치 조정
---------------------------------------------------------------- */
function positionSummary() {
    var right   = document.getElementById('checkout-right');
    var summary = document.getElementById('checkout-summary');
    if (!right || !summary) return;
    var rightRect    = right.getBoundingClientRect();
    var firstSection = document.querySelector('.checkout-section');
    var topVal = 192;
    if (firstSection) {
        topVal = firstSection.getBoundingClientRect().top + window.scrollY;
    }
    summary.style.left  = rightRect.left + 'px';
    summary.style.width = rightRect.width + 'px';
    summary.style.top   = topVal + 'px';
    summary.classList.add('summary-ready');
}

/* ----------------------------------------------------------------
   9. 초기화
---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function() {
    init();
    var payBtn = document.getElementById('pay-btn');
    if (payBtn) payBtn.addEventListener('click', requestPayment);
    window.addEventListener('resize', positionSummary);
});
