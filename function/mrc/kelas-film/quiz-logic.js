const _sbUrl = "https://kbrvnbduwczjqdmofdky.supabase.co";
const _sbKey = "PASTE_SUPABASE_ANON_KEY_LU_DISINI";
const _quizDB = supabase.createClient(_sbUrl, _sbKey);

// Daftar 42 Anggota
const listNama = [
    "Dedy Indra Setiawan", "Rantis Alfila", "Sigit Gilang P. R.", "Dewiasih", "Diahayu Lestari", "Eko Satrio",
    "Aditya Tri Anom B. P.", "M. Nailus Sawab", "Edy Sutanto", "Febrian Satrio N.", "Wahib Maulana A.",
    "Lita Marga Ningrum", "MOCH TEGAR EFFENDI", "Ahmad Faizal K. A.", "Hidayah Yeti Julianti",
    "Ahmad Lutfi Ihsanuddin", "Pipin Dwi Setiyarini", "Miftakhul Khasanah", "Moch Alfiyan Adi P.",
    "M. Aldi Adi Tama", "Setiana Agelika", "Muhammad Fair F.", "Nanda Susanto", "Hendrica Adi Wibowo",
    "Uswatun Chasanah", "Regita Cahyani", "Olif Agustina", "Julia", "Himmatul 'Ulya", "Dwi Prasetyo",
    "Jibril Muhamad Rizki", "Satria Bagus Putra H.", "M. Imam Ali Murtado", "Irfan Andika Pratama",
    "Felisya Nova Aulia", "Ilham Dwi Prastyo", "Rudianto", "Moch Radhit Fathur R.", "Ana Sifa Rahma Wati",
    "Serli Erlinda", "Rina Praptiwi", "Alyu Ninatus Sofia"
];

// Bank Soal dari PDF (Total 15 Soal) 
const bankSoal = {
    1: [
        "Sebutkan 3 tahapan utama dalam produksi film, dan 2 contoh kegiatan wajib tahap Pra-produksi! [cite: 5]",
        "Jelaskan perbedaan tugas utama antara Produser dan Sutradara! [cite: 6]",
        "Apa yang dimaksud dengan Logline, dan mengapa penulis perlu membuatnya? [cite: 7]",
        "Dalam 'Struktur 3 Babak', apa yang dihadapi tokoh utama pada Babak II (Konfrontasi)? [cite: 8]",
        "Apa perbedaan mendasar antara Treatment dengan Skenario? [cite: 9]"
    ],
    2: [
        "Apa yang dimaksud dengan Storyboard dan bagaimana perannya membantu kru saat syuting? [cite: 12]",
        "Sebutkan minimal 3 dari 5 elemen penentu aksi untuk membangun karakter kuat! [cite: 13]",
        "Apa dampak peristiwa pemicu (Inciting Incident) bagi tokoh utama? [cite: 15]",
        "Sebutkan dua contoh cara mendistribusikan film agar dapat ditonton publik! [cite: 17]",
        "Apa fungsi dari teks Parenthetical dalam penulisan skenario? [cite: 19]"
    ],
    3: [
        "Sebutkan tiga unsur utama yang membangun sebuah karya film! [cite: 22]",
        "Apa tujuan utama dilakukannya proses Casting pada tahap Pra-produksi? [cite: 23]",
        "Apa yang dimaksud dengan Goals bagi seorang karakter di dalam film? [cite: 25]",
        "Mengapa naskah film harus memakai format seragam dan tidak ditulis seperti cerpen? [cite: 26]",
        "Apa maksud dari instruksi 'CUT TO:' di akhir sebuah adegan skenario? [cite: 28]"
    ]
};

let setTerpilih = 0;

function acakArray(arr) { return arr.sort(() => Math.random() - 0.5); }

async function refreshStatus() {
    const { data } = await _quizDB.from('quiz_film_results').select('nama_peserta');
    const sudah = data.map(d => d.nama_peserta);
    const belum = listNama.filter(n => !sudah.includes(n));

    document.getElementById('list-sudah').innerHTML = sudah.sort().map(n => `<div class="small mb-1"><span class="badge-status bg-success"></span> ${n}</div>`).join('') || "Belum ada data";
    document.getElementById('list-belum').innerHTML = belum.sort().map(n => `<div class="small mb-1"><span class="badge-status bg-danger"></span> ${n}</div>`).join('');
}

function mulaiQuiz(id) {
    setTerpilih = id;
    document.getElementById('view-pilih-set').classList.add('d-none');
    document.getElementById('view-form-quiz').classList.remove('d-none');
    document.getElementById('judul-set').innerText = `Paket Soal ${id === 1 ? 'A' : id === 2 ? 'B' : 'C'}`;

    // Isi Dropdown Nama
    const select = document.getElementById('nama-peserta');
    listNama.sort().forEach(n => select.innerHTML += `<option value="${n}">${n}</option>`);

    // Render Soal Acak
    const container = document.getElementById('container-soal');
    acakArray([...bankSoal[id]]).forEach((s, i) => {
        container.innerHTML += `
            <div class="lab-card soal-card shadow-sm p-3 mb-3 rounded-3">
                <label class="fw-bold mb-2 small text-maroon">Pertanyaan ${i + 1}</label>
                <p class="mb-3 fw-bold">${s}</p>
                <textarea class="form-control rounded-3" rows="3" name="jawab_${i}" required placeholder="Tulis jawabanmu di sini..."></textarea>
            </div>
        `;
    });
}

document.getElementById('quiz-form').onsubmit = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Mengirim...';

    const answers = {};
    new FormData(e.target).forEach((v, k) => answers[k] = v);

    const { error } = await _sbQuiz.from('quiz_film_results').insert([{
        nama_peserta: document.getElementById('nama-peserta').value,
        set_soal: setTerpilih,
        jawaban: JSON.stringify(answers),
        nilai: 0
    }]);

    if (!error) {
        alert("Jawaban berhasil dikirim!");
        location.reload();
    } else {
        alert("Gagal mengirim: " + error.message);
        btn.disabled = false;
    }
};

document.addEventListener('DOMContentLoaded', refreshStatus);