// --- File: /function/admin/content-manage.js ---
// Kelola konten publik: slide beranda + statistik, Kegiatan, Galeri, Struktur
// Organisasi. Gambar diupload ke bucket PUBLIK (bukan mrc-storage) karena
// konten ini memang untuk pengunjung umum, disimpan sebagai URL publik penuh.

const CONTENT_IMAGE_BUCKET = 'Public';

const CONTENT_TABS = [
    { key: 'beranda', label: 'Beranda' },
    { key: 'kegiatan', label: 'Kegiatan' },
    { key: 'galeri', label: 'Galeri' },
    { key: 'publikasi', label: 'Publikasi' },
    { key: 'struktur_organisasi', label: 'Struktur Organisasi' },
    { key: 'departemen', label: 'Departemen' },
    { key: 'production_houses', label: 'Production House' },
    { key: 'cert_events', label: 'Certificate Center' },
];

const CONTENT_TABLE_CONFIGS = {
    kegiatan: {
        label: 'Kegiatan', imageField: 'gambar_url', orderBy: 'urutan',
        fields: [
            { name: 'judul', label: 'Judul', type: 'text', required: true },
            { name: 'deskripsi', label: 'Deskripsi', type: 'textarea' },
            { name: 'tanggal', label: 'Tanggal (bebas format)', type: 'text' },
            { name: 'urutan', label: 'Urutan Tampil', type: 'number' },
        ],
    },
    galeri: {
        label: 'Galeri', imageField: 'gambar_url', orderBy: 'urutan',
        fields: [
            { name: 'judul', label: 'Judul / Caption', type: 'text' },
            { name: 'kategori', label: 'Kategori (Videografi/Fotografi/Publikasi)', type: 'text' },
            { name: 'urutan', label: 'Urutan Tampil', type: 'number' },
        ],
    },
    publikasi: {
        label: 'Publikasi', imageField: 'gambar_url', orderBy: 'urutan',
        fields: [
            { name: 'judul', label: 'Judul', type: 'text', required: true },
            { name: 'jenis', label: 'Jenis (Buku/Modul, Handbook, Silabus, dll)', type: 'text' },
            { name: 'penulis', label: 'Penulis', type: 'text' },
            { name: 'kode', label: 'Kode (ISBN/QRCBN)', type: 'text' },
            { name: 'status', label: 'Status (terbit / coming_soon)', type: 'text' },
            { name: 'urutan', label: 'Urutan Tampil', type: 'number' },
        ],
    },
    struktur_organisasi: {
        label: 'Struktur Organisasi', imageField: 'foto_url', orderBy: 'urutan',
        fields: [
            { name: 'nama', label: 'Nama', type: 'text', required: true },
            { name: 'jabatan', label: 'Jabatan', type: 'text' },
            { name: 'departemen', label: 'Departemen', type: 'text' },
            { name: 'urutan', label: 'Urutan Tampil', type: 'number' },
        ],
    },
    departemen: {
        label: 'Departemen', imageField: null, orderBy: 'urutan',
        fields: [
            { name: 'nama', label: 'Nama Departemen', type: 'text', required: true },
            { name: 'deskripsi', label: 'Deskripsi', type: 'textarea' },
            { name: 'icon', label: 'Icon (kode Bootstrap Icons, mis. bi-camera-fill)', type: 'text' },
            { name: 'urutan', label: 'Urutan Tampil', type: 'number' },
        ],
    },
    production_houses: {
        label: 'Production House', imageField: 'logo_url', orderBy: 'urutan',
        fields: [
            { name: 'nama', label: 'Nama PH', type: 'text', required: true },
            { name: 'jumlah_anggota', label: 'Jumlah Anggota', type: 'number' },
            { name: 'status', label: 'Status (mis. PH Aktif)', type: 'text' },
            { name: 'profil_url', label: 'Link Profil PH (opsional)', type: 'text' },
            { name: 'urutan', label: 'Urutan Tampil', type: 'number' },
        ],
    },
    cert_events: {
        label: 'Certificate Center', imageField: null, orderBy: 'urutan',
        fields: [
            { name: 'title', label: 'Judul Kartu', type: 'text', required: true },
            { name: 'subtitle', label: 'Sub-teks', type: 'text' },
            { name: 'icon', label: 'Icon (kode Bootstrap Icons)', type: 'text' },
            { name: 'link_path', label: 'Link Halaman Cek Sertifikat', type: 'text' },
            { name: 'urutan', label: 'Urutan Tampil', type: 'number' },
        ],
    },
};

