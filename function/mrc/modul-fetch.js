// --- KONFIGURASI SUPABASE ---
// Pakai client Supabase bersama dari supabase-config.js
const db_modul = _supabase;

let allModulData = [];

document.addEventListener("DOMContentLoaded", () => {
    tarikDataModul();
});

async function tarikDataModul() {
    const tableBody = document.getElementById('tabel-modul-body');
    const badgeCount = document.getElementById('modul-count');
    if (!tableBody) return;

    try {
        const { data, error } = await db_modul
            .from('modul_pelatihan')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        allModulData = data;

        // Update jumlah dokumen di badge
        if (badgeCount) {
            badgeCount.innerText = `${allModulData.length} Dokumen`;
        }

        renderTabelModul(allModulData);

    } catch (err) {
        console.error("Gagal tarik modul:", err);
        tableBody.innerHTML = `<tr><td colspan="3" class="text-center py-4 text-danger fw-bold">❌ Gagal memuat data modul.</td></tr>`;
        if (badgeCount) badgeCount.innerText = `0 Dokumen`;
    }
}

function renderTabelModul(dataArray) {
    const tableBody = document.getElementById('tabel-modul-body');
    let html = '';

    if (dataArray.length === 0) {
        html = `<tr><td colspan="3" class="text-center py-5 text-muted">Dokumen tidak ditemukan.</td></tr>`;
    } else {
        dataArray.forEach((modul, index) => {
            html += `
            <tr>
                <td>
                    <div class="fw-bold">${modul.judul}</div>
                    <div class="text-muted x-small">Oleh: ${modul.pemateri || 'Tim UKM Multimedia'}</div>
                </td>
                <td class="text-center text-muted">
                    <span class="badge bg-light text-dark border">${modul.kategori || 'PDF'}</span>
                </td>
                <td class="text-end">
                    <button type="button" class="btn btn-sm btn-outline-dark rounded-pill px-3" data-path="${mrcEscAttr(modul.file_url)}" onclick="openMrcFile(this.dataset.path, this)">Unduh</button>
                </td>
            </tr>`;
        });
    }

    tableBody.innerHTML = html;
}

// Fitur Pencarian Cerdas
window.searchModul = function (keyword) {
    const searchTerm = keyword.toLowerCase();

    const filteredData = allModulData.filter(modul => {
        const judulMatch = (modul.judul || '').toLowerCase().includes(searchTerm);
        const kategoriMatch = (modul.kategori || '').toLowerCase().includes(searchTerm);
        const pemateriMatch = (modul.pemateri || '').toLowerCase().includes(searchTerm);
        return judulMatch || kategoriMatch || pemateriMatch;
    });

    renderTabelModul(filteredData);
};