// --- VARIABEL KHUSUS MODUL KELAS FILM (Biar gak bentrok) ---
const _supabaseUrlModul = "https://kbrvnbduwczjqdmofdky.supabase.co";
const _supabaseKeyModul = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImticnZuYmR1d2N6anFkbW9mZGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMDczODYsImV4cCI6MjA5Mjc4MzM4Nn0.M1jW5lB3eSm7oOp37gKmEIO7XaUUAw-qwZ-aOVf09Vo";
const _supabaseModul = supabase.createClient(_supabaseUrlModul, _supabaseKeyModul);

async function fetchModulKelasFilm() {
    const tableBody = document.getElementById('tabel-modul-body');
    const countBadge = document.getElementById('modul-count');

    if (!tableBody) return;

    // Tampilkan Loading
    tableBody.innerHTML = `<tr><td colspan="3" class="text-center py-5 text-muted"><div class="spinner-border spinner-border-sm text-maroon me-2" style="color:#800000;"></div> Menarik materi...</td></tr>`;

    try {
        const { data, error } = await _supabaseModul
            // NARIK DATA DARI TABEL BARU
            .from('modul_kelas_film')
            .select('*')
            .order('created_at', { ascending: false }); // Yang terbaru muncul di atas

        if (error) throw error;

        // Kalau tabel masih kosong
        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="3" class="text-center py-5 text-muted">Belum ada modul kelas film yang diunggah.</td></tr>`;
            if (countBadge) countBadge.innerText = `0 Modul`;
        } else {
            // Kalau ada isinya
            let html = '';
            data.forEach((modul) => {
                html += `
                <tr>
                    <td>
                        <div class="fw-bold fs-6 text-dark">${modul.judul}</div>
                        <div class="text-muted x-small">Pemateri: ${modul.pemateri || 'Instruktur Kelas Film'}</div>
                    </td>
                    <td class="text-center">
                        <span class="badge bg-light text-dark border px-2 py-1">${modul.kategori || 'PDF'}</span>
                    </td>
                    <td class="text-end">
                        <a href="${modul.file_url}" target="_blank" class="btn btn-sm btn-outline-dark rounded-pill px-3">Unduh</a>
                    </td>
                </tr>`;
            });
            tableBody.innerHTML = html;

            // Update angka di badge "0 Modul"
            if (countBadge) countBadge.innerText = `${data.length} Modul`;
        }
    } catch (err) {
        console.error(err);
        tableBody.innerHTML = `<tr><td colspan="3" class="text-center py-5 text-danger small">Gagal memuat data modul. Coba refresh halaman.</td></tr>`;
    }
}

// Jalankan fungsi saat halaman beres di-load
document.addEventListener('DOMContentLoaded', fetchModulKelasFilm);