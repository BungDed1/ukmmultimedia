// --- KONFIGURASI ---
// Client Supabase dipakai bersama dari supabase-config.js (_supabase),
// tidak lagi bikin client terpisah dengan key hardcoded di file ini.
const sdm_sb = _supabase;

// --- AUTH & REFRESH ---
// Password gate manual ("sdm2026") sudah DIHAPUS.
// Halaman ini sekarang diproteksi oleh mrc-guard.js (Supabase Auth, role admin)
// yang di-load lebih dulu di index.html. Kalau skrip ini sempat jalan,
// berarti akses sudah sah, jadi konten langsung ditampilkan.
function mrc_check_auth() {
    const gate = document.getElementById('sdm_auth_gate');
    const content = document.getElementById('sdm_main_content');

    if (gate) gate.style.setProperty('display', 'none', 'important');
    if (content) content.style.display = 'block';
    window.tarik_data_sdm_sekarang();
}

// FUNGSI REFRESH HALAMAN PENUH
window.mrc_refresh_halaman = function () {
    window.location.reload();
};

window.sdm_logout = function () {
    localStorage.removeItem('sdm_authenticated');
    window.location.href = '/pages/MRC/index.html';
};

window.zoom_karya_publikasi = function (url, caption) {
    document.getElementById('zoom_img').src = url;
    document.getElementById('zoom_caption').innerText = caption;
    new bootstrap.Modal(document.getElementById('modalZoomKarya')).show();
}

window.tarik_data_sdm_sekarang = async function () {
    const tabel = document.getElementById('mrc_tabel_sdm_body');
    if (!tabel) return;

    try {
        const { data, error } = await sdm_sb.from('tugas_harian').select('*').order('created_at', { ascending: false });
        if (error) throw error;

        let html = "";
        data.forEach(row => {
            const files = row.file_url ? row.file_url.split(',') : [];
            let displayBerkas = "";

            if (row.divisi === 'Publikasi') {
                const imgUrl = files[0] || '';
                const fullCap = row.catatan ? row.catatan : 'Tanpa Caption';
                const safeCap = fullCap.replace(/'/g, "\\'").replace(/"/g, '&quot;');

                // Menampilkan hanya 20 karakter pertama di tabel
                const shortCap = fullCap.length > 20 ? fullCap.substring(0, 20) + "..." : fullCap;

                displayBerkas = `
                    <div class="mrc-preview-box" onclick="window.zoom_karya_publikasi('${imgUrl}', '${safeCap}')">
                        <img src="${imgUrl}">
                        <div class="mrc-caption-preview">${shortCap}</div>
                        <div class="mrc-see-more">Lihat Detail</div>
                    </div>`;
            } else {
                displayBerkas = `<div class="d-flex flex-wrap gap-1 justify-content-center">`;
                files.forEach((url, i) => {
                    displayBerkas += `<a href="${url}" target="_blank" class="btn btn-light border btn-sm fw-bold" style="font-size: 9px; padding: 2px 8px;">F${i + 1}</a>`;
                });
                displayBerkas += `</div>`;
            }

            // Penentuan Warna Soft Status
            let softStatusClass = row.status === 'Done' ? 'bg-soft-done' : (row.status === 'Revisi' ? 'bg-soft-revisi' : 'bg-soft-menunggu');

            let waLink = `https://wa.me/${row.no_wa}`;
            let btnClass = "btn-success";
            let btnLabel = "Chat";

            if (row.status === 'Revisi') {
                const pesan = `Halo ${row.nama}, laporan Subdepartemen *${row.divisi}* perlu revisi. Silakan cek Dashboard MRC ya!`;
                waLink += `?text=${encodeURIComponent(pesan)}`;
                btnClass = "btn-danger";
                btnLabel = "Revisi";
            }

            const tgl = new Date(row.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

            html += `
            <tr>
                <td class="text-muted" style="font-size: 0.7rem">${tgl}</td>
                <td class="text-start fw-bold" style="font-size: 0.85rem">${row.nama}</td>
                <td><span class="badge bg-light text-dark border px-3" style="font-size: 0.65rem;">${row.divisi}</span></td>
                <td>${displayBerkas || '-'}</td>
                <td>
                    <select onchange="window.update_status_laporan(${row.id}, this.value)" 
                            class="form-select status-select shadow-none border-0 ${softStatusClass} mx-auto">
                        <option value="Menunggu" ${row.status === 'Menunggu' ? 'selected' : ''}>Menunggu</option>
                        <option value="Done" ${row.status === 'Done' ? 'selected' : ''}>Done</option>
                        <option value="Revisi" ${row.status === 'Revisi' ? 'selected' : ''}>Revisi</option>
                    </select>
                </td>
                <td>
                    <a href="${waLink}" target="_blank" class="btn btn-sm ${btnClass} rounded-pill px-3 fw-bold shadow-sm" style="font-size: 0.75rem">
                       <i class="bi bi-whatsapp"></i> ${btnLabel}
                    </a>
                </td>
            </tr>`;
        });
        tabel.innerHTML = html || '<tr><td colspan="6" class="py-4">Belum ada data.</td></tr>';
    } catch (err) { console.error(err); }
};

window.update_status_laporan = async function (id, valBaru) {
    const { error } = await sdm_sb.from('tugas_harian').update({ status: valBaru }).eq('id', id);
    if (!error) window.tarik_data_sdm_sekarang();
};

document.addEventListener('DOMContentLoaded', mrc_check_auth);