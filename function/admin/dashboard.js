// --- File: /function/admin/dashboard.js ---
// Menarik data ringkasan untuk kartu-kartu di dashboard admin.
// Query dijalankan sebagai user admin yang sedang login -- RLS di database
// yang menentukan boleh/tidaknya, bukan skrip ini.

document.addEventListener('DOMContentLoaded', async function () {
    // Ditunda dikit sampai renderAdminShell() jalan & #adminPageContent ada
    const waitForShell = setInterval(async () => {
        const target = document.getElementById('adminPageContent');
        if (!target) return;
        clearInterval(waitForShell);
        await renderDashboard(target);
    }, 50);
});

// Tabel resource MRC yang dihitung sebagai "jumlah konten/resource MRC"
const MRC_RESOURCE_TABLES = [
    'modul_pelatihan', 'naskah_skenario', 'prod_administrasi',
    'prod_pra_produksi', 'prod_rab', 'data_template',
    'digital_library', 'modul_kelas_film'
];

async function countRows(table) {
    try {
        const { count, error } = await _supabase.from(table).select('*', { count: 'exact', head: true });
        if (error) throw error;
        return count || 0;
    } catch (err) {
        console.error(`Gagal hitung ${table}:`, err);
        return null;
    }
}

async function renderDashboard(target) {
    target.innerHTML = `
        <div class="row g-3" id="statCardsRow">
            ${skeletonCard()}${skeletonCard()}${skeletonCard()}${skeletonCard()}
        </div>

        <div class="admin-card mt-4">
            <h6 class="fw-bold mb-2"><i class="bi bi-info-circle me-2 text-muted"></i>Catatan</h6>
            <p class="text-muted small mb-0">
                Konten Productivity Lab (shortcut/rumus) masih statis di kode, belum ada database-nya.
                Statistik Event juga belum aktif -- menyusul di pembaruan berikutnya.
            </p>
        </div>
    `;

    const [memberCount, resourceCounts, certCount] = await Promise.all([
        countRows('members'),
        Promise.all(MRC_RESOURCE_TABLES.map(t => countRows(t))),
        countRows('cert_data'),
    ]);

    const totalResource = resourceCounts.reduce((sum, n) => sum + (n || 0), 0);

    const cards = [
        { icon: 'bi-people-fill', value: memberCount, label: 'Total Member Terdaftar' },
        { icon: 'bi-folder2-open', value: totalResource, label: 'Total Resource MRC' },
        { icon: 'bi-patch-check-fill', value: certCount, label: 'Data Sertifikat' },
        { icon: 'bi-calendar-event', value: '—', label: 'Event (segera hadir)' },
    ];

    document.getElementById('statCardsRow').innerHTML = cards.map(c => `
        <div class="col-6 col-md-3">
            <div class="admin-card admin-stat-card h-100">
                <div class="stat-icon"><i class="bi ${c.icon}"></i></div>
                <div class="stat-value">${c.value === null ? '—' : c.value}</div>
                <div class="stat-label">${c.label}</div>
            </div>
        </div>
    `).join('');
}

function skeletonCard() {
    return `
        <div class="col-6 col-md-3">
            <div class="admin-card admin-stat-card h-100">
                <div class="placeholder-glow">
                    <span class="placeholder col-4 mb-2" style="height:20px;"></span><br>
                    <span class="placeholder col-6" style="height:26px;"></span><br>
                    <span class="placeholder col-8 mt-1" style="height:14px;"></span>
                </div>
            </div>
        </div>
    `;
}
