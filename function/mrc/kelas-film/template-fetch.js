// --- UBAH NAMA VARIABEL BIAR GAK BENTROK SAMA MODUL-FETCH.JS ---
const _supabaseUrlTemplate = "https://kbrvnbduwczjqdmofdky.supabase.co";
const _supabaseKeyTemplate = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImticnZuYmR1d2N6anFkbW9mZGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMDczODYsImV4cCI6MjA5Mjc4MzM4Nn0.M1jW5lB3eSm7oOp37gKmEIO7XaUUAw-qwZ-aOVf09Vo";
const _supabaseTemplate = supabase.createClient(_supabaseUrlTemplate, _supabaseKeyTemplate);

// FUNGSI TARIK DATA TEMPLATE DARI SUPABASE
async function fetchTemplate() {
    // Tangkap elemen body tabel template di dalam fungsi biar aman
    const tabelTemplateBody = document.getElementById('tabel-template-body');

    if (!tabelTemplateBody) return; // Jaga-jaga kalau elemennya belum ke-load

    // Tampilan saat loading
    tabelTemplateBody.innerHTML = `<tr><td colspan="3" class="text-center py-5 text-muted"><div class="spinner-border spinner-border-sm text-maroon me-2" style="color:#800000;"></div> Memuat data...</td></tr>`;

    try {
        const { data, error } = await _supabaseTemplate
            .from('data_template') // Pastikan lu udah bikin tabel ini di Supabase ya!
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Kalau tabel masih kosong di Supabase
        if (data.length === 0) {
            tabelTemplateBody.innerHTML = `<tr><td colspan="3" class="text-center py-5 text-muted">Belum ada template produksi yang diunggah.</td></tr>`;
            return;
        }

        // Kalau ada datanya, cetak jadi baris tabel
        let html = '';
        data.forEach((template) => {
            html += `
            <tr>
                <td>
                    <div class="fw-bold text-dark fs-6">${template.nama_template}</div>
                    <div class="text-muted x-small">${template.deskripsi}</div>
                </td>
                <td class="text-center">
                    <span class="badge bg-light text-dark border px-2 py-1">${template.format}</span>
                </td>
                <td class="text-end">
                    <a href="${template.link_file}" target="_blank" class="btn btn-sm btn-outline-dark rounded-pill px-3">Unduh</a>
                </td>
            </tr>`;
        });

        tabelTemplateBody.innerHTML = html;

    } catch (err) {
        console.error("Gagal load template:", err);
        tabelTemplateBody.innerHTML = `<tr><td colspan="3" class="text-center py-5 text-danger small">Gagal memuat template. Coba refresh halaman.</td></tr>`;
    }
}

// Jalankan fungsi saat halaman beres di-load
document.addEventListener('DOMContentLoaded', fetchTemplate);