document.addEventListener("DOMContentLoaded", function () {
    const navbarContainer = document.getElementById('tempat-navbar');
    if (!navbarContainer) return;

    // Logika Pintar untuk Cek Halaman Aktif
    const currentPath = window.location.pathname;

    // Perbaikan deteksi URL agar tidak bocor ke menu lain
    const isHome = (currentPath === '/' || currentPath.endsWith('/index.html') && !currentPath.includes('/pages/')) ? 'active' : '';
    const isProfil = currentPath.includes('/Profil/') ? 'active' : '';
    const isKegiatan = currentPath.includes('/Kegiatan/') ? 'active' : '';
    const isGaleri = currentPath.includes('/Galeri/') ? 'active' : '';
    const isStruktur = currentPath.includes('/Struktur') ? 'active' : '';
    const isHubungi = currentPath.includes('/Hubungi Kami/') ? 'active' : '';

    navbarContainer.innerHTML = `
        <div class="fixed-top shadow-sm">
            <div class="bg-black text-white py-1 d-none d-md-block" style="font-family: 'Poppins', sans-serif;">
                <div class="container d-flex justify-content-end align-items-center">
                    <span class="me-3 fw-bold" style="font-size: 0.75rem;">Follow:</span>
                    <a href="https://www.instagram.com/ukmmultimedia" class="text-white me-3 fs-6"><i class="bi bi-instagram"></i></a>
                    <a href="https://www.tiktok.com/@ukmmultimediaikip" class="text-white me-3 fs-6"><i class="bi bi-tiktok"></i></a>
                    <a href="https://youtube.com/@ukmmultimediaikip" class="text-white fs-6"><i class="bi bi-youtube"></i></a>
                </div>
            </div>

            <nav class="navbar navbar-expand-lg navbar-light bg-white" style="font-family: 'Poppins', sans-serif; padding: 10px 0;">
                <div class="container">
                    <a class="navbar-brand d-flex align-items-center" href="/index.html">
                        <img src="https://kbrvnbduwczjqdmofdky.supabase.co/storage/v1/object/public/Public/Logo/logomm.webp" alt="Logo" width="45" class="me-2">
                        <div class="d-flex flex-column">
                            <span class="fw-bold fs-5 text-dark" style="letter-spacing: -0.5px; line-height: 1.1;">UKM MULTIMEDIA</span>
                            <span style="font-family: 'Cardo', serif; font-style: italic; font-size: 0.75rem; color: #000; letter-spacing: 0.5px;">Creative, Innovative, Collaborative</span>
                        </div>
                    </a>

                    <button class="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <i class="bi bi-list fs-1 text-dark"></i>
                    </button>

                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav ms-auto fw-bold align-items-center" style="font-size: 0.9rem;">
                            <li class="nav-item">
                                <a class="nav-link px-3 ${isHome}" href="/index.html">Beranda</a>
                            </li>
                            <li class="nav-item dropdown">
                                <a class="nav-link dropdown-toggle px-3 ${isProfil}" href="#" role="button" data-bs-toggle="dropdown">Profil</a>
                                <ul class="dropdown-menu border-0 shadow-sm mt-lg-2 py-2">
                                    <li><a class="dropdown-item fw-bold py-2" href="/pages/Profil/Sejarah/index.html">Sejarah</a></li>
                                    <li><a class="dropdown-item fw-bold py-2" href="/pages/Profil/Visi Misi/index.html">Visi & Misi</a></li>
                                </ul>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link px-3 ${isKegiatan}" href="/pages/Kegiatan/index.html">Kegiatan</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link px-3 ${isGaleri}" href="/pages/Galeri/index.html">Galeri</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link px-3 ${isStruktur}" href="/pages/Struktur Organisasi/index.html">Struktur</a>
                            </li>
                            <li class="nav-item dropdown">
                                <a class="nav-link dropdown-toggle px-3 ${isHubungi}" href="#" role="button" data-bs-toggle="dropdown">Hubungi Kami</a>
                                <ul class="dropdown-menu border-0 shadow-sm mt-lg-2 py-2">
                                    <li><a class="dropdown-item fw-bold py-2" href="/pages/Hubungi Kami/Kontak Admin/index.html">Kontak Admin</a></li>
                                    <li><a class="dropdown-item fw-bold py-2" href="/pages/Hubungi Kami/Partnership/index.html">Partnership</a></li>
                                    <li><a class="dropdown-item fw-bold py-2" href="/pages/Hubungi Kami/kritik/index.html">Kotak Aspirasi</a></li>
                                </ul>
                            </li>
                            <li class="nav-item ms-lg-3 mt-3 mt-lg-0" id="mrcMenuWrapper"></li>
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    `;

    renderMrcButton();
});

function renderMrcButton() {
    const isMember = sessionStorage.getItem('isMember');
    const targetID = sessionStorage.getItem('targetID');
    const isParticipant = sessionStorage.getItem('isParticipant');
    const mrcWrapper = document.getElementById('mrcMenuWrapper');

    if (isMember) {
        mrcWrapper.innerHTML = `
        <div class="d-flex gap-2 align-items-center">
            <a class="btn btn-maroon text-white rounded-pill px-4 py-2 small fw-bold" href="/pages/MRC/index.html">DASHBOARD</a>
            <button onclick="logout()" class="btn btn-outline-danger rounded-circle d-flex align-items-center justify-content-center" style="width: 35px; height: 35px;">
                <i class="bi bi-power fs-5"></i>
            </button>
        </div>`;
    } else if (targetID || isParticipant) {
        mrcWrapper.innerHTML = `
        <button onclick="logout()" class="btn btn-outline-danger rounded-pill px-4 py-2 small fw-bold">
            <i class="bi bi-power me-2"></i> KELUAR
        </button>`;
    } else {
        mrcWrapper.innerHTML = `
        <a class="btn btn-maroon text-white rounded-pill px-4 py-2 small fw-bold" href="/pages/MRC/login/index.html">
            <i class="bi bi-shield-lock-fill me-2"></i> MRC ACCESS
        </a>`;
    }
}

window.logout = function () {
    sessionStorage.clear();
    window.location.href = "/index.html";
};