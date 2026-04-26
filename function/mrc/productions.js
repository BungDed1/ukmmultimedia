// ==========================================================
// SUPER LIVE SEARCH PRODUCTION SUITE - UKM MULTIMEDIA
// ==========================================================

document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('searchInput');
    const productionContainer = document.getElementById('productionContainer'); // Container kartu folder
    const searchResults = document.getElementById('searchResults'); // Container tabel hasil
    const resultTableBody = document.getElementById('resultTableBody'); // Body tabel hasil
    const resultCount = document.getElementById('resultCount'); // Teks jumlah hasil

    // DATABASE MINI: Menggabungkan 28 dokumen Production Suite
    const productionData = [
        // --- PRA-PRODUKSI (10 Dokumen) ---
        { title: "Master Template Script Breakdown", folder: "Pra-Produksi", format: "XLSX", link: "/pages/MRC/production/pra-produksi.html" },
        { title: "Template Shot List & Storyboard", folder: "Pra-Produksi", format: "PDF", link: "/pages/MRC/production/pra-produksi.html" },
        { title: "Form Hunting Lokasi & Perizinan", folder: "Pra-Produksi", format: "DOCX", link: "/pages/MRC/production/pra-produksi.html" },
        { title: "Casting Sheet & Database Talent", folder: "Pra-Produksi", format: "XLSX", link: "/pages/MRC/production/pra-produksi.html" },
        { title: "Template Call Sheet Produksi Harian", folder: "Pra-Produksi", format: "PDF", link: "/pages/MRC/production/pra-produksi.html" },
        { title: "Moodboard & Art Direction Guideline", folder: "Pra-Produksi", format: "PPTX", link: "/pages/MRC/production/pra-produksi.html" },
        { title: "Wardrobe & Makeup Breakdown", folder: "Pra-Produksi", format: "XLSX", link: "/pages/MRC/production/pra-produksi.html" },
        { title: "Equipment & Gear Checklist Form", folder: "Pra-Produksi", format: "PDF", link: "/pages/MRC/production/pra-produksi.html" },
        { title: "Director's Treatment Template", folder: "Pra-Produksi", format: "DOCX", link: "/pages/MRC/production/pra-produksi.html" },
        { title: "Floor Plan & Camera Setup Blocking", folder: "Pra-Produksi", format: "PDF", link: "/pages/MRC/production/pra-produksi.html" },

        // --- ADMINISTRASI & LEGAL (10 Dokumen) ---
        { title: "Surat Izin Lokasi Syuting (Internal Kampus)", folder: "Administrasi", format: "DOCX", link: "/pages/MRC/production/administrasi.html" },
        { title: "Kontrak Perjanjian Kru (SOP UKM)", folder: "Administrasi", format: "PDF", link: "/pages/MRC/production/administrasi.html" },
        { title: "Form Talent Release & Hak Cipta", folder: "Administrasi", format: "PDF", link: "/pages/MRC/production/administrasi.html" },
        { title: "Surat Peminjaman Alat Multimedia", folder: "Administrasi", format: "DOCX", link: "/pages/MRC/production/administrasi.html" },
        { title: "Form Absensi Kru & Talent Harian", folder: "Administrasi", format: "XLSX", link: "/pages/MRC/production/administrasi.html" },
        { title: "Surat Permohonan Sponsorship & Dana", folder: "Administrasi", format: "DOCX", link: "/pages/MRC/production/administrasi.html" },
        { title: "MoU Kerjasama Pihak Ketiga (Vendor)", folder: "Administrasi", format: "PDF", link: "/pages/MRC/production/administrasi.html" },
        { title: "Berita Acara Kerusakan/Kehilangan Alat", folder: "Administrasi", format: "DOCX", link: "/pages/MRC/production/administrasi.html" },
        { title: "Form Evaluasi Pasca Produksi (Wrap Report)", folder: "Administrasi", format: "PDF", link: "/pages/MRC/production/administrasi.html" },
        { title: "Surat Keterangan Selesai Produksi (SKSP)", folder: "Administrasi", format: "DOCX", link: "/pages/MRC/production/administrasi.html" },

        // --- MANAJEMEN RAB (8 Dokumen) ---
        { title: "Master Template RAB Produksi Film", folder: "RAB", format: "XLSX", link: "/pages/MRC/production/rab.html" },
        { title: "Laporan Pertanggungjawaban (LPJ) Keuangan", folder: "RAB", format: "DOCX", link: "/pages/MRC/production/rab.html" },
        { title: "Form Kas Bon & Petty Cash Produksi", folder: "RAB", format: "XLSX", link: "/pages/MRC/production/rab.html" },
        { title: "Rekapitulasi Nota & Kwitansi Pengeluaran", folder: "RAB", format: "PDF", link: "/pages/MRC/production/rab.html" },
        { title: "Template Anggaran Konsumsi Syuting (Meals)", folder: "RAB", format: "XLSX", link: "/pages/MRC/production/rab.html" },
        { title: "Proposal Pengajuan Dana Kampus (Standard)", folder: "RAB", format: "DOCX", link: "/pages/MRC/production/rab.html" },
        { title: "Laporan Keuangan Transparansi Sponsorship", folder: "RAB", format: "XLSX", link: "/pages/MRC/production/rab.html" },
        { title: "Log Book Pengeluaran Harian Produksi", folder: "RAB", format: "PDF", link: "/pages/MRC/production/rab.html" }
    ];

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const keyword = this.value.toLowerCase().trim();

            if (keyword === "") {
                // Jika input kosong: Tampilkan 3 Kartu Folder, Sembunyikan Tabel Hasil
                productionContainer.style.display = "flex";
                searchResults.style.display = "none";
            } else {
                // Jika ada input: Sembunyikan 3 Kartu Folder, Tampilkan Tabel Hasil
                productionContainer.style.display = "none";
                searchResults.style.display = "block";

                // Filter data
                const filteredData = productionData.filter(item =>
                    item.title.toLowerCase().includes(keyword) ||
                    item.folder.toLowerCase().includes(keyword)
                );

                // Update jumlah hasil
                resultCount.textContent = `Ditemukan ${filteredData.length} dokumen terkait "${keyword}"`;

                // Render tabel HTML
                resultTableBody.innerHTML = "";

                if (filteredData.length > 0) {
                    filteredData.forEach(item => {
                        let badgeColor = item.folder === "Pra-Produksi" ? "danger" : (item.folder === "Administrasi" ? "success" : "warning");

                        const row = `
                            <tr>
                                <td>
                                    <div class="fw-bold">${item.title}</div>
                                </td>
                                <td class="text-center"><span class="badge bg-${badgeColor}-subtle text-${badgeColor === 'warning' ? 'dark' : badgeColor} rounded-pill">${item.folder}</span></td>
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