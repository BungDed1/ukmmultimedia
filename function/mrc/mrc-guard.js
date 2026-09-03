// --- File: /function/mrc/mrc-guard.js ---
// Guard terpusat untuk semua halaman MRC (member & admin).
// PENTING: proteksi SEBENARNYA ditegakkan oleh Row Level Security (RLS)
// di database Supabase. Script ini HANYA mengatur pengalaman tampilan:
// sembunyikan halaman sampai status login dipastikan, lalu redirect
// kalau memang tidak berhak. Data tetap aman walau script ini dimatikan.

document.addEventListener('DOMContentLoaded', async function () {
    if (!window.supabaseAuth) {
        console.error('[MRC Guard] supabase-auth.js belum dimuat.');
        window.location.replace('/pages/MRC/login/index.html');
        return;
    }

    // Halaman tertentu bisa mewajibkan role spesifik dengan menaruh
    // <script>window.MRC_REQUIRED_ROLE = 'admin';</script> SEBELUM file ini di-load.
    const requiredRole = window.MRC_REQUIRED_ROLE || null;
    const hasAccess = await window.supabaseAuth.protectPage(requiredRole);
    if (hasAccess) {
        document.documentElement.style.visibility = 'visible';
    }
});