let activeContentTab = 'beranda';
let contentRowsCache = [];
let contentEditingId = null;

document.addEventListener('DOMContentLoaded', function () {
    const waitForShell = setInterval(() => {
        const target = document.getElementById('adminPageContent');
        if (!target) return;
        clearInterval(waitForShell);
        initContentPage(target);
    }, 50);
});

function initContentPage(target) {
    target.innerHTML = `
        <ul class="nav nav-pills flex-wrap gap-1 mb-3" id="contentTabNav">
            ${CONTENT_TABS.map(t => `
                <li class="nav-item">
                    <button type="button" class="nav-link ${t.key === activeContentTab ? 'active' : ''}"
                        onclick="switchContentTab('${t.key}')">${t.label}</button>
                </li>
            `).join('')}
        </ul>
        <div id="contentTabBody"></div>
    `;
    styleContentTabs();
    renderActiveContentTab();
}

function styleContentTabs() {
    document.querySelectorAll('#contentTabNav .nav-link').forEach(btn => {
        const isActive = btn.classList.contains('active');
        btn.style.background = isActive ? '#800000' : '#f4f6fa';
        btn.style.color = isActive ? '#fff' : '#495057';
    });
}

window.switchContentTab = function (key) {
    activeContentTab = key;
    contentEditingId = null;
    document.querySelectorAll('#contentTabNav .nav-link').forEach((btn, i) => {
        btn.classList.toggle('active', CONTENT_TABS[i].key === key);
    });
    styleContentTabs();
    renderActiveContentTab();
};

function renderActiveContentTab() {
    if (activeContentTab === 'beranda') {
        renderBerandaTab();
    } else {
        renderGenericContentTab(activeContentTab);
    }
}

/* ============================================================
   TAB BERANDA: statistik (site_settings) + slide (homepage_slides)
   ============================================================ */
async function renderBerandaTab() {
    const body = document.getElementById('contentTabBody');
    body.innerHTML = `<div class="text-muted small">Memuat...</div>`;

    const [{ data: statSettings }, { data: slides }] = await Promise.all([
        _supabase.from('site_settings').select('*').eq('category', 'beranda'),
        _supabase.from('homepage_slides').select('*').order('urutan', { ascending: true }),
    ]);

    body.innerHTML = `
        <div class="admin-card mb-3">
            <h6 class="fw-bold mb-3">Statistik Beranda</h6>
            <form id="statForm">
                <div class="row g-3">
                    ${(statSettings || []).map(row => `
                        <div class="col-md-3 col-6">
                            <label class="form-label small fw-bold">${escapeHtmlContent(row.label)}</label>
                            <input type="text" class="form-control" name="${row.key}" value="${escapeHtmlContent(row.value || '')}">
                        </div>
                    `).join('')}
                </div>
                <button type="submit" class="btn btn-maroon text-white rounded-pill px-4 fw-bold mt-3">Simpan Statistik</button>
                <span id="statSaveMsg" class="ms-2 small text-success d-none">Tersimpan!</span>
            </form>
        </div>

        <div class="d-flex justify-content-between align-items-center mb-3">
            <h6 class="fw-bold mb-0">Slide Beranda</h6>
            <button class="btn btn-maroon text-white rounded-pill px-4 fw-bold" onclick="openSlideFormModal()">
                <i class="bi bi-plus-lg me-1"></i> Tambah Slide
            </button>
        </div>
        <div class="row g-3" id="slidesGrid"></div>

        ${renderSlideFormModalShell()}
    `;

    document.getElementById('statForm').addEventListener('submit', handleSaveStats);

    window._slidesCache = slides || [];
    renderSlidesGrid();
}

