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
    if (!inputField) return;

    const inputKey = inputField.value;

    // Cek Tiket Member (Anggota Internal UKM)
    if (inputKey === 'mulmedikip123') {

        // BAGIAN PALING PENTING: Kasih tiket ke pengunjung!
        sessionStorage.setItem('isMember', 'true');

        // Arahkan ke halaman utama MRC
        window.location.href = '/pages/MRC/index.html';

    } else {
        // Kalau Key-nya salah
        alert("Key Akses salah atau tidak valid! Silakan coba lagi.");
        inputField.value = ''; // Kosongin inputan biar bisa ngetik lagi
        inputField.focus();    // Langsung arahin kursor ke inputan
    }
}