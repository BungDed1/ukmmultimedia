// --- File: /function/admin/mrc-manage.js ---
// CRUD generik untuk semua tabel resource MRC + upload file ke bucket privat
// `mrc-storage`. Kolom yang ditampilkan/diedit per tabel didefinisikan di
// MRC_TABLE_CONFIGS supaya satu halaman ini bisa melayani semua tabel tanpa
// duplikasi kode per tabel.

const MRC_STORAGE_BUCKET_ADMIN = 'mrc-storage';

const MRC_PILLARS = [
    { key: 'digital-library', label: 'Digital Library', desc: 'Modul pelatihan, arsip naskah, dan literasi digital.', icon: 'bi-book-half', color: '#800000', bg: 'rgba(128,0,0,0.08)' },
    { key: 'productivity-lab', label: 'Productivity Lab', desc: 'Shortcut master, rumus excel, dan tools fungsional SDM.', icon: 'bi-cpu-fill', color: '#0d6efd', bg: 'rgba(13,110,253,0.08)', staticOnly: true },
    { key: 'production-suite', label: 'Production Suite', desc: 'Template RAB, skenario standar, dan dokumen produksi.', icon: 'bi-camera-reels-fill', color: '#212529', bg: 'rgba(33,37,41,0.06)' },
    { key: 'certificate-center', label: 'Certificate Center', desc: 'Cari dan kelola sertifikat pelatihan resmi anggota UKM.', icon: 'bi-patch-check-fill', color: '#b8860b', bg: 'rgba(184,134,11,0.12)' },
];

const MRC_TABLE_CONFIGS = [
    {
        key: 'modul_pelatihan', label: 'Modul Pelatihan', linkField: 'file_url', orderBy: 'created_at', orderDesc: true, pillar: 'digital-library',
        fields: [
            { name: 'judul', label: 'Judul', type: 'text', required: true },
            { name: 'kategori', label: 'Kategori', type: 'text' },
            { name: 'pemateri', label: 'Pemateri', type: 'text' },
        ],
    },
    {
        key: 'naskah_skenario', label: 'Naskah & Skenario', linkField: 'link_baca', orderBy: 'created_at', orderDesc: true, pillar: 'digital-library',
        fields: [
            { name: 'judul', label: 'Judul', type: 'text', required: true },
            { name: 'penulis', label: 'Penulis', type: 'text' },
            { name: 'tanggal_update', label: 'Tanggal Update', type: 'text' },
            { name: 'format', label: 'Format (PDF/DOCX/dll)', type: 'text' },
        ],
    },
    {
        key: 'digital_library', label: 'E-Book / Digital Library', linkField: 'link_baca', orderBy: 'created_at', orderDesc: true, pillar: 'digital-library',
        fields: [
            { name: 'judul', label: 'Judul', type: 'text', required: true },
            { name: 'tahun_terbit', label: 'Tahun Terbit', type: 'text' },
            { name: 'format', label: 'Format', type: 'text' },
        ],
    },
    {
        key: 'modul_kelas_film', label: 'Modul Kelas Film', linkField: 'file_url', orderBy: 'created_at', orderDesc: true, pillar: 'production-suite',
        fields: [
            { name: 'judul', label: 'Judul', type: 'text', required: true },
            { name: 'pemateri', label: 'Pemateri', type: 'text' },
            { name: 'kategori', label: 'Kategori', type: 'text' },
        ],
    },
    {
        key: 'data_template', label: 'Template Produksi', linkField: 'link_file', orderBy: 'created_at', orderDesc: true, pillar: 'production-suite',
        fields: [
            { name: 'nama_template', label: 'Nama Template', type: 'text', required: true },
            { name: 'deskripsi', label: 'Deskripsi', type: 'textarea' },
            { name: 'format', label: 'Format', type: 'text' },
        ],
    },
    {
        key: 'prod_administrasi', label: 'Administrasi', linkField: 'link_unduh', orderBy: 'id', pillar: 'production-suite',
        fields: [
            { name: 'judul', label: 'Judul', type: 'text', required: true },
            { name: 'format', label: 'Format', type: 'text' },
        ],
    },
    {
        key: 'prod_pra_produksi', label: 'Pra Produksi', linkField: 'link_unduh', orderBy: 'id', pillar: 'production-suite',
        fields: [
            { name: 'judul', label: 'Judul', type: 'text', required: true },
            { name: 'format', label: 'Format', type: 'text' },
        ],
    },
    {
        key: 'prod_rab', label: 'RAB', linkField: 'link_unduh', orderBy: 'id', pillar: 'production-suite',
        fields: [
            { name: 'judul', label: 'Judul', type: 'text', required: true },
            { name: 'format', label: 'Format', type: 'text' },
        ],
    },
    {
        key: 'cert_data', label: 'Sertifikat', linkField: 'file_url', orderBy: 'id', pillar: 'certificate-center',
        uploadBucket: 'certificates.', uploadIsPublic: true, // sertifikat harus tetap bisa dilihat publik tanpa login
        fields: [
            { name: 'name', label: 'Nama Peserta', type: 'text', required: true },
            { name: 'role', label: 'Peran (mis. Peserta/Panitia)', type: 'text' },
            { name: 'category', label: 'Kategori', type: 'text' },
            { name: 'event_key', label: 'Kode Event', type: 'text' },
            { name: 'cert_id', label: 'Nomor Sertifikat', type: 'text' },
        ],
    },
];

