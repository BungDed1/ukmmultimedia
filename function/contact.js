function sendToWhatsApp() {
    // Ambil data dari form
    const nama = document.getElementById("inputNama").value;
    const kategori = document.getElementById("inputKategori").value;
    const pesan = document.getElementById("inputPesan").value;

    // Validasi sederhana jika form kosong
    if (nama === "" || kategori === "" || pesan === "") {
        alert("Mohon lengkapi semua kolom form sebelum mengirim pesan!");
        return;
    }

    // GANTI NOMOR INI DENGAN NOMOR ADMIN ASLI (Gunakan kode negara 62 tanpa spasi/plus)
    const nomorAdmin = "62895340010308";

    // Format pesan
    const formatPesan = `Halo Humas Kerjasama UKM Multimedia,%0A%0APerkenalkan, nama saya *${nama}*.%0ASaya ingin bertanya terkait: *${kategori}*.%0A%0A"${pesan}"%0A%0AMohon arahannya, terima kasih.`;

    // Buat link WA
    const urlWA = `https://wa.me/${nomorAdmin}?text=${formatPesan}`;

    // Buka tab baru ke WhatsApp
    window.open(urlWA, '_blank');
}