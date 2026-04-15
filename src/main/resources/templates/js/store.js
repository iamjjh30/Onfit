document.addEventListener('DOMContentLoaded', () => {
    const filterBtn = document.getElementById('filter-btn');
    const filterDropdown = document.getElementById('filter-dropdown');
    const applyBtn = document.querySelector('.apply-btn');
    const toneHeaders = document.querySelectorAll('.tone-header');

    toneHeaders.forEach(header => {
        header.addEventListener('click', (e) => {
            e.stopPropagation();

            const parentSection = header.parentElement;

            parentSection.classList.toggle('active');
        });
    });
    filterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        filterDropdown.classList.toggle('active');
    });

    filterDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    document.addEventListener('click', () => {
        filterDropdown.classList.remove('active');
    });

    applyBtn.addEventListener('click', () => {
        alert('필터 조건이 서버로 전송됩니다.');
        filterDropdown.classList.remove('active');
    });
});