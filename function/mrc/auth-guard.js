// Cek kedua jenis tiket
const isMember = sessionStorage.getItem('isMember');
const isParticipant = sessionStorage.getItem('isParticipant');

// Kalau DUA-DUANYA nggak ada (artinya beneran penyusup yang pakai link langsung)
if (!isMember && !isParticipant) {
    alert("Hayo! Anda belum memasukkan Key Akses. Silakan login dulu ya!");

    // Tendang ke halaman login awal
    window.location.replace('/pages/MRC/index.html');
}