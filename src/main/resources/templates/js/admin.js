/* ═══════════════════════════════════════
   OnFit Admin · admin.js
═══════════════════════════════════════ */

/* ── Section navigation ── */
function showSection(id, btn) {
  // hide all
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  // show target
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
  if (btn) btn.classList.add('active');

  // update topbar crumb
  const labels = {
    'dashboard':    'Dashboard',
    'shopping':     'Shopping',
    'crm':          'CRM',
    'main-section': 'Main',
    'project':      'Project',
    'access':       'Access Control',
  };
  const crumb = document.getElementById('pageCrumb');
  if (crumb) crumb.textContent = labels[id] || id;
}

/* ── Clock ── */
function updateClock() {
  const el = document.getElementById('clock');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}
setInterval(updateClock, 1000);
updateClock();

/* ── Dashboard date ── */
(function() {
  const el = document.getElementById('dashDate');
  if (!el) return;
  const d = new Date();
  el.textContent = d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
})();

/* ── Show/hide Access nav (JS fallback for non-Thymeleaf preview) ── */
(function() {
  const btn = document.getElementById('accessNavBtn');
  if (btn) btn.style.display = 'flex'; // Thymeleaf th:if handles actual auth
})();

/* ══════════════════════════════
   SHOPPING
══════════════════════════════ */
function openProductModal() {
  const m = document.getElementById('productModal');
  if (m) m.classList.add('open');
}
function closeProductModal(e) {
  if (e && e.target !== document.getElementById('productModal')) return;
  const m = document.getElementById('productModal');
  if (m) m.classList.remove('open');
}

function filterProducts() {
  const cat = document.getElementById('shopCatFilter')?.value;
  document.querySelectorAll('.product-card').forEach(card => {
    const c = card.dataset.category || '';
    card.style.display = (cat === 'ALL' || c === cat) ? '' : 'none';
  });
}

/* ══════════════════════════════
   CRM
══════════════════════════════ */
function filterCRM() {
  const search = (document.getElementById('crmSearch')?.value || '').toLowerCase();
  const color  = document.getElementById('crmColorFilter')?.value || 'ALL';
  const dna    = document.getElementById('crmDnaFilter')?.value   || 'ALL';

  document.querySelectorAll('.crm-row').forEach(row => {
    const name    = (row.dataset.name  || '').toLowerCase();
    const id      = (row.dataset.id    || '').toLowerCase();
    const rColor  = row.dataset.color  || '';
    const rDna    = row.dataset.dna    || '';

    const matchSearch = !search || name.includes(search) || id.includes(search);
    const matchColor  = color === 'ALL' || rColor === color || (color === '미진단' && !rColor);
    const matchDna    = dna   === 'ALL' || rDna   === dna;

    row.style.display = (matchSearch && matchColor && matchDna) ? '' : 'none';
  });
}

/* Member detail modal */
const memberData = {}; // populate from Thymeleaf or AJAX if needed

function showMemberDetail(userId) {
  // Try to read from the table row's data attributes
  const row = document.querySelector(`.crm-row`);
  // fallback: navigate to detail page
  const link = document.getElementById('detailFullLink');
  if (link) link.href = `/admin/member/detail/${userId}`;

  // Populate from row
  const rows = document.querySelectorAll('.crm-row');
  let found = null;
  rows.forEach(r => {
    // We stored userId via th:data or we just grab by index
  });

  // Open modal
  const modal = document.getElementById('memberModal');
  if (modal) modal.classList.add('open');
}

function closeMemberModal(e) {
  if (e && e.target !== document.getElementById('memberModal')) return;
  const m = document.getElementById('memberModal');
  if (m) m.classList.remove('open');
}

/* ══════════════════════════════
   MAIN — Outfit slots
══════════════════════════════ */
function switchColorTab(colorKey, btn) {
  document.querySelectorAll('.color-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.color-panel').forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const panel = document.getElementById(colorKey + '_panel');
  if (panel) panel.classList.add('active');
}

function saveOutfitSlot(btn) {
  const slotKey = btn.dataset.slot;
  if (!slotKey) return;
  const sel = document.getElementById(slotKey);
  if (!sel) return;
  const productId = sel.value;
  if (!productId) { alert('상품을 선택해주세요.'); return; }

  btn.textContent = '저장 중...';
  btn.disabled = true;

  fetch('/admin/outfit/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slotKey, productId }),
  })
    .then(r => r.json())
    .then(data => {
      const statusEl = document.getElementById(slotKey + '_status');
      if (statusEl) {
        statusEl.innerHTML = `<span class="badge badge-active">✓ ${data.productName || '저장됨'}</span>`;
      }
      btn.textContent = '저장';
      btn.disabled = false;
    })
    .catch(() => {
      alert('저장에 실패했습니다.');
      btn.textContent = '저장';
      btn.disabled = false;
    });
}

/* ══════════════════════════════
   PROJECT — Memo
══════════════════════════════ */
let memoTimer = null;

(function initMemo() {
  const area = document.getElementById('adminMemoArea');
  if (!area) return;

  updateMemoCount(area.value);

  area.addEventListener('input', () => {
    updateMemoCount(area.value);
    const status = document.getElementById('saveStatus');
    if (status) { status.textContent = '저장 대기 중...'; status.style.color = 'var(--text-muted)'; }
    clearTimeout(memoTimer);
    memoTimer = setTimeout(() => autoSaveMemo(area.value), 1500);
  });
})();

function updateMemoCount(val) {
  const el = document.getElementById('memoCount');
  if (el) el.textContent = (val || '').length + '자';
}

function autoSaveMemo(content) {
  fetch('/admin/project/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })
    .then(() => {
      const status = document.getElementById('saveStatus');
      if (status) {
        status.textContent = '자동 저장됨 ✓';
        status.style.color = 'var(--accent)';
        setTimeout(() => { status.textContent = '변경 사항이 없습니다'; status.style.color = ''; }, 2500);
      }
    })
    .catch(() => {});
}

function saveMemo() {
  const area = document.getElementById('adminMemoArea');
  if (!area) return;
  autoSaveMemo(area.value);
}

function insertMemoText(text) {
  const area = document.getElementById('adminMemoArea');
  if (!area) return;
  const start = area.selectionStart;
  const end   = area.selectionEnd;
  const val   = area.value;
  area.value  = val.substring(0, start) + text + val.substring(end);
  area.selectionStart = area.selectionEnd = start + text.length;
  area.focus();
  area.dispatchEvent(new Event('input'));
}

/* ── ESC to close modals ── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.getElementById('productModal')?.classList.remove('open');
    document.getElementById('memberModal')?.classList.remove('open');
  }
});