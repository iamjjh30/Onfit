document.addEventListener('DOMContentLoaded', function() {
    const oldTitle = document.getElementById('title');
    if(oldTitle) oldTitle.style.display = 'none';

    loadCartItems();
});

function loadCartItems() {
    const container = document.getElementById('Cart_container');
    container.innerHTML = '<p style="text-align:center; padding: 50px; color:#888;">데이터를 불러오는 중입니다...</p>';

    fetch('/api/cart')
        .then(response => {
            if (response.status === 401) {
                alert("로그인이 필요합니다.");
                window.location.href = '/login';
                throw new Error("Unauthorized");
            }
            return response.json();
        })
        .then(data => {
            if (data.length === 0) {
                container.innerHTML = `
                    <div style="max-width: 800px; margin: 40px auto; background: #fff; border-radius: 16px; padding: 80px 20px; text-align: center; box-shadow: 0 2px 12px rgba(0,0,0,0.04);">
                        <div style="width: 64px; height: 64px; background: #f5f5f5; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin: 0 auto 20px;">🛒</div>
                        <p style="font-size: 1.1rem; font-weight: 600; color: #111; margin-bottom: 10px;">장바구니가 비어 있습니다.</p>
                        <p style="font-size: 0.9rem; color: #888; margin-bottom: 30px;">당신의 스타일을 채워줄 새로운 아이템을 만나보세요.</p>
                        <button onclick="location.href='/store'" style="padding: 14px 32px; background: #111; color: white; border: none; border-radius: 50px; font-weight: 700; cursor: pointer; transition: background 0.2s;">
                            쇼핑하러 가기
                        </button>
                    </div>`;
                return;
            }

            let itemsHtml = '';
            let totalAmount = 0;

            // 1. 개별 상품 리스트 생성
            data.forEach((item, index) => {
                totalAmount += (item.price * item.qty);
                // 마지막 아이템은 밑줄(border-bottom) 제거
                const borderStyle = index === data.length - 1 ? '' : 'border-bottom: 1px solid #f0f0f0;';

                itemsHtml += `
                    <div style="display: flex; align-items: center; gap: 16px; padding: 16px 0; ${borderStyle}">
                        <img src="${item.imgUrl}" style="width: 72px; height: 72px; object-fit: cover; border-radius: 8px; background: #f5f5f5; flex-shrink: 0;">
                        
                        <div style="flex: 1;">
                            <p style="font-size: 0.95rem; font-weight: 500; color: #222; margin: 0 0 4px 0;">${item.name}</p>
                            <p style="font-size: 0.85rem; color: #999; margin: 0;">${item.size} · ${item.qty}개</p>
                        </div>
                        
                        <div style="font-size: 0.95rem; font-weight: 700; color: #111; margin-right: 16px; white-space: nowrap;">
                            ${(item.price * item.qty).toLocaleString()}원
                        </div>
                        
                        <div style="display: flex; flex-direction: row; gap: 6px;">
                            <button onclick="buyIndividualItem(${item.productId}, '${item.name.replace(/'/g, "\\'")}', ${item.price}, '${item.imgUrl}', '${item.size}', ${item.qty})" 
                                    style="padding: 6px 16px; border: 1px solid #111; border-radius: 50px; background: #111; color: #fff; font-size: 0.8rem; font-weight: 600; cursor: pointer;">
                                구매
                            </button>
                            <button onclick="removeCartItem(${item.cartId})" 
                                    style="padding: 6px 16px; border: 1px solid #e8e8e8; border-radius: 50px; background: transparent; color: #888; font-size: 0.8rem; cursor: pointer;">
                                삭제
                            </button>
                        </div>
                    </div>
                `;
            });

            // 🌟 2. 요약창을 없애고 하나의 중앙 박스로 통합 조립
            container.innerHTML = `
                <div style="max-width: 800px; margin: 0 auto; padding: 40px 0 80px;">
                    <h2 style="font-size: 1.8rem; font-weight: 700; margin-bottom: 32px; color: #111;">장바구니</h2>
                    
                    <section style="background: #fff; border-radius: 16px; padding: 32px; box-shadow: 0 2px 12px rgba(0,0,0,0.04);">
                        <h3 style="font-size: 0.8rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #aaa; margin-bottom: 20px;">
                            담긴 상품
                        </h3>
                        
                        <div>
                            ${itemsHtml}
                        </div>
                        
                        <div style="height: 1px; background: #eee; margin: 24px 0;"></div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
                            <span style="font-size: 1.1rem; font-weight: 700; color: #111;">총 결제금액</span>
                            <span style="font-size: 1.5rem; font-weight: 800; color: #111;">${totalAmount.toLocaleString()}원</span>
                        </div>

                        <button onclick="location.href='/Checkout?mode=cart'" 
                                style="width: 100%; height: 56px; background: #111; color: #fff; border: none; border-radius: 50px; font-size: 1.05rem; font-weight: 700; cursor: pointer; letter-spacing: 0.02em; transition: background 0.2s;">
                            전체 구매하기
                        </button>
                    </section>
                </div>
            `;
        })
        .catch(err => console.error(err));
}

function buyIndividualItem(productId, name, price, imgUrl, size, qty) {
    const url = `/Checkout?mode=direct`
        + `&productId=${productId}`
        + `&name=${encodeURIComponent(name)}`
        + `&price=${price}`
        + `&imgUrl=${encodeURIComponent(imgUrl)}`
        + `&size=${encodeURIComponent(size)}`
        + `&qty=${qty}`;

    location.href = url;
}

// 장바구니 상품 삭제
function removeCartItem(cartId) {
    if (confirm('이 상품을 장바구니에서 삭제하시겠습니까?')) {

        // 백엔드로 삭제 요청 (DELETE 메서드 사용)
        fetch(`/api/cart/${cartId}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.status === 401) {
                    alert('로그인이 만료되었습니다.');
                    window.location.href = '/Login';
                    return;
                }
                if (response.ok) {
                    // 🌟 삭제 성공 시 화면을 새로고침하지 않고 장바구니 목록만 다시 그려줍니다!
                    loadCartItems();
                } else {
                    alert('상품 삭제에 실패했습니다.');
                }
            })
            .catch(err => {
                console.error('삭제 에러:', err);
                alert('서버 오류가 발생했습니다.');
            });
    }
}

function goCheckout() {
    return "/Checkout";
}