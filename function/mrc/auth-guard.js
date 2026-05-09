// --- File: /function/mrc/auth-guard.js ---

// Cek kedua jenis tiket di dalam kantong browser (Session Storage)
const isMember = sessionStorage.getItem('isMember');
const isParticipant = sessionStorage.getItem('isParticipant');

// Kalau DUA-DUANYA nggak ada (artinya beneran penyusup yang pakai link langsung)
if (!isMember && !isParticipant) {
    alert("Hayo! Anda belum memasukkan Key Akses. Silakan login dulu ya!");

    // Tendang balik ke halaman login awal (sesuaikan link ini ke halaman login lu)
    window.location.replace('/index.html');
}