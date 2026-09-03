// --- File: /function/mrc/login-ui.js ---
// Login MRC memakai Supabase Auth (email + password).
// File ini HANYA urusan tampilan; validasi kredensial sungguhan dilakukan
// oleh Supabase (server), bukan oleh JavaScript ini.

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('loginForm');
    if (!form) return;

    // Kalau ternyata sudah ada sesi login aktif, langsung lempar ke dashboard
    (async function redirectIfAlreadyLoggedIn() {
        if (window.supabaseAuth) {
            const user = await window.supabaseAuth.getCurrentUser();
            if (user) {
                window.location.replace('/pages/MRC/index.html');
            }
        }
    })();

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        await handleLogin();
    });
});

// Fitur ngintip password (mata)
function togglePassword() {
    const input = document.getElementById('loginPassword');
    const icon = document.getElementById('toggleIcon');
    if (!input || !icon) return;

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

async function handleLogin() {
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const errorMsg = document.getElementById('errorMessage');
    const errorMsgText = document.getElementById('errorMessageText');
    const submitBtn = document.getElementById('loginSubmitBtn');
    const submitText = document.getElementById('loginSubmitText');

    if (!emailInput || !passwordInput) return;

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (errorMsg) errorMsg.classList.add('d-none');

    if (!email || !password) {
        if (errorMsg && errorMsgText) {
            errorMsgText.textContent = 'Email dan password wajib diisi.';
            errorMsg.classList.remove('d-none');
        }
        return;
    }

    // Kunci tombol supaya tidak double-submit
    if (submitBtn) submitBtn.disabled = true;
    if (submitText) submitText.textContent = 'MEMPROSES...';

    try {
        const result = await window.supabaseAuth.login(email, password);

        if (result.success) {
            window.location.href = '/pages/MRC/index.html';
        } else {
            if (errorMsg && errorMsgText) {
                errorMsgText.textContent = 'Email atau password salah, atau akun belum terdaftar.';
                errorMsg.classList.remove('d-none');
            }
            passwordInput.value = '';
            passwordInput.focus();
        }
    } catch (err) {
        console.error('Login error:', err);
        if (errorMsg && errorMsgText) {
            errorMsgText.textContent = 'Terjadi kesalahan. Coba lagi beberapa saat.';
            errorMsg.classList.remove('d-none');
        }
    } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (submitText) submitText.textContent = 'MASUK';
    }
}
