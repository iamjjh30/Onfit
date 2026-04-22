document.addEventListener('DOMContentLoaded', function()  {
    console.log("✅ store.js 정상적으로 로드되었습니다!"); // 1. JS가 제대로 불려왔는지 확인

    const tabs = document.querySelectorAll('.category-tabs a');
    const products = document.querySelectorAll('.product-item');
    const productGrid = document.querySelector('.product-grid');
    const filterBtn = document.getElementById('filter-btn');
    const filterDropdown = document.getElementById('filter-dropdown');
    const applyBtn = document.querySelector('.apply-btn');

    if (filterBtn && filterDropdown) {
        filterBtn.addEventListener('click', () => {
            filterDropdown.classList.toggle('active');
        });
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            filterAndShow();
        });
    });

    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            filterAndShow();
            filterDropdown.classList.remove('active');
        });
    }

    function filterAndShow() {
        const activeTabElement = document.querySelector('.category-tabs a.active');
        const activeTab = activeTabElement ? activeTabElement.getAttribute('data-target').trim().toUpperCase() : 'ALL';

        const checkedTones = Array.from(document.querySelectorAll('input[name="tone"]:checked'))
            .map(cb => cb.value.trim().toUpperCase());

        const minPriceInput = document.getElementById('min-price').value;
        const maxPriceInput = document.getElementById('max-price').value;
        const minPrice = minPriceInput ? parseInt(minPriceInput) : 0;
        const maxPrice = maxPriceInput ? parseInt(maxPriceInput) : Infinity;

        const sortTypeElem = document.querySelector('input[name="sort"]:checked');
        const sortType = sortTypeElem ? sortTypeElem.value : null;

        console.log(`🔍 [필터 실행] 탭: ${activeTab}, 톤: ${checkedTones}, 가격: ${minPrice}~${maxPrice}`);

        let visibleCount = 0; // 몇 개가 살아남는지 카운트

        products.forEach((product, index) => {
            const category = (product.getAttribute('data-category') || "").trim().toUpperCase();
            const price = parseInt(product.getAttribute('data-price')) || 0;
            const tones = (product.getAttribute('data-tone') || "").toUpperCase();

            const matchCategory = (activeTab === 'ALL' || activeTab === category);
            const matchPrice = (price >= minPrice && price <= maxPrice);
            const matchTone = (checkedTones.length === 0 || checkedTones.some(t => tones.includes(t)));

            if (matchCategory && matchPrice && matchTone) {
                // 🌟 중요: 'block' 대신 빈 문자열('')을 넣어 CSS Grid 속성을 해치지 않게 합니다.
                product.style.display = '';
                visibleCount++;
            } else {
                product.style.display = 'none';
            }

            // 첫 번째 상품의 데이터가 잘 읽히는지 로그 출력
            if(index === 0) {
                console.log(`📦 [상품1 데이터] 카테고리:${category}, 가격:${price}, 톤:${tones}`);
            }
        });

        console.log(`✅ 필터 완료! 보여지는 상품 수: ${visibleCount}개`);

        if (sortType === 'price_low') {
            const productsArray = Array.from(products);
            productsArray.sort((a, b) => {
                const priceA = parseInt(a.getAttribute('data-price')) || 0;
                const priceB = parseInt(b.getAttribute('data-price')) || 0;
                return priceA - priceB;
            });
            productsArray.forEach(product => {
                productGrid.appendChild(product);
            });
        }
    }

    filterAndShow();
});