function renderSlidesGrid() {
    const grid = document.getElementById('slidesGrid');
    const slides = window._slidesCache || [];

    if (slides.length === 0) {
        grid.innerHTML = `<div class="col-12"><div class="admin-empty-state"><i class="bi bi-images"></i>Belum ada slide.</div></div>`;
        return;
    }

    grid.innerHTML = slides.map(s => `
        <div class="col-md-4">
            <div class="admin-card p-0 overflow-hidden h-100">
                <div style="height:120px; background:#eee url('${escapeHtmlContent(s.gambar_url || '')}') center/cover;"></div>
                <div class="p-3">
                    <div class="small text-muted mb-1">${escapeHtmlContent(s.badge || '-')}</div>
                    <div class="fw-bold small mb-1">${escapeHtmlContent(s.judul || '(tanpa judul)')}</div>
                    <div class="d-flex justify-content-between align-items-center mt-2">
                        <span class="${s.is_published ? 'admin-badge-status-active' : 'admin-badge-status-inactive'}">${s.is_published ? 'TAMPIL' : 'DISEMBUNYIKAN'}</span>
                        <div>
                            <button class="btn btn-sm btn-outline-secondary border-0" onclick='openSlideFormModal(${s.id})'><i class="bi bi-pencil"></i></button>
                            <button class="btn btn-sm btn-outline-danger border-0" onclick='deleteSlide(${s.id})'><i class="bi bi-trash"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function renderSlideFormModalShell() {
    return `
    <div class="modal fade" id="slideFormModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <form id="slideForm">
                    <div class="modal-header">
                        <h5 class="modal-title fw-bold" id="slideFormTitle">Tambah Slide</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" id="slideFormFields"></div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Batal</button>
                        <button type="submit" id="slideFormSubmitBtn" class="btn btn-maroon text-white fw-bold">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    </div>`;
}

window.openSlideFormModal = function (id) {
    contentEditingId = id || null;
    const slide = id ? window._slidesCache.find(s => s.id === id) : null;

    document.getElementById('slideFormTitle').textContent = slide ? 'Edit Slide' : 'Tambah Slide';
    document.getElementById('slideFormFields').innerHTML = `
        <div class="mb-3">
            <label class="form-label small fw-bold">Badge (label kecil di atas judul)</label>
            <input type="text" class="form-control" name="badge" value="${escapeHtmlContent(slide?.badge || '')}">
        </div>
        <div class="mb-3">
            <label class="form-label small fw-bold">Judul</label>
            <input type="text" class="form-control" name="judul" value="${escapeHtmlContent(slide?.judul || '')}" required>
        </div>
        <div class="mb-3">
            <label class="form-label small fw-bold">Sub-judul / Deskripsi</label>
            <textarea class="form-control" name="subjudul" rows="2">${escapeHtmlContent(slide?.subjudul || '')}</textarea>
        </div>
        <div class="mb-3">
            <label class="form-label small fw-bold">Urutan Tampil</label>
            <input type="number" class="form-control" name="urutan" value="${slide?.urutan ?? 0}">
        </div>
        <div class="form-check form-switch mb-3">
            <input class="form-check-input" type="checkbox" name="is_published" id="slideIsPublished" ${slide?.is_published !== false ? 'checked' : ''}>
            <label class="form-check-label small" for="slideIsPublished">Tampilkan di beranda</label>
        </div>
        <div class="mb-2">
            <label class="form-label small fw-bold">Gambar ${slide?.gambar_url ? '(kosongkan kalau tidak ganti)' : ''}</label>
            <input type="file" class="form-control" id="slideImageInput" accept="image/*">
        </div>
    `;

    document.getElementById('slideForm').onsubmit = handleSaveSlide;
    new bootstrap.Modal(document.getElementById('slideFormModal')).show();
};

async function handleSaveSlide(e) {
    e.preventDefault();
    const form = e.target;
    const btn = document.getElementById('slideFormSubmitBtn');
    btn.disabled = true;
    btn.textContent = 'Menyimpan...';

    try {
        const payload = {
            badge: form.elements['badge'].value.trim(),
            judul: form.elements['judul'].value.trim(),
            subjudul: form.elements['subjudul'].value.trim(),
            urutan: parseInt(form.elements['urutan'].value) || 0,
            is_published: form.elements['is_published'].checked,
        };

        const fileInput = document.getElementById('slideImageInput');
        const file = fileInput && fileInput.files[0];
        if (file) {
            payload.gambar_url = await uploadPublicImage('homepage_slides', file);
        }

        let error;
        if (contentEditingId) {
            ({ error } = await _supabase.from('homepage_slides').update(payload).eq('id', contentEditingId));
        } else {
            ({ error } = await _supabase.from('homepage_slides').insert(payload));
        }
        if (error) throw error;

        bootstrap.Modal.getInstance(document.getElementById('slideFormModal')).hide();
        renderBerandaTab();
    } catch (err) {
        alert('Gagal menyimpan slide: ' + err.message);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Simpan';
    }
}

window.deleteSlide = async function (id) {
    if (!confirm('Yakin hapus slide ini?')) return;
    const { error } = await _supabase.from('homepage_slides').delete().eq('id', id);
    if (error) { alert('Gagal menghapus: ' + error.message); return; }
    renderBerandaTab();
};

async function handleSaveStats(e) {
    e.preventDefault();
    const form = e.target;
    const msg = document.getElementById('statSaveMsg');

    const { data: statSettings } = await _supabase.from('site_settings').select('*').eq('category', 'beranda');
    const updates = (statSettings || []).map(row => ({
        key: row.key, value: form.elements[row.key].value, label: row.label, category: row.category,
    }));

    const { error } = await _supabase.from('site_settings').upsert(updates, { onConflict: 'key' });
    if (error) { alert('Gagal menyimpan statistik: ' + error.message); return; }

    msg.classList.remove('d-none');
    setTimeout(() => msg.classList.add('d-none'), 2000);
}

/* ============================================================
   TAB GENERIK: Kegiatan / Galeri / Struktur Organisasi
   ============================================================ */
async function renderGenericContentTab(key) {
    const config = CONTENT_TABLE_CONFIGS[key];
    const body = document.getElementById('contentTabBody');
    body.innerHTML = `<div class="text-muted small">Memuat...</div>`;

    const { data, error } = await _supabase.from(key).select('*').order(config.orderBy, { ascending: true });

    if (error) {
        body.innerHTML = `<div class="admin-card text-danger">Gagal memuat: ${error.message}</div>`;
        return;
    }

    contentRowsCache = data || [];
    const titleField = config.fields[0].name;

    body.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <div class="text-muted small">${contentRowsCache.length} item di ${config.label}</div>
            <button class="btn btn-maroon text-white rounded-pill px-4 fw-bold" onclick="openContentFormModal()">
                <i class="bi bi-plus-lg me-1"></i> Tambah ${config.label}
            </button>
        </div>
        <div class="row g-3" id="contentGrid"></div>
        ${renderContentFormModalShell(config)}
    `;

    const grid = document.getElementById('contentGrid');
    if (contentRowsCache.length === 0) {
        grid.innerHTML = `<div class="col-12"><div class="admin-empty-state"><i class="bi bi-inbox"></i>Belum ada data.</div></div>`;
    } else {
        grid.innerHTML = contentRowsCache.map(row => `
            <div class="col-md-4">
                <div class="admin-card p-0 overflow-hidden h-100">
                    ${config.imageField ? `<div style="height:120px; background:#eee url('${escapeHtmlContent(row[config.imageField] || '')}') center/cover;"></div>` : ''}
                    <div class="p-3">
                        <div class="fw-bold small mb-1">${escapeHtmlContent(row[titleField] || '(tanpa judul)')}</div>
                        <div class="d-flex justify-content-between align-items-center mt-2">
                            <span class="${row.is_published ? 'admin-badge-status-active' : 'admin-badge-status-inactive'}">${row.is_published ? 'TAMPIL' : 'DISEMBUNYIKAN'}</span>
                            <div>
                                <button class="btn btn-sm btn-outline-secondary border-0" onclick='openContentFormModal(${JSON.stringify(row.id)})'><i class="bi bi-pencil"></i></button>
                                <button class="btn btn-sm btn-outline-danger border-0" onclick='deleteContentRow(${JSON.stringify(row.id)})'><i class="bi bi-trash"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    document.getElementById('contentResourceForm').addEventListener('submit', handleSaveContentRow);
}

function renderContentFormModalShell(config) {
    return `
    <div class="modal fade" id="contentFormModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <form id="contentResourceForm">
                    <div class="modal-header">
                        <h5 class="modal-title fw-bold" id="contentFormTitle">Tambah ${config.label}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" id="contentFormFields"></div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Batal</button>
                        <button type="submit" id="contentFormSubmitBtn" class="btn btn-maroon text-white fw-bold">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    </div>`;
}

window.openContentFormModal = function (id) {
    const config = CONTENT_TABLE_CONFIGS[activeContentTab];
    contentEditingId = id || null;
    const row = id ? contentRowsCache.find(r => r.id === id) : null;

    document.getElementById('contentFormTitle').textContent = row ? `Edit ${config.label}` : `Tambah ${config.label}`;

    const fieldsHtml = config.fields.map(f => {
        const value = row ? (row[f.name] ?? '') : '';
        if (f.type === 'textarea') {
            return `<div class="mb-3"><label class="form-label small fw-bold">${f.label}</label>
                <textarea class="form-control" name="${f.name}" rows="2" ${f.required ? 'required' : ''}>${escapeHtmlContent(value)}</textarea></div>`;
        }
        return `<div class="mb-3"><label class="form-label small fw-bold">${f.label}</label>
            <input type="${f.type === 'number' ? 'number' : 'text'}" class="form-control" name="${f.name}" value="${escapeHtmlContent(value)}" ${f.required ? 'required' : ''}></div>`;
    }).join('');

    document.getElementById('contentFormFields').innerHTML = `
        ${fieldsHtml}
        <div class="form-check form-switch mb-3">
            <input class="form-check-input" type="checkbox" name="is_published" id="contentIsPublished" ${row?.is_published !== false ? 'checked' : ''}>
            <label class="form-check-label small" for="contentIsPublished">Tampilkan di halaman publik</label>
        </div>
        ${config.imageField ? `
        <div class="mb-2">
            <label class="form-label small fw-bold">Gambar ${row && row[config.imageField] ? '(kosongkan kalau tidak ganti)' : ''}</label>
            <input type="file" class="form-control" id="contentImageInput" accept="image/*">
        </div>` : ''}
    `;

    new bootstrap.Modal(document.getElementById('contentFormModal')).show();
};

async function handleSaveContentRow(e) {
    e.preventDefault();
    const config = CONTENT_TABLE_CONFIGS[activeContentTab];
    const form = e.target;
    const btn = document.getElementById('contentFormSubmitBtn');
    btn.disabled = true;
    btn.textContent = 'Menyimpan...';

    try {
        const payload = { is_published: form.elements['is_published'].checked };
        config.fields.forEach(f => {
            const raw = form.elements[f.name].value;
            payload[f.name] = f.type === 'number' ? (parseInt(raw) || 0) : raw.trim();
        });

        const fileInput = document.getElementById('contentImageInput');
        const file = fileInput && fileInput.files[0];
        if (file) {
            payload[config.imageField] = await uploadPublicImage(activeContentTab, file);
        }

        let error;
        if (contentEditingId) {
            ({ error } = await _supabase.from(activeContentTab).update(payload).eq('id', contentEditingId));
        } else {
            ({ error } = await _supabase.from(activeContentTab).insert(payload));
        }
        if (error) throw error;

        bootstrap.Modal.getInstance(document.getElementById('contentFormModal')).hide();
        renderGenericContentTab(activeContentTab);
    } catch (err) {
        alert('Gagal menyimpan: ' + err.message);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Simpan';
    }
}

window.deleteContentRow = async function (id) {
    if (!confirm('Yakin hapus item ini?')) return;
    const { error } = await _supabase.from(activeContentTab).delete().eq('id', id);
    if (error) { alert('Gagal menghapus: ' + error.message); return; }
    renderGenericContentTab(activeContentTab);
};

/* ============================================================
   HELPER: upload gambar ke bucket publik, kembalikan URL publik penuh
   ============================================================ */
async function uploadPublicImage(folder, file) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${folder}/${Date.now()}-${safeName}`;
    const { error } = await _supabase.storage.from(CONTENT_IMAGE_BUCKET).upload(path, file, { upsert: false });
    if (error) throw error;
    const { data } = _supabase.storage.from(CONTENT_IMAGE_BUCKET).getPublicUrl(path);
    return data.publicUrl;
}

function escapeHtmlContent(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : str;
    return div.innerHTML;
}
