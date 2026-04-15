document.addEventListener('DOMContentLoaded', () => {
    const headerContainer = document.querySelector('#header-container');
    if (!headerContainer) return;

    headerContainer.innerHTML = `
    <div id="header-outer">
    <div id="header">
        <a href="../">
            <div id="logo">
                <img src="../img/interface/LOGO_B.png">
            </div>
        </a>
        <nav>
            <ul>
                <a href="/AIStyler"><li>AI진단</li></a>
                <a href="/store"><li>스토어</li></a>
                <a href="/Community"><li>커뮤니티</li></a>
                <a href="/MyPalette"><li>내 팔레트</li></a>
            </ul>
        </nav>

        <!-- 검색창 — 항상 노출, 좌측 돋보기 아이콘 포함 -->
        <div id="header-search-inline">
            <div id="header-search-box">
                <svg id="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input type="search" id="header-search-input" placeholder="Mens Fashion Solution" autocomplete="off">
            </div>
        </div>

        <!-- 프로필 아이콘 -->
        <div class="header_icon">
            <img src="../img/Main/icon_profile.png">
            <div class="header_icon_hover1">
                <nav><ul>
                    <li><a href="/login">로그인</a></li>
                    <li><a href="/signIn">회원가입</a></li>
                    <li><a href="/find">ID 찾기</a></li>
                </ul></nav>
            </div>
        </div>
        <!-- 장바구니 아이콘 -->
        <div class="header_icon">
            <img src="../img/Main/icon_cart (1).png">
            <div class="header_icon_hover2">
                <nav><ul>
                    <li><a href="/Cart">장바구니</a></li>
                    <li><a href="/OrderInfo">주문내역</a></li>
                    <li><a href="/store">스토어</a></li>
                </ul></nav>
            </div>
        </div>
    </div>
</div>
`;
    const header = document.querySelector('#header');
    const tabLinks = document.querySelectorAll('[data-tab]');

    tabLinks.forEach(link => {
        link.addEventListener('click', function() {
            const tabValue = this.getAttribute('data-tab');

            header.classList.remove('warm-mode', 'cool-mode', 'neutral-mode');

            if (tabValue.includes('warm')) {
                header.classList.add('warm-mode');
            } else if (tabValue.includes('cool')) {
                header.classList.add('cool-mode');
            } else {
                header.classList.add('neutral-mode');
            }
        });
    });
});