let activeMrcTableKey = MRC_TABLE_CONFIGS[0].key;
let activePillarKey = MRC_TABLE_CONFIGS[0].pillar;
let mrcRowsCache = [];
let mrcEditingId = null;

document.addEventListener('DOMContentLoaded', function () {
    const waitForShell = setInterval(() => {
        const target = document.getElementById('adminPageContent');
        if (!target) return;
        clearInterval(waitForShell);
        initMrcManagePage(target);
    }, 50);
});

function getMrcConfig(key) {
    return MRC_TABLE_CONFIGS.find(c => c.key === key);
}

function initMrcManagePage(target) {
    target.innerHTML = `
        <p class="text-muted small mb-3">Dikelompokkan sesuai 4 bagian utama MRC di situs -- klik salah satu untuk buka.</p>
        <div id="mrcPillarStack"></div>

        <div id="mrcResourceListArea" class="d-none">
            <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div class="text-muted small" id="mrcRowCountLabel">Memuat data...</div>
                <button class="btn btn-maroon text-white rounded-pill px-4 fw-bold" onclick="openMrcFormModal()">
                    <i class="bi bi-plus-lg me-1"></i> Tambah Resource
                </button>
            </div>

            <div class="admin-card p-0">
                <div class="table-responsive">
                    <table class="table admin-table mb-0">
                        <thead><tr id="mrcTableHeadRow"></tr></thead>
                        <tbody id="mrcTableBody"><tr><td colspan="6" class="text-center text-muted py-4">Memuat...</td></tr></tbody>
                    </table>
                </div>
            </div>
        </div>

        ${renderMrcFormModalShell()}
    `;

    document.getElementById('mrcResourceForm').addEventListener('submit', handleSaveMrcResource);

    renderPillarStack();
    openPillar(activePillarKey);
}

function renderPillarStack() {
    const stack = document.getElementById('mrcPillarStack');
    stack.innerHTML = MRC_PILLARS.map(p => {
        const tablesInPillar = MRC_TABLE_CONFIGS.filter(c => c.pillar === p.key);
        return `
        <div class="mrc-pillar-group ${p.key === activePillarKey ? 'open' : ''}" id="pillar-${p.key}">
            <div class="mrc-pillar-header" onclick="togglePillar('${p.key}')">
                <div class="pillar-icon" style="background:${p.bg}; color:${p.color};"><i class="bi ${p.icon}"></i></div>
                <div class="pillar-info">
                    <div class="pillar-title">${p.label}</div>
                    <div class="pillar-desc">${p.desc}</div>
                </div>
                <i class="bi bi-chevron-down pillar-chevron"></i>
            </div>
            <div class="mrc-pillar-body">
                ${p.staticOnly ? `
                    <div class="admin-empty-state">
                        <i class="bi bi-info-circle"></i>
                        Konten Productivity Lab masih statis di kode (belum ada database-nya).
                        Untuk saat ini ubah lewat file halaman lab secara langsung.
                    </div>
                ` : `
                    <div class="p-3 d-flex flex-wrap gap-2">
                        ${tablesInPillar.map(t => `
                            <button type="button" class="btn btn-sm rounded-pill px-3 pillar-subtab" data-key="${t.key}"
                                onclick="switchMrcTab('${t.key}')">${t.label}</button>
                        `).join('')}
                    </div>
                `}
            </div>
        </div>`;
    }).join('');

    highlightActiveSubtab();
}

window.togglePillar = function (key) {
    const isCurrentlyOpen = document.getElementById(`pillar-${key}`).classList.contains('open');
    document.querySelectorAll('.mrc-pillar-group').forEach(el => el.classList.remove('open'));
    if (!isCurrentlyOpen) {
        openPillar(key);
    } else {
        document.getElementById('mrcResourceListArea').classList.add('d-none');
    }
};

