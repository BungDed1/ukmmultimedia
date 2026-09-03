// --- File: /function/mrc/site-settings.js ---
// Helper bersama untuk membaca tabel `site_settings` (identitas situs, link
// sosial media, embed URL, dll) yang bisa diubah admin lewat Admin Panel.
// SELALU pakai fallback -- kalau fetch gagal atau key belum ada, situs tetap
// tampil dengan nilai default, tidak pernah kosong/rusak.

window.getSiteSettings = async function (keysWithFallback) {
    const result = { ...keysWithFallback };
    try {
        const keys = Object.keys(keysWithFallback);
        const { data, error } = await _supabase
            .from('site_settings')
            .select('key, value')
            .in('key', keys);

        if (!error && data) {
            data.forEach(row => {
                if (row.value) result[row.key] = row.value;
            });
        }
    } catch (err) {
        console.error('Gagal ambil pengaturan situs, pakai nilai default:', err);
    }
    return result;
};

window.getSiteSetting = async function (key, fallbackValue) {
    const result = await window.getSiteSettings({ [key]: fallbackValue });
    return result[key];
};
