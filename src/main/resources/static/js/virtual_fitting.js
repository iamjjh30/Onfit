document.addEventListener('DOMContentLoaded', () => {
    const userUpload = document.getElementById('user-upload');
    const userFile = document.getElementById('user-file');

    userUpload.addEventListener('click', () => userFile.click());

    userFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            alert('사용자 사진이 선택되었습니다: ' + file.name);
        }
    });

    const clothUpload = document.getElementById('cloth-upload');
    const clothFile = document.getElementById('cloth-file');

    clothUpload.addEventListener('click', () => clothFile.click());

    clothFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            alert('의류 사진이 선택되었습니다: ' + file.name);
        }
    });
});