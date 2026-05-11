function showDetail(phId) {
    document.getElementById('view-list-ph').classList.add('d-none');
    // Sembunyikan semua detail yang ada
    const detailSections = document.querySelectorAll('[id^="view-detail-"]');
    detailSections.forEach(section => section.classList.add('d-none'));

    // Tampilkan yang dipilih
    document.getElementById('view-detail-' + phId).classList.remove('d-none');
    window.scrollTo(0, 0);
}

function showList() {
    const detailSections = document.querySelectorAll('[id^="view-detail-"]');
    detailSections.forEach(section => section.classList.add('d-none'));
    document.getElementById('view-list-ph').classList.remove('d-none');
    window.scrollTo(0, 0);
}