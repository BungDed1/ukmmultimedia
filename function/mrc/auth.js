function checkAccess() {
    const key = document.getElementById('accessKey').value.trim();
    const errorMsg = document.getElementById('errorMessage');

    if (key === "mulmedikip123") {
        sessionStorage.setItem('isMember', 'true'); // Kasih tiket VIP (Member)
        window.location.href = "/pages/MRC/index.html";
    }
    else if (key.includes("peserta123")) {
        sessionStorage.removeItem('isMember'); // Cabut tiket VIP
        sessionStorage.setItem('targetID', key); // Buat auto-search

        // --- TAMBAH BARIS INI: Kasih tiket Reguler ---
        sessionStorage.setItem('isParticipant', 'true');

        window.location.href = "/pages/MRC/certificates/index.html";
    }
    else {
        errorMsg.classList.remove('d-none');
    }
}