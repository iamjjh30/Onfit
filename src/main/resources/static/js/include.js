document.addEventListener('DOMContentLoaded', () => {
    const headerContainer = document.querySelector('#header-container');
    if (!headerContainer) return;

    headerContainer.innerHTML = `
    <div id="header">
        <div class="header_left_group">
        <a href="/">
            <div id="logo">
                <img src="../img/interface/logo.png" alt="OnFit Logo">
            </div>
        </a>
        <nav>
            <ul>
                <a href="../diagnosis"><li>AI진단</li></a>
                <a href="../virtualFitting"><li>가상피팅</li></a>
                <a href="../storeMain"><li>스토어</li></a>
                <li>커뮤니티</li>
                <li>내 팔레트</li>
            </ul>
        </nav>
    </div>
        <div class="header_icon_wrap">
            <div class="header_icon">
                <img src="../img/Main/icon_profile.png">
                    <div class="header_icon_hover1">
                        <nav>
                            <ul>
                                <a href="../login"><li>로그인</li></a>
                                <a href="../signIn"><li>회원가입</li></a>
                                <a href="../find"><li>ID 찾기</li></a>
                            </ul>
                        </nav>
                    </div>
            </div>

            <div class="header_icon">
                <img src="../img/Main/icon_cart (1).png">
                    <div class="header_icon_hover2">
                        <nav>
                            <ul>
                                <li>장바구니</li>
                                <li>주문내역</li>
                                <li>스토어</li>
                            </ul>
                        </nav>
                    </div>
            </div>

            <div class="header_icon">
                <img src="../img/Main/icon_search.png">
                    <div class="header_icon_hover3">
                        <div class="header_search">
                            <form><input class="header_search_main" type="search" placeholder="검색어를 입력해주세요"></form>
                        </div>
                        <div class="header_main">
                            <p>실시간 검색 결과</p>
                            <div class="header_main_search">
                                <div class="header_main_s"></div>
                                <div class="header_main_s"></div>
                                <div class="header_main_s"></div>
                                <div class="header_main_s"></div>
                                <div class="header_main_s"></div>
                            </div>
                        </div>
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
