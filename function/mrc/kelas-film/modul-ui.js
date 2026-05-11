// Fungsi untuk memunculkan tabel Modul atau Template
function showSection(section) {
    // Sembunyikan dulu keduanya
    document.getElementById('section-modul').classList.add('d-none');
    document.getElementById('section-template').classList.add('d-none');

    // Munculkan yang dipilih dan scroll perlahan ke bawah
    if (section === 'modul') {
        document.getElementById('section-modul').classList.remove('d-none');
        window.scrollTo({ top: 600, behavior: 'smooth' });
    } else if (section === 'template') {
        document.getElementById('section-template').classList.remove('d-none');
        window.scrollTo({ top: 600, behavior: 'smooth' });
    }
}