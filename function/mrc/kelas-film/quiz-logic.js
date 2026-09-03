// Pakai client Supabase bersama dari supabase-config.js
const _quizDB = _supabase;

// Daftar 38 Anggota (Sudah disesuaikan dengan update PH terakhir)
const listNama = [
    // Lensara Pictures
    "Lita Marga Ningrum", "Muhammad Fair Firmansyah", "Ahmad Faizal Khafidhul Anant", "Diah Ayu Lestari",
    "Serli Erlinda", "Satria Bagus Putra Hermawan", "Uswatun Chasanah", "Rina Praptiwi", "Nanda Susanto",
    "Wahib Maulana A", "Olif Agustina", "Pipin Dwi Setiyarini", "Moch Radhit Fathur R.",
    // Sigma Production
    "Rantis Alfila", "Ana Sifa Rahma Wati", "Akyu Ninatus Sofia", "Ilham Dwi Prastyo", "Dwi Prasetyo",
    "Jibril Muhamad Rizki", "M. Nailus Sawab", "Felisya Niva Aulia", "Rudianto", "M. Imam Ali Murtado",
    "Hidayah Yeti Julianti", "Miftakhul Khasanah", "Setiana Agelika",
    // Visuallaksana
    "Dewi Asih", "Ahmad Lutfi Ihsanuddin", "Aditya Tri Anom Bawono Putra", "Moch Alfiyan Adi Pratama",
    "Himmatul 'Ulya", "Regita Cahyani", "Julia", "Hendrica Adi Wibowo", "Irfan Andika Pratama",
    "Eko Satrio", "Edy Sutanto", "Febri Satrio N"
];

// Bank Soal dari PDF (Bersih tanpa tulisan [cite])
const bankSoal = {
    1: [
        "Sebutkan 3 tahapan utama dalam produksi film, dan 2 contoh kegiatan wajib tahap Pra-produksi!",
        "Jelaskan perbedaan tugas utama antara Produser dan Sutradara!",
        "Apa yang dimaksud dengan Logline, dan mengapa penulis perlu membuatnya?",
        "Dalam Struktur 3 Babak, apa yang dihadapi tokoh utama pada Babak II (Konfrontasi)?",
        "Apa perbedaan mendasar antara Treatment dengan Skenario?"
    ],
    2: [
        "Apa yang dimaksud dengan Storyboard dan bagaimana perannya membantu kru saat syuting?",
        "Sebutkan minimal 3 dari 5 elemen penentu aksi untuk membangun karakter kuat!",
        "Apa dampak peristiwa pemicu (Inciting Incident) bagi tokoh utama?",
        "Sebutkan dua contoh cara mendistribusikan film agar dapat ditonton publik!",
        "Apa fungsi dari teks Parenthetical dalam penulisan skenario?"
    ],
    3: [
        "Sebutkan tiga unsur utama yang membangun sebuah karya film!",
        "Apa tujuan utama dilakukannya proses Casting pada tahap Pra-produksi?",
        "Apa yang dimaksud dengan Goals bagi seorang karakter di dalam film?",
        "Mengapa naskah film harus memakai format seragam dan tidak ditulis seperti cerpen?",
        "Apa maksud dari instruksi CUT TO di akhir sebuah adegan skenario?"
    ]
};

let setTerpilih = 0;

function acakArray(arr) { return arr.sort(() => Math.random() - 0.5); }

async function refreshStatus() {
    const { data, error } = await _quizDB.from('quiz_film_results').select('nama_peserta');

    if (error) {
        console.error("Gagal mengambil data monitoring:", error.message);
        return;
    }

    const sudah = data.map(d => d.nama_peserta);
    const belum = listNama.filter(n => !sudah.includes(n));

    const containerSudah = document.getElementById('list-sudah');
    containerSudah.innerHTML = sudah.length > 0
        ? sudah.sort().map(n => `
            <div class="small mb-1 d-flex align-items-center">
                <span class="badge-status bg-success"></span> ${n}
            </div>`).join('')
        : '<div class="text-muted small p-2">Belum ada peserta</div>';

    const containerBelum = document.getElementById('list-belum');
    containerBelum.innerHTML = belum.length > 0
        ? belum.sort().map(n => `
            <div class="small mb-1 d-flex align-items-center">
                <span class="badge-status bg-danger"></span> ${n}
            </div>`).join('')
        : '<div class="text-success small p-2 fw-bold">Semua sudah mengerjakan!</div>';
}

function mulaiQuiz(id) {
    setTerpilih = id;
    document.getElementById('view-pilih-set').classList.add('d-none');
    document.getElementById('view-form-quiz').classList.remove('d-none');
    document.getElementById('judul-set').innerText = `Paket Soal ${id === 1 ? 'A' : id === 2 ? 'B' : 'C'}`;

    const select = document.getElementById('nama-peserta');
    listNama.sort().forEach(n => select.innerHTML += `<option value="${n}">${n}</option>`);

    const container = document.getElementById('container-soal');
    acakArray([...bankSoal[id]]).forEach((s, i) => {
        container.innerHTML += `
            <div class="lab-card soal-card shadow-sm p-3 mb-3 rounded-3">
                <label class="fw-bold mb-2 small text-maroon">Pertanyaan ${i + 1}</label>
                <p class="mb-3 fw-bold">${s}</p>
                <textarea class="form-control rounded-3" rows="3" name="jawab_${i}" required placeholder="Tulis jawabanmu di sini..."></textarea>
                <input type="hidden" name="soal_${i}" value="${s}">
            </div>
        `;
    });
}

document.getElementById('quiz-form').onsubmit = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Mengirim...';

    const answers = {};
    new FormData(e.target).forEach((v, k) => answers[k] = v);

    const { error } = await _quizDB.from('quiz_film_results').insert([{
        nama_peserta: document.getElementById('nama-peserta').value,
        set_soal: setTerpilih,
        jawaban: JSON.stringify(answers),
        nilai: 0
    }]);

    if (!error) {
        alert("Jawaban berhasil dikirim! Terima kasih.");
        location.reload();
    } else {
        alert("Gagal mengirim: " + error.message);
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-send-check-fill me-2"></i> Kirim Jawaban Quiz';
    }
};

document.addEventListener('DOMContentLoaded', refreshStatus);