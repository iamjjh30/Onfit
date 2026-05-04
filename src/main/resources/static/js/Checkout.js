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

var selectedCoupon  = null; // 선택된 쿠폰 객체
var discountPrice   = 0;    // 할인 금액

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
    initSameAsOrderer(); // 🌟 추가
    initAddressSearch();
    loadCoupons();
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

    // 🌟 할인 반영
    totalPrice = Math.max(0, sumPrice + deliPrice - discountPrice);
    if (td) td.textContent = totalPrice.toLocaleString() + '원';
}

/* ----------------------------------------------------------------
   7. 결제 요청 (토스 v1 requestPayment) 일부 수정
---------------------------------------------------------------- */
function requestPayment() {
    var btn      = document.getElementById('pay-btn');
    var recvName = document.getElementById('input-name').value.trim();
    var phone    = document.getElementById('input-phone').value.trim();
    var baseAddress   = document.getElementById('input-address').value.trim();
    var detailAddress = document.getElementById('input-address-detail').value.trim();
    var address = detailAddress ? baseAddress + ' ' + detailAddress : baseAddress;
    var extraQuery = new URLSearchParams({
        recvName: recvName,
        phone:    phone,
        address:  address,
        deliFee:  deliPrice,
        couponId: selectedCoupon ? selectedCoupon.id : '',  // 🌟 추가
        items:    JSON.stringify(cartItems.map(function(item) {
            var actualId = item.productId || item.id || item.itemNo;
            return { productId: actualId, size: item.size || 'FREE', qty: item.qty || item.quantity || 1 };
        }))
    }).toString();

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
/* ----------------------------------------------------------------
   주문자 정보와 동일 체크박스
---------------------------------------------------------------- */
function initSameAsOrderer() {
    var checkbox = document.getElementById('same-as-orderer');
    if (!checkbox) return;

    checkbox.addEventListener('change', function() {
        if (!this.checked) {
            // 체크 해제 시 입력값 비우기
            document.getElementById('input-name').value    = '';
            document.getElementById('input-phone').value   = '';
            return;
        }

        // 세션에서 회원 정보 불러오기
        fetch('/api/member/me', {
            credentials: 'include'
        })
            .then(function(res) {
                if (!res.ok) throw new Error('로그인 필요');
                return res.json();
            })
            .then(function(member) {
                document.getElementById('input-name').value  = member.name  || '';
                document.getElementById('input-phone').value = member.tel   || '';
                document.getElementById('input-address').value       = member.address       || '';
                document.getElementById('input-address-detail').value = member.addressDetail || '';
            })
            .catch(function(err) {
                console.error('회원 정보 불러오기 실패:', err);
                alert('회원 정보를 불러오지 못했습니다. 로그인 상태를 확인해주세요.');
                checkbox.checked = false;
            });
    });
}
function initAddressSearch() {
    var btn = document.getElementById('btn-address-search');
    if (!btn) return;

    btn.addEventListener('click', function() {
        new daum.Postcode({
            oncomplete: function(data) {
                var addr = data.roadAddress || data.jibunAddress;
                document.getElementById('input-address').value = addr;
                document.getElementById('input-address-detail').focus();
            }
        }).open();
    });
}
/* ----------------------------------------------------------------
   쿠폰 목록 불러오기
---------------------------------------------------------------- */
function loadCoupons() {
    fetch('/api/mypage/coupons', { credentials: 'include' })
        .then(function(res) {
            if (!res.ok) return;
            return res.json();
        })
        .then(function(coupons) {
            if (!coupons || coupons.length === 0) return;

            var select = document.getElementById('coupon-select');
            if (!select) return;

            coupons.forEach(function(coupon) {
                var discount = coupon.discountAmount
                    ? coupon.discountAmount.toLocaleString() + '원 할인'
                    : coupon.discountRate + '% 할인';
                var option = document.createElement('option');
                option.value       = JSON.stringify(coupon);
                option.textContent = coupon.name + ' (' + discount + ')';
                select.appendChild(option);
            });

            select.addEventListener('change', function() {
                if (!this.value) {
                    selectedCoupon = null;
                    discountPrice  = 0;
                    document.getElementById('coupon-desc').textContent = '';
                    document.getElementById('summary-coupon-row').style.display = 'none';
                } else {
                    selectedCoupon = JSON.parse(this.value);
                    applyСoupon();
                }
                renderSummary();
            });
        })
        .catch(function(err) { console.error('쿠폰 로드 실패:', err); });
}

/* ----------------------------------------------------------------
   쿠폰 적용
---------------------------------------------------------------- */
function applyСoupon() {
    if (!selectedCoupon) { discountPrice = 0; return; }

    var minOrder = selectedCoupon.minOrderAmount || 0;
    if (sumPrice + deliPrice < minOrder) {
        alert(minOrder.toLocaleString() + '원 이상 구매 시 사용 가능한 쿠폰입니다.');
        document.getElementById('coupon-select').value = '';
        selectedCoupon = null;
        discountPrice  = 0;
        document.getElementById('coupon-desc').textContent = '';
        document.getElementById('summary-coupon-row').style.display = 'none';
        return;
    }

    if (selectedCoupon.discountAmount) {
        discountPrice = selectedCoupon.discountAmount;
    } else if (selectedCoupon.discountRate) {
        discountPrice = Math.floor((sumPrice + deliPrice) * selectedCoupon.discountRate / 100);
    }

    var desc = document.getElementById('coupon-desc');
    if (desc) desc.textContent = '✅ ' + discountPrice.toLocaleString() + '원 할인 적용됩니다.';

    var row = document.getElementById('summary-coupon-row');
    if (row) row.style.display = 'flex';
    var couponEl = document.getElementById('summary-coupon');
    if (couponEl) couponEl.textContent = '-' + discountPrice.toLocaleString() + '원';
}