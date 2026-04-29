document.addEventListener("DOMContentLoaded", function () {
    const footerContainer = document.getElementById('tempat-footer');

    if (footerContainer) {
        footerContainer.innerHTML = `
            <footer class="bg-dark text-white pt-5 pb-0 mt-5 shadow-lg" style="background-color: #1a1a1a !important; font-family: 'Poppins', sans-serif;">
                <div class="container">
                    <div class="row g-4">
                        
                        <div class="col-lg-4 col-md-6">
                            <div class="d-flex align-items-center mb-3">
                                <img src="https://kbrvnbduwczjqdmofdky.supabase.co/storage/v1/object/public/Public/Logo/logomm.webp" alt="Logo UKM" width="50" class="me-3 bg-white rounded-circle p-1">
                                <div class="d-flex flex-column">
                                    <h5 class="fw-bold m-0" style="letter-spacing: 1px;">UKM MULTIMEDIA</h5>
                                    <span style="font-family: 'Cardo', serif; font-style: italic; font-size: 0.9rem; color: #cccccc; letter-spacing: 0.5px;">
                                        Creative, Innovative, Collaborative
                                    </span>
                                </div>
                            </div>
                            <p class="text-secondary small mb-4" style="line-height: 1.8;">
                                Wadah kreatif mahasiswa IKIP PGRI Bojonegoro untuk bereksplorasi dalam dunia Visual, Literasi, dan Digital Creative. Kami percaya setiap karya memiliki cerita dan setiap cerita layak untuk diabadikan.
                            </p>
                            <div class="d-flex gap-3">
                                <a href="mailto:ukmmultimediaikip@gmail.com" class="text-white fs-5 hover-maroon-text-top" title="Kirim Email"><i class="bi bi-envelope-fill"></i></a>
                                <a href="https://www.instagram.com/ukmmultimedia?igsh=aGlyYmV2YWZyZ2Nu" class="text-white fs-5 hover-maroon-text-top" title="Instagram"><i class="bi bi-instagram"></i></a>
                                <a href="https://www.tiktok.com/@ukmmultimediaikip?lang=en" class="text-white fs-5 hover-maroon-text-top" title="TikTok"><i class="bi bi-tiktok"></i></a>
                                <a href="https://youtube.com/@ukmmultimediaikip?si=YIybflLmZFrIlybN" class="text-white fs-5 hover-maroon-text-top" title="YouTube"><i class="bi bi-youtube"></i></a>
                            </div>
                        </div>

                        <div class="col-lg-2 col-md-6 ms-lg-auto">
                            <ul class="list-unstyled" style="margin-top: 3.5rem;">
                                <li class="mb-2"><a href="/index.html" class="text-secondary text-decoration-none small hover-white">Beranda</a></li>
                                <li class="mb-2"><a href="/pages/Profil/Sejarah/index.html" class="text-secondary text-decoration-none small hover-white">Profil UKM</a></li>
                                <li class="mb-2"><a href="/pages/Kegiatan/index.html" class="text-secondary text-decoration-none small hover-white">Kegiatan</a></li>
                                <li class="mb-2"><a href="/pages/Galeri/index.html" class="text-secondary text-decoration-none small hover-white">Galeri Karya</a></li>
                                <li class="mb-2"><a href="/pages/Struktur Organisasi/index.html" class="text-secondary text-decoration-none small hover-white">Struktur Pengurus</a></li>
                            </ul>
                        </div>

                        <div class="col-lg-3 col-md-6">
                            <h6 class="fw-bold mb-4 text-uppercase" style="color: #800000; letter-spacing: 1px;">Hubungi Kami</h6>
                            <div class="d-flex mb-3">
                                <i class="bi bi-geo-alt-fill me-3" style="color: #800000;"></i>
                                <p class="text-secondary small m-0">Jl. Panglima Polim No. 46, Bojonegoro, Jawa Timur</p>
                            </div>
                            <div class="d-flex mb-3">
                                <i class="bi bi-envelope-fill me-3" style="color: #800000;"></i>
                                <p class="text-secondary small m-0">ukmmultimediaikip@gmail.com</p>
                            </div>
                            <div class="d-flex mb-3">
                                <i class="bi bi-whatsapp me-3" style="color: #800000;"></i>
                                <p class="text-secondary small m-0">+62 815-1570-9786</p>
                            </div>
                        </div>

                    </div>
                </div>

                <div class="mt-5 py-3" style="background-color: #800000;">
                    <div class="container">
                        <div class="row align-items-center">
                            <div class="col-md-6 text-center text-md-start mb-2 mb-md-0">
                                <p class="m-0 text-white" style="font-size: 0.8rem; font-weight: 500; opacity: 0.9;">
                                    &copy; 2026 UKM MULTIMEDIA IKIP PGRI BOJONEGORO. All Rights Reserved.
                                </p>
                            </div>
                            <div class="col-md-6 text-center text-md-end">
                                <p class="m-0 text-white" style="font-size: 0.7rem; font-weight: 300; opacity: 0.7; letter-spacing: 0.5px;">
                                    Dibuat oleh <span class="fw-bold" style="opacity: 0.9;">BungDed Group</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </footer>
        `;
    }
});