function openPillar(key) {
    const pillar = MRC_PILLARS.find(p => p.key === key);
    document.querySelectorAll('.mrc-pillar-group').forEach(el => el.classList.remove('open'));
    const el = document.getElementById(`pillar-${key}`);
    if (el) el.classList.add('open');
    activePillarKey = key;

    if (pillar && pillar.staticOnly) {
        document.getElementById('mrcResourceListArea').classList.add('d-none');
        return;
    }

    const firstTable = MRC_TABLE_CONFIGS.find(c => c.pillar === key);
    if (firstTable) {
        document.getElementById('mrcResourceListArea').classList.remove('d-none');
        switchMrcTab(firstTable.key);
    }
}

function highlightActiveSubtab() {
    document.querySelectorAll('.pillar-subtab').forEach(btn => {
        const isActive = btn.dataset.key === activeMrcTableKey;
        btn.classList.toggle('active', isActive);
        btn.style.background = isActive ? '#800000' : '#f4f6fa';
        btn.style.color = isActive ? '#fff' : '#495057';
        btn.style.fontWeight = isActive ? '700' : '500';
    });
}

window.switchMrcTab = function (key) {
    activeMrcTableKey = key;
    mrcEditingId = null;
    document.getElementById('mrcResourceListArea').classList.remove('d-none');
    highlightActiveSubtab();
    loadMrcRows();
};

