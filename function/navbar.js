document.addEventListener("DOMContentLoaded", function () {
    const navbarContainer = document.getElementById('tempat-navbar');
    if (navbarContainer) {
        navbarContainer.innerHTML = `
            <div class="fixed-top shadow-sm">
                
                <div class="bg-black text-white py-2 d-none d-md-block" style="font-family: 'Poppins', sans-serif;">
                    <div class="container d-flex justify-content-end align-items-center">
                        <span class="me-3 fw-bold" style="font-size: 0.85rem;">Follow:</span>
                        <a href="https://www.instagram.com/ukmmultimedia?igsh=aGlyYmV2YWZyZ2Nu" class="text-white me-3 fs-5"><i class="bi bi-instagram"></i></a>
                        <a href="https://www.tiktok.com/@ukmmultimediaikip?lang=en" class="text-white me-3 fs-5"><i class="bi bi-tiktok"></i></a>
                        <a href="https://youtube.com/@ukmmultimediaikip?si=YIybflLmZFrIlybN" class="text-white fs-5"><i class="bi bi-youtube"></i></a>
                    </div>
                </div>

                <nav class="navbar navbar-expand-lg navbar-light bg-white py-3" style="font-family: 'Poppins', sans-serif;">
                    <div class="container">
                        <a class="navbar-brand d-flex align-items-center" href="/index.html">
                            <img src="https://kbrvnbduwczjqdmofdky.supabase.co/storage/v1/object/public/Public/Logo/logomm.webp" alt="Logo UKM" width="50" class="me-2">
                            <div class="d-flex flex-column">
                                <span class="fw-bold fs-4 text-dark" style="letter-spacing: -0.5px; line-height: 1.2;">UKM MULTIMEDIA</span>
                                <span style="font-family: 'Cardo', serif; font-style: italic; font-size: 0.85rem; color: #000000; letter-spacing: 0.5px; margin-top: -2px;">
                                    Creative, Innovative, Collaborative
                                </span>
                            </div>
                        </a>

                        <button class="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                            <span class="navbar-toggler-icon"></span>
                        </button>

                        <div class="collapse navbar-collapse" id="navbarNav">
                            <ul class="navbar-nav ms-auto fw-bold align-items-center" style="font-size: 1rem;">
                                <li class="nav-item">
                                    <a class="nav-link px-3 py-2 hover-maroon-text" href="/index.html">Beranda</a>
                                </li>
                                <li class="nav-item dropdown">
                                    <a class="nav-link dropdown-toggle px-3 py-2 hover-maroon-text" href="#" data-bs-toggle="dropdown">Profil</a>
                                    <ul class="dropdown-menu border-0 shadow mt-2 py-2">
                                        <li><a class="dropdown-item fw-bold py-2" href="/pages/Profil/Sejarah/index.html">Sejarah</a></li>
                                        <li><a class="dropdown-item fw-bold py-2" href="/pages/Profil/Visi Misi/index.html">Visi & Misi</a></li>
                                    </ul>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link px-3 py-2 hover-maroon-text" href="/pages/Kegiatan/index.html">Kegiatan</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link px-3 py-2 hover-maroon-text" href="/pages/Galeri/index.html">Galeri</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link px-3 py-2 hover-maroon-text" href="/pages/Struktur Organisasi/index.html">Struktur</a>
                                </li>
                                
                                <li class="nav-item dropdown">
                                    <a class="nav-link dropdown-toggle px-3 py-2 hover-maroon-text" href="#" data-bs-toggle="dropdown">Hubungi Kami</a>
                                    <ul class="dropdown-menu border-0 shadow mt-2 py-2">
                                        <li><a class="dropdown-item fw-bold py-2" href="/pages/Hubungi Kami/Kontak Admin/index.html">Kontak Admin</a></li>
                                        <li><a class="dropdown-item fw-bold py-2" href="/pages/Hubungi Kami/Partnership/index.html">Partnership</a></li>
                                        <li><a class="dropdown-item fw-bold py-2" href="/pages/Hubungi Kami/kritik/index.html">Kotak Aspirasi</a></li>
                                    </ul>
                                </li>
                                <li class="nav-item ms-lg-3 mt-3 mt-lg-0" id="mrcMenuWrapper">
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
            </div>
        `;

        const isMember = sessionStorage.getItem('isMember');
        const targetID = sessionStorage.getItem('targetID');
        const isParticipant = sessionStorage.getItem('isParticipant');
        const mrcWrapper = document.getElementById('mrcMenuWrapper');

        if (isMember) {
            mrcWrapper.innerHTML = `
            <div class="d-flex gap-2 align-items-center">
                <a class="btn btn-maroon text-white rounded-pill px-4 py-2 small fw-bold" href="/pages/MRC/index.html" style="font-size: 0.9rem;">DASHBOARD</a>
                <button onclick="logout()" class="btn btn-outline-danger rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                    <i class="bi bi-power fs-5"></i>
                </button>
            </div>
            `;
        } else if (targetID || isParticipant) {
            mrcWrapper.innerHTML = `
            <button onclick="logout()" class="btn btn-outline-danger rounded-pill px-4 py-2 small fw-bold" style="font-size: 0.9rem;">
                <i class="bi bi-power me-2"></i> KELUAR
            </button>
            `;
        } else {
            mrcWrapper.innerHTML = `
            <a class="btn btn-maroon text-white rounded-pill px-4 py-2 small fw-bold" href="/pages/MRC/login/index.html" style="font-size: 0.9rem;">
                <i class="bi bi-shield-lock-fill me-2"></i> MRC ACCESS
            </a>
            `;
        }

        window.logout = function () {
            sessionStorage.clear();
            window.location.href = "/index.html";
        };
    }
});