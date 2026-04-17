document.addEventListener("DOMContentLoaded", function () {
    const navbarContainer = document.getElementById('tempat-navbar');

    if (navbarContainer) {
        navbarContainer.innerHTML = `
            <div class="bg-black text-white py-2 d-none d-md-block" style="font-family: 'Poppins', sans-serif;">
                <div class="container d-flex justify-content-end align-items-center">
                    <span class="me-3 fw-bold" style="font-size: 0.85rem;">Follow:</span>
                    <a href="#" class="text-white me-3 fs-5 hover-maroon-text-top"><i class="bi bi-instagram"></i></a>
                    <a href="#" class="text-white me-3 fs-5 hover-maroon-text-top"><i class="bi bi-tiktok"></i></a>
                    <a href="#" class="text-white fs-5 hover-maroon-text-top"><i class="bi bi-youtube"></i></a>
                </div>
            </div>

            <nav class="navbar navbar-expand-lg navbar-light bg-white sticky-top shadow-sm py-3" style="font-family: 'Poppins', sans-serif;">
                <div class="container">
                    <a class="navbar-brand d-flex align-items-center" href="/index.html">
                        <img src="/public/logomm.webp" alt="Logo UKM" width="50" class="me-2">
                        <div class="d-flex flex-column">
                            <span class="fw-bold fs-4 text-dark" style="letter-spacing: -0.5px; line-height: 1.2;">UKM MULTIMEDIA</span>
                            <span style="font-family: 'Cardo', serif; font-style: italic; font-size: 0.85rem; color: #800000; letter-spacing: 0.5px; margin-top: -2px;">
                                Creative, Innovative, Collaborative
                            </span>
                        </div>
                        
                    </a>

                    <button class="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span class="navbar-toggler-icon"></span>
                    </button>

                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav ms-auto align-items-center fw-bold" style="font-size: 1rem;">
                            <li class="nav-item"><a class="nav-link px-3 py-2 hover-maroon-text" href="/index.html">Beranda</a></li>
                            
                            <li class="nav-item dropdown">
                                <a class="nav-link dropdown-toggle px-3 py-2 hover-maroon-text" href="#" id="profilDropdown" role="button" data-bs-toggle="dropdown">
                                    Profil
                                </a>
                                <ul class="dropdown-menu border-0 shadow mt-2 py-2">
                                    <li><a class="dropdown-item fw-bold py-2 hover-maroon-text" href="/pages/Profil/Sejarah/index.html">Sejarah</a></li>
                                    <li><a class="dropdown-item fw-bold py-2 hover-maroon-text" href="/pages/Profil/Visi Misi/index.html">Visi & Misi</a></li>
                                </ul>
                            </li>
                            
                            <li class="nav-item"><a class="nav-link px-3 py-2 hover-maroon-text" href="/pages/Kegiatan/index.html">Kegiatan</a></li>
                            <li class="nav-item"><a class="nav-link px-3 py-2 hover-maroon-text" href="/pages/Galeri/index.html">Galeri</a></li>
                            <li class="nav-item"><a class="nav-link px-3 py-2 hover-maroon-text" href="/pages/Struktur Organisasi/index.html">Struktur Organisasi</a></li>
                            
                            <li class="nav-item dropdown">
                                <a class="nav-link dropdown-toggle px-3 py-2 hover-maroon-text" href="#" id="hubungiDropdown" role="button" data-bs-toggle="dropdown">
                                    Hubungi Kami
                                </a>
                                <ul class="dropdown-menu border-0 shadow mt-2 py-2">
                                    <li><a class="dropdown-item fw-bold py-2 hover-maroon-text" href="/pages/Hubungi Kami/Kontak Admin/index.html">Kontak Admin</a></li>
                                    <li><a class="dropdown-item fw-bold py-2 hover-maroon-text" href="/pages/Hubungi Kami/Partnership/index.html">Partnership</a></li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        `;
    }
});