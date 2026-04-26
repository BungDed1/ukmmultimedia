// ==========================================================
// SUPER LIVE SEARCH LIBRARY - UKM MULTIMEDIA
// ==========================================================

document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('searchInput');
    const libraryContainer = document.getElementById('libraryContainer'); // Container kartu folder
    const searchResults = document.getElementById('searchResults'); // Container tabel hasil
    const resultTableBody = document.getElementById('resultTableBody'); // Body tabel hasil
    const resultCount = document.getElementById('resultCount'); // Teks jumlah hasil

    // DATABASE MINI: Menggabungkan semua dokumen dari Modul, Naskah, dan E-Book
    const libraryData = [
        // --- MODUL PELATIHAN ---
        { title: "Dasar-Dasar Desain Grafis (BungDed Guide)", category: "Modul", format: "PDF", link: "/pages/MRC/library/modul.html" },
        { title: "Manajemen Produksi Film Pendek", category: "Modul", format: "PDF", link: "/pages/MRC/library/modul.html" },
        { title: "SOP Penggunaan Kamera & Lighting", category: "Modul", format: "PDF", link: "/pages/MRC/library/modul.html" },
        { title: "Modul Web Development Dasar (HTML/CSS)", category: "Modul", format: "PDF", link: "/pages/MRC/library/modul.html" },
        { title: "Panduan Editing Video dengan Premiere Pro", category: "Modul", format: "PDF", link: "/pages/MRC/library/modul.html" },
        { title: "Pengenalan UI/UX Design menggunakan Figma", category: "Modul", format: "PDF", link: "/pages/MRC/library/modul.html" },
        { title: "Modul Pelatihan Jurnalistik & Penulisan Berita", category: "Modul", format: "PDF", link: "/pages/MRC/library/modul.html" },
        { title: "Teknik Dasar Fotografi Outdoor & Studio", category: "Modul", format: "PDF", link: "/pages/MRC/library/modul.html" },
        { title: "Panduan Live Streaming & Broadcasting OBS", category: "Modul", format: "PDF", link: "/pages/MRC/library/modul.html" },
        { title: "Modul Master of Ceremony (MC) & Public Speaking", category: "Modul", format: "PDF", link: "/pages/MRC/library/modul.html" },
        { title: "Pengoperasian Drone untuk Sinematografi Dasar", category: "Modul", format: "PDF", link: "/pages/MRC/library/modul.html" },
        { title: "Modul Keorganisasian & Kepemimpinan UKM", category: "Modul", format: "PDF", link: "/pages/MRC/library/modul.html" },

        // --- NASKAH & SKENARIO ---
        { title: "Film Pendek \"Spektra\" (Draft Final)", category: "Naskah", format: "PDF", link: "/pages/MRC/library/naskah.html" },
        { title: "Iklan Layanan Masyarakat: Literasi Digital", category: "Naskah", format: "PDF", link: "/pages/MRC/library/naskah.html" },
        { title: "Video Profil Kampus IKIP PGRI Bojonegoro", category: "Naskah", format: "DOCX", link: "/pages/MRC/library/naskah.html" },
        { title: "Skenario Web Series \"Kampus Biru\" Eps. 1", category: "Naskah", format: "PDF", link: "/pages/MRC/library/naskah.html" },
        { title: "SOP Susunan Acara (Rundown) Pelatihan", category: "Naskah", format: "PDF", link: "/pages/MRC/library/naskah.html" },
        { title: "Film Pendek \"Jejak Asa\"", category: "Naskah", format: "PDF", link: "/pages/MRC/library/naskah.html" },
        { title: "Naskah Teatrikal Kemerdekaan", category: "Naskah", format: "DOCX", link: "/pages/MRC/library/naskah.html" },
        { title: "Skenario Podcast \"Bincang Kampus\" Eps 1-5", category: "Naskah", format: "PDF", link: "/pages/MRC/library/naskah.html" },
        { title: "Iklan Komersial \"Kopi Boeng Tani\"", category: "Naskah", format: "PDF", link: "/pages/MRC/library/naskah.html" },
        { title: "Voice Over Script Cinematic Bojonegoro", category: "Naskah", format: "DOCX", link: "/pages/MRC/library/naskah.html" },
        { title: "Film Pendek \"Rasa yang Tertinggal\"", category: "Naskah", format: "PDF", link: "/pages/MRC/library/naskah.html" },
        { title: "Konsep Acara Diklat Dasar UKM Multimedia", category: "Naskah", format: "PDF", link: "/pages/MRC/library/naskah.html" },
        { title: "Naskah Liputan Berita Kampus Edisi UTS", category: "Naskah", format: "DOCX", link: "/pages/MRC/library/naskah.html" },
        { title: "Skenario Animasi Pendek 2D", category: "Naskah", format: "PDF", link: "/pages/MRC/library/naskah.html" },
        { title: "Draft Naskah \"BungDed\" Biografi Singkat", category: "Naskah", format: "DOCX", link: "/pages/MRC/library/naskah.html" },

        // --- E-BOOK & LITERASI ---
        { title: "Seni Membangun Website (BungDed Edition)", category: "E-Book", format: "PDF", link: "/pages/MRC/library/ebook.html" },
        { title: "Tulis Dulu, Film Belakangan", category: "E-Book", format: "PDF", link: "/pages/MRC/library/ebook.html" },
        { title: "Silabus Film & Produksi Kreatif UKM MM", category: "E-Book", format: "PDF", link: "/pages/MRC/library/ebook.html" },
        { title: "Color Grading for Beginners (Terjemahan)", category: "E-Book", format: "PDF", link: "/pages/MRC/library/ebook.html" },
        { title: "Digital Marketing untuk Organisasi Mahasiswa", category: "E-Book", format: "PDF", link: "/pages/MRC/library/ebook.html" },
        { title: "Tipografi dalam Desain Komunikasi Visual", category: "E-Book", format: "PDF", link: "/pages/MRC/library/ebook.html" },
        { title: "Panduan Dasar Fotografi Jurnalistik", category: "E-Book", format: "PDF", link: "/pages/MRC/library/ebook.html" },
        { title: "Manajemen Waktu Mahasiswa Kreatif", category: "E-Book", format: "PDF", link: "/pages/MRC/library/ebook.html" }
    ];

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const keyword = this.value.toLowerCase().trim();

            if (keyword === "") {
                // Jika input kosong: Tampilkan 3 Kartu Folder, Sembunyikan Tabel Hasil
                libraryContainer.style.display = "flex";
                searchResults.style.display = "none";
            } else {
                // Jika ada input: Sembunyikan 3 Kartu Folder, Tampilkan Tabel Hasil
                libraryContainer.style.display = "none";
                searchResults.style.display = "block";

                // Filter data
                const filteredData = libraryData.filter(item =>
                    item.title.toLowerCase().includes(keyword) ||
                    item.category.toLowerCase().includes(keyword)
                );

                // Update jumlah hasil
                resultCount.textContent = `Ditemukan ${filteredData.length} dokumen terkait "${keyword}"`;

                // Render tabel HTML
                resultTableBody.innerHTML = "";

                if (filteredData.length > 0) {
                    filteredData.forEach(item => {
                        let badgeColor = item.category === "Modul" ? "danger" : (item.category === "Naskah" ? "success" : "warning");

                        const row = `
                            <tr>
                                <td>
                                    <div class="fw-bold">${item.title}</div>
                                </td>
                                <td class="text-center"><span class="badge bg-${badgeColor}-subtle text-${badgeColor === 'warning' ? 'dark' : badgeColor} rounded-pill">${item.category}</span></td>
                                <td class="text-center text-muted x-small">${item.format}</td>
                                <td class="text-end"><a href="${item.link}" class="btn btn-sm btn-outline-dark rounded-pill px-3">Buka</a></td>
                            </tr>
                        `;
                        resultTableBody.innerHTML += row;
                    });
                } else {
                    resultTableBody.innerHTML = `
                        <tr>
                            <td colspan="4" class="text-center text-muted py-4">
                                <i class="bi bi-search me-2"></i> Tidak ada dokumen yang cocok dengan kata kunci tersebut.
                            </td>
                        </tr>
                    `;
                }
            }
        });
    }
});