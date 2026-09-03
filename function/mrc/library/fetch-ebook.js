// Pakai client Supabase bersama dari supabase-config.js
const _libDB = _supabase;

async function loadEbookLibrary() {
    const container = document.getElementById('tempat-buku');
    const badgeTotal = document.getElementById('total-dokumen');

    try {
        // Tarik data tanpa diurutkan berdasarkan ID (mencegah error kalau kolom ID beda nama)
        const { data, error } = await _libDB
            .from('digital_library')
            .select('*');

        if (error) {
            // MUNCULIN PESAN ERROR ASLI DARI SUPABASE KE LAYAR
            console.error("Error Database:", error.message);
            container.innerHTML = `<tr><td colspan="3" class="text-center text-danger py-4">
                <b><i class="bi bi-bug-fill"></i> ERROR DARI DATABASE:</b><br><br>
                <code>${error.message}</code>
            </td></tr>`;
            badgeTotal.innerText = "Error";
            return;
        }

        if (!data || data.length === 0) {
            container.innerHTML = `<tr><td colspan="3" class="text-center text-muted py-3">Belum ada koleksi e-book yang ditambahkan.</td></tr>`;
            badgeTotal.innerText = "0 Dokumen";
            return;
        }

        // Update jumlah dokumen
        badgeTotal.innerText = `${data.length} Dokumen`;

        // Render HTML
        container.innerHTML = data.map((buku, index) => `
            <tr>
                <td>
                    <div class="fw-bold">${index + 1}. ${buku.judul || 'Judul Kosong'}</div>
                    <div class="text-muted x-small">Tahun Terbit: ${buku.tahun_terbit || '-'}</div>
                </td>
                <td class="text-center text-muted">${buku.format || 'PDF'}</td>
                <td class="text-end">
                    <button type="button" class="btn btn-sm btn-outline-dark rounded-pill px-3" data-path="${mrcEscAttr(buku.link_baca)}" onclick="openMrcFile(this.dataset.path, this)">
                        <i class="bi bi-book-half me-1"></i> Baca
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (err) {
        // MUNCULIN PESAN ERROR KONEKSI/SISTEM KE LAYAR
        container.innerHTML = `<tr><td colspan="3" class="text-center text-danger py-4">
            <b><i class="bi bi-wifi-off"></i> ERROR SISTEM:</b><br><br>
            <code>${err.message}</code>
        </td></tr>`;
    }
}

document.addEventListener('DOMContentLoaded', loadEbookLibrary);