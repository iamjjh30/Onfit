const slideData = [
    {
        title: "New start with OnFit",
        subtitle: "2026 Seasonal Sale",
        buttonLeft: "스토어 둘러보기",
        buttonRight: "지금 시작하기"
    },
    {
        title: "AI 코디 플래너",
        subtitle: "오늘의 TPO에 딱 맞는 스타일링 제안",
        buttonLeft: "나만의 코디 짜기",
        buttonRight: "스토어 둘러보기"
    },
    {
        title: "퍼스널 컬러 진단",
        subtitle: "당신의 숨겨진 톤을 찾아드립니다",
        buttonLeft: "진단 시작하기",
        buttonRight: "결과 보러가기"
    }
];

document.addEventListener('DOMContentLoaded', function() {
    const banner = document.getElementById('banner');

    // 🌟 1. 철벽 방어: 현재 페이지에 배너가 없으면 여기서 스크립트를 즉시 종료! (에러 완벽 차단)
    if (!banner) return;

    const slides = banner.querySelectorAll('img');
    const totalSlides = slides.length;

    // 슬라이드 이미지가 없어도 종료
    if (totalSlides === 0) return;

    const prevButton = document.getElementById('banner_button_left');
    const nextButton = document.getElementById('banner_button_right');
    const titleEl = document.getElementById('banner-title');
    const subtitleEl = document.getElementById('banner-subtitle');

    let currentSlide = 0;
    const intervalTime = 5000;
    let autoSlideTimer;

    function applyFadeClass(element, className, remove = false) {
        if (element) {
            if (remove) {
                element.classList.remove(className);
            } else {
                element.classList.add(className);
            }
        }
    }

    function updateTextContent(index) {
        if (titleEl && subtitleEl && slideData[index]) {
            titleEl.textContent = slideData[index].title;
            subtitleEl.textContent = slideData[index].subtitle;
        }
    }

    function showSlide(index) {
        slides.forEach((slide) => { slide.style.opacity = 0; });
        if (slides[index]) {
            slides[index].style.opacity = 1;
            currentSlide = index;
        }

        // 닷 인디케이터 업데이트
        const dots = document.querySelectorAll('.banner-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });

        // 슬라이드 카운터 업데이트
        const currentEl = document.getElementById('banner-current');
        if (currentEl) currentEl.textContent = String(index + 1).padStart(2, '0');

        applyFadeClass(titleEl, 'fade-out');
        applyFadeClass(subtitleEl, 'fade-out');
        applyFadeClass(prevButton, 'fade-out');
        applyFadeClass(nextButton, 'fade-out');

        setTimeout(() => {
            updateTextContent(index);

            applyFadeClass(titleEl, 'fade-out', true);
            applyFadeClass(subtitleEl, 'fade-out', true);
            applyFadeClass(prevButton, 'fade-out', true);
            applyFadeClass(nextButton, 'fade-out', true);

            applyFadeClass(titleEl, 'fade-in');
            applyFadeClass(subtitleEl, 'fade-in');
            applyFadeClass(prevButton, 'fade-in');
            applyFadeClass(nextButton, 'fade-in');

        }, 300);
        setTimeout(() => {
            applyFadeClass(titleEl, 'fade-in', true);
            applyFadeClass(subtitleEl, 'fade-in', true);
            applyFadeClass(prevButton, 'fade-in', true);
            applyFadeClass(nextButton, 'fade-in', true);
        }, 700);
    }

    function nextSlide() {
        const nextIndex = (currentSlide + 1) % totalSlides;
        showSlide(nextIndex);
    }

    function prevSlide() {
        let prevIndex = currentSlide - 1;
        if (prevIndex < 0) {
            prevIndex = totalSlides - 1;
        }
        showSlide(prevIndex);
    }

    function startAutoSlide() {
        clearInterval(autoSlideTimer);
        autoSlideTimer = setInterval(nextSlide, intervalTime);
    }

    // 🌟 2. 버튼이 존재하는지 확인 후 이벤트 리스너 부착
    if (nextButton) {
        nextButton.addEventListener('click', function() {
            startAutoSlide();
            nextSlide();
        });
    }

    if (prevButton) {
        prevButton.addEventListener('click', function() {
            startAutoSlide();
            prevSlide();
        });
    }

    // 닷 인디케이터 클릭 이벤트
    document.querySelectorAll('.banner-dot').forEach(dot => {
        dot.addEventListener('click', function() {
            const idx = parseInt(this.getAttribute('data-index'));
            startAutoSlide();
            showSlide(idx);
        });
    });

    // 초기화 실행
    updateTextContent(currentSlide);
    showSlide(currentSlide);
    startAutoSlide();
});