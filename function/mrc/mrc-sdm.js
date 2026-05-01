// --- KONFIGURASI ---
const SDM_ACCESS_KEY = "sdm2026";
const SDM_SB_URL = 'https://kbrvnbduwczjqdmofdky.supabase.co';
const SDM_SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImticnZuYmR1d2N6anFkbW9mZGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMDczODYsImV4cCI6MjA5Mjc4MzM4Nn0.M1jW5lB3eSm7oOp37gKmEIO7XaUUAw-qwZ-aOVf09Vo';

const sdm_sb = window.supabase.createClient(SDM_SB_URL, SDM_SB_KEY);

// --- AUTH & REFRESH ---
function mrc_check_auth() {
    const isAuth = localStorage.getItem('sdm_authenticated');
    const gate = document.getElementById('sdm_auth_gate');
    const content = document.getElementById('sdm_main_content');

    if (isAuth === 'true') {
        if (gate) gate.style.setProperty('display', 'none', 'important');
        if (content) content.style.display = 'block';
        window.tarik_data_sdm_sekarang();
    } else {
        if (gate) gate.style.setProperty('display', 'flex', 'important');
        if (content) content.style.display = 'none';

        const inputEl = document.getElementById('sdm_password_input');
        if (inputEl) {
            inputEl.addEventListener('keypress', (e) => { if (e.key === 'Enter') window.verifikasi_akses_sdm(); });
        }
    }
}

// FUNGSI REFRESH HALAMAN PENUH
window.mrc_refresh_halaman = function () {
    window.location.reload();
};

window.verifikasi_akses_sdm = function () {
    const inputEl = document.getElementById('sdm_password_input');
    if (inputEl.value === SDM_ACCESS_KEY) {
        localStorage.setItem('sdm_authenticated', 'true');
        mrc_check_auth();
    } else {
        alert("❌ Sandi Salah!");
        inputEl.value = "";
    }
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