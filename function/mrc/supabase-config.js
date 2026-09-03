// Satu-satunya sumber koneksi Supabase untuk seluruh area MRC.
// Semua file lain wajib pakai `_supabase` dari sini, bukan bikin client sendiri.
// Key di bawah ini adalah publishable/anon key — memang didesain untuk dipakai
// di sisi client (browser). Keamanan sesungguhnya ditegakkan oleh Row Level
// Security (RLS) di database, BUKAN dengan menyembunyikan key ini.
const _supabaseUrl = 'https://kbrvnbduwczjqdmofdky.supabase.co';
const _supabaseKey = 'sb_publishable_JvmhsogGJ1ZowTpbPfkSbg_6fZq6tBx';

const _supabase = supabase.createClient(_supabaseUrl, _supabaseKey);
