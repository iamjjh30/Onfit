/* ================================================================
   ShareFitWrite.js — Share Fit 게시글 작성
   - 이미지 필수 (Base64)
   - 상품 인용 → [상품:ID:상품명:이미지URL:가격] 태그
   - 제목 없음 → content 첫 줄 or "Share Fit" 자동 생성
   - POST /api/posts  (type: "Share Fit")
================================================================ */

var API_BASE = 'http://localhost:8080';
function getToken() { return localStorage.getItem('token'); }
function authHeaders() {
    return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() };
}

var imgBase64        = null;
var selectedProducts = [];
var allProducts      = [];

/* ----------------------------------------------------------------
   초기화
---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function() {

    setupImageUpload();
    setupCharCount();
    setupProductPicker();
    setupSubmit();
    fetchProducts();
});

/* ----------------------------------------------------------------
   이미지 업로드
---------------------------------------------------------------- */
/* ----------------------------------------------------------------
   이미지 업로드 (HTML 이름표에 맞게 수정됨)
---------------------------------------------------------------- */
function setupImageUpload() {
    var fileInput  = document.getElementById('imgFileInput');
    var attachArea = document.getElementById('imgAttachArea');
    var preview    = document.getElementById('imgPreview');
    var previewEl  = document.getElementById('imgPreviewEl');
    var removeBtn  = document.getElementById('imgRemoveBtn');

    if (!fileInput) return; // 안전장치

    fileInput.addEventListener('change', function() {
        var file = this.files[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) { alert('이미지 크기는 10MB 이하여야 해요.'); return; }

        var reader = new FileReader();
        reader.onload = function(e) {
            imgBase64             = e.target.result;
            previewEl.src         = imgBase64;

            // 미리보기 띄우고, 업로드 버튼 영역 숨기기
            if (preview) preview.style.display = 'block';
            if (attachArea) {
                attachArea.style.visibility = 'hidden';
                attachArea.style.height     = '0';
                attachArea.style.overflow   = 'hidden';
                attachArea.style.padding    = '0';
                attachArea.style.border     = 'none';
            }
        };
        reader.readAsDataURL(file);
    });

    // 이미지 지우기 (X 버튼)
    if (removeBtn) {
        removeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            imgBase64 = null;
            fileInput.value = '';

            // 미리보기 숨기고, 업로드 버튼 영역 다시 보이기
            if (preview) preview.style.display = 'none';
            if (attachArea) {
                attachArea.style.visibility = '';
                attachArea.style.height     = '';
                attachArea.style.overflow   = '';
                attachArea.style.padding    = '';
                attachArea.style.border     = '';
            }
        });
    }
}

/* ----------------------------------------------------------------
   글자 수 카운터
---------------------------------------------------------------- */
function setupCharCount() {
    var contentInput = document.getElementById('contentInput');
    var contentCount = document.getElementById('contentCount');
    if (contentInput && contentCount) {
        contentInput.addEventListener('input', function() {
            contentCount.textContent = this.value.length;
        });
    }
}

/* ----------------------------------------------------------------
   상품 목록 조회
---------------------------------------------------------------- */
function fetchProducts() {
    fetch(API_BASE + '/api/products', { headers: authHeaders() })
    .then(function(res) { return res.json(); })
    .then(function(data) {
        allProducts = data;
        renderProductList(allProducts);
    })
    .catch(function() {
        var el = document.getElementById('productItems');
        if (el) el.innerHTML = '<div style="text-align:center;padding:16px;color:#bbb;font-size:0.82rem;">상품 목록을 불러오지 못했어요.</div>';
    });
}

/* ----------------------------------------------------------------
   상품 피커 UI
---------------------------------------------------------------- */
function setupProductPicker() {
    var header      = document.getElementById('productPickerHeader');
    var listWrap    = document.getElementById('productListWrap');
    var searchInput = document.getElementById('productSearchInput');

    if (header) {
        header.addEventListener('click', function() {
            this.classList.toggle('open');
            listWrap.classList.toggle('open');
        });
    }
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            var keyword = this.value.trim().toLowerCase();
            var filtered = allProducts.filter(function(p) {
                return p.name.toLowerCase().includes(keyword);
            });
            renderProductList(filtered);
        });
    }
}

