/* ============================================================
   MyPage.js (통합본 - 단일 주소 기반 추가/수정/삭제 지원)
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

    /* ── 1. 탭 전환 ── */
    document.querySelectorAll('.mp-tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.mp-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.mp-section').forEach(s => s.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(this.dataset.target).classList.add('active');
        });
    });

    /* ── 2. 회원 정보 수정 ── */
    var btnEdit   = document.getElementById('btn-edit-info');
    var btnSave   = document.getElementById('btn-save-info');
    var btnCancel = document.getElementById('btn-cancel-info');
    var editableIds = ['input-name', 'input-email', 'input-tel'];

    if (btnEdit) {
        btnEdit.addEventListener('click', function () {
            editableIds.forEach(function (id) {
                var el = document.getElementById(id);
                if (el) { el.removeAttribute('readonly'); el.classList.add('editable'); }
            });
            btnEdit.style.display   = 'none';
            btnSave.style.display   = 'inline-flex';
            btnCancel.style.display = 'inline-flex';
        });
    }

    if (btnCancel) {
        btnCancel.addEventListener('click', function () {
            editableIds.forEach(function (id) {
                var el = document.getElementById(id);
                if (el) { el.setAttribute('readonly', ''); el.classList.remove('editable'); }
            });
            // 원래 값 복원
            document.getElementById('input-name').value  = window.MEMBER_DATA.name  || '';
            document.getElementById('input-email').value = window.MEMBER_DATA.email || '';
            document.getElementById('input-tel').value   = window.MEMBER_DATA.tel   || '';
            btnEdit.style.display   = 'inline-flex';
            btnSave.style.display   = 'none';
            btnCancel.style.display = 'none';
        });
    }

    if (btnSave) {
        btnSave.addEventListener('click', function () {
            var name  = document.getElementById('input-name').value.trim();
            var email = document.getElementById('input-email').value.trim();
            var tel   = document.getElementById('input-tel').value.trim();

            if (!name || !email || !tel) {
                alert('이름, 이메일, 전화번호를 모두 입력해주세요.');
                return;
            }

            fetch('/api/mypage/info', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name, email, tel })
            })
                .then(function (res) {
                    if (res.ok) {
                        alert('회원 정보가 수정되었습니다.');
                        location.reload();
                    } else {
                        alert('저장에 실패했습니다. 다시 시도해주세요.');
                    }
                })
                .catch(function () { alert('서버 오류가 발생했습니다.'); });
        });
    }

    /* ── 3. 비밀번호 변경 ── */
    var btnChangePw = document.getElementById('btn-change-pw');
    if (btnChangePw) {
        btnChangePw.addEventListener('click', function () {
            var current = document.getElementById('input-pw-current').value;
            var newPw   = document.getElementById('input-pw-new').value;
            var confirm = document.getElementById('input-pw-confirm').value;
            var msg     = document.getElementById('pw-msg');

            if (!current || !newPw || !confirm) {
                msg.textContent = '모든 항목을 입력해주세요.';
                msg.className   = 'mp-pw-msg error';
                return;
            }
            if (newPw !== confirm) {
                msg.textContent = '새 비밀번호가 일치하지 않습니다.';
                msg.className   = 'mp-pw-msg error';
                return;
            }

            fetch('/api/mypage/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ currentPassword: current, newPassword: newPw })
            })
                .then(function (res) {
                    if (res.ok) {
                        alert('비밀번호가 안전하게 변경되었습니다. 다시 로그인해주세요.');
                        location.href = '/login';
                    } else {
                        res.json().then(function (data) {
                            msg.textContent = data.message || '현재 비밀번호가 일치하지 않습니다.';
                            msg.className   = 'mp-pw-msg error';
                        });
                    }
                })
                .catch(function () {
                    msg.textContent = '서버 오류가 발생했습니다.';
                    msg.className   = 'mp-pw-msg error';
                });
        });
    }

    /* ── 4. 배송지 관리 (다중 주소 지원) ── */
    var btnAddAddr    = document.getElementById('btn-add-address');
    var btnSaveAddr   = document.getElementById('btn-save-address');
    var btnCancelAddr = document.getElementById('btn-cancel-address');
    var addrForm      = document.getElementById('address-form');
    var formTitle     = document.getElementById('address-form-title');

    // 🌟 폼 필드들
    var inputAddressId = document.getElementById('address-id');
    var inputAddrName  = document.getElementById('new-address-name'); // 배송지명 추가!
    var inputAddress   = document.getElementById('new-address');
    var inputDetail    = document.getElementById('new-address-detail');
    var checkDefault   = document.getElementById('is-default-address');

    // 카카오 우편번호
    window.execDaumPostcode = function() {
        new daum.Postcode({
            oncomplete: function(data) {
                inputAddress.value = data.roadAddress || data.jibunAddress;
                inputDetail.focus();
            }
        }).open();
    };

    // [새 배송지 추가] 버튼
    if (btnAddAddr) {
        btnAddAddr.addEventListener('click', function() {
            formTitle.textContent = '새 배송지 추가';
            inputAddressId.value = ''; // ID 비우기 (신규)
            inputAddrName.value  = '';
            inputAddress.value   = '';
            inputDetail.value    = '';
            checkDefault.checked = false;

            addrForm.style.display = 'block';
            addrForm.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // [수정] 버튼 (여러 개 존재하므로 각각 이벤트 리스너 할당)
    document.querySelectorAll('.btn-edit-item').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            formTitle.textContent = '배송지 수정';
            inputAddressId.value = this.getAttribute('data-id');
            inputAddrName.value  = this.getAttribute('data-name');
            inputAddress.value   = this.getAttribute('data-addr');
            inputDetail.value    = this.getAttribute('data-detail');
            checkDefault.checked = this.getAttribute('data-default') === 'true';

            addrForm.style.display = 'block';
            addrForm.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // [취소] 버튼
    if (btnCancelAddr) {
        btnCancelAddr.addEventListener('click', function() {
            addrForm.style.display = 'none';
        });
    }

    // [삭제] 버튼
    document.querySelectorAll('.btn-delete-item').forEach(function(btn) {
        btn.addEventListener('click', function() {
            if (!confirm('이 배송지를 정말 삭제하시겠습니까?')) return;

            var addrId = this.getAttribute('data-id');

            // 🌟 삭제 API (백엔드에 삭제용 API 개발 필요)
            fetch('/api/mypage/address/' + addrId, {
                method: 'DELETE',
                credentials: 'include'
            })
                .then(function(res) {
                    if (res.ok) {
                        alert('배송지가 삭제되었습니다.');
                        location.reload();
                    } else {
                        alert('삭제에 실패했습니다.');
                    }
                })
                .catch(function() { alert('서버 오류가 발생했습니다.'); });
        });
    });

    // [저장하기] 버튼 (추가/수정)
    if (btnSaveAddr) {
        btnSaveAddr.addEventListener('click', function() {
            var id            = inputAddressId.value;
            var addressName   = inputAddrName.value.trim();
            var address       = inputAddress.value.trim();
            var addressDetail = inputDetail.value.trim();
            var isDefault     = checkDefault.checked;

            if (!addressName) { alert('배송지명을 입력해주세요. (예: 집, 회사)'); return; }
            if (!address) { alert('주소를 검색하여 입력해주세요.'); return; }

            // 🌟 저장/수정 API (백엔드에서 JSON으로 addressName 포함해서 받도록 수정 필요)
            fetch('/api/mypage/address', {
                method: id ? 'PUT' : 'POST', // ID가 있으면 수정(PUT), 없으면 추가(POST)
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    id: id,
                    addressName: addressName,
                    address: address,
                    addressDetail: addressDetail,
                    isDefault: isDefault
                })
            })
                .then(function(res) {
                    if (res.ok) {
                        alert('배송지가 성공적으로 저장되었습니다.');
                        location.reload();
                    } else {
                        alert('저장에 실패했습니다.');
                    }
                })
                .catch(function() { alert('서버 오류가 발생했습니다.'); });
        });
    }
});