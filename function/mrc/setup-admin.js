// --- File: /function/mrc/setup-admin.js ---
// Bootstrap admin pertama. Aman ditinggal di kode karena penegakan aslinya
// ada di fungsi database claim_first_admin(): begitu sudah ada 1 admin,
// fungsi itu tidak akan pernah berhasil lagi untuk siapapun.

document.addEventListener('DOMContentLoaded', async function () {
    const alreadyDoneState = document.getElementById('alreadyDoneState');
    const claimOnlyState = document.getElementById('claimOnlyState');
    const setupForm = document.getElementById('setupForm');
    const setupSubtitle = document.getElementById('setupSubtitle');

    const { data: adminExistsData, error: adminExistsError } = await _supabase.rpc('admin_exists');

    if (adminExistsError) {
        console.error('Gagal cek status admin:', adminExistsError);
    }

    if (adminExistsData === true) {
        setupSubtitle.textContent = 'Setup sudah pernah dilakukan sebelumnya.';
        alreadyDoneState.classList.remove('d-none');
        return;
    }

    const currentUser = await window.supabaseAuth.getCurrentUser();

    if (currentUser) {
        // Sudah login (mis. baru saja konfirmasi email lalu login manual) -> tinggal klaim
        claimOnlyState.classList.remove('d-none');
        document.getElementById('claimBtn').addEventListener('click', handleClaim);
    } else {
        // Belum login sama sekali -> tampilkan form bikin akun
        setupForm.classList.remove('d-none');
        setupForm.addEventListener('submit', handleSignupAndClaim);
    }
});

async function handleClaim() {
    const btn = document.getElementById('claimBtn');
    btn.disabled = true;
    btn.textContent = 'MEMPROSES...';

    const { data, error } = await _supabase.rpc('claim_first_admin');

    if (error || data !== true) {
        alert('Gagal menjadikan admin. Kemungkinan sudah ada admin lain, atau sesi login sudah tidak valid. Coba login ulang.');
        btn.disabled = false;
        btn.textContent = 'JADIKAN AKUN INI ADMIN';
        return;
    }

    alert('Berhasil! Akun ini sekarang admin.');
    window.location.href = '/pages/MRC/index.html';
}

async function handleSignupAndClaim(e) {
    e.preventDefault();

    const name = document.getElementById('setupName').value.trim();
    const email = document.getElementById('setupEmail').value.trim();
    const password = document.getElementById('setupPassword').value;

    const errorMsg = document.getElementById('setupErrorMessage');
    const errorMsgText = document.getElementById('setupErrorMessageText');
    const infoMsg = document.getElementById('setupInfoMessage');
    const infoMsgText = document.getElementById('setupInfoMessageText');
    const submitBtn = document.getElementById('setupSubmitBtn');
    const submitText = document.getElementById('setupSubmitText');

    errorMsg.classList.add('d-none');
    infoMsg.classList.add('d-none');

    submitBtn.disabled = true;
    submitText.textContent = 'MEMPROSES...';

    try {
        const result = await window.supabaseAuth.signup(email, password, name, 'member');

        if (!result.success) {
            errorMsgText.textContent = result.error || 'Gagal membuat akun.';
            errorMsg.classList.remove('d-none');
            return;
        }

        // Kalau project butuh konfirmasi email, belum ada sesi aktif -> tidak bisa langsung klaim
        const currentUser = await window.supabaseAuth.getCurrentUser();

        if (!currentUser) {
            infoMsgText.textContent = 'Akun dibuat. Cek email untuk konfirmasi, lalu buka halaman ini lagi dan login untuk menyelesaikan setup.';
            infoMsg.classList.remove('d-none');
            setupForm.reset && setupForm.reset();
            return;
        }

        const { data, error } = await _supabase.rpc('claim_first_admin');

        if (error || data !== true) {
            errorMsgText.textContent = 'Akun berhasil dibuat, tapi gagal diklaim jadi admin. Coba login lalu buka halaman ini lagi.';
            errorMsg.classList.remove('d-none');
            return;
        }

        alert('Setup selesai! Akun ini sekarang admin.');
        window.location.href = '/pages/MRC/index.html';

    } catch (err) {
        console.error('Setup admin error:', err);
        errorMsgText.textContent = 'Terjadi kesalahan. Coba lagi beberapa saat.';
        errorMsg.classList.remove('d-none');
    } finally {
        submitBtn.disabled = false;
        submitText.textContent = 'BUAT AKUN ADMIN';
    }
}
