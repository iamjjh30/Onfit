document.addEventListener('DOMContentLoaded', () => {
    const sidebarContainer = document.getElementById('sidebar_container');

    // 1. 사이드바 HTML 구조 정의
    const sidebarHTML = `
        <nav id="sidebar">
            <h2 class="sidebar-title">회원관리</h2>
            <ul class="sidebar-menu">
                <li><a href="./UserDetail.html">내 정보</a></li>
            </ul>
            <h2 class="sidebar-title">게시글 관리</h2>
            <ul class="sidebar-menu">
                <li><a href="./MyPosts.html">내 게시글</a></li>
                <li><a href="./MyComments.html">내 댓글</a></li>
                <li><a href="./MyHearts.html">좋아요</a></li>
            </ul>
        </nav>
    `;

    // 2. 컨테이너에 주입
    if (sidebarContainer) {
        sidebarContainer.innerHTML = sidebarHTML;
    }

    // 3. 현재 페이지 활성화 (Active 상태) 처리
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const sidebarLinks = document.querySelectorAll('.sidebar-menu a');

    sidebarLinks.forEach(link => {
        const linkPath = link.getAttribute('href').split('/').pop();
        if (currentPath === linkPath) {
            link.classList.add('active');
        }
    });
});