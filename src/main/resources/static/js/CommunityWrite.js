/* ================================================================
   CommunityWrite.js
   - 세션 기반 인증으로 수정 (JWT 토큰 방식 제거)
   - 다중 이미지 (최대 5장) → imgUrl: JSON.stringify([url1, url2, ...])
   - POST /api/posts
================================================================ */

var selectedCat      = '잡담';
var imageFiles       = [];   // File 객체 배열 (최대 5)
var imageBase64s     = [];   // 각 이미지의 base64 배열
var selectedProducts = [];
var allProducts      = [];
var MAX_IMAGES       = 5;

/* ── 초기화 ── */
document.addEventListener('DOMContentLoaded', function () {
    setupCategoryTabs();
    setupCharCount();
    setupImageUpload();
    setupProductPicker();
    setupSubmit();
    fetchProducts();

    // ✅ 로그인 여부는 서버에서 세션으로 확인 (토큰 체크 제거)
    // Thymeleaf에서 th:if="${session.loginMember != null}" 로 처리하거나
    // 아래처럼 API로 확인
    checkLoginStatus();
});

/* ── 로그인 상태 확인 (세션 기반) ── */
function checkLoginStatus() {
    fetch('/api/posts', {
        credentials: 'include'  // ✅ 세션 쿠키 포함
    })
        .then(function (r) {
            // 비로그인이어도 목록 조회는 되므로, 별도 엔드포인트가 없으면
            // 글쓰기 페이지 접근 제어는 서버(컨트롤러)에서 처리하는 것을 권장
        })
        .catch(function () {});
}

/* ── 카테고리 탭 ── */
function setupCategoryTabs() {
    document.querySelectorAll('.cat-tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.cat-tab').forEach(function (t) { t.classList.remove('active'); });
            this.classList.add('active');
            selectedCat = this.getAttribute('data-cat');
        });
    });
}

/* ── 글자 수 ── */
function setupCharCount() {
    var ta = document.getElementById('contentInput');
    var ct = document.getElementById('contentCount');
    if (ta && ct) ta.addEventListener('input', function () { ct.textContent = this.value.length; });
}

/* ── 다중 이미지 업로드 ── */
function setupImageUpload() {
    var trigger   = document.getElementById('imgUploadTrigger');
    var fileInput = document.getElementById('imgFileInput');

    if (!trigger || !fileInput) return;

    trigger.addEventListener('click', function () {
        if (imageFiles.length >= MAX_IMAGES) {
            alert('이미지는 최대 ' + MAX_IMAGES + '장까지 첨부할 수 있어요.');
            return;
        }
        fileInput.click();
    });

    fileInput.addEventListener('change', function () {
        var newFiles  = Array.from(this.files);
        var remaining = MAX_IMAGES - imageFiles.length;
        if (newFiles.length > remaining) {
            alert('최대 ' + MAX_IMAGES + '장까지만 첨부 가능해요. ' + remaining + '장만 추가됩니다.');
            newFiles = newFiles.slice(0, remaining);
        }

        var validFiles = newFiles.filter(function (f) {
            if (f.size > 10 * 1024 * 1024) { alert(f.name + ' 파일은 10MB를 초과해서 제외됩니다.'); return false; }
            return true;
        });

        validFiles.forEach(function (file) {
            var reader = new FileReader();
            reader.onload = function (e) {
                imageFiles.push(file);
                imageBase64s.push(e.target.result);
                renderImagePreviews();
            };
            reader.readAsDataURL(file);
        });

        this.value = '';
    });
}

function renderImagePreviews() {
    var grid  = document.getElementById('imgPreviewGrid');
    var badge = document.getElementById('imgCountBadge');
    if (!grid) return;

    if (imageBase64s.length === 0) {
        grid.innerHTML = '';
        if (badge) badge.style.display = 'none';
        return;
    }

    if (badge) {
        badge.style.display = 'inline-block';
        badge.textContent = imageBase64s.length + ' / ' + MAX_IMAGES;
    }

    grid.innerHTML = imageBase64s.map(function (src, idx) {
        return '<div class="img-preview-item">' +
            '<img src="' + src + '" alt="미리보기 ' + (idx + 1) + '">' +
            '<button class="img-preview-remove" data-idx="' + idx + '" type="button">✕</button>' +
            '<div class="img-preview-order">' + (idx + 1) + '</div>' +
            '</div>';
    }).join('');

    grid.querySelectorAll('.img-preview-remove').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var idx = parseInt(this.getAttribute('data-idx'));
            imageFiles.splice(idx, 1);
            imageBase64s.splice(idx, 1);
            renderImagePreviews();
        });
    });
}

/* ── 상품 목록 ── */
function fetchProducts() {
    fetch('/api/products', {
        credentials: 'include'  // ✅ 세션 쿠키 포함
    })
        .then(function (r) { return r.json(); })
        .then(function (data) {
            allProducts = data;
            renderProductList(allProducts);
        })
        .catch(function () {
            var el = document.getElementById('productItems');
            if (el) el.innerHTML = '<div class="product-loading">상품 목록을 불러오지 못했어요.</div>';
        });
}

