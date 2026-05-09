// ============================================
// EMERGENCY PROTECTION SCRIPT
// File: emergency-auth-guard.js
// Tujuan: Proteksi sementara sambil migrasi ke Supabase Auth
// ============================================

(function () {
    'use strict';

    // Cek apakah user sudah login
    const isMember = sessionStorage.getItem('isMember');
    const isParticipant = sessionStorage.getItem('isParticipant');

    // Tambahan: cek timestamp login (untuk auto-logout)
    const loginTime = sessionStorage.getItem('loginTime');
    const currentTime = new Date().getTime();
    const sessionTimeout = 30 * 60 * 1000; // 30 menit

    // Fungsi logout otomatis
    function autoLogout() {
        sessionStorage.clear();
        alert('Sesi Anda telah berakhir. Silakan login kembali.');
        window.location.replace('/pages/MRC/login/index.html');
    }

    // Cek session timeout
    if (loginTime && (currentTime - parseInt(loginTime)) > sessionTimeout) {
        autoLogout();
        return;
    }

    // Cek autentikasi
    if (!isMember && !isParticipant) {
        // Tidak ada kredensial valid
        alert("Akses ditolak! Anda belum login. Silakan login terlebih dahulu.");
        window.location.replace('/pages/MRC/login/index.html');
        return;
    }

    // Proteksi halaman berdasarkan role
    const currentPath = window.location.pathname;

    // Halaman yang hanya bisa diakses member (bukan participant)
    const memberOnlyPages = [
        '/pages/MRC/sdm-control/',
        '/pages/MRC/production/',
        '/pages/MRC/tugas-harian/',
        '/pages/MRC/library/'
    ];

    // Cek apakah halaman ini khusus member
    const isMemberOnlyPage = memberOnlyPages.some(page => currentPath.includes(page));

    if (isMemberOnlyPage && !isMember) {
        alert('Akses ditolak! Halaman ini hanya untuk member.');
        window.location.replace('/pages/MRC/certificates/index.html');
        return;
    }

    // Refresh login timestamp setiap ada aktivitas
    sessionStorage.setItem('loginTime', currentTime.toString());

    // Logging (untuk monitoring - opsional)
    if (typeof console !== 'undefined') {
        console.log('[Auth Guard] Access granted:', {
            path: currentPath,
            role: isMember ? 'member' : 'participant',
            timestamp: new Date().toISOString()
        });
    }

    // Tampilkan halaman (hapus d-none jika ada)
    document.documentElement.style.display = 'block';

})();