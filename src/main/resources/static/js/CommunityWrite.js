/* ================================================================
   CommunityWrite.js — 텍스트 게시글 작성
   - 제목 없음 → content 첫 줄을 title로 자동 생성
   - 상품 인용 → [상품:ID:상품명:이미지URL:가격] 태그로 content에 삽입
   - POST /api/posts
================================================================ */

var API_BASE = 'http://localhost:8080';
function getToken() { return localStorage.getItem('token'); }
function authHeaders() {
    return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() };
}

var selectedCat      = '잡담';
var imgBase64        = null;
var selectedProducts = [];  // { productId, name, imgUrl, price }
var allProducts      = [];  // API에서 받아온 전체 상품 목록

/* ----------------------------------------------------------------
   초기화
---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function() {
    setupCategoryTabs();
    setupCharCount();
    setupImageUpload();
    setupProductPicker();
    setupSubmit();
    fetchProducts();
});

/* ----------------------------------------------------------------
   카테고리 탭
---------------------------------------------------------------- */
function setupCategoryTabs() {
    document.querySelectorAll('.cat_tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.cat_tab').forEach(function(t) { t.classList.remove('active'); });
            this.classList.add('active');
            selectedCat = this.getAttribute('data-cat');
        });
    });
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
   이미지 업로드 (수정됨)
   - attachArea를 display:none 대신 visibility/height로 숨겨
     fileInput이 DOM에서 살아있도록 유지
---------------------------------------------------------------- */
function setupImageUpload() {
    var fileInput  = document.getElementById('imgFileInput');
    var preview    = document.getElementById('imgPreview');
    var previewEl  = document.getElementById('imgPreviewEl');
    var removeBtn  = document.getElementById('imgRemoveBtn');
    var attachArea = document.getElementById('imgAttachArea');
    if (!fileInput) return;

    fileInput.addEventListener('change', function() {
        var file = this.files[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) { alert('이미지 크기는 10MB 이하여야 해요.'); return; }
        var reader = new FileReader();
        reader.onload = function(e) {
            imgBase64             = e.target.result;
            previewEl.src         = imgBase64;
            preview.style.display = 'block';
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

    if (removeBtn) {
        removeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            imgBase64 = null;
            fileInput.value = '';
            preview.style.display = 'none';
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
    var header   = document.getElementById('productPickerHeader');
    var listWrap = document.getElementById('productListWrap');
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

    /* 인용 버튼 클릭 */
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

/* ----------------------------------------------------------------
   상품 태그를 content에 삽입하는 형식
   [상품:ID:상품명:이미지URL:가격]
---------------------------------------------------------------- */
function buildProductTags() {
    // ID만 저장 → 표시 시점에 API 재조회로 항상 최신 정보 반영
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
        var rawContent = document.getElementById('contentInput').value.trim();
        if (!rawContent && selectedProducts.length === 0) {
            alert('내용을 입력하거나 상품을 인용해주세요.');
            return;
        }

        /* 제목 = content 첫 줄 (최대 50자) */
        var firstLine = rawContent.split('\n')[0] || '게시글';
        var title     = firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;

        /* 상품 태그를 content 뒤에 붙임 */
        var productTagStr = buildProductTags();
        var finalContent  = rawContent + (productTagStr ? '\n' + productTagStr : '');

        if (!finalContent.trim()) { alert('내용을 입력해주세요.'); return; }

        submitBtn.disabled    = true;
        submitBtn.textContent = '게시 중...';

        var payload = {
            title:   title,
            content: finalContent,
            type:    selectedCat,
            imgUrl:  imgBase64 || null
        };

        fetch(API_BASE + '/api/posts', {
            method: 'POST', headers: authHeaders(), body: JSON.stringify(payload)
        })
        .then(function(res) { if (!res.ok) throw new Error('게시 실패'); return res.json(); })
            .then(function(post) {
                // 🌟 1. 성공 알림창 띄우기
                alert('게시글이 성공적으로 등록되었습니다!');

                // 🌟 2. 커뮤니티 메인 목록 화면으로 안전하게 돌아가기 (대소문자 주의: 보통 소문자 사용)
                window.location.href = '/Community';

            })
        .catch(function(err) {
            console.error(err);
            alert('게시글 등록에 실패했습니다. 다시 시도해주세요.');
            submitBtn.disabled    = false;
            submitBtn.textContent = '게시하기';
        });
    });
}