/* ── 상품 피커 ── */
function setupProductPicker() {
    var header  = document.getElementById('productPickerHeader');
    var body    = document.getElementById('productPickerBody');
    var chevron = header ? header.querySelector('.picker-chevron') : null;

    if (header) {
        header.addEventListener('click', function () {
            var open = body.style.display !== 'none';
            body.style.display = open ? 'none' : 'block';
            if (chevron) chevron.classList.toggle('open', !open);
        });
    }

    var search = document.getElementById('productSearchInput');
    if (search) {
        search.addEventListener('input', function () {
            var kw = this.value.trim().toLowerCase();
            renderProductList(kw
                ? allProducts.filter(function (p) { return p.name.toLowerCase().includes(kw); })
                : allProducts);
        });
    }
}

function renderProductList(products) {
    var container = document.getElementById('productItems');
    if (!container) return;

    if (!products || !products.length) {
        container.innerHTML = '<div class="product-loading">검색 결과가 없어요.</div>';
        return;
    }

    container.innerHTML = products.map(function (p) {
        var added = selectedProducts.some(function (s) { return s.productId === p.productId; });
        return '<div class="product-item" data-id="' + p.productId + '">' +
            '<img src="' + (p.imgUrl || '') + '" alt="' + p.name + '" onerror="this.style.display=\'none\'">' +
            '<span class="product-item-name">' + p.name + '</span>' +
            '<span class="product-item-price">₩' + (p.price || 0).toLocaleString() + '</span>' +
            '<button class="product-item-add" ' + (added ? 'disabled' : '') + '>' + (added ? '추가됨' : '+ 인용') + '</button>' +
            '</div>';
    }).join('');

    container.querySelectorAll('.product-item').forEach(function (item) {
        var btn = item.querySelector('.product-item-add');
        if (btn && !btn.disabled) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                var id = parseInt(item.getAttribute('data-id'));
                var p  = allProducts.find(function (p) { return p.productId === id; });
                if (p) addProduct(p);
            });
        }
    });
}

function addProduct(p) {
    if (selectedProducts.some(function (s) { return s.productId === p.productId; })) return;
    selectedProducts.push(p);
    renderSelectedProducts();
    renderProductList(allProducts);
}

function removeProduct(id) {
    selectedProducts = selectedProducts.filter(function (s) { return s.productId !== id; });
    renderSelectedProducts();
    renderProductList(allProducts);
}

function renderSelectedProducts() {
    var container = document.getElementById('selectedProducts');
    if (!container) return;

    container.innerHTML = selectedProducts.map(function (p) {
        return '<div class="selected-product-tag">' +
            '<img src="' + (p.imgUrl || '') + '" alt="' + p.name + '" onerror="this.style.display=\'none\'">' +
            p.name +
            '<button class="remove-tag" data-id="' + p.productId + '" type="button">✕</button>' +
            '</div>';
    }).join('');

    container.querySelectorAll('.remove-tag').forEach(function (btn) {
        btn.addEventListener('click', function () { removeProduct(parseInt(this.getAttribute('data-id'))); });
    });
}

/* ── 게시글 제출 ── */
function setupSubmit() {
    var btn = document.getElementById('submitBtn');
    if (!btn) return;

    btn.addEventListener('click', function () {
        var rawContent = document.getElementById('contentInput').value.trim();
        if (!rawContent && selectedProducts.length === 0 && imageBase64s.length === 0) {
            alert('내용을 입력하거나 이미지/상품을 추가해주세요.');
            return;
        }

        var firstLine   = rawContent.split('\n')[0] || '게시글';
        var title       = firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
        var productTags = selectedProducts.map(function (p) { return '[상품:' + p.productId + ']'; }).join('\n');
        var finalContent = rawContent + (productTags ? '\n' + productTags : '');

        var imgUrl = imageBase64s.length === 0
            ? null
            : imageBase64s.length === 1
                ? imageBase64s[0]
                : JSON.stringify(imageBase64s);

        btn.disabled    = true;
        btn.textContent = '게시 중...';

        fetch('/api/posts', {
            method: 'POST',
            credentials: 'include',                              // ✅ 세션 쿠키 포함
            headers: { 'Content-Type': 'application/json' },    // ✅ Authorization 헤더 제거
            body: JSON.stringify({ title: title, content: finalContent, type: selectedCat, imgUrl: imgUrl })
        })
            .then(function (r) {
                if (r.status === 401) {
                    alert('로그인이 필요합니다.');
                    window.location.href = '/login';
                    return null;
                }
                if (!r.ok) throw new Error('게시 실패');
                return r.json();
            })
            .then(function (post) {
                if (!post) return;
                window.location.href = '/community/' + post.postId;
            })
            .catch(function () {
                alert('게시글 등록에 실패했습니다. 다시 시도해주세요.');
                btn.disabled    = false;
                btn.textContent = '게시하기';
            });
    });
}