// URL & Key project BungDed-Resource-Center (Udah dipastikan valid)
const _sbUrl = "https://kbrvnbduwczjqdmofdky.supabase.co";
const _sbKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImticnZuYmR1d2N6anFkbW9mZGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMDczODYsImV4cCI6MjA5Mjc4MzM4Nn0.M1jW5lB3eSm7oOp37gKmEIO7XaUUAw-qwZ-aOVf09Vo";
const _libDB = supabase.createClient(_sbUrl, _sbKey);

async function loadNaskahLibrary() {
    const container = document.getElementById('tempat-naskah');
    const badgeTotal = document.getElementById('total-dokumen');

    try {
        // Tarik data dari tabel naskah_skenario
        const { data, error } = await _libDB
            .from('naskah_skenario')
            .select('*');

        if (error) {
            console.error("Error Database:", error.message);
            container.innerHTML = `<tr><td colspan="3" class="text-center text-danger py-4">
                <b><i class="bi bi-bug-fill"></i> ERROR DARI DATABASE:</b><br><br>
                <code>${error.message}</code>
            </td></tr>`;
            badgeTotal.innerText = "Error";
            return;
        }

        if (!data || data.length === 0) {
            container.innerHTML = `<tr><td colspan="3" class="text-center text-muted py-3">Belum ada arsip naskah yang ditambahkan.</td></tr>`;
            badgeTotal.innerText = "0 Dokumen";
            return;
        }

        // Update jumlah dokumen
        badgeTotal.innerText = `${data.length} Dokumen`;

        // Render HTML
        container.innerHTML = data.map((naskah, index) => `
            <tr>
                <td>
                    <div class="fw-bold">${index + 1}. ${naskah.judul || 'Judul Kosong'}</div>
                    <div class="text-muted x-small">Update: ${naskah.tanggal_update || '-'} • Penulis: ${naskah.penulis || 'Anonim'}</div>
                </td>
                <td class="text-center text-muted">${naskah.format || 'PDF'}</td>
                <td class="text-end">
                    <a href="${naskah.link_baca || '#'}" target="_blank" class="btn btn-sm btn-outline-dark rounded-pill px-3">
                        <i class="bi bi-file-earmark-text me-1"></i> Baca
                    </a>
                </td>
            </tr>
        `).join('');

    } catch (err) {
        container.innerHTML = `<tr><td colspan="3" class="text-center text-danger py-4">
            <b><i class="bi bi-wifi-off"></i> ERROR SISTEM:</b><br><br>
            <code>${err.message}</code>
        </td></tr>`;
    }
}

document.addEventListener('DOMContentLoaded', loadNaskahLibrary);