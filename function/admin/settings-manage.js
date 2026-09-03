// --- File: /function/admin/settings-manage.js ---
// Kelola tabel site_settings: identitas situs, kontak, sosial media, embed URL,
// event beranda, proposal partnership. Perubahan di sini langsung dibaca
// navbar/footer/halaman publik lewat getSiteSettings().

const SETTINGS_CATEGORY_LABELS = {
    'identitas': 'Identitas Situs',
    'beranda': 'Statistik Beranda',
    'event-beranda': 'Event & Pendaftaran (Beranda)',
    'partnership': 'Halaman Partnership',
    'kontak': 'Kontak',
    'sosial-media': 'Sosial Media',
    'embed': 'Embed (Google Sheet, dll)',
    'umum': 'Lainnya',
};

// Key yang berupa FILE (gambar/PDF), bukan teks biasa -- dirender sebagai upload widget.
const SETTINGS_FILE_KEYS = {
    'logo_url': { label: 'Logo Situs', folder: 'Logo', accept: 'image/*', hint: 'Format PNG/WEBP transparan disarankan. Dipakai di navbar & footer.' },
    'proposal1_file_url': { label: 'File PDF Proposal 1', folder: 'Proposal', accept: 'application/pdf', hint: 'Dipakai di tombol "Unduh Proposal" kartu pertama halaman Partnership.' },
    'proposal2_file_url': { label: 'File PDF Proposal 2', folder: 'Proposal', accept: 'application/pdf', hint: 'Dipakai di tombol "Unduh Proposal" kartu kedua halaman Partnership.' },
};

let settingsRowsCache = [];

document.addEventListener('DOMContentLoaded', function () {
    const waitForShell = setInterval(() => {
        const target = document.getElementById('adminPageContent');
        if (!target) return;
        clearInterval(waitForShell);
        initSettingsPage(target);
    }, 50);
});

