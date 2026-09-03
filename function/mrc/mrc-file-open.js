// --- File: /function/mrc/mrc-file-open.js ---
// Helper bersama untuk seluruh halaman MRC: bikin signed URL SEKALI PAKAI
// (berlaku singkat) untuk file di bucket privat `mrc-storage`, lalu buka di
// tab baru. Dipakai oleh semua fetch script (modul, naskah, ebook, template,
// dokumen produksi, dst) supaya file tidak otomatis publik hanya karena
// pathnya diketahui -- signed URL cuma bisa dibuat oleh user yang sedang
// login sebagai member/admin aktif (ditegakkan oleh storage policy di DB).

const MRC_STORAGE_BUCKET = 'mrc-storage';

window.openMrcFile = async function (storagePath, triggerEl) {
    if (!storagePath) {
        alert('File tidak tersedia untuk item ini.');
        return;
    }

    // Data lama (sebelum sistem upload privat ini ada) disimpan sebagai URL utuh
    // (Google Drive, atau bucket publik lama). Itu dibuka langsung apa adanya.
    // Cuma path relatif baru (hasil upload lewat Admin Panel) yang perlu di-signed-URL-kan.
    if (/^https?:\/\//i.test(storagePath)) {
        window.open(storagePath, '_blank');
        return;
    }

    const originalHtml = triggerEl ? triggerEl.innerHTML : null;
    if (triggerEl) {
        triggerEl.setAttribute('disabled', 'disabled');
        triggerEl.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
    }

    try {
        const { data, error } = await _supabase.storage
            .from(MRC_STORAGE_BUCKET)
            .createSignedUrl(storagePath, 60);

        if (error || !data || !data.signedUrl) throw error || new Error('Signed URL kosong');

        window.open(data.signedUrl, '_blank');
    } catch (err) {
        console.error('Gagal membuka file:', err);
        alert('Gagal membuka file. Coba lagi, atau hubungi admin kalau terus gagal.');
    } finally {
        if (triggerEl) {
            triggerEl.removeAttribute('disabled');
            triggerEl.innerHTML = originalHtml;
        }
    }
};

// Escape kecil untuk taruh path ke atribut HTML (data-path="...")
window.mrcEscAttr = function (str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : str;
    return div.innerHTML.replace(/"/g, '&quot;');
};
