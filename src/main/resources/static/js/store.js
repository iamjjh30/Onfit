document.addEventListener('DOMContentLoaded', function () {
    console.log("✅ store.js 정상적으로 로드되었습니다!");

    const tabs          = document.querySelectorAll('.category-tabs a');
    const products      = document.querySelectorAll('.product-item');
    const productGrid   = document.querySelector('.product-grid');
    const filterBtn     = document.getElementById('filter-btn');
    const filterDropdown = document.getElementById('filter-dropdown');
    const applyBtn      = document.querySelector('.apply-btn');

    // ✅ 필터 드롭다운 열기/닫기
    if (filterBtn && filterDropdown) {
        filterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            filterDropdown.classList.toggle('active');
        });

        // 외부 클릭 시 닫기
        document.addEventListener('click', (e) => {
            if (!filterDropdown.contains(e.target) && e.target !== filterBtn) {
                filterDropdown.classList.remove('active');
            }
        });
    }

    // ✅ 카테고리 탭
    tabs.forEach(tab => {
        tab.addEventListener('click', function (e) {
            e.preventDefault();
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            filterAndShow();
        });
    });

    // ✅ 적용하기 버튼
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            filterAndShow();
            filterDropdown.classList.remove('active');
        });
    }

    function filterAndShow() {
        const activeTabElement = document.querySelector('.category-tabs a.active');
        const activeTab = activeTabElement
            ? activeTabElement.getAttribute('data-target').trim().toUpperCase()
            : 'ALL';

        const checkedTones = Array.from(document.querySelectorAll('input[name="tone"]:checked'))
            .map(cb => cb.value.trim().toUpperCase());

        const minPrice = parseInt(document.getElementById('min-price').value) || 0;
        const maxPrice = parseInt(document.getElementById('max-price').value) || Infinity;

        const sortTypeElem = document.querySelector('input[name="sort"]:checked');
        const sortType = sortTypeElem ? sortTypeElem.value : null;

        // ✅ 1. 필터링
        let visibleProducts = [];
        products.forEach(product => {
            const category = (product.getAttribute('data-category') || '').trim().toUpperCase();
            const price    = parseInt(product.getAttribute('data-price')) || 0;
            const tones    = (product.getAttribute('data-tone') || '').toUpperCase();

            const matchCategory = (activeTab === 'ALL' || activeTab === category);
            const matchPrice    = (price >= minPrice && price <= maxPrice);
            const matchTone     = (checkedTones.length === 0 || checkedTones.some(t => tones.includes(t)));

            if (matchCategory && matchPrice && matchTone) {
                product.style.display = '';
                visibleProducts.push(product);
            } else {
                product.style.display = 'none';
            }
        });

        console.log(`✅ 필터 완료! 보여지는 상품 수: ${visibleProducts.length}개`);

        // ✅ 2. 정렬
        if (!sortType || visibleProducts.length === 0) return;

        visibleProducts.sort((a, b) => {
            const priceA   = parseInt(a.getAttribute('data-price')) || 0;
            const priceB   = parseInt(b.getAttribute('data-price')) || 0;
            const createdA = a.getAttribute('data-created') || '';
            const createdB = b.getAttribute('data-created') || '';
            const viewA    = parseInt(a.getAttribute('data-view')) || 0;
            const viewB    = parseInt(b.getAttribute('data-view')) || 0;

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