async function initSettingsPage(target) {
    target.innerHTML = `<div class="text-muted small">Memuat pengaturan...</div>`;

    const { data, error } = await _supabase
        .from('site_settings')
        .select('*')
        .order('category', { ascending: true });

    if (error) {
        target.innerHTML = `<div class="admin-card text-danger">Gagal memuat pengaturan: ${error.message}</div>`;
        return;
    }

    settingsRowsCache = data || [];

    const grouped = {};
    settingsRowsCache.forEach(row => {
        if (SETTINGS_FILE_KEYS[row.key]) return; // ditangani khusus (upload file, bukan teks)
        const cat = row.category || 'umum';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(row);
    });

    const fileRows = settingsRowsCache.filter(r => SETTINGS_FILE_KEYS[r.key]);
    const categoryOrder = ['identitas', 'beranda', 'event-beranda', 'kontak', 'sosial-media', 'partnership', 'embed', 'umum'];

    target.innerHTML = `
        ${fileRows.length ? `
        <div class="admin-card mb-3">
            <h6 class="fw-bold mb-3">File & Logo</h6>
            <div class="row g-3">
                ${fileRows.map(row => {
                    const meta = SETTINGS_FILE_KEYS[row.key];
                    const isImage = meta.accept.startsWith('image');
                    return `
                    <div class="col-md-6">
                        <label class="form-label small fw-bold">${escapeHtmlSettings(meta.label)}</label>
                        <div class="d-flex align-items-center gap-2 flex-wrap">
                            ${isImage
                                ? `<img id="filePreview_${row.key}" src="${escapeHtmlSettings(row.value || '')}" style="width:50px; height:50px; object-fit:contain; background:#f4f6fa; border-radius:10px; padding:5px;">`
                                : `<a href="${escapeHtmlSettings(row.value || '#')}" target="_blank" class="small text-truncate" style="max-width:160px;"><i class="bi bi-file-earmark-pdf-fill text-danger me-1"></i>Lihat file saat ini</a>`
                            }
                            <input type="file" class="form-control" id="fileInput_${row.key}" accept="${meta.accept}" style="max-width:220px;">
                            <button type="button" class="btn btn-sm btn-maroon text-white fw-bold" onclick="handleUploadSettingFile('${row.key}')">Upload</button>
                        </div>
                        <div class="form-text">${meta.hint}</div>
                        <div id="fileMsg_${row.key}" class="small text-success d-none">Tersimpan!</div>
                    </div>`;
                }).join('')}
            </div>
        </div>` : ''}

        <form id="settingsForm">
            ${categoryOrder.filter(cat => grouped[cat]).map(cat => `
                <div class="admin-card mb-3">
                    <h6 class="fw-bold mb-3">${SETTINGS_CATEGORY_LABELS[cat] || cat}</h6>
                    <div class="row g-3">
                        ${grouped[cat].map(row => `
                            <div class="col-md-6">
                                <label class="form-label small fw-bold">${escapeHtmlSettings(row.label || row.key)}</label>
                                ${row.key.endsWith('_desc') || row.key === 'event_desc'
                                    ? `<textarea class="form-control" name="${row.key}" rows="2">${escapeHtmlSettings(row.value || '')}</textarea>`
                                    : `<input type="text" class="form-control" name="${row.key}" value="${escapeHtmlSettings(row.value || '')}">`
                                }
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}

            <div id="settingsSaveError" class="text-danger small mb-3 d-none"></div>
            <div id="settingsSaveSuccess" class="text-success small mb-3 d-none">Tersimpan!</div>

            <button type="submit" id="settingsSaveBtn" class="btn btn-maroon text-white rounded-pill px-5 fw-bold">
                <i class="bi bi-check-lg me-1"></i> Simpan Semua Perubahan
            </button>
        </form>
    `;

    document.getElementById('settingsForm').addEventListener('submit', handleSaveSettings);
}

window.handleUploadSettingFile = async function (key) {
    const meta = SETTINGS_FILE_KEYS[key];
    const fileInput = document.getElementById(`fileInput_${key}`);
    const file = fileInput.files[0];
    if (!file) { alert('Pilih file dulu.'); return; }

    try {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = `${meta.folder}/${Date.now()}-${safeName}`;

        const { error: uploadError } = await _supabase.storage.from('Public').upload(path, file, { upsert: false });
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = _supabase.storage.from('Public').getPublicUrl(path);
        const newUrl = publicUrlData.publicUrl;

        const existingRow = settingsRowsCache.find(r => r.key === key);
        const { error } = await _supabase.from('site_settings').upsert(
            { key, value: newUrl, label: meta.label, category: existingRow?.category || 'identitas' },
            { onConflict: 'key' }
        );
        if (error) throw error;

        const preview = document.getElementById(`filePreview_${key}`);
        if (preview) preview.src = newUrl;
        document.getElementById(`fileMsg_${key}`).classList.remove('d-none');
        setTimeout(() => document.getElementById(`fileMsg_${key}`).classList.add('d-none'), 2500);
    } catch (err) {
        alert('Gagal upload: ' + err.message);
    }
};

async function handleSaveSettings(e) {
    e.preventDefault();

    const form = e.target;
    const btn = document.getElementById('settingsSaveBtn');
    const errorBox = document.getElementById('settingsSaveError');
    const successBox = document.getElementById('settingsSaveSuccess');

    errorBox.classList.add('d-none');
    successBox.classList.add('d-none');
    btn.disabled = true;
    btn.innerHTML = 'Menyimpan...';

    try {
        const updates = settingsRowsCache
            .filter(row => !SETTINGS_FILE_KEYS[row.key])
            .map(row => ({
                key: row.key,
                value: form.elements[row.key].value,
                label: row.label,
                category: row.category,
            }));

        const { error } = await _supabase.from('site_settings').upsert(updates, { onConflict: 'key' });
        if (error) throw error;

        successBox.classList.remove('d-none');
        setTimeout(() => successBox.classList.add('d-none'), 2500);

    } catch (err) {
        console.error('Gagal simpan pengaturan:', err);
        errorBox.textContent = err.message || 'Gagal menyimpan pengaturan.';
        errorBox.classList.remove('d-none');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-check-lg me-1"></i> Simpan Semua Perubahan';
    }
}

function escapeHtmlSettings(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : str;
    return div.innerHTML;
}
