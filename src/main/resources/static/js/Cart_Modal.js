function openCartModal(item, position, onUpdate) {
    var existingModal = document.getElementById('cart-modal-overlay');
    if (existingModal) existingModal.remove();

    var tempQty  = item ? item.qty  || 1   : 1;
    var tempSize = item ? item.size || 'S' : 'S';

    var overlay = document.createElement('div');
    overlay.id = 'cart-modal-overlay';
    overlay.onclick = function() { closeModal(); };

    var modalWrapper = document.createElement('div');
    modalWrapper.className = 'Modal-wrapper';
    modalWrapper.style.top  = position.top  + 'px';
    modalWrapper.style.left = position.left + 'px';
    modalWrapper.onclick = function(e) { e.stopPropagation(); };

    // 사이즈 섹션은 로딩 중 표시 후 API 응답으로 교체
    modalWrapper.innerHTML =
        '<div class="Modal-section">' +
        '<p class="Modal-label">사이즈</p>' +
        '<div id="modal-size-area"><p style="font-size:12px;color:#aaa;">불러오는 중...</p></div>' +
        '</div>' +
        '<div class="Modal-section">' +
        '<p class="Modal-label">수량</p>' +
        '<div class="Qty-control">' +
        '<button type="button" class="temp-btn" id="modal-qty-minus">−</button>' +
        '<span id="modal-qty-text">' + tempQty + '</span>' +
        '<button type="button" class="temp-btn" id="modal-qty-plus">+</button>' +
        '</div>' +
        '</div>' +
        '<div class="Modal-divider"></div>' +
        '<div class="Modal-actions">' +
        '<button class="Cancel-btn" id="modal-cancel-btn">취소</button>' +
        '<button class="Save-btn"   id="modal-save-btn">변경하기</button>' +
        '</div>';

    overlay.appendChild(modalWrapper);
    document.body.appendChild(overlay);

    requestAnimationFrame(function() {
        modalWrapper.classList.add('Modal-visible');
    });

    // 수량 이벤트
    var qtyText  = modalWrapper.querySelector('#modal-qty-text');
    var minusBtn = modalWrapper.querySelector('#modal-qty-minus');
    var plusBtn  = modalWrapper.querySelector('#modal-qty-plus');

    function updateQtyButtons() {
        if (tempQty <= 1) {
            minusBtn.disabled = true;
            minusBtn.style.color = '#ccc';
            minusBtn.style.cursor = 'default';
        } else {
            minusBtn.disabled = false;
            minusBtn.style.color = '#333';
            minusBtn.style.cursor = 'pointer';
        }
    }

    updateQtyButtons(); // 초기 상태 적용

    minusBtn.onclick = function() {
        if (tempQty > 1) {
            tempQty--;
            qtyText.innerText = tempQty;
            updateQtyButtons();
        }
    };
    plusBtn.onclick = function() {
        tempQty++;
        qtyText.innerText = tempQty;
        updateQtyButtons();
    };
    modalWrapper.querySelector('#modal-qty-minus').onclick = function() {
        tempQty = Math.max(1, tempQty - 1);
        qtyText.innerText = tempQty;
    };
    modalWrapper.querySelector('#modal-qty-plus').onclick = function() {
        tempQty += 1;
        qtyText.innerText = tempQty;
    };

    modalWrapper.querySelector('#modal-save-btn').onclick = function() {
        onUpdate(item.cartId, tempSize, tempQty);
        closeModal();
    };
    modalWrapper.querySelector('#modal-cancel-btn').onclick = function() {
        closeModal();
    };

    function onKeyDown(e) { if (e.key === 'Escape') closeModal(); }
    document.addEventListener('keydown', onKeyDown);
    function closeModal() {
        document.removeEventListener('keydown', onKeyDown);
        overlay.remove();
    }

    // ── 상품 옵션 API 조회 후 사이즈 버튼 렌더링 ──
    fetch(API_BASE + '/api/products/' + item.productId, {
        headers: { 'Authorization': 'Bearer ' + getToken() }
    })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            var sizeArea = modalWrapper.querySelector('#modal-size-area');
            if (!data.options || data.options.length === 0) {
                sizeArea.innerHTML = '<p style="font-size:12px;color:#aaa;">옵션 없음</p>';
                return;
            }

            // 재고 있는 사이즈만 필터
            var availableOptions = data.options.filter(function(o) { return o.stock > 0; });

            sizeArea.innerHTML = availableOptions.map(function(o) {
                var isSelected = o.size === tempSize;
                return '<button type="button" class="size-opt-btn' + (isSelected ? ' active' : '') + '" data-size="' + o.size + '">' + o.size + '</button>';
            }).join('');

            // 사이즈 버튼 클릭 이벤트
            sizeArea.querySelectorAll('.size-opt-btn').forEach(function(btn) {
                btn.onclick = function() {
                    sizeArea.querySelectorAll('.size-opt-btn').forEach(function(b) { b.classList.remove('active'); });
                    btn.classList.add('active');
                    tempSize = btn.dataset.size;
                };
            });
        })
        .catch(function() {
            var sizeArea = modalWrapper.querySelector('#modal-size-area');
            sizeArea.innerHTML = '<p style="font-size:12px;color:#f00;">사이즈 조회 실패</p>';
        });
}