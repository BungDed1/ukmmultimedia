const _sbUrl = "https://kbrvnbduwczjqdmofdky.supabase.co";
const _sbKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImticnZuYmR1d2N6anFkbW9mZGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMDczODYsImV4cCI6MjA5Mjc4MzM4Nn0.M1jW5lB3eSm7oOp37gKmEIO7XaUUAw-qwZ-aOVf09Vo";
const _libDB = supabase.createClient(_sbUrl, _sbKey);

async function loadLibraryCounts() {
    // 1. Cek Tabel Modul Pelatihan
    const { count: countModul, error: errModul } = await _libDB
        .from('modul_pelatihan')
        .select('*', { count: 'exact', head: true });

    if (errModul) {
        document.getElementById('count-modul').innerHTML = `<span class="text-danger fw-bold"><i class="bi bi-exclamation-triangle"></i> Tabel Belum Ada/Error</span>`;
        console.error("Error Modul:", errModul.message);
    } else {
        document.getElementById('count-modul').innerText = `${countModul || 0} Dokumen Tersedia`;
    }

    // 2. Cek Tabel Naskah & Skenario
    const { count: countNaskah, error: errNaskah } = await _libDB
        .from('naskah_skenario')
        .select('*', { count: 'exact', head: true });

    if (errNaskah) {
        document.getElementById('count-naskah').innerHTML = `<span class="text-danger fw-bold"><i class="bi bi-exclamation-triangle"></i> Tabel Belum Ada/Error</span>`;
        console.error("Error Naskah:", errNaskah.message);
    } else {
        document.getElementById('count-naskah').innerText = `${countNaskah || 0} Dokumen Tersedia`;
    }

    // 3. Cek Tabel E-Book (digital_library)
    const { count: countEbook, error: errEbook } = await _libDB
        .from('digital_library')
        .select('*', { count: 'exact', head: true });

    if (errEbook) {
        document.getElementById('count-ebook').innerHTML = `<span class="text-danger fw-bold"><i class="bi bi-exclamation-triangle"></i> Tabel Belum Ada/Error</span>`;
        console.error("Error Ebook:", errEbook.message);
    } else {
        document.getElementById('count-ebook').innerText = `${countEbook || 0} Dokumen Tersedia`;
    }
}

document.addEventListener('DOMContentLoaded', loadLibraryCounts);