async function loadMrcRows() {
    const config = getMrcConfig(activeMrcTableKey);
    const headRow = document.getElementById('mrcTableHeadRow');
    const tbody = document.getElementById('mrcTableBody');
    const countLabel = document.getElementById('mrcRowCountLabel');

    const titleFieldLabel = config.fields[0].label;
    const otherFieldConfigs = config.fields.slice(1);

    headRow.innerHTML = `<th class="ps-3">${titleFieldLabel}</th>` +
        otherFieldConfigs.map(f => `<th>${f.label}</th>`).join('') +
        `<th>File</th><th class="text-end pe-3">Aksi</th>`;

    tbody.innerHTML = `<tr><td colspan="10" class="text-center text-muted py-4">Memuat...</td></tr>`;

    const { data, error } = await _supabase
        .from(config.key)
        .select('*')
        .order(config.orderBy, { ascending: !config.orderDesc });

    if (error) {
        tbody.innerHTML = `<tr><td colspan="10" class="text-center text-danger py-4">Gagal memuat: ${error.message}</td></tr>`;
        countLabel.textContent = 'Gagal memuat data';
        return;
    }

    mrcRowsCache = data || [];
    countLabel.textContent = `${mrcRowsCache.length} item di ${config.label}`;

    if (mrcRowsCache.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" class="text-center text-muted py-4">Belum ada data.</td></tr>`;
        return;
    }

    const titleField = config.fields[0].name;
    const otherFields = config.fields.slice(1);

    tbody.innerHTML = mrcRowsCache.map(row => `
        <tr>
            <td class="ps-3 fw-semibold">${escapeHtmlMrc(row[titleField] || '(tanpa judul)')}</td>
            ${otherFields.map(f => `<td>${escapeHtmlMrc(row[f.name] || '-')}</td>`).join('')}
            <td>${row[config.linkField]
            ? `<button type="button" class="btn btn-sm btn-outline-dark rounded-pill px-3" data-path="${mrcEscAttr(row[config.linkField])}" onclick="openMrcFile(this.dataset.path, this)">Lihat</button>`
            : '<span class="text-muted small">Belum ada file</span>'}
            </td>
            <td class="text-end pe-3">
                <button class="btn btn-sm btn-outline-secondary border-0" onclick='openMrcFormModal(${JSON.stringify(row.id)})'><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-danger border-0" onclick='deleteMrcRow(${JSON.stringify(row.id)})'><i class="bi bi-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function renderMrcFormModalShell() {
    return `
    <div class="modal fade" id="mrcFormModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <form id="mrcResourceForm">
                    <div class="modal-header">
                        <h5 class="modal-title fw-bold" id="mrcFormModalTitle">Tambah Resource</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" id="mrcFormFieldsContainer"></div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Batal</button>
                        <button type="submit" id="mrcFormSubmitBtn" class="btn btn-maroon text-white fw-bold">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    </div>`;
}

window.openMrcFormModal = function (id) {
    const config = getMrcConfig(activeMrcTableKey);
    mrcEditingId = id || null;
    const row = id ? mrcRowsCache.find(r => r.id === id) : null;

    document.getElementById('mrcFormModalTitle').textContent = row ? `Edit ${config.label}` : `Tambah ${config.label}`;

    const fieldsHtml = config.fields.map(f => {
        const value = row ? escapeHtmlMrc(row[f.name] || '') : '';
        if (f.type === 'textarea') {
            return `
            <div class="mb-3">
                <label class="form-label small fw-bold">${f.label}</label>
                <textarea class="form-control" name="${f.name}" rows="2" ${f.required ? 'required' : ''}>${value}</textarea>
            </div>`;
        }
        return `
        <div class="mb-3">
            <label class="form-label small fw-bold">${f.label}</label>
            <input type="text" class="form-control" name="${f.name}" value="${value}" ${f.required ? 'required' : ''}>
        </div>`;
    }).join('');

    document.getElementById('mrcFormFieldsContainer').innerHTML = `
        ${fieldsHtml}
        <div class="mb-2">
            <label class="form-label small fw-bold">File ${row && row[config.linkField] ? '(kosongkan kalau tidak ingin ganti file)' : ''}</label>
            <input type="file" class="form-control" id="mrcFileInput">
            ${row && row[config.linkField] ? `<div class="form-text">File saat ini: ${escapeHtmlMrc(row[config.linkField].split('/').pop())}</div>` : ''}
        </div>
        <div id="mrcFormError" class="text-danger small mt-2 d-none"></div>
    `;

    const modal = new bootstrap.Modal(document.getElementById('mrcFormModal'));
    modal.show();
};

async function handleSaveMrcResource(e) {
    e.preventDefault();

    const config = getMrcConfig(activeMrcTableKey);
    const form = e.target;
    const errorBox = document.getElementById('mrcFormError');
    const submitBtn = document.getElementById('mrcFormSubmitBtn');
    errorBox.classList.add('d-none');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Menyimpan...';

    try {
        const payload = {};
        config.fields.forEach(f => {
            payload[f.name] = form.elements[f.name].value.trim();
        });

        const fileInput = document.getElementById('mrcFileInput');
        const file = fileInput && fileInput.files[0];

        if (file) {
            const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            const path = `${config.key}/${Date.now()}-${safeName}`;
            const targetBucket = config.uploadBucket || MRC_STORAGE_BUCKET_ADMIN;

            const { error: uploadError } = await _supabase.storage
                .from(targetBucket)
                .upload(path, file, { upsert: false });

            if (uploadError) throw uploadError;

            if (config.uploadIsPublic) {
                // Bucket publik -> simpan URL publik lengkap, langsung bisa dibuka tanpa login
                const { data: publicUrlData } = _supabase.storage.from(targetBucket).getPublicUrl(path);
                payload[config.linkField] = publicUrlData.publicUrl;
            } else {
                // Bucket privat -> simpan path relatif saja, dibuka lewat signed URL
                payload[config.linkField] = path;
            }
        }

        let saveError;
        if (mrcEditingId) {
            const { error } = await _supabase.from(config.key).update(payload).eq('id', mrcEditingId);
            saveError = error;
        } else {
            const { error } = await _supabase.from(config.key).insert(payload);
            saveError = error;
        }

        if (saveError) throw saveError;

        bootstrap.Modal.getInstance(document.getElementById('mrcFormModal')).hide();
        await loadMrcRows();

    } catch (err) {
        console.error('Simpan resource MRC gagal:', err);
        errorBox.textContent = err.message || 'Gagal menyimpan data.';
        errorBox.classList.remove('d-none');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Simpan';
    }
}

window.deleteMrcRow = async function (id) {
    const config = getMrcConfig(activeMrcTableKey);
    const row = mrcRowsCache.find(r => r.id === id);
    if (!row) return;

    if (!confirm('Yakin hapus item ini? File yang sudah diunggah juga akan dihapus.')) return;

    try {
        const linkValue = row[config.linkField];
        // Cuma coba hapus file dari storage kalau nilainya path relatif hasil upload kita sendiri
        // (bukan URL Google Drive/legacy atau link eksternal lain).
        if (linkValue && !/^https?:\/\//i.test(linkValue)) {
            const targetBucket = config.uploadBucket || MRC_STORAGE_BUCKET_ADMIN;
            await _supabase.storage.from(targetBucket).remove([linkValue]);
        }
        const { error } = await _supabase.from(config.key).delete().eq('id', id);
        if (error) throw error;
        await loadMrcRows();
    } catch (err) {
        alert('Gagal menghapus: ' + err.message);
    }
};

function escapeHtmlMrc(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : str;
    return div.innerHTML;
}
