(function () {
    const isMember = sessionStorage.getItem('isMember');

    if (!isMember) {
        // Jika bukan anggota, langsung lempar ke login TANPA AMPUN
        window.location.replace("/pages/MRC/login/index.html");
    } else {
        // Jika anggota, baru izinkan halaman terlihat (kita hapus class 'd-none' nanti)
        document.documentElement.style.display = 'block';
    }
})();