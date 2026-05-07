/* ====================================================
   OnFit Admin - 통합 JavaScript (HTML과 완벽 동기화 완료!)
   ==================================================== */

// [1] 섹션 전환
window.showSection = function(id, btn) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const target = document.getElementById(id);
    if (target) target.classList.add('active');
    if (btn) btn.classList.add('active');

    const crumb = document.getElementById('pageCrumb');
    if (crumb) {
        crumb.textContent = {
            dashboard: 'Dashboard', shopping: 'Shopping', crm: 'CRM',
            'main-section': 'Main', project: 'Project', access: 'Access Control'
        }[id] || id;
    }
}

// [2] 시계 업데이트
function updateClock() {
    const el = document.getElementById('clock');
    if (el) el.textContent = new Date().toLocaleTimeString('ko-KR', { hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false });
}
setInterval(updateClock, 1000);

// [3] 쇼핑 상품 필터링
function filterProducts() {
    const cat = document.getElementById('shopCatFilter')?.value || 'ALL';
    document.querySelectorAll('.product-card').forEach(card => {
        const c = card.dataset.category || '';
        card.style.display = (cat === 'ALL' || c === cat) ? '' : 'none';
    });
}

// [4] 신규 상품 모달 제어
function openProductModal() { document.getElementById('productModal')?.classList.add('open'); }
function closeProductModal(e) {
    if (e && e.target !== document.getElementById('productModal')) return;
    document.getElementById('productModal')?.classList.remove('open');
}

// [5] CRM 필터링
function filterCRM() {
    const search = (document.getElementById('crmSearch')?.value || '').toLowerCase();
    const color  = document.getElementById('crmColorFilter')?.value || 'ALL';
    const dna    = document.getElementById('crmDnaFilter')?.value || 'ALL';

    document.querySelectorAll('.crm-row').forEach(row => {
        const name = (row.dataset.name || '').toLowerCase();
        const id   = (row.dataset.id   || '').toLowerCase();
        const rColor = row.dataset.color || '';
        const rDna   = row.dataset.dna   || '';
        const matchSearch = !search || name.includes(search) || id.includes(search);
        const matchColor  = color === 'ALL' || rColor === color || (color === '미진단' && !rColor);
        const matchDna    = dna   === 'ALL' || rDna   === dna;
        row.style.display = (matchSearch && matchColor && matchDna) ? '' : 'none';
    });
}

// [6] 메인 컬러 탭 전환
function switchColorTab(key, btn) {
    document.querySelectorAll('.color-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.color-tab').forEach(t => t.classList.remove('active'));
    const panel = document.getElementById(key + '_panel');
    if (panel) panel.classList.add('active');
    if (btn) btn.classList.add('active');
}

// [7] 아웃핏 슬롯 저장 (핵심)
function saveOutfitSlot(btn) {
    const slotKey = btn.dataset.slot;
    const sel = document.getElementById(slotKey);
    const productId = sel?.value;

    if (!productId) { alert('상품을 선택해주세요.'); return; }

    btn.textContent = '저장 중...';
    btn.disabled = true;

    fetch('/admin/outfit/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'slot=' + encodeURIComponent(slotKey) + '&productId=' + productId
    })
        .then(r => {
            if (!r.ok) throw new Error('Save failed');
            return r.json();
        })
        .then(data => {
            const statusEl = document.getElementById(slotKey + '_status');
            if (statusEl) {
                statusEl.innerHTML = `<span class="badge badge-active">✓ ${data.message || '저장됨'}</span>`;
            }
            btn.textContent = '저장됨 ✓';
            setTimeout(() => { btn.textContent = '저장'; btn.disabled = false; }, 1500);
        })
        .catch(() => {
            alert('저장에 실패했습니다.');
            btn.textContent = '저장';
            btn.disabled = false;
        });
}
// 🌟 window. 를 붙이고 파라미터에 btn을 추가했습니다!
// [8] Best Picks 저장 (새로고침 제거 버전!)
window.saveBestPick = function(color, slotNum, btn) {
    const selectEl = document.getElementById(color + '_bestSelect_' + slotNum);
    const productId = selectEl.value;

    if (!productId) {
        alert('상품을 먼저 선택해주세요.');
        return;
    }

    btn.textContent = '저장 중...';
    btn.disabled = true;

    fetch('/admin/best/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'color=' + encodeURIComponent(color) + '&productId=' + productId
    })
        .then(res => res.json())
        .then(data => {
            if (data.result === 'success') {
                btn.textContent = '저장 완료 ✓';
                btn.style.background = '#000';
                btn.style.color = '#fff';

                // 🌟 범인 검거! location.reload()를 지우고, 1.5초 뒤에 버튼 원래대로 복구만 해줍니다.
                setTimeout(() => {
                    btn.textContent = '저장';
                    btn.disabled = false;
                    btn.style.background = 'var(--bg-hover)';
                    btn.style.color = 'var(--text-secondary)';
                }, 1500);

            } else {
                alert('저장 실패: ' + data.message);
                btn.textContent = '저장';
                btn.disabled = false;
            }
        })
        .catch(err => {
            console.error(err);
            alert('서버 연결 실패');
            btn.textContent = '저장';
            btn.disabled = false;
        });
};
// [8] 이미지 미리보기 업데이트
function updateOutfitPreview(selectEl) {
    const previewId = selectEl.id + '_preview';
    const previewImg = document.getElementById(previewId);
    if (!previewImg) return;

    const selectedOption = selectEl.options[selectEl.selectedIndex];
    const imageUrl = selectedOption ? selectedOption.getAttribute('data-image') : '';

    if (imageUrl) {
        previewImg.src = imageUrl;
        previewImg.style.display = 'block';
    } else {
        previewImg.src = '';
        previewImg.style.display = 'none';
    }
}

// [9] 프로젝트 메모 자동 저장
let memoTimer = null;
function updateMemoCount(val) {
    const el = document.getElementById('memoCount');
    if (el) el.textContent = (val || '').length + '자';
}
function autoSaveMemo(content) {
    fetch('/admin/project/memo/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'content=' + encodeURIComponent(content)
    });
}
function saveMemo() {
    const area = document.getElementById('adminMemoArea');
    if (area) autoSaveMemo(area.value);
}

// ==========================================
// 문서 로딩 완료 후 이벤트 리스너 초기화
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    updateClock();

    // 접근 제어 메뉴 표시 (권한 있는 경우)
    const accessBtn = document.getElementById('accessNavBtn');
    if (accessBtn) accessBtn.style.display = 'flex';

    // 기존 아웃핏 미리보기 이미지 세팅
    document.querySelectorAll('.outfit-select').forEach(sel => updateOutfitPreview(sel));

    // ESC 키 모달 닫기
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeProductModal();
    });

    // 메모장 타이머 연결
    const memoArea = document.getElementById('adminMemoArea');
    if (memoArea) {
        updateMemoCount(memoArea.value);
        memoArea.addEventListener('input', () => {
            updateMemoCount(memoArea.value);
            clearTimeout(memoTimer);
            memoTimer = setTimeout(() => autoSaveMemo(memoArea.value), 1500);
        });
    }

    console.log("OnFit Admin System: All Functions Integrated Successfully.");
});