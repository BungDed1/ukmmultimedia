// ============================================
// SUPABASE AUTHENTICATION - SOLUSI PERMANEN
// File: supabase-auth.js
// Implementasi authentication yang aman dengan Supabase
// ============================================

// Konfigurasi Supabase ada di supabase-config.js (harus di-load sebelum file ini)
// const _supabase = supabase.createClient(_supabaseUrl, _supabaseKey);

// ============================================
// SKEMA DATABASE (sudah dibuat & di-migrasi di Supabase project)
// Tabel: members (id, email, full_name, role: 'member'|'admin', status: 'active'|'inactive', created_at, last_login)
// Tabel: activity_logs (id, user_id, action, details, user_agent, created_at)
// Proteksi akses diatur lewat Row Level Security (RLS) di database, BUKAN di file ini.
// File ini hanya memanggil Supabase Auth; server yang menegakkan siapa boleh apa.
// ============================================

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

/**
 * Login dengan email dan password
 */
async function loginWithEmail(email, password) {
    try {
        const { data, error } = await _supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;

        // Update last login
        await updateLastLogin(data.user.id);

        // Log activity
        await logActivity('login_success', {
            email: email,
            method: 'email_password'
        });

        return { success: true, user: data.user };
    } catch (error) {
        console.error('Login error:', error);

        // Log failed attempt
        await logActivity('login_failed', {
            email: email,
            error: error.message
        });

        return { success: false, error: error.message };
    }
}

/**
 * Signup user baru
 */
async function signupUser(email, password, fullName, role = 'member') {
    try {
        const { data, error } = await _supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName,
                    role: role
                }
            }
        });

        if (error) throw error;

        // Log activity
        await logActivity('signup_success', {
            email: email,
            role: role
        });

        return { success: true, user: data.user };
    } catch (error) {
        console.error('Signup error:', error);

        await logActivity('signup_failed', {
            email: email,
            error: error.message
        });

        return { success: false, error: error.message };
    }
}

/**
 * Logout
 */
