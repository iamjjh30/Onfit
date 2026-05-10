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
    initSameAsOrderer();
    initLoadAddressBtn(); // 🌟 배송지 불러오기 버튼 활성화!
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
   5. 주문 상품 렌더링
---------------------------------------------------------------- */
function renderCheckoutItems() {
    var container = document.getElementById('checkout-items');
    if (!container) return;
    container.innerHTML = cartItems.map(function(item) {
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

    totalPrice = Math.max(0, sumPrice + deliPrice - discountPrice);
    if (td) td.textContent = totalPrice.toLocaleString() + '원';
}

/* ----------------------------------------------------------------
   7. 결제 요청 (토스)
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
        couponId: selectedCoupon ? selectedCoupon.id : '',
        mode: MODE,
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

    var firstItemName = cartItems[0].name || cartItems[0].productName || '상품';
    var orderName = cartItems.length > 1
        ? firstItemName + ' 외 ' + (cartItems.length - 1) + '건'
        : firstItemName;

    var orderId = 'ONFIT-' + Date.now();

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
   9. 초기화 및 이벤트 리스너
---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function() {
    init();
    var payBtn = document.getElementById('pay-btn');
    if (payBtn) payBtn.addEventListener('click', requestPayment);
    window.addEventListener('resize', positionSummary);
});

/* ----------------------------------------------------------------
   🌟 배송지 불러오기 버튼 로직 (모달 열고 목록 렌더링)
---------------------------------------------------------------- */
function initLoadAddressBtn() {
    var btn = document.getElementById('btn-load-address');
    var modal = document.getElementById('address-modal');
    var listContainer = document.getElementById('modal-address-list');

    if (!btn) return;

    btn.addEventListener('click', function() {
        // 1. 서버에서 다중 배송지 목록 가져오기
        fetch('/api/mypage/addresses', { credentials: 'include' })
            .then(function(res) {
                if (!res.ok) throw new Error('배송지 목록 조회 실패');
                return res.json();
            })
            .then(function(addresses) {
                if (!addresses || addresses.length === 0) {
                    alert('등록된 배송지가 없습니다. 마이페이지에서 먼저 등록해주세요.');
                    return;
                }

                // 2. 모달 열기
                if (modal) modal.style.display = 'flex';

                // 3. 모달 안에 배송지 목록 그리기
                if (listContainer) {
                    listContainer.innerHTML = addresses.map(function(addr) {
                        // 따옴표 에러 방지
                        var safeAddr = addr.address.replace(/'/g, "\\'");
                        var safeDetail = addr.addressDetail ? addr.addressDetail.replace(/'/g, "\\'") : '';

                        return `
                        <div class="modal-addr-item" 
                             onclick="selectAddress('${safeAddr}', '${safeDetail}')"
                             style="padding:16px; border:1px solid #eee; border-radius:12px; margin-bottom:12px; cursor:pointer; background:#fff; transition:background 0.2s;">
                            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                                <span style="font-weight:700; font-size:14px; color:#111;">${addr.addressName}</span>
                                ${addr.isDefault ? '<span style="font-size:11px; background:#000; color:#fff; padding:2px 6px; border-radius:4px;">기본</span>' : ''}
                            </div>
                            <p style="margin:0; font-size:13px; color:#555;">${addr.address}</p>
                            <p style="margin:4px 0 0; font-size:13px; color:#888;">${addr.addressDetail || ''}</p>
                        </div>
                    `;
                    }).join('');
                }
            })
            .catch(function(err) {
                console.error(err);
                alert('배송지 목록을 불러오는 중 오류가 발생했습니다.');
            });
    });
}
/* ----------------------------------------------------------------
   🌟 배송지 선택 시 폼 자동 입력 로직
---------------------------------------------------------------- */
window.selectAddress = function(addr, detail) {
    // 1. 입력 필드 찾기
    const nameInput    = document.getElementById('input-name');
    const phoneInput   = document.getElementById('input-phone');
    const addrInput    = document.getElementById('input-address');
    const detailInput  = document.getElementById('input-address-detail');

    // 2. 값 채워넣기 (이름/번호는 세션 데이터, 주소는 선택한 값)
    if (window.MEMBER_DATA) {
        nameInput.value  = window.MEMBER_DATA.name || '';
        phoneInput.value = window.MEMBER_DATA.tel || '';
    }
    addrInput.value   = addr;
    detailInput.value = detail;

    // 3. 모달 닫기
    closeAddressModal();

    // 4. 입력 성공 시각 효과 (입력창이 파랗게 깜빡임)
    [nameInput, phoneInput, addrInput, detailInput].forEach(function(el) {
        if (el) {
            el.style.transition = 'background 0.5s';
            el.style.background = '#f0f9ff';
            setTimeout(function() { el.style.background = '#fff'; }, 500);
        }
    });
};
/* ----------------------------------------------------------------
   🌟 모달 닫기 함수
---------------------------------------------------------------- */
window.closeAddressModal = function() {
    var modal = document.getElementById('address-modal');
    if (modal) modal.style.display = 'none';
};
/* ----------------------------------------------------------------
   주문자 정보와 동일 체크박스
---------------------------------------------------------------- */
function initSameAsOrderer() {
    var checkbox = document.getElementById('same-as-orderer');
    if (!checkbox) return;

    checkbox.addEventListener('change', function() {
        if (!this.checked) {
            document.getElementById('input-name').value    = '';
            document.getElementById('input-phone').value   = '';
            return;
        }

        // Thymeleaf 주입 데이터 우선
        if (window.MEMBER_DATA && window.MEMBER_DATA.name) {
            document.getElementById('input-name').value           = window.MEMBER_DATA.name || '';
            document.getElementById('input-phone').value          = window.MEMBER_DATA.tel || '';
            document.getElementById('input-address').value        = window.MEMBER_DATA.address || '';
            document.getElementById('input-address-detail').value = window.MEMBER_DATA.addressDetail || '';
        } else {
            fetch('/api/member/me', { credentials: 'include' })
                .then(function(res) {
                    if (!res.ok) throw new Error('로그인 필요');
                    return res.json();
                })
                .then(function(member) {
                    document.getElementById('input-name').value           = member.name  || '';
                    document.getElementById('input-phone').value          = member.tel   || '';
                    document.getElementById('input-address').value        = member.address       || '';
                    document.getElementById('input-address-detail').value = member.addressDetail || '';
                })
                .catch(function(err) {
                    console.error('회원 정보 불러오기 실패:', err);
                    alert('회원 정보를 불러오지 못했습니다. 로그인 상태를 확인해주세요.');
                    checkbox.checked = false;
                });
        }
    });
}

/* ----------------------------------------------------------------
   주소 검색 (다음 우편번호 API)
---------------------------------------------------------------- */
function initAddressSearch() {
    var btn = document.getElementById('btn-address-search');
    var inputAddr = document.getElementById('input-address');

    function execDaum() {
        new daum.Postcode({
            oncomplete: function(data) {
                var addr = data.roadAddress || data.jibunAddress;
                document.getElementById('input-address').value = addr;
                document.getElementById('input-address-detail').focus();
            }
        }).open();
    }

    if (btn) btn.addEventListener('click', execDaum);
    if (inputAddr) inputAddr.addEventListener('click', execDaum);
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