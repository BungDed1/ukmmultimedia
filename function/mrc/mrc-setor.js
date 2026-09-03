// Pakai client Supabase bersama dari supabase-config.js
const mrc_sb = _supabase;

const mrc_params = new URLSearchParams(window.location.search);
const mrc_divisi = mrc_params.get('divisi') || 'Umum';

async function mrc_init_workflow() {
    document.getElementById('mrc_label_divisi').innerText = mrc_divisi.toUpperCase();
    const targetBox = document.getElementById('mrc_target_list');
    const uploadSec = document.getElementById('section_upload');
    const labelCatatan = document.getElementById('label_catatan');
    let html = "";

    if (mrc_divisi === 'Fotografi') {
        html = `
            <p class="mb-2"><b>Ahmad Faizal K.A (Kasubdep):</b> Koordinasi area & min. 2 Foto Raw</p>
            <p class="mb-2"><b>Irfan, Imam, Satria, Alfiyan:</b> Hunting Gedung & Fasilitas (min. 3 Foto Raw)</p>
            <p class="mb-2"><b>Oliv, Regita, Julia, Wahib:</b> Hunting Human Interest (min. 3 Foto Raw)</p>
            <p class="mb-0"><b>Nailus, Ulya, Hidayah, Radhit:</b> Hunting Detail/Objek (min. 3 Foto Raw)</p>`;
    }
    else if (mrc_divisi === 'Videografi') {
        html = `
            <p class="mb-2"><b>Anasifa Rahma Wati (Kasubdep):</b> Jadwal rekam & min. 1 Klip (15 dtk)</p>
            <p class="mb-0"><b>Akyu, Serli, Rudianto, Uswatun:</b> Hunting B-roll & min. 2 Klip (15-30 dtk)</p>`;
    }
    else if (mrc_divisi === 'Editing') {
        html = `
            <p class="mb-2"><b>Dwi Prasetyo (Kasubdep):</b> Quality Control & 1 Karya Final</p>
            <p class="mb-0"><b>Jibril, Aditya, Fair:</b> Submit min. 1 Karya Final (Poster/Video)</p>`;
    }
    else if (mrc_divisi === 'Publikasi') {
        html = `
            <p class="mb-2"><b>Ilham Dwi Prastyo (Kasubdep):</b> Master Storage & Database Link</p>
            <p class="mb-0"><b>Uswatun Chasanah:</b> Menulis 4 Caption siap post</p>`;
        labelCatatan.innerText = "Tulis Caption Disini";
        uploadSec.classList.add('d-none');
        document.getElementById('section_auto_karya').classList.remove('d-none');
        mrc_get_latest_editing_work();
    }
    else if (mrc_divisi === 'Kerjasama') {
        html = `
            <p class="mb-2"><b>Edy Sutanto (Kasubdep):</b> Min. 3 Kontak Media Partner</p>
            <p class="mb-0"><b>Tegar Adi Saputra:</b> Min. 3 Kontak Vendor/Sponsor/Komunitas</p>`;
    }
    else if (mrc_divisi === 'Kewirausahaan') {
        html = `
            <p class="mb-2"><b>Ahmad Lutfi (Kasubdep):</b> Draf Price List Jasa</p>
            <p class="mb-2"><b>Miftakhul:</b> Riset 2 Percetakan (Brosur/Harga)</p>
            <p class="mb-0"><b>Setiana:</b> Riset 2 Vendor Merch (Brosur/Harga)</p>`;
    }
    else if (mrc_divisi === 'SDM') {
        html = `
            <p class="mb-2"><b>Lita Marga Ningrum (Kasubdep):</b> Rapor & Progres Anggota</p>
            <p class="mb-2"><b>Pipin Dwi Setiyarini:</b> Tagih Tugas Fotografi & Videografi</p>
            <p class="mb-0"><b>Rina Praptiwi:</b> Tagih Tugas Editing, Publikasi, Kerjasama, & Wira</p>`;
    }

    targetBox.innerHTML = html || "Selesaikan target harian sesuai arahan.";
}

// FUNGSI AMBIL KARYA TERBARU (INTEGRASI EDITING -> PUBLIKASI)
async function mrc_get_latest_editing_work() {
    const display = document.getElementById('mrc_preview_display');
    const info = document.getElementById('mrc_info_karya');
    const hiddenUrl = document.getElementById('mrc_hidden_url');

    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - 7);

    const { data, error } = await mrc_sb.from('tugas_harian')
        .select('*')
        .eq('divisi', 'Editing')
        .gte('created_at', dateLimit.toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

    if (error || !data || data.length === 0) {
        display.innerHTML = `<span class="text-danger small">Belum ada karya baru minggu ini.</span>`;
        return;
    }

    const karya = data[0];
    const firstFile = karya.file_url.split(',')[0];

    if (firstFile.match(/\.(jpeg|jpg|png|gif|webp)$/i)) {
        display.innerHTML = `<img src="${firstFile}" class="img-fluid rounded-3 shadow-sm" style="max-height: 180px;">`;
    } else {
        display.innerHTML = `<div class="p-3 bg-dark text-white rounded-3 small"><i class="bi bi-play-btn me-2"></i>File Video</div>`;
    }

    info.innerHTML = `Oleh: ${karya.nama} (${new Date(karya.created_at).toLocaleDateString()})`;
    hiddenUrl.value = karya.file_url;
}
// ... (Bagian atas mrc-setor.js tetap sama)

window.mrc_proses_submit = async function () {
    const nama = document.getElementById('mrc_form_nama').value.trim();
    const wa = document.getElementById('mrc_form_wa').value.trim();
    const catatan = document.getElementById('mrc_form_catatan').value.trim();
    const status = document.getElementById('mrc_status');
    const btn = document.getElementById('mrc_btn_setor');

    if (!nama || !wa) return alert("Masukkan nama dan nomor WhatsApp kamu!");

    // --- VALIDASI MAKSIMAL 3 FILE ---
    if (mrc_divisi !== 'Publikasi') {
        const files = document.getElementById('mrc_form_files').files;
        if (files.length > 3) {
            alert("Eits, maksimal 3 file aja ya Tum untuk sekali setor!");
            return; // Berhenti di sini
        }
    }

    btn.disabled = true;
    status.innerHTML = "⏳ Sedang mengirim...";

    try {
        let urls = [];
        if (mrc_divisi !== 'Publikasi') {
            const files = document.getElementById('mrc_form_files').files;
            for (let i = 0; i < files.length; i++) {
                const path = `Tugas/${mrc_divisi}/${Date.now()}_${files[i].name}`;
                await mrc_sb.storage.from('mrc-storage').upload(path, files[i]);
                const { data } = mrc_sb.storage.from('mrc-storage').getPublicUrl(path);
                urls.push(data.publicUrl);
            }
        } else {
            urls.push(document.getElementById('mrc_hidden_url').value);
        }

        const { error } = await mrc_sb.from('tugas_harian').insert([{
            nama, divisi: mrc_divisi, no_wa: wa, catatan,
            file_url: urls.join(','), status: 'Menunggu'
        }]);

        if (error) throw error;
        status.innerHTML = "<span class='text-success fw-bold'>✅ Progres Terkirim!</span>";
        setTimeout(() => { window.location.href = '/pages/MRC/index.html'; }, 2000);

    } catch (err) {
        status.innerHTML = "❌ Gagal: " + err.message;
        btn.disabled = false;
    }
};

mrc_init_workflow();