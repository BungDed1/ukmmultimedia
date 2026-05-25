console.log("Script Production.js berhasil dipanggil!");

const _sbUrl = "https://kbrvnbduwczjqdmofdky.supabase.co";
const _sbKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImticnZuYmR1d2N6anFkbW9mZGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMDczODYsImV4cCI6MjA5Mjc4MzM4Nn0.M1jW5lB3eSm7oOp37gKmEIO7XaUUAw-qwZ-aOVf09Vo";

async function loadProductionCounts() {
    try {
        const _prodDB = supabase.createClient(_sbUrl, _sbKey);

        // 1. Tarik Data Pra-Produksi
        try {
            const { count: countPra, error: errPra } = await _prodDB.from('prod_pra_produksi').select('*', { count: 'exact', head: true });
            if (errPra) throw errPra;
            document.getElementById('count-pra').innerText = `${countPra || 0} Dokumen Tersedia`;
        } catch (e) {
            document.getElementById('count-pra').innerHTML = `<span class="text-danger fw-bold">Error Pra-Produksi</span>`;
            console.error("Gagal Pra-Produksi:", e.message);
        }

        // 2. Tarik Data Administrasi
        try {
            const { count: countAdmin, error: errAdmin } = await _prodDB.from('prod_administrasi').select('*', { count: 'exact', head: true });
            if (errAdmin) throw errAdmin;
            document.getElementById('count-admin').innerText = `${countAdmin || 0} Dokumen Tersedia`;
        } catch (e) {
            document.getElementById('count-admin').innerHTML = `<span class="text-danger fw-bold">Error Administrasi</span>`;
            console.error("Gagal Administrasi:", e.message);
        }

        // 3. Tarik Data RAB
        try {
            const { count: countRab, error: errRab } = await _prodDB.from('prod_rab').select('*', { count: 'exact', head: true });
            if (errRab) throw errRab;
            document.getElementById('count-rab').innerText = `${countRab || 0} Dokumen Tersedia`;
        } catch (e) {
            document.getElementById('count-rab').innerHTML = `<span class="text-danger fw-bold">Error RAB</span>`;
            console.error("Gagal RAB:", e.message);
        }

    } catch (globalError) {
        console.error("CRITICAL ERROR:", globalError);
        document.getElementById('count-pra').innerText = "Gagal (Cek Console)";
        document.getElementById('count-admin').innerText = "Gagal (Cek Console)";
        document.getElementById('count-rab').innerText = "Gagal (Cek Console)";
    }
}

document.addEventListener('DOMContentLoaded', loadProductionCounts);