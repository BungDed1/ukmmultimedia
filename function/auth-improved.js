// ============================================
// IMPROVED AUTH.JS (TEMPORARY SOLUTION)
// File: auth-improved.js
// Catatan: Ini masih client-side, tetap harus diganti dengan Supabase Auth!
// ============================================

// Simple obfuscation untuk password (BUKAN enkripsi yang aman!)
// Ini hanya untuk mempersulit, bukan solusi permanen
const authConfig = {
    // Hash sederhana dari password (gunakan tool online untuk generate)
    // Contoh: SHA-256 hash
    memberHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', // ganti dengan hash password baru
    participantPrefix: 'pst_', // prefix untuk kode peserta

    // Salt untuk tambahan keamanan
    salt: 'ukm_multimedia_2026',
};

// Fungsi hash sederhana (masih bisa di-reverse, hanya untuk obfuscation)
async function simpleHash(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text + authConfig.salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Fungsi cek akses yang lebih aman
async function checkAccess() {
    const key = document.getElementById('accessKey').value.trim();
    const errorMsg = document.getElementById('errorMessage');

    // Reset error message
    errorMsg.classList.add('d-none');

    // Validasi input
    if (!key) {
        errorMsg.textContent = 'Silakan masukkan kode akses!';
        errorMsg.classList.remove('d-none');
        return;
    }

    // Rate limiting sederhana (client-side)
    const attemptKey = 'loginAttempts';
    const attemptTimeKey = 'lastAttemptTime';
    const currentTime = new Date().getTime();
    const lastAttemptTime = localStorage.getItem(attemptTimeKey);
    const attempts = parseInt(localStorage.getItem(attemptKey) || '0');

    // Reset counter setelah 15 menit
    if (lastAttemptTime && (currentTime - parseInt(lastAttemptTime)) > 15 * 60 * 1000) {
        localStorage.removeItem(attemptKey);
        localStorage.removeItem(attemptTimeKey);
    }

    // Cek jumlah percobaan
    if (attempts >= 5) {
        errorMsg.textContent = 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.';
        errorMsg.classList.remove('d-none');
        return;
    }

    try {
        // Hash input password
        const hashedInput = await simpleHash(key);

        // Cek member
        if (hashedInput === authConfig.memberHash) {
            // Login berhasil sebagai member
            sessionStorage.setItem('isMember', 'true');
            sessionStorage.setItem('loginTime', currentTime.toString());

            // Log aktivitas (untuk audit)
            logActivity('member_login_success');

            // Reset login attempts
            localStorage.removeItem(attemptKey);
            localStorage.removeItem(attemptTimeKey);

            // Redirect
            window.location.href = "/pages/MRC/index.html";
            return;
        }

        // Cek participant (dengan prefix)
        if (key.startsWith(authConfig.participantPrefix)) {
            // Validasi format kode peserta
            const participantCode = key.substring(authConfig.participantPrefix.length);

            if (participantCode.length >= 6) { // minimal 6 karakter
                sessionStorage.setItem('isParticipant', 'true');
                sessionStorage.setItem('targetID', key);
                sessionStorage.setItem('loginTime', currentTime.toString());

                // Log aktivitas
                logActivity('participant_login_success', { code: key });

                // Reset login attempts
                localStorage.removeItem(attemptKey);
                localStorage.removeItem(attemptTimeKey);

                // Redirect
                window.location.href = "/pages/MRC/certificates/index.html";
                return;
            }
        }

        // Login gagal
        const newAttempts = attempts + 1;
        localStorage.setItem(attemptKey, newAttempts.toString());
        localStorage.setItem(attemptTimeKey, currentTime.toString());

        // Log aktivitas gagal
        logActivity('login_failed', { attempts: newAttempts });

        errorMsg.textContent = `Kode akses salah! (Percobaan ${newAttempts}/5)`;
        errorMsg.classList.remove('d-none');

    } catch (error) {
        console.error('Error during authentication:', error);
        errorMsg.textContent = 'Terjadi kesalahan. Silakan coba lagi.';
        errorMsg.classList.remove('d-none');
    }
}

// Fungsi logout
function logout() {
    // Log aktivitas
    const isMember = sessionStorage.getItem('isMember');
    logActivity(isMember ? 'member_logout' : 'participant_logout');

    // Clear session
    sessionStorage.clear();

    // Redirect ke login
    window.location.href = '/pages/MRC/login/index.html';
}

// Fungsi logging untuk audit trail (simpan di localStorage sementara)
function logActivity(action, data = {}) {
    const logs = JSON.parse(localStorage.getItem('activityLogs') || '[]');

    const logEntry = {
        timestamp: new Date().toISOString(),
        action: action,
        data: data,
        userAgent: navigator.userAgent,
        page: window.location.pathname
    };

    logs.push(logEntry);

    // Simpan max 100 log terakhir
    if (logs.length > 100) {
        logs.shift();
    }

    localStorage.setItem('activityLogs', JSON.stringify(logs));

    // Kirim ke server/Supabase jika sudah setup
    // sendLogToServer(logEntry);
}

// Fungsi untuk generate hash baru (untuk admin yang ingin ganti password)
async function generatePasswordHash(password) {
    const hash = await simpleHash(password);
    console.log('Generated hash:', hash);
    console.log('Update authConfig.memberHash dengan nilai di atas');
    return hash;
}

// Export functions untuk debugging (hapus di production!)
if (typeof window !== 'undefined') {
    window.authDebug = {
        generateHash: generatePasswordHash,
        viewLogs: () => JSON.parse(localStorage.getItem('activityLogs') || '[]'),
        clearLogs: () => localStorage.removeItem('activityLogs')
    };
}

// ============================================
// CARA GANTI PASSWORD:
// ============================================
// 1. Buka Console browser (F12)
// 2. Ketik: await window.authDebug.generateHash('password_baru_kamu')
// 3. Copy hash yang muncul
// 4. Paste ke authConfig.memberHash di atas
// 5. Save file ini
// ============================================