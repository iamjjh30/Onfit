/* ============================================================
   MyPage.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

    /* ── 탭 전환 ── */
    document.querySelectorAll('.mp-tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.mp-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.mp-section').forEach(s => s.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(this.dataset.target).classList.add('active');
        });
    });

    /* ── 회원 정보 수정 ── */
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
            document.getElementById('input-name').value  = MEMBER_DATA.name  || '';
            document.getElementById('input-email').value = MEMBER_DATA.email || '';
            document.getElementById('input-tel').value   = MEMBER_DATA.tel   || '';
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
                        MEMBER_DATA.name  = name;
                        MEMBER_DATA.email = email;
                        MEMBER_DATA.tel   = tel;
                        editableIds.forEach(function (id) {
                            var el = document.getElementById(id);
                            if (el) { el.setAttribute('readonly', ''); el.classList.remove('editable'); }
                        });
                        btnEdit.style.display   = 'inline-flex';
                        btnSave.style.display   = 'none';
                        btnCancel.style.display = 'none';
                        alert('회원 정보가 수정되었습니다.');
                    } else {
                        alert('저장에 실패했습니다. 다시 시도해주세요.');
                    }
                })
                .catch(function () { alert('서버 오류가 발생했습니다.'); });
        });
    }

    /* ── 비밀번호 변경 ── */
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
            if (newPw.length < 4) {
                msg.textContent = '비밀번호는 4자 이상이어야 합니다.';
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
                        msg.textContent = '✅ 비밀번호가 성공적으로 변경되었습니다.';
                        msg.className   = 'mp-pw-msg success';
                        document.getElementById('input-pw-current').value = '';
                        document.getElementById('input-pw-new').value     = '';
                        document.getElementById('input-pw-confirm').value  = '';
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

    /* ── 배송지 수정 ── */
    var btnEditAddr   = document.getElementById('btn-edit-address');
    var btnSaveAddr   = document.getElementById('btn-save-address');
    var btnCancelAddr = document.getElementById('btn-cancel-address');
    var addrForm      = document.getElementById('address-form');
    var addrDisplay   = document.getElementById('address-display');
    var btnSearchAddr = document.getElementById('btn-search-address');

    if (btnEditAddr) {
        btnEditAddr.addEventListener('click', function () {
            // 현재 주소 값 채우기
            document.getElementById('new-address').value        = MEMBER_DATA.address       || '';
            document.getElementById('new-address-detail').value = MEMBER_DATA.addressDetail || '';
            addrDisplay.style.display = 'none';
            btnEditAddr.style.display = 'none';
            addrForm.style.display    = 'block';
        });
    }

    if (btnCancelAddr) {
        btnCancelAddr.addEventListener('click', function () {
            addrDisplay.style.display = 'flex';
            btnEditAddr.style.display = 'inline-flex';
            addrForm.style.display    = 'none';
        });
    }

    if (btnSearchAddr) {
        btnSearchAddr.addEventListener('click', function () {
            new daum.Postcode({
                oncomplete: function (data) {
                    var addr = data.roadAddress || data.jibunAddress;
                    document.getElementById('new-address').value = addr;
                    document.getElementById('new-address-detail').focus();
                }
            }).open();
        });
    }

    if (btnSaveAddr) {
        btnSaveAddr.addEventListener('click', function () {
            var address       = document.getElementById('new-address').value.trim();
            var addressDetail = document.getElementById('new-address-detail').value.trim();

            if (!address) { alert('주소를 검색해주세요.'); return; }

            fetch('/api/mypage/address', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ address, addressDetail })
            })
                .then(function (res) {
                    if (res.ok) {
                        MEMBER_DATA.address       = address;
                        MEMBER_DATA.addressDetail = addressDetail;
                        document.getElementById('address-main-text').textContent   = address;
                        document.getElementById('address-detail-text').textContent = addressDetail;
                        addrDisplay.style.display = 'flex';
                        btnEditAddr.style.display = 'inline-flex';
                        addrForm.style.display    = 'none';
                        alert('배송지가 저장되었습니다.');
                    } else {
                        alert('저장에 실패했습니다.');
                    }
                })
                .catch(function () { alert('서버 오류가 발생했습니다.'); });
        });
    }

    /* ── 회원 탈퇴 ── */
    var btnWithdraw = document.getElementById('btn-withdraw');
    if (btnWithdraw) {
        btnWithdraw.addEventListener('click', function () {
            var pw  = document.getElementById('input-withdraw-pw').value;
            var msg = document.getElementById('withdraw-msg');

            if (!pw) {
                msg.textContent = '비밀번호를 입력해주세요.';
                msg.className   = 'mp-pw-msg error';
                return;
            }

            if (!confirm('정말로 탈퇴하시겠습니까?\n탈퇴 시 모든 데이터가 삭제되며 복구가 불가능합니다.')) return;

            fetch('/api/mypage/withdraw', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ password: pw })
            })
                .then(function (res) {
                    if (res.ok) {
                        alert('탈퇴가 완료되었습니다. 이용해주셔서 감사합니다.');
                        window.location.href = '/';
                    } else {
                        res.json().then(function (data) {
                            msg.textContent = data.message || '비밀번호가 일치하지 않습니다.';
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
});