async function logout() {
    try {
        // Log activity sebelum logout
        await logActivity('logout');

        const { error } = await _supabase.auth.signOut();
        if (error) throw error;

        // Redirect ke beranda (logout bisa dipicu dari halaman publik maupun MRC)
        window.location.href = '/index.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
}

/**
 * Cek user yang sedang login
 */
async function getCurrentUser() {
    try {
        const { data: { user }, error } = await _supabase.auth.getUser();

        if (error) throw error;
        if (!user) return null;

        // Ambil data lengkap dari tabel members
        const { data: memberData, error: memberError } = await _supabase
            .from('members')
            .select('*')
            .eq('id', user.id)
            .single();

        if (memberError) throw memberError;

        return { ...user, profile: memberData };
    } catch (error) {
        console.error('Get user error:', error);
        return null;
    }
}

/**
 * Update last login timestamp
 */
async function updateLastLogin(userId) {
    try {
        const { error } = await _supabase
            .from('members')
            .update({ last_login: new Date().toISOString() })
            .eq('id', userId);

        if (error) throw error;
    } catch (error) {
        console.error('Update last login error:', error);
    }
}

/**
 * Cek role user
 */
async function checkUserRole(requiredRole) {
    const user = await getCurrentUser();
    if (!user) return false;

    const userRole = user.profile.role;

    // Admin punya akses ke semua
    if (userRole === 'admin') return true;

    // Cek role yang diminta
    return userRole === requiredRole;
}

/**
 * Log aktivitas user
 */
async function logActivity(action, details = {}) {
    try {
        const { data: { user } } = await _supabase.auth.getUser();

        const { error } = await _supabase
            .from('activity_logs')
            .insert({
                user_id: user?.id || null,
                action: action,
                details: details,
                user_agent: navigator.userAgent
            });

        if (error) throw error;
    } catch (error) {
        console.error('Log activity error:', error);
    }
}

/**
 * Reset password (kirim email reset)
 */
async function resetPassword(email) {
    try {
        const { error } = await _supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/pages/MRC/reset-password.html'
        });

        if (error) throw error;

        await logActivity('password_reset_requested', { email });

        return { success: true };
    } catch (error) {
        console.error('Reset password error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update password
 */
async function updatePassword(newPassword) {
    try {
        const { error } = await _supabase.auth.updateUser({
            password: newPassword
        });

        if (error) throw error;

        await logActivity('password_updated');

        return { success: true };
    } catch (error) {
        console.error('Update password error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// AUTH GUARD - Untuk proteksi halaman
// ============================================

/**
 * Proteksi halaman - harus dipanggil di setiap halaman yang butuh auth
 */
async function protectPage(requiredRole = null) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            // Tidak ada user login, redirect ke login
            window.location.replace('/pages/MRC/login/index.html');
            return false;
        }

        // Jika ada role requirement, cek role
        if (requiredRole) {
            const hasAccess = await checkUserRole(requiredRole);

            if (!hasAccess) {
                // Tidak pakai alert() -- biar halaman tetap blank/bersih sebelum redirect,
                // bukan nongolin popup jelek dulu.
                window.location.replace('/pages/MRC/index.html');
                return false;
            }
        }

        // Log page access
        await logActivity('page_access', {
            page: window.location.pathname
        });

        return true;
    } catch (error) {
        console.error('Protection error:', error);
        window.location.replace('/pages/MRC/login/index.html');
        return false;
    }
}

/**
 * Setup auth listener - untuk auto-redirect
 */
function setupAuthListener() {
    // Catatan: redirect setelah logout sudah ditangani di fungsi logout() sendiri.
    // Listener ini sengaja TIDAK memaksa redirect saat SIGNED_OUT, supaya halaman
    // publik (yang juga memuat file ini untuk keperluan navbar) tidak ikut
    // ter-redirect paksa ke halaman login MRC.
    _supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
            // User klik link reset password
            window.location.href = '/pages/MRC/reset-password.html';
        }
    });
}

// ============================================
// INITIALIZATION
// ============================================

// Setup listener saat page load
document.addEventListener('DOMContentLoaded', () => {
    setupAuthListener();
});

// ============================================
// EXPORT FUNCTIONS (untuk dipanggil dari HTML)
// ============================================

window.supabaseAuth = {
    login: loginWithEmail,
    signup: signupUser,
    logout: logout,
    getCurrentUser: getCurrentUser,
    checkRole: checkUserRole,
    protectPage: protectPage,
    resetPassword: resetPassword,
    updatePassword: updatePassword,
    logActivity: logActivity
};

// ============================================
// CONTOH PENGGUNAAN DI HTML
// ============================================

/*
<!-- Di halaman login -->
<script src="/function/mrc/supabase-config.js"></script>
<script src="/function/mrc/supabase-auth.js"></script>
<script>
async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const result = await window.supabaseAuth.login(email, password);
    
    if (result.success) {
        // Member & admin sama-sama masuk ke dashboard MRC
        window.location.href = '/pages/MRC/index.html';
    } else {
        alert('Login gagal: ' + result.error);
    }
}
</script>

<!-- Di halaman yang perlu proteksi -->
<script src="/function/mrc/supabase-config.js"></script>
<script src="/function/mrc/supabase-auth.js"></script>
<script>
// Proteksi halaman, hanya admin yang bisa akses
(async function() {
    const hasAccess = await window.supabaseAuth.protectPage('admin');
    if (hasAccess) {
        // Tampilkan konten halaman
        document.body.style.display = 'block';
    }
})();
</script>

<!-- Di halaman signup -->
<script>
async function handleSignup() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const fullName = document.getElementById('fullName').value;
    
    const result = await window.supabaseAuth.signup(email, password, fullName);
    
    if (result.success) {
        alert('Pendaftaran berhasil! Silakan cek email untuk verifikasi.');
    } else {
        alert('Pendaftaran gagal: ' + result.error);
    }
}
</script>
*/