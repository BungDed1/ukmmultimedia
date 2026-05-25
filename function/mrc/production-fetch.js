const _sbUrl = "https://kbrvnbduwczjqdmofdky.supabase.co";
const _sbKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImticnZuYmR1d2N6anFkbW9mZGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMDczODYsImV4cCI6MjA5Mjc4MzM4Nn0.M1jW5lB3eSm7oOp37gKmEIO7XaUUAw-qwZ-aOVf09Vo";
const _prodDB = supabase.createClient(_sbUrl, _sbKey);

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
                <a href="${doc.link_unduh || '#'}" target="_blank" class="btn btn-sm btn-outline-dark rounded-pill px-3">Unduh</a>
            </td>
        </tr>
    `).join('');
}