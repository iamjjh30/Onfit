/* ============================================================
   OnFit — Main.js
   컬러 트렌드 팝업 제거됨 → /colorTrend?trend={key} 페이지로 이동
   ============================================================ */

// ---------- 배너 슬라이드 ----------
document.addEventListener('DOMContentLoaded', function () {
    var banner = document.getElementById('banner');
    if (!banner) return;

    var slides = banner.querySelectorAll('img.slide');
    var dots   = document.querySelectorAll('.banner-dot');
    var current = 0;

    function showSlide(index) {
        slides.forEach(function (s, i) {
            s.style.opacity = (i === index) ? '1' : '0';
        });
        dots.forEach(function (d, i) {
            d.classList.toggle('active', i === index);
        });
        current = index;
    }

    setInterval(function () {
        showSlide((current + 1) % slides.length);
    }, 5000);

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showSlide(parseInt(this.getAttribute('data-index')));
        });
    });

    showSlide(0);
});