 const slideData = [
    { 
        title: "New start with OnFit", 
        subtitle: "2026 구정 빅 세일",
        buttonLeft: "이전",
        buttonRight: "다음"
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
    const slides = banner.querySelectorAll('img');
    const totalSlides = slides.length;
    const prevButton = document.getElementById('banner_button_left');
    const nextButton = document.getElementById('banner_button_right');
    const titleEl = document.getElementById('banner-title');
    const subtitleEl = document.getElementById('banner-subtitle');

    let currentSlide = 0;
    const intervalTime = 5000;
    let autoSlideTimer;

    if (totalSlides === 0) {
        return;
    }

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
        slides.forEach((slide) => {
            slide.style.opacity = 0;
        });
        if (slides[index]) {
            slides[index].style.opacity = 1;
            currentSlide = index;
        }

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
    
    nextButton.addEventListener('click', function() {
        startAutoSlide();
        nextSlide();
    });

    prevButton.addEventListener('click', function() {
        startAutoSlide();
        prevSlide();
    });
    updateTextContent(currentSlide); 
    showSlide(currentSlide);
    startAutoSlide();
});

        document.addEventListener('DOMContentLoaded', function(){
        const tabs = document.querySelectorAll('#tab_button li');
        const contents = document.querySelectorAll('#content_area .content'); 

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active')); 

                tab.classList.add('active');

                const targetTab = tab.getAttribute('data-tab');

                const targetContent = document.querySelector(`[data-tab-content="${targetTab}"]`);

                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    });

    const tabButtons = document.querySelectorAll('[data-tab]');
const header = document.getElementById('header');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');
        header.classList.remove('warm-mode', 'cool-mode');
        if (targetTab === 'warm-content-id') {
            header.classList.add('warm-mode');
        } else if (targetTab === 'cool-content-id') { 
            header.classList.add('cool-mode');
        }
    });
});