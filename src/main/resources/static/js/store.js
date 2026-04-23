document.addEventListener('DOMContentLoaded', function () {
    console.log("✅ store.js 로드 완료! (유령 완벽 차단 모드)");

    // 🌟 [핵심] 헤더 다 무시하고, 진짜 본문인 id="wrap" 안에서만 요소를 찾습니다!
    const wrap = document.getElementById('wrap');
    if (!wrap) {
        console.error("🚨 #wrap 영역을 찾을 수 없습니다!");
        return;
    }

    const tabs           = wrap.querySelectorAll('.category-tabs a');
    const products       = wrap.querySelectorAll('.product-item');
    const productGrid    = wrap.querySelector('.product-grid');
    const filterBtn      = wrap.querySelector('#filter-btn');
    const filterDropdown = wrap.querySelector('#filter-dropdown');
    const applyBtn       = wrap.querySelector('.apply-btn');

    const filterInputs   = wrap.querySelectorAll('input[name="tone"], input[name="sort"], #min-price, #max-price');

    // 드롭다운 열기/닫기
    if (filterBtn && filterDropdown) {
        filterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            filterDropdown.classList.toggle('active');
        });
        document.addEventListener('click', (e) => {
            if (!filterDropdown.contains(e.target) && e.target !== filterBtn) {
                filterDropdown.classList.remove('active');
            }
        });
    }

    // 카테고리 탭 클릭
    tabs.forEach(tab => {
        tab.addEventListener('click', function (e) {
            e.preventDefault();
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            filterAndShow();
        });
    });

    // 필터 값 변경 감지
    filterInputs.forEach(input => {
        input.addEventListener('change', filterAndShow);
        if (input.type === 'number') {
            input.addEventListener('keyup', filterAndShow);
        }
    });

    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            filterAndShow();
            filterDropdown.classList.remove('active');
        });
    }

    function filterAndShow() {
        // 🌟 값을 읽어올 때도 반드시 wrap 안에서만 읽어옵니다!
        const activeTabElement = wrap.querySelector('.category-tabs a.active');
        const activeTab = activeTabElement ? activeTabElement.getAttribute('data-target').trim().toUpperCase() : 'ALL';

        const checkedTones = Array.from(wrap.querySelectorAll('input[name="tone"]:checked'))
            .map(cb => cb.value.trim().toUpperCase());

        let minVal = parseInt(wrap.querySelector('#min-price').value);
        let maxVal = parseInt(wrap.querySelector('#max-price').value);
        const minPrice = isNaN(minVal) ? 0 : minVal;
        const maxPrice = isNaN(maxVal) ? 99999999 : maxVal;

        const sortTypeElem = wrap.querySelector('input[name="sort"]:checked');
        const sortType = sortTypeElem ? sortTypeElem.value : null;

        console.log(`🔍 [JS가 읽은 값] 탭: ${activeTab}, 톤: [${checkedTones}], 가격: ${minPrice}~${maxPrice}`);

        let visibleProducts = [];
        let hiddenCount = 0;

        products.forEach(product => {
            const category = (product.getAttribute('data-category') || '').trim().toUpperCase();
            const tones    = (product.getAttribute('data-tone') || '').toUpperCase();
            const price    = parseInt((product.getAttribute('data-price') || '0').replace(/,/g, '')) || 0;

            const matchCategory = (activeTab === 'ALL' || activeTab === category);
            const matchPrice    = (price >= minPrice && price <= maxPrice);
            const matchTone     = (checkedTones.length === 0 || checkedTones.some(t => tones.includes(t)));

            if (matchCategory && matchPrice && matchTone) {
                product.style.display = '';
                visibleProducts.push(product);
            } else {
                product.style.display = 'none';
                hiddenCount++;
            }
        });

        console.log(`✅ 렌더링 결과: [보임 ${visibleProducts.length}개] / [숨김 ${hiddenCount}개]`);

        // 정렬
        if (!sortType || visibleProducts.length === 0) return;

        visibleProducts.sort((a, b) => {
            const priceA = parseInt((a.getAttribute('data-price') || '0').replace(/,/g, '')) || 0;
            const priceB = parseInt((b.getAttribute('data-price') || '0').replace(/,/g, '')) || 0;
            const createdA = a.getAttribute('data-created') || '';
            const createdB = b.getAttribute('data-created') || '';
            const viewA = parseInt(a.getAttribute('data-view')) || 0;
            const viewB = parseInt(b.getAttribute('data-view')) || 0;

            if (sortType === 'price_low')  return priceA - priceB;
            if (sortType === 'price_high') return priceB - priceA;
            if (sortType === 'newest')     return createdB.localeCompare(createdA);
            if (sortType === 'popular')    return viewB - viewA;
            return 0;
        });

        visibleProducts.forEach(product => productGrid.appendChild(product));
    }

    filterAndShow();
});