// include.js - 헤더 삽입 코드 전부 삭제하고 이것만 유지
document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('#header');
    const tabLinks = document.querySelectorAll('[data-tab]');

    tabLinks.forEach(link => {
        link.addEventListener('click', function() {
            const tabValue = this.getAttribute('data-tab');
            header.classList.remove('warm-mode', 'cool-mode', 'neutral-mode');
            if (tabValue.includes('warm')) header.classList.add('warm-mode');
            else if (tabValue.includes('cool')) header.classList.add('cool-mode');
            else header.classList.add('neutral-mode');
        });
    });
});