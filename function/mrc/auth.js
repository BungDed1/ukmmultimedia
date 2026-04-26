function checkAccess() {
    const key = document.getElementById('accessKey').value.trim();
    const errorMsg = document.getElementById('errorMessage');

    if (key === "mulmedikip123") {
        sessionStorage.setItem('isMember', 'true');
        window.location.href = "/pages/MRC/index.html";
    }
    else if (key.includes("peserta123")) { // Pola ID Sertifikat
        sessionStorage.removeItem('isMember'); // Pastikan bukan member
        sessionStorage.setItem('targetID', key);
        window.location.href = "/pages/MRC/certificates/index.html";
    }
    else {
        errorMsg.classList.remove('d-none');
    }
}