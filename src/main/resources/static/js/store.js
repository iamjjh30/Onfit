document.addEventListener('DOMContentLoaded', function () {
    console.log("✅ store.js 로드 완료!");

    const wrap = document.getElementById('wrap');
    if (!wrap) { console.error("🚨 #wrap 영역을 찾을 수 없습니다!"); return; }

    const categoryTabs   = wrap.querySelectorAll('.category-tabs a');
    const toneTabs       = wrap.querySelectorAll('.tone-tabs a');
    const products       = wrap.querySelectorAll('.product-item');
    const productGrid    = wrap.querySelector('.product-grid');
    const filterBtn      = wrap.querySelector('#filter-btn');
    const filterDropdown = wrap.querySelector('#filter-dropdown');
    const filterInputs   = wrap.querySelectorAll('input[name="sort"], #min-price, #max-price');

    /* ── 드롭다운 열기/닫기 ── */
    if (filterBtn && filterDropdown) {
        filterBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            filterDropdown.classList.toggle('active');
        });
        document.addEventListener('click', function(e) {
            if (!filterDropdown.contains(e.target) && e.target !== filterBtn) {
                filterDropdown.classList.remove('active');
            }
        });
    }

    /* ── 필터 초기화 함수 ── */
    function resetFilters() {
        // 정렬 라디오 버튼 초기화
        wrap.querySelectorAll('input[name="sort"]').forEach(function(input) {
            input.checked = false;
        });
        // 가격 입력 초기화
        var minInput = wrap.querySelector('#min-price');
        var maxInput = wrap.querySelector('#max-price');
        if (minInput) minInput.value = '';
        if (maxInput) maxInput.value = '';
    }

    /* ── 카테고리 탭 ── */
    categoryTabs.forEach(function(tab) {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            categoryTabs.forEach(function(t) { t.classList.remove('active'); });
            this.classList.add('active');
            resetFilters();
            filterAndShow();
        });
    });

    /* ── 퍼스널 컬러 탭 ── */
    toneTabs.forEach(function(tab) {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            toneTabs.forEach(function(t) { t.classList.remove('active'); });
            this.classList.add('active');
            resetFilters();
            filterAndShow();
        });
    });

    /* ── 필터 입력 변경 감지 ── */
    filterInputs.forEach(function(input) {
        input.addEventListener('change', filterAndShow);
        if (input.type === 'number') {
            input.addEventListener('keyup', filterAndShow);
        }
    });

    /* ── 필터 & 정렬 ── */
    function filterAndShow() {
        // 카테고리
        var activeTabEl = wrap.querySelector('.category-tabs a.active');
        var activeTab   = activeTabEl ? activeTabEl.getAttribute('data-target').trim().toUpperCase() : 'ALL';

        // 퍼스널 컬러 톤
        var activeToneEl = wrap.querySelector('.tone-tabs a.active');
        var activeTone   = activeToneEl ? activeToneEl.getAttribute('data-tone').trim().toUpperCase() : 'ALL';

        // 가격
        var minVal   = parseInt(wrap.querySelector('#min-price').value);
        var maxVal   = parseInt(wrap.querySelector('#max-price').value);
        var minPrice = isNaN(minVal) ? 0        : minVal;
        var maxPrice = isNaN(maxVal) ? 99999999 : maxVal;

        // 정렬
        var sortTypeEl = wrap.querySelector('input[name="sort"]:checked');
        var sortType   = sortTypeEl ? sortTypeEl.value : null;

        console.log('탭:', activeTab, '/ 톤:', activeTone, '/ 가격:', minPrice, '~', maxPrice, '/ 정렬:', sortType);

        var visibleProducts = [];

        products.forEach(function(product) {
            var category = (product.getAttribute('data-category') || '').trim().toUpperCase();
            var tone     = (product.getAttribute('data-tone')     || '').trim().toUpperCase();
            var price    = parseInt((product.getAttribute('data-price') || '0').replace(/,/g, '')) || 0;

            var matchCategory = (activeTab  === 'ALL' || activeTab  === category);
            var matchTone     = (activeTone === 'ALL' || tone.includes(activeTone));
            var matchPrice    = (price >= minPrice && price <= maxPrice);

            if (matchCategory && matchTone && matchPrice) {
                product.style.display = '';
                visibleProducts.push(product);
            } else {
                product.style.display = 'none';
            }
        });

        console.log('보임:', visibleProducts.length, '개');

        // 정렬
        if (!sortType || visibleProducts.length === 0) return;

        visibleProducts.sort(function(a, b) {
            var priceA   = parseInt((a.getAttribute('data-price')   || '0').replace(/,/g, '')) || 0;
            var priceB   = parseInt((b.getAttribute('data-price')   || '0').replace(/,/g, '')) || 0;
            var createdA = a.getAttribute('data-created') || '';
            var createdB = b.getAttribute('data-created') || '';
            var viewA    = parseInt(a.getAttribute('data-view')) || 0;
            var viewB    = parseInt(b.getAttribute('data-view')) || 0;

            if (sortType === 'price_low')  return priceA - priceB;
            if (sortType === 'price_high') return priceB - priceA;
            if (sortType === 'newest')     return createdB.localeCompare(createdA);
            if (sortType === 'popular')    return viewB - viewA;
            return 0;
        });

        visibleProducts.forEach(function(product) { productGrid.appendChild(product); });
    }

    filterAndShow();

    // URL 파라미터(?category=SHIRT 등)로 진입 시 해당 탭 자동 활성화
    var urlParams = new URLSearchParams(window.location.search);
    var categoryParam = (urlParams.get('category') || '').toUpperCase();
    if (categoryParam && categoryParam !== 'ALL') {
        var targetTab = wrap.querySelector('.category-tabs a[data-target="' + categoryParam + '"]');
        if (targetTab) {
            categoryTabs.forEach(function(t) { t.classList.remove('active'); });
            targetTab.classList.add('active');
            filterAndShow();
        }
    }
});