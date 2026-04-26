/* ================================================================
   CommunityWrite.js
   - 세션 기반 인증 (JWT 토큰 방식 제거)
   - 수정 모드: URL에 ?edit={postId} 있으면 기존 내용 불러와서 수정
   - 다중 이미지 (최대 5장) → imgUrl: JSON.stringify([url1, url2, ...])
   - 상품 인용 최대 4개, 가로 스와이프 UI
   - POST /api/posts        (새 글)
   - PUT  /api/posts/{id}   (수정)
================================================================ */

var selectedCat      = 'TF';
var imageFiles       = [];
var imageBase64s     = [];
var selectedProducts = [];
var allProducts      = [];
var MAX_IMAGES       = 5;
var MAX_PRODUCTS     = 4;   // ✅ 상품 인용 최대 4개
var editPostId       = null;

/* ── 초기화 ── */
document.addEventListener('DOMContentLoaded', function () {
    var params = new URLSearchParams(window.location.search);
    editPostId = params.get('edit') ? parseInt(params.get('edit')) : null;

    setupCategoryTabs();
    setupCharCount();
    setupImageUpload();
    setupProductPicker();
    setupSubmit();
    fetchProducts();
    checkLoginStatus();

    if (editPostId) {
        loadPostForEdit(editPostId);
    }
});

/* ── 수정 모드: 기존 게시글 불러오기 ── */
function loadPostForEdit(postId) {
    var titleEl = document.querySelector('.write-title');
    if (titleEl) titleEl.textContent = '게시글 수정';
    var submitBtn = document.getElementById('submitBtn');
    if (submitBtn) submitBtn.textContent = '수정하기';

    fetch('/api/posts/' + postId, { credentials: 'include' })
        .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
        .then(function (post) {
            if (post.type) {
                selectedCat = post.type;
                document.querySelectorAll('.cat-tab').forEach(function (tab) {
                    tab.classList.toggle('active', tab.getAttribute('data-menu') === post.type);
                });
            }

            var content = (post.content || post.title || '')
                .replace(/\[상품:\d+:[^\]]*\]\n?/g, '')
                .replace(/\[상품:\d+\]\n?/g, '')
                .trim();
            var ta = document.getElementById('contentInput');
            if (ta) {
                ta.value = content;
                var ct = document.getElementById('contentCount');
                if (ct) ct.textContent = content.length;
            }

            if (post.imgUrl) {
                var images = [];
                try {
                    var parsed = JSON.parse(post.imgUrl);
                    images = Array.isArray(parsed) ? parsed : [parsed];
                } catch (e) {
                    images = [post.imgUrl];
                }
                imageBase64s = images.filter(Boolean);
                imageFiles   = images.map(function () { return null; });
                renderImagePreviews();
            }
        })
        .catch(function () {
            toast('게시글을 불러올 수 없습니다.');
            window.location.href = '/community';
        });
}

/* ── 로그인 상태 확인 ── */
function checkLoginStatus() {
    fetch('/api/posts', { credentials: 'include' })
        .then(function () {})
        .catch(function () {});
}

