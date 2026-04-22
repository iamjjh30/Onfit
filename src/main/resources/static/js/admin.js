/* ─────────────────────────────────────────────
       [1] CRM 회원 실시간 필터링
    ───────────────────────────────────────────── */
function filterMembers() {
    const searchInput = document.getElementById('memberSearch').value.toLowerCase();
    const colorFilter = document.getElementById('colorFilter').value;
    const dnaFilter   = document.getElementById('dnaFilter').value;
    const rows = document.getElementsByClassName('member-row');
    for (let row of rows) {
        const name  = row.querySelector('.target-name').textContent.toLowerCase();
        const id    = row.querySelector('.target-id').textContent.toLowerCase();
        const color = row.querySelector('.target-color').textContent.toUpperCase();
        const dna   = row.querySelector('.target-dna').textContent.toUpperCase();
        const matchSearch = name.includes(searchInput) || id.includes(searchInput);
        const matchColor  = (colorFilter === 'ALL' || color === colorFilter || (colorFilter === '미진단' && color === '미진단'));
        const matchDna    = (dnaFilter === 'ALL' || dna.includes(dnaFilter));
        row.style.display = (matchSearch && matchColor && matchDna) ? "" : "none";
    }
}

/* ─────────────────────────────────────────────
   [2] 쇼핑 상품 실시간 필터링
───────────────────────────────────────────── */
function filterProducts() {
    const searchInput    = document.getElementById('productSearch').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const rows = document.getElementsByClassName('product-row');
    for (let row of rows) {
        const categoryText = row.querySelector('.col-category').textContent.toUpperCase();
        const nameText     = row.querySelector('.col-name').textContent.toLowerCase();
        const matchCategory = (categoryFilter === 'ALL' || categoryText.includes(categoryFilter));
        const matchName     = nameText.includes(searchInput);
        row.style.display = (matchCategory && matchName) ? "" : "none";
    }
}

/* ─────────────────────────────────────────────
   [3] 섹션 전환
───────────────────────────────────────────── */
function showSection(sectionId, el) {
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(sectionId);
    if (target) target.classList.add('active');
    document.querySelectorAll('.menu-item').forEach(li => li.classList.remove('active-menu'));
    if (el) el.classList.add('active-menu');
}

/* ─────────────────────────────────────────────
   [4] Shopping 내부 탭 전환
───────────────────────────────────────────── */
function showShoppingTab(tabId, el) {
    document.querySelectorAll('.shopping-tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.shopping-tab').forEach(t => t.classList.remove('active'));
    const target = document.getElementById(tabId);
    if (target) target.classList.add('active');
    if (el) el.classList.add('active');
}

/* ─────────────────────────────────────────────
   [5] Outfit 퍼스널컬러 패널 전환
───────────────────────────────────────────── */
function showOutfitColor(colorKey, el) {
    document.querySelectorAll('.outfit-color-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.outfit-color-tab').forEach(t => t.classList.remove('active'));
    const panel = document.getElementById('outfit_panel_' + colorKey);
    if (panel) panel.classList.add('active');
    if (el) el.classList.add('active');
}

/* ─────────────────────────────────────────────
   [6] Outfit 슬롯 저장 (핵심)
       slotKey  예: "NEUTRAL_SET01_TOP"
       selectId 예: "NEUTRAL_SET01_TOP"  (select 요소 id에서 _select 제거 전)
───────────────────────────────────────────── */
function saveOutfitSlot(btn) {
    const slotKey  = btn.getAttribute('data-slot');
    const selectEl = document.getElementById(slotKey + '_select');
    const statusEl = document.getElementById(slotKey + '_status');

    if (!selectEl || !statusEl) {
        console.error('Outfit slot element not found:', slotKey);
        return;
    }

    const productId = selectEl.value;

    // UI 피드백
    statusEl.className = 'slot-status saving';
    statusEl.innerHTML = '저장 중...';
    btn.disabled = true;  // saveBtn → btn 으로 변경

    const globalStatus = document.getElementById('outfitGlobalStatus');
    if (globalStatus) globalStatus.textContent = slotKey + ' 저장 중...';

    fetch('/admin/outfit/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'slot=' + encodeURIComponent(slotKey) + '&productId=' + encodeURIComponent(productId)
    })
        .then(res => res.json())
        .then(data => {
            btn.disabled = false;  // saveBtn → btn
            if (data.result === 'success') {
                statusEl.className = 'slot-status success';
                if (productId === '0') {
                    statusEl.innerHTML = '<span class="outfit-empty-badge">미배정</span>';
                } else {
                    const productName = selectEl.options[selectEl.selectedIndex].text.split(' (')[0];
                    statusEl.innerHTML = '<span class="outfit-assigned-badge">✓ ' + productName + '</span>';
                }
                if (globalStatus) {
                    globalStatus.style.color = '#4CAF50';
                    globalStatus.textContent = '✓ ' + data.message;
                    setTimeout(() => { globalStatus.textContent = ''; }, 3000);
                }
            } else {
                statusEl.className = 'slot-status error';
                statusEl.textContent = '❌ ' + (data.message || '저장 실패');
            }
        })
        .catch(err => {
            btn.disabled = false;  // saveBtn → btn
            statusEl.className = 'slot-status error';
            statusEl.textContent = '❌ 서버 연결 실패';
            console.error('Outfit save error:', err);
        });
}

/* ─────────────────────────────────────────────
   [7] 상품 등록 모달
───────────────────────────────────────────── */
function openModal() {
    const modal = document.getElementById('product_modal');
    if (modal) modal.style.display = 'flex';
}
function closeModal() {
    const modal = document.getElementById('product_modal');
    if (modal) modal.style.display = 'none';
}
window.onclick = function(event) {
    const modal = document.getElementById('product_modal');
    if (event.target == modal) closeModal();
};

/* ─────────────────────────────────────────────
   [8] Project 메모 자동 저장
───────────────────────────────────────────── */
let memoTimer;
const memoArea = document.getElementById('adminMemoArea');
if (memoArea) {
    memoArea.addEventListener('input', function() {
        const status = document.getElementById('saveStatus');
        status.innerText = "저장 중...";
        status.style.color = "#FFB834";
        clearTimeout(memoTimer);
        memoTimer = setTimeout(saveProjectMemo, 800);
    });
}
function saveProjectMemo() {
    const content = document.getElementById('adminMemoArea').value;
    const status  = document.getElementById('saveStatus');
    fetch('/admin/project/memo/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'content=' + encodeURIComponent(content)
    })
        .then(response => response.text())
        .then(result => {
            if (result === 'success') {
                status.innerText = "모든 변경 사항이 저장되었습니다. (" + new Date().toLocaleTimeString() + ")";
                status.style.color = "#4CAF50";
            } else {
                status.innerText = "저장 중 오류가 발생했습니다.";
                status.style.color = "#f44336";
            }
        })
        .catch(error => {
            console.error('Error:', error);
            status.innerText = "서버 연결 실패";
        });
}

window.onload = function() {
    console.log("OnFit Admin System: All Functions Integrated.");
};