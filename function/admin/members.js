// --- File: /function/admin/members.js ---
// Kelola member: lihat daftar, tambah (lewat Edge Function), ubah role/status,
// reset password. Semua operasi tunduk pada RLS di database.

document.addEventListener('DOMContentLoaded', function () {
    const waitForShell = setInterval(() => {
        const target = document.getElementById('adminPageContent');
        if (!target) return;
        clearInterval(waitForShell);
        initMembersPage(target);
    }, 50);
});

let currentMembersCache = [];

async function initMembersPage(target) {
    target.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <div class="text-muted small" id="memberCountLabel">Memuat data member...</div>
            <button class="btn btn-maroon text-white rounded-pill px-4 fw-bold" data-bs-toggle="modal" data-bs-target="#addMemberModal">
                <i class="bi bi-plus-lg me-1"></i> Tambah Member
            </button>
        </div>

        <div class="admin-card p-0">
            <div class="table-responsive">
                <table class="table admin-table mb-0">
                    <thead>
                        <tr>
                            <th class="ps-3">Nama</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Terdaftar</th>
                            <th class="text-end pe-3">Aksi</th>
                        </tr>
                    </thead>
                    <tbody id="membersTableBody">
                        <tr><td colspan="6" class="text-center text-muted py-4">Memuat...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        ${renderAddMemberModal()}
    `;

    document.getElementById('addMemberForm').addEventListener('submit', handleAddMember);

    await loadMembers();
}

function renderAddMemberModal() {
    return `
    <div class="modal fade" id="addMemberModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <form id="addMemberForm">
                    <div class="modal-header">
                        <h5 class="modal-title fw-bold">Tambah Member Baru</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label small fw-bold">Nama Lengkap</label>
                            <input type="text" class="form-control" id="newMemberName" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label small fw-bold">Email</label>
                            <input type="email" class="form-control" id="newMemberEmail" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label small fw-bold">Password Awal</label>
                            <input type="text" class="form-control" id="newMemberPassword" minlength="6" required>
                            <div class="form-text">Minimal 6 karakter. Sampaikan ke member yang bersangkutan secara pribadi.</div>
                        </div>
                        <div class="mb-2">
                            <label class="form-label small fw-bold">Role</label>
                            <select class="form-select" id="newMemberRole">
                                <option value="member" selected>Member</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div id="addMemberError" class="text-danger small mt-2 d-none"></div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Batal</button>
                        <button type="submit" id="addMemberSubmitBtn" class="btn btn-maroon text-white fw-bold">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    </div>`;
}

async function loadMembers() {
    const tbody = document.getElementById('membersTableBody');
    const countLabel = document.getElementById('memberCountLabel');

    const { data, error } = await _supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">Gagal memuat data: ${error.message}</td></tr>`;
        return;
    }

    currentMembersCache = data || [];
    countLabel.textContent = `${currentMembersCache.length} member terdaftar`;

    if (currentMembersCache.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">Belum ada member.</td></tr>`;
        return;
    }

    tbody.innerHTML = currentMembersCache.map(m => {
        const roleBadge = m.role === 'admin'
            ? '<span class="admin-badge-role-admin">ADMIN</span>'
            : '<span class="admin-badge-role-member">MEMBER</span>';
        const statusBadge = m.status === 'active'
            ? '<span class="admin-badge-status-active">AKTIF</span>'
            : '<span class="admin-badge-status-inactive">NONAKTIF</span>';
        const createdAt = m.created_at ? new Date(m.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

        return `
        <tr>
            <td class="ps-3 fw-semibold">${escapeHtml(m.full_name || '(tanpa nama)')}</td>
            <td>${escapeHtml(m.email)}</td>
            <td>${roleBadge}</td>
            <td>${statusBadge}</td>
            <td>${createdAt}</td>
            <td class="text-end pe-3">
                <div class="dropdown">
                    <button class="btn btn-sm btn-outline-secondary border-0" data-bs-toggle="dropdown"><i class="bi bi-three-dots-vertical"></i></button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item" href="#" onclick="toggleMemberRole('${m.id}', '${m.role}'); return false;">
                            <i class="bi bi-arrow-repeat me-2"></i> Jadikan ${m.role === 'admin' ? 'Member' : 'Admin'}
                        </a></li>
                        <li><a class="dropdown-item" href="#" onclick="toggleMemberStatus('${m.id}', '${m.status}'); return false;">
                            <i class="bi bi-toggle2-${m.status === 'active' ? 'off' : 'on'} me-2"></i> ${m.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                        </a></li>
                        <li><a class="dropdown-item" href="#" onclick="resetMemberPassword('${escapeHtml(m.email)}'); return false;">
                            <i class="bi bi-key me-2"></i> Reset Password
                        </a></li>
                    </ul>
                </div>
            </td>
        </tr>`;
    }).join('');
}

async function handleAddMember(e) {
    e.preventDefault();

    const name = document.getElementById('newMemberName').value.trim();
    const email = document.getElementById('newMemberEmail').value.trim();
    const password = document.getElementById('newMemberPassword').value;
    const role = document.getElementById('newMemberRole').value;
    const errorBox = document.getElementById('addMemberError');
    const submitBtn = document.getElementById('addMemberSubmitBtn');

    errorBox.classList.add('d-none');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Menyimpan...';

    try {
        const { data, error } = await _supabase.functions.invoke('admin-create-member', {
            body: { email, password, full_name: name, role },
        });

        if (error) {
            let message = error.message || 'Gagal menambah member.';
            // Coba ambil pesan error asli dari body response Edge Function kalau ada
            try {
                const ctx = error.context;
                if (ctx && typeof ctx.json === 'function') {
                    const parsed = await ctx.json();
                    if (parsed && parsed.error) message = parsed.error;
                }
            } catch (_) { /* abaikan, pakai message default */ }

            errorBox.textContent = message;
            errorBox.classList.remove('d-none');
            return;
        }

        if (data && data.error) {
            errorBox.textContent = data.error;
            errorBox.classList.remove('d-none');
            return;
        }

        bootstrap.Modal.getInstance(document.getElementById('addMemberModal')).hide();
        document.getElementById('addMemberForm').reset();
        await loadMembers();

    } catch (err) {
        console.error('Add member error:', err);
        errorBox.textContent = 'Terjadi kesalahan tak terduga.';
        errorBox.classList.remove('d-none');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Simpan';
    }
}

window.toggleMemberRole = async function (id, currentRole) {
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    if (!confirm(`Ubah role member ini jadi "${newRole}"?`)) return;

    const { error } = await _supabase.from('members').update({ role: newRole }).eq('id', id);
    if (error) {
        alert('Gagal mengubah role: ' + error.message);
        return;
    }
    await loadMembers();
};

window.toggleMemberStatus = async function (id, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const label = newStatus === 'active' ? 'mengaktifkan' : 'menonaktifkan';
    if (!confirm(`Yakin ${label} member ini?`)) return;

    const { error } = await _supabase.from('members').update({ status: newStatus }).eq('id', id);
    if (error) {
        alert('Gagal mengubah status: ' + error.message);
        return;
    }
    await loadMembers();
};

window.resetMemberPassword = async function (email) {
    if (!confirm(`Kirim email reset password ke ${email}?`)) return;

    const result = await window.supabaseAuth.resetPassword(email);
    if (result.success) {
        alert('Email reset password sudah dikirim ke ' + email);
    } else {
        alert('Gagal mengirim email reset: ' + result.error);
    }
};

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : str;
    return div.innerHTML;
}