function renderProductList(products) {
    var container = document.getElementById('productItems');
    if (!container) return;

    if (!products || products.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:16px;color:#bbb;font-size:0.82rem;">검색 결과가 없어요.</div>';
        return;
    }

    container.innerHTML = products.map(function(p) {
        var alreadyAdded = selectedProducts.some(function(s) { return s.productId === p.productId; });
        return (
            '<div class="product_item" data-id="' + p.productId + '">' +
                '<img src="' + (p.imgUrl || '') + '" alt="' + p.name + '" onerror="this.style.display=\'none\'">' +
                '<span class="product_item_name">' + p.name + '</span>' +
                '<span class="product_item_price">₩' + (p.price || 0).toLocaleString() + '</span>' +
                '<button class="product_item_add" ' + (alreadyAdded ? 'disabled style="background:#ccc"' : '') + '>' +
                    (alreadyAdded ? '추가됨' : '+ 인용') +
                '</button>' +
            '</div>'
        );
    }).join('');

    container.querySelectorAll('.product_item').forEach(function(item) {
        var addBtn = item.querySelector('.product_item_add');
        if (addBtn && !addBtn.disabled) {
            addBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                var id = parseInt(item.getAttribute('data-id'));
                var product = allProducts.find(function(p) { return p.productId === id; });
                if (product) addProductTag(product);
            });
        }
    });
}

function addProductTag(product) {
    if (selectedProducts.some(function(s) { return s.productId === product.productId; })) return;
    selectedProducts.push(product);
    renderSelectedProducts();
    renderProductList(allProducts);
}

function removeProductTag(productId) {
    selectedProducts = selectedProducts.filter(function(s) { return s.productId !== productId; });
    renderSelectedProducts();
    renderProductList(allProducts);
}

function renderSelectedProducts() {
    var container = document.getElementById('selectedProducts');
    if (!container) return;

    if (selectedProducts.length === 0) { container.innerHTML = ''; return; }

    container.innerHTML = selectedProducts.map(function(p) {
        return (
            '<div class="selected_product_tag">' +
                '<img src="' + (p.imgUrl || '') + '" alt="' + p.name + '" onerror="this.style.display=\'none\'">' +
                p.name +
                '<button class="remove_tag" data-id="' + p.productId + '">✕</button>' +
            '</div>'
        );
    }).join('');

    container.querySelectorAll('.remove_tag').forEach(function(btn) {
        btn.addEventListener('click', function() {
            removeProductTag(parseInt(this.getAttribute('data-id')));
        });
    });
}

function buildProductTags() {
    return selectedProducts.map(function(p) {
        return '[상품:' + p.productId + ']';
    }).join('\n');
}

/* ----------------------------------------------------------------
   게시글 제출
---------------------------------------------------------------- */
function setupSubmit() {
    var submitBtn = document.getElementById('submitBtn');
    submitBtn.addEventListener('click', function() {
        if (!imgBase64) { alert('핏 사진을 업로드해주세요.'); return; }

        var rawContent    = document.getElementById('contentInput').value.trim();
        var productTagStr = buildProductTags();
        var finalContent  = rawContent + (productTagStr ? '\n' + productTagStr : '');

        /* 제목 = content 첫 줄 or "Share Fit" */
        var firstLine = rawContent.split('\n')[0] || 'Share Fit';
        var title     = firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
        if (!title) title = 'Share Fit';

        /* content도 없고 상품도 없으면 기본값 */
        if (!finalContent.trim()) finalContent = 'Share Fit';

        submitBtn.disabled    = true;
        submitBtn.textContent = '공유 중...';

        var payload = {
            title:   title,
            content: finalContent,
            type:    'Share Fit',
            imgUrl:  imgBase64
        };

        fetch(API_BASE + '/api/posts', {
            method: 'POST', headers: authHeaders(), body: JSON.stringify(payload)
        })
        .then(function(res) { if (!res.ok) throw new Error('게시 실패'); return res.json(); })
        .then(function(post) {
            window.location.href = './Community';
        })
        .catch(function(err) {
            console.error(err);
            alert('게시글 등록에 실패했습니다. 다시 시도해주세요.');
            submitBtn.disabled    = false;
            submitBtn.textContent = '공유하기';
        });
    });
}
