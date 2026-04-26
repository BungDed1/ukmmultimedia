document.addEventListener('DOMContentLoaded', async function () {
    const isMember = sessionStorage.getItem('isMember');
    const mrcBreadcrumb = document.getElementById('mrcBreadcrumb');
    const tableBody = document.querySelector('#participantTable tbody');

    // Identifikasi halaman (pab, kelas-praktisi, dll)
    const pageKey = window.location.pathname.split('/').pop().replace('.html', '');

    // 1. TARIK DATA DARI SUPABASE
    const { data: certs, error } = await _supabase
        .from('cert_data')
        .select('*')
        .eq('event_key', pageKey);

    if (error) {
        console.error("Error Supabase:", error.message);
        return;
    }

    // 2. RENDER TABEL
    if (tableBody && certs) {
        tableBody.innerHTML = "";

        certs.forEach(user => {
            // LOGIKA WARNA BADGE
            let badgeClass = "bg-success-subtle text-success"; // Default Hijau (Peserta)

            if (user.category === "Panitia") {
                badgeClass = "bg-danger-subtle text-danger";
            } else if (user.category === "Pemateri") {
                badgeClass = "bg-primary-subtle text-primary";
            }

            // CEK STATUS ABSEN (Otomatis jadi Abu-abu)
            const isAbsen = (user.role && user.role.toLowerCase().includes("absen")) ||
                (user.category && user.category.toLowerCase().includes("absen"));

            if (isAbsen) {
                badgeClass = "bg-secondary-subtle text-secondary";
            }

            tableBody.innerHTML += `
                <tr>
                    <td><div class="fw-bold text-uppercase">${user.name || 'NAMA BELUM DIISI'}</div></td>
                    <td class="text-center"><span class="badge ${badgeClass} rounded-pill px-3">${user.role || '-'}</span></td>
                    <td class="text-center text-muted x-small">${user.cert_id || '-'}</td>
                    <td class="text-end">
                        <a href="${user.file_url}" class="btn btn-sm btn-outline-dark rounded-pill px-3" target="_blank">
                            <i class="bi bi-download me-1"></i> Sertifikat
                        </a>
                    </td>
                </tr>`;
        });

        // Tambahkan baris "Tidak Ditemukan" (sembunyi secara default)
        tableBody.innerHTML += `
            <tr id="noDataRow" style="display: none;">
                <td colspan="4" class="text-center py-5 text-muted">
                    <i class="bi bi-search display-6 d-block mb-2"></i>
                    Yah, datanya nggak ada, Tum... Coba cek ejaannya lagi!
                </td>
            </tr>`;
    }

    // --- BREADCRUMB KILL SWITCH ---
    if (!isMember && mrcBreadcrumb) {
        mrcBreadcrumb.innerHTML = '<span class="text-white-50 small">MRC</span>';
    }

    // --- LOGIC SEARCH ANTI-GAGAL ---
    const searchInput = document.getElementById('participantSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const keyword = this.value.toLowerCase().trim();
            const rows = document.querySelectorAll('#participantTable tbody tr:not(#noDataRow)');
            const noDataRow = document.getElementById('noDataRow');
            let foundMatch = false;

            rows.forEach(row => {
                const rowText = row.textContent.toLowerCase();
                if (rowText.includes(keyword)) {
                    row.style.display = '';
                    foundMatch = true;
                } else {
                    row.style.display = 'none';
                }
            });

            // Tampilkan pesan jika tidak ada data yang cocok
            if (noDataRow) {
                noDataRow.style.display = foundMatch ? 'none' : '';
            }
        });
    }
});