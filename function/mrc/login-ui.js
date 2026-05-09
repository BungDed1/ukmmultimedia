// --- File: /function/mrc/login-ui.js ---

document.addEventListener('DOMContentLoaded', function () {
    // 1. Fitur tekan "Enter" untuk langsung verifikasi
    const accessKeyInput = document.getElementById('accessKey');

    if (accessKeyInput) {
        accessKeyInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault(); // Mencegah reload halaman
                checkAccess();      // Memanggil fungsi validasi
            }
        });
    }
});

// 2. Fitur ngintip password (Mata)
function togglePassword() {
    const input = document.getElementById('accessKey');
    const icon = document.getElementById('toggleIcon');

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('bi-eye-slash');
        icon.classList.add('bi-eye');
    } else {
        input.type = 'password';
        icon.classList.remove('bi-eye');
        icon.classList.add('bi-eye-slash');
    }
}

// 3. Fitur Validasi & Pemberian Tiket
function checkAccess() {
    const inputField = document.getElementById('accessKey');
    const errorMsg = document.getElementById('errorMessage');

    if (!inputField) return;

    const inputKey = inputField.value.trim(); // Pakai trim() biar bersih dari spasi

    // Sembunyikan pesan error setiap kali ngeklik tombol/enter
    if (errorMsg) {
        errorMsg.classList.add('d-none');
    }

    // Cek Tiket Member (Anggota Internal UKM)
    if (inputKey === 'mulmedikip123') {
        sessionStorage.setItem('isMember', 'true'); // Kasih tiket VIP
        window.location.href = '/pages/MRC/index.html';
    }
    // Cek Tiket Peserta (Berdasarkan kodingan lu sebelumnya)
    else if (inputKey.includes('peserta123')) {
        sessionStorage.removeItem('isMember'); // Cabut tiket VIP
        sessionStorage.setItem('targetID', inputKey); // Buat auto-search
        sessionStorage.setItem('isParticipant', 'true'); // Kasih tiket Reguler
        window.location.href = '/pages/MRC/certificates/index.html';
    }
    else {
        // Kalau Key-nya salah, tampilkan pesan error merah
        if (errorMsg) {
            errorMsg.classList.remove('d-none');
        }

        inputField.value = ''; // Kosongin inputan biar bisa ngetik lagi
        inputField.focus();    // Langsung arahin kursor ke inputan
    }
}