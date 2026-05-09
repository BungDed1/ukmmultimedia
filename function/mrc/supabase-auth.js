// ============================================
// SUPABASE AUTHENTICATION - SOLUSI PERMANEN
// File: supabase-auth.js
// Implementasi authentication yang aman dengan Supabase
// ============================================

// Konfigurasi Supabase (sudah ada di supabase-config.js)
// const _supabaseUrl = 'https://kbrvnbduwczjqdmofdky.supabase.co';
// const _supabaseKey = 'your_anon_key';
// const _supabase = supabase.createClient(_supabaseUrl, _supabaseKey);

// ============================================
// SETUP DATABASE (Jalankan di Supabase SQL Editor)
// ============================================

/*
-- 1. Buat tabel members
CREATE TABLE IF NOT EXISTS members (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT CHECK (role IN ('admin', 'member', 'participant')) DEFAULT 'participant',
    npm TEXT,
    department TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- 2. Enable Row Level Security
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- 3. Policies untuk tabel members
-- Policy: Users dapat melihat data sendiri
CREATE POLICY "Users can view own data"
ON members FOR SELECT
USING (auth.uid() = id);

-- Policy: Hanya admin yang bisa update semua data
CREATE POLICY "Admins can update all"
ON members FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM members
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Policy: Users bisa update data sendiri (kecuali role)
CREATE POLICY "Users can update own data"
ON members FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
    auth.uid() = id AND
    role = (SELECT role FROM members WHERE id = auth.uid())
);

-- 4. Buat function untuk auto-create member profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.members (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Buat trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Buat tabel untuk activity logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS untuk logs
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Hanya admin yang bisa lihat semua logs
CREATE POLICY "Admins can view all logs"
ON activity_logs FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM members
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Policy: Users bisa lihat log sendiri
CREATE POLICY "Users can view own logs"
ON activity_logs FOR SELECT
USING (auth.uid() = user_id);
*/

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
async function signupUser(email, password, fullName, role = 'participant') {
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

        // Redirect ke login
        window.location.href = '/pages/MRC/login/index.html';
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
                alert('Akses ditolak! Anda tidak memiliki hak akses ke halaman ini.');
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
    _supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
            // User logout, redirect ke login
            window.location.href = '/pages/MRC/login/index.html';
        } else if (event === 'PASSWORD_RECOVERY') {
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
        // Cek role untuk redirect
        const user = await window.supabaseAuth.getCurrentUser();
        
        if (user.profile.role === 'admin' || user.profile.role === 'member') {
            window.location.href = '/pages/MRC/index.html';
        } else {
            window.location.href = '/pages/MRC/certificates/index.html';
        }
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