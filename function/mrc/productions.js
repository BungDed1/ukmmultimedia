console.log("Script Production.js berhasil dipanggil!");

async function loadProductionCounts() {
    try {
        // Pakai client Supabase bersama dari supabase-config.js
        const _prodDB = _supabase;

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