/* ── 카테고리 탭 ── */
function setupCategoryTabs() {
    document.querySelectorAll('.cat-tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.cat-tab').forEach(function (t) { t.classList.remove('active'); });
            this.classList.add('active');
            selectedCat = this.getAttribute('data-menu');
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
            toast('이미지는 최대 ' + MAX_IMAGES + '장까지 첨부할 수 있어요.');
            return;
        }
        fileInput.click();
    });

    fileInput.addEventListener('change', function () {
        var newFiles  = Array.from(this.files);
        var remaining = MAX_IMAGES - imageFiles.length;
        if (newFiles.length > remaining) {
            toast('최대 ' + MAX_IMAGES + '장까지만 첨부 가능해요. ' + remaining + '장만 추가됩니다.');
            newFiles = newFiles.slice(0, remaining);
        }

        var validFiles = newFiles.filter(function (f) {
            if (f.size > 10 * 1024 * 1024) {
                toast(f.name + ' 파일은 10MB를 초과해서 제외됩니다.');
                return false;
            }
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

/* ── 상품 목록 fetch ── */
function fetchProducts() {
    fetch('/api/products', { credentials: 'include' })
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

/* ── 상품 피커 드롭다운 ── */
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

/* ── 상품 목록 렌더링 ── */
function renderProductList(products) {
    var container = document.getElementById('productItems');
    if (!container) return;

    if (!products || !products.length) {
        container.innerHTML = '<div class="product-loading">검색 결과가 없어요.</div>';
        return;
    }

    var isFull = selectedProducts.length >= MAX_PRODUCTS;

    container.innerHTML = products.map(function (p) {
        // ✅ p.id 기준으로 통일해서 비교
        var added = selectedProducts.some(function (s) { return s.id === p.id; });
        var disabledAttr = (added || isFull) ? 'disabled' : '';
        var btnText = added ? '추가됨' : (isFull ? '최대 ' + MAX_PRODUCTS + '개' : '+ 인용');
        var btnClass = 'product-item-add' + (added ? ' added' : '') + (isFull && !added ? ' full' : '');

        return '<div class="product-item" data-id="' + p.id + '">' +
            '<img src="' + (p.imageUrl || '') + '" alt="' + p.name + '" onerror="this.style.display=\'none\'">' +
            '<span class="product-item-name">' + p.name + '</span>' +
            '<span class="product-item-price">₩' + (p.price || 0).toLocaleString() + '</span>' +
            '<button class="' + btnClass + '" ' + disabledAttr + '>' + btnText + '</button>' +
            '</div>';
    }).join('');

    container.querySelectorAll('.product-item').forEach(function (item) {
        var btn = item.querySelector('.product-item-add');
        if (btn && !btn.disabled) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                var id = parseInt(item.getAttribute('data-id'));
                var p  = allProducts.find(function (p) { return p.id === id; });
                if (p) addProduct(p);
            });
        }
    });
}

/* ── 상품 추가 ── */
function addProduct(p) {
    // ✅ 최대 4개 제한
    if (selectedProducts.length >= MAX_PRODUCTS) {
        toast('상품 인용은 최대 ' + MAX_PRODUCTS + '개까지 가능해요.');
        return;
    }
    // ✅ 중복 방지: p.id 기준
    if (selectedProducts.some(function (s) { return s.id === p.id; })) return;

    selectedProducts.push(p);
    renderSelectedProducts();
    renderProductList(allProducts);
}

/* ── 상품 제거 ── */
function removeProduct(id) {
    selectedProducts = selectedProducts.filter(function (s) { return s.id !== id; });
    renderSelectedProducts();
    renderProductList(allProducts);
}

/* ── 선택된 상품 태그 렌더링 (최대 4개) ── */
function renderSelectedProducts() {
    var container = document.getElementById('selectedProducts');
    if (!container) return;

    container.innerHTML = selectedProducts.map(function (p) {
        return '<div class="selected-product-tag">' +
            '<img src="' + (p.imageUrl || '') + '" alt="' + p.name + '" onerror="this.style.display=\'none\'">' +
            p.name +
            '<button class="remove-tag" data-id="' + p.id + '" type="button">✕</button>' +
            '</div>';
    }).join('');

    container.querySelectorAll('.remove-tag').forEach(function (btn) {
        btn.addEventListener('click', function () {
            removeProduct(parseInt(this.getAttribute('data-id')));
        });
    });
}

/* ── 게시글 제출 (새 글 / 수정) ── */
function setupSubmit() {
    var btn = document.getElementById('submitBtn');
    if (!btn) return;

    btn.addEventListener('click', function () {
        var rawContent = document.getElementById('contentInput').value.trim();
        if (!rawContent && imageBase64s.length === 0) {
            toast('내용을 입력하거나 이미지를 추가해주세요.');
            return;
        }

        var firstLine   = rawContent.split('\n')[0] || '게시글';
        var title       = firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
        var productTags = selectedProducts.map(function (p) { return '[상품:' + p.id + ']'; }).join('\n');
        var finalContent = rawContent + (productTags ? '\n' + productTags : '');

        var imgUrl = imageBase64s.length === 0
            ? null
            : imageBase64s.length === 1
                ? imageBase64s[0]
                : JSON.stringify(imageBase64s);

        btn.disabled    = true;
        btn.textContent = editPostId ? '수정 중...' : '게시 중...';

        var url    = editPostId ? '/api/posts/' + editPostId : '/api/posts';
        var method = editPostId ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: title, content: finalContent, type: selectedCat, imgUrl: imgUrl })
        })
            .then(function (r) {
                if (r.status === 401) {
                    toast('로그인이 필요합니다.');
                    window.location.href = '/login';
                    return null;
                }
                if (!r.ok) throw new Error('실패');
                return r.json();
            })
            .then(function (post) {
                if (!post) return;
                window.location.href = '/community/' + post.postId;
            })
            .catch(function () {
                toast((editPostId ? '수정' : '게시글 등록') + '에 실패했습니다. 다시 시도해주세요.');
                btn.disabled    = false;
                btn.textContent = editPostId ? '수정하기' : '게시하기';
            });
    });
}

function toast(msg, success = true) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.className = 'toast-show' + (success ? '' : ' toast-error');
    setTimeout(() => { toast.className = ''; }, 1200);

}