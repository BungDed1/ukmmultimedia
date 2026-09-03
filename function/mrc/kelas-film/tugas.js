// Konfigurasi Supabase
// Pakai client Supabase bersama `_supabase` yang sudah dideklarasikan di supabase-config.js

// DOM Elements
const formTugas = document.getElementById('form-tugas');
const btnSubmit = document.getElementById('btn-submit');
const tabelRiwayatBody = document.getElementById('tabel-riwayat-body');

// 1. FUNGSI UPLOAD & SUBMIT TUGAS
formTugas.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Ambil data dari form
    const namaPH = document.getElementById('nama_ph').value.trim();
    const jenisTugas = document.getElementById('jenis_tugas').value;
    const fileInput = document.getElementById('file_tugas');
    const catatan = document.getElementById('catatan').value.trim();

    // Validasi file
    const file = fileInput.files[0];
    if (!file) {
        alert("Pilih file tugasnya dulu ya!");
        return;
    }

    // Ubah tulisan tombol jadi loading
    btnSubmit.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Mengupload...`;
    btnSubmit.disabled = true;

    try {
        // TAHAP 1: UPLOAD FILE KE SUPABASE STORAGE
        const fileExt = file.name.split('.').pop();
        const namaPhAman = namaPH.replace(/[^a-zA-Z0-9]/g, '_'); // Bersihkan nama dari simbol aneh
        const fileName = `${Date.now()}_${namaPhAman}.${fileExt}`; // Nama file unik
        const filePath = `berkas_tugas/${fileName}`; // Simpan di dalam folder 'berkas_tugas'

        const { data: uploadData, error: uploadError } = await _supabase.storage
            .from('tugas_film') // Nama bucket lu
            .upload(filePath, file);

        if (uploadError) {
            throw new Error("Gagal upload file ke Storage: " + uploadError.message);
        }

        // TAHAP 2: DAPATKAN LINK DOWNLOAD FILE TERSEBUT
        const { data: urlData } = _supabase.storage
            .from('tugas_film')
            .getPublicUrl(filePath);

        const fileUrl = urlData.publicUrl;

        // TAHAP 3: SIMPAN DATA KE TABEL 'pengumpulan_tugas'
        const { error: insertError } = await _supabase
            .from('pengumpulan_tugas')
            .insert([
                {
                    nama_ph: namaPH,
                    jenis_tugas: jenisTugas,
                    link_file: fileUrl, // Ini URL file yang barusan diupload
                    catatan: catatan
                }
            ]);

        if (insertError) {
            throw new Error("Gagal menyimpan ke Database: " + insertError.message);
        }

        // Kalau semua tahap sukses
        alert("Mantap! File tugas berhasil diupload dan dikumpulkan.");
        formTugas.reset();
        fetchRiwayatTugas(); // Refresh otomatis tabel kanan

    } catch (err) {
        console.error("Error Detail:", err);
        alert(err.message);
    } finally {
        // Balikin kondisi tombol ke awal
        btnSubmit.innerHTML = `<i class="bi bi-send-fill me-2"></i> Upload & Kumpul Tugas`;
        btnSubmit.disabled = false;
    }
});

// 2. FUNGSI TARIK DATA RIWAYAT
async function fetchRiwayatTugas() {
    tabelRiwayatBody.innerHTML = `<tr><td colspan="3" class="text-center py-4 text-muted">Menarik riwayat...</td></tr>`;

    try {
        const { data, error } = await _supabase
            .from('pengumpulan_tugas')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (data.length === 0) {
            tabelRiwayatBody.innerHTML = `<tr><td colspan="3" class="text-center py-4 text-muted">Belum ada tugas yang terkumpul.</td></tr>`;
        } else {
            let html = '';
            data.forEach((tugas) => {
                const dateObj = new Date(tugas.created_at);
                const tgl = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

                html += `
                <tr>
                    <td>
                        <div class="fw-bold text-dark">${tugas.nama_ph}</div>
                        <div class="text-muted x-small"><i class="bi bi-calendar2 me-1"></i> ${tgl}</div>
                    </td>
                    <td>
                        <span class="badge bg-light text-dark border">${tugas.jenis_tugas}</span>
                    </td>
                    <td class="text-end">
                        <a href="${tugas.link_file}" target="_blank" class="btn btn-sm btn-outline-dark rounded-pill px-3">Buka File</a>
                    </td>
                </tr>`;
            });
            tabelRiwayatBody.innerHTML = html;
        }
    } catch (err) {
        console.error(err);
        tabelRiwayatBody.innerHTML = `<tr><td colspan="3" class="text-center py-4 text-danger small">Gagal memuat riwayat.</td></tr>`;
    }
}

// Jalankan fetch riwayat saat halaman pertama kali dibuka
document.addEventListener('DOMContentLoaded', fetchRiwayatTugas);