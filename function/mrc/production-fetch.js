// Pakai client Supabase bersama dari supabase-config.js
const _prodDB = _supabase;

async function loadProductionTable(tableName) {
    const container = document.getElementById('tempat-dokumen');
    const badgeTotal = document.getElementById('total-dokumen');

    const { data, error } = await _prodDB.from(tableName).select('*').order('id', { ascending: true });

    if (error) {
        container.innerHTML = `<tr><td colspan="3" class="text-center text-danger py-4">Error Database: ${error.message}</td></tr>`;
        badgeTotal.innerText = "Error";
        return;
    }

    if (!data || data.length === 0) {
        container.innerHTML = `<tr><td colspan="3" class="text-center text-muted py-3">Belum ada dokumen yang ditambahkan.</td></tr>`;
        badgeTotal.innerText = "0 Dokumen";
        return;
    }

    badgeTotal.innerText = `${data.length} Dokumen`;

    container.innerHTML = data.map((doc, index) => `
        <tr>
            <td><div class="fw-bold">${index + 1}. ${doc.judul}</div></td>
            <td class="text-center text-muted">${doc.format || '-'}</td>
            <td class="text-end">
                <button type="button" class="btn btn-sm btn-outline-dark rounded-pill px-3" data-path="${mrcEscAttr(doc.link_unduh)}" onclick="openMrcFile(this.dataset.path, this)">Unduh</button>
            </td>
        </tr>
    `).join('');
}