// --- login-ui.js ---

document.addEventListener('DOMContentLoaded', function () {
    // 1. Fitur tekan "Enter" untuk langsung verifikasi
    const accessKeyInput = document.getElementById('accessKey');

    if (accessKeyInput) {
        accessKeyInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault(); // Mencegah reload halaman
                checkAccess();      // Memanggil fungsi dari auth.js
            }
        });
    }
});

// 2. Fitur ngintip password (Mata)
// Fungsi ini ditaruh di luar DOMContentLoaded biar bisa dipanggil langsung dari HTML (onclick)
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