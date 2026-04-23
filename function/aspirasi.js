document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector('form');
    const btn = document.querySelector('.btn-maroon');
    const checkAnonim = document.getElementById('checkAnonim');
    const inputNama = document.getElementById('inputNama');

    // Handle Logic Anonim (Sama kayak sebelumnya)
    if (checkAnonim) {
        checkAnonim.addEventListener('change', function () {
            if (this.checked) {
                inputNama.value = "Anonim";
                inputNama.disabled = true;
            } else {
                inputNama.value = "";
                inputNama.disabled = false;
            }
        });
    }

    // INTERAKSI TOMBOL (LOGIKA SAMA DENGAN KONTAK ADMIN)
    form.addEventListener('submit', function (e) {
        e.preventDefault(); // Stop kirim instan biar animasi kelihatan

        // 1. Ubah Button jadi hitam & Loading
        btn.classList.add('is-sending');
        const teksAsli = btn.innerHTML;
        btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Sedang Mengirim...`;

        // 2. Kasih jeda (Delay) biar user ngerasa prosesnya "khas"
        setTimeout(() => {
            // Kirim data secara manual ke Formspree
            const formData = new FormData(form);
            fetch(form.action, {
                method: form.method,
                body: formData,
                headers: { 'Accept': 'application/json' }
            }).then(response => {
                if (response.ok) {
                    alert("Mantap! Aspirasi lo udah masuk ke email admin.");
                    form.reset();
                } else {
                    alert("Aduh gagal kirim, coba cek koneksi internet lo.");
                }
                // Balikin tombol ke asal
                btn.classList.remove('is-sending');
                btn.innerHTML = teksAsli;
            });
        }, 1000); // Jeda 1 detik biar animasinya kerasa mahal
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector('form');
    const btn = document.querySelector('.btn-maroon'); // Pastikan ini .btn-maroon

    if (form) {
        form.addEventListener('submit', function (e) {
            // 1. Tambah class buat berubah warna jadi hitam
            btn.classList.add('is-sending');
            btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Sedang Mengirim...`;

            // Proses selanjutnya (fetch Formspree) tetap sama...
        });
    }
});