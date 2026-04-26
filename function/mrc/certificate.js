// ==========================================================
// SEARCH FILTER KARTU KEGIATAN - UKM MULTIMEDIA
// ==========================================================

document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('searchInput');
    const classCards = document.querySelectorAll('.class-card-item');

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const keyword = this.value.toLowerCase().trim();

            classCards.forEach(card => {
                const title = card.querySelector('h5').textContent.toLowerCase();
                const subtitle = card.querySelector('.lab-list-item').textContent.toLowerCase();

                // Cari berdasarkan judul h5 atau teks sub-judulnya
                if (title.includes(keyword) || subtitle.includes(keyword)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const targetID = sessionStorage.getItem('targetID');
    if (targetID) {
        // Jika user masuk pakai ID, otomatis masukkan ke kolom search
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = targetID;
            // Trigger event input biar tabel langsung ter-filter
            searchInput.dispatchEvent(new Event('input'));
        }
        // Hapus session biar nggak nyangkut terus
        sessionStorage.removeItem('targetID');
    }
});

// ==========================================================
// CERTIFICATE INDEX LOGIC - UKM MULTIMEDIA
// ==========================================================

document.addEventListener('DOMContentLoaded', function () {
    const isMember = sessionStorage.getItem('isMember');
    const mrcBreadcrumb = document.getElementById('mrcBreadcrumb');

    // --- HARD KILL SWITCH BREADCRUMB ---
    if (!isMember && mrcBreadcrumb) {
        // Ganti link <a> jadi teks biasa <span>
        mrcBreadcrumb.innerHTML = '<span class="text-white-50 small">MRC</span>';

        // Sembunyikan atau ganti tombol "Kembali" yang arahnya ke Dashboard
        const btnBack = document.querySelector('.btn-mrc-pro');
        if (btnBack && btnBack.getAttribute('href').includes('index.html')) {
            // Kita arahkan ke Beranda utama saja
            btnBack.setAttribute('href', '/index.html');
            btnBack.innerHTML = '<i class="bi bi-house me-2"></i> Kembali ke Beranda';
        }
    }

    // --- LOGIKA SEARCH KARTU (YANG SUDAH ADA SEBELUMNYA) ---
    const searchInput = document.getElementById('searchInput');
    const classCards = document.querySelectorAll('.class-card-item');

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const keyword = this.value.toLowerCase().trim();
            classCards.forEach(card => {
                const title = card.querySelector('h5').textContent.toLowerCase();
                const subtitle = card.querySelector('.lab-list-item').textContent.toLowerCase();
                if (title.includes(keyword) || subtitle.includes(keyword)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
});