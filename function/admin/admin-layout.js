// --- File: /function/admin/admin-layout.js ---
// Render sidebar + topbar admin, termasuk mode mobile (drawer geser).
// Dipanggil setelah mrc-guard.js memastikan yang buka halaman ini admin aktif.

function renderAdminShell(activeMenu) {
    const shellTarget = document.getElementById('adminShellRoot');
    if (!shellTarget) return;

    const menuGroups = [
        {
            label: null,
            items: [
                { key: 'dashboard', label: 'Dashboard', icon: 'bi-grid-1x2-fill', href: '/pages/Admin/index.html' },
            ],
        },
        {
            label: 'Konten Website',
            items: [
                { key: 'content', label: 'Kelola Konten', icon: 'bi-file-earmark-richtext-fill', href: '/pages/Admin/content/index.html' },
                { key: 'mrc', label: 'Kelola MRC', icon: 'bi-folder2-open', href: '/pages/Admin/mrc/index.html' },
            ],
        },
        {
            label: 'Sistem',
            items: [
                { key: 'members', label: 'Kelola Member', icon: 'bi-people-fill', href: '/pages/Admin/members/index.html' },
                { key: 'settings', label: 'Pengaturan Situs', icon: 'bi-gear-fill', href: '/pages/Admin/settings/index.html' },
            ],
        },
    ];

    const navHtml = menuGroups.map(group => `
        ${group.label ? `<li class="nav-section-label">${group.label}</li>` : ''}
        ${group.items.map(item => `
            <li>
                <a href="${item.href}" class="${item.key === activeMenu ? 'active' : ''}">
                    <i class="bi ${item.icon}"></i> ${item.label}
                </a>
            </li>
        `).join('')}
    `).join('');

    shellTarget.innerHTML = `
        <div class="admin-mobile-topbar">
            <div class="brand-mini">
                <img src="https://kbrvnbduwczjqdmofdky.supabase.co/storage/v1/object/public/Public/Logo/logomm.webp" alt="Logo">
                Admin Panel
            </div>
            <button type="button" id="adminMobileMenuBtn"><i class="bi bi-list"></i></button>
        </div>
        <div class="admin-sidebar-backdrop" id="adminSidebarBackdrop"></div>

        <div class="admin-shell">
            <aside class="admin-sidebar" id="adminSidebar">
                <div class="brand">
                    <img src="https://kbrvnbduwczjqdmofdky.supabase.co/storage/v1/object/public/Public/Logo/logomm.webp" alt="Logo">
                    <div class="brand-text">Admin Panel<small>UKM Multimedia</small></div>
                </div>
                <ul class="admin-nav">${navHtml}</ul>
                <div class="sidebar-footer">
                    <a href="/pages/MRC/index.html"><i class="bi bi-box-arrow-in-left"></i> Ke Dashboard MRC</a>
                    <a href="#" onclick="window.supabaseAuth.logout(); return false;"><i class="bi bi-power"></i> Logout</a>
                </div>
            </aside>
            <main class="admin-main">
                <div class="admin-topbar">
                    <h4 id="adminPageTitle"></h4>
                    <div class="admin-user-chip" id="adminUserChip">
                        <div class="avatar">...</div>
                        <span>Memuat...</span>
                    </div>
                </div>
                <div id="adminPageContent"></div>
            </main>
        </div>
    `;

    document.getElementById('adminPageTitle').textContent = document.title.replace(' - UKM MM', '');

    // Toggle drawer di mobile
    const sidebar = document.getElementById('adminSidebar');
    const backdrop = document.getElementById('adminSidebarBackdrop');
    const menuBtn = document.getElementById('adminMobileMenuBtn');

    function closeDrawer() {
        sidebar.classList.remove('open');
        backdrop.classList.remove('show');
    }
    function openDrawer() {
        sidebar.classList.add('open');
        backdrop.classList.add('show');
    }
    if (menuBtn) menuBtn.addEventListener('click', openDrawer);
    if (backdrop) backdrop.addEventListener('click', closeDrawer);
    sidebar.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));

    (async function fillUserChip() {
        const user = await window.supabaseAuth.getCurrentUser();
        const chip = document.getElementById('adminUserChip');
        if (!user || !chip) return;
        const name = (user.profile && user.profile.full_name) || user.email;
        const initial = name.trim().charAt(0).toUpperCase();
        chip.innerHTML = `<div class="avatar">${initial}</div><span>${name}</span>`;
    })();
}
