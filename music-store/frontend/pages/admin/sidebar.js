function checkAdmin() {
    if (!Auth.isLoggedIn()) { window.location.href = '../login.html'; return null; }
    const user = Auth.getUser();
    if (!['admin','super_admin','staff'].includes(user?.role)) {
        window.location.href = '../../index.html'; return null;
    }
    return user;
}

const ROLE_META = {
    super_admin: { label:'👑 Super Admin', color:'#da70d6' },
    admin:       { label:'🛡️ Admin',       color:'var(--gold)' },
    staff:       { label:'👤 Nhân viên',   color:'#6495ed' },
};

function renderSidebar(activePage) {
    const user = checkAdmin();
    if (!user) return;
    const isSuperAdmin = user.role === 'super_admin';
    const isAdmin      = user.role === 'admin' || isSuperAdmin;
    const isStaff      = true; // staff, admin, super_admin đều vào được

    const shopItems = [
        { id:'dashboard',  icon:'📊', label:'Dashboard',    href:'index.html',        show: isAdmin },
        { id:'products',   icon:'🎵', label:'Sản phẩm',     href:'products.html',     show: isAdmin },
        { id:'categories', icon:'📂', label:'Danh mục',     href:'categories.html',   show: isAdmin },
        { id:'orders',     icon:'📦', label:'Đơn hàng',     href:'orders.html',       show: isStaff },
        { id:'users',      icon:'👥', label:'Khách hàng',   href:'users.html',        show: isAdmin },
        { id:'sheets',     icon:'🎼', label:'Bản nhạc',     href:'admin-sheets.html', show: isAdmin },
        { id:'news',       icon:'📰', label:'Tin tức',      href:'admin-news.html',   show: isAdmin },
    ];
    const centerItems = [
        { id:'teachers',     icon:'👨‍🏫', label:'Giáo viên',   href:'teachers.html',     show: isStaff },
        { id:'timekeeping',  icon:'⏰', label:'Chấm công',   href:'timekeeping.html',  show: isStaff },
        { id:'students',     icon:'🎓', label:'Học viên',    href:'students.html',     show: isStaff },
        { id:'classes',      icon:'📅', label:'Lớp học',     href:'classes.html',      show: isStaff },
    ];
    const systemItems = [
        { id:'admins', icon:'🔐', label:'Phân quyền',    href:'admins.html',      show: isSuperAdmin },
        { id:'web',    icon:'🌐', label:'Xem trang web', href:'../../index.html', show: true, target:'_blank' },
    ];

    const renderItems = items => items.filter(x => x.show).map(x => `
        <a href="${x.href}" ${x.target?`target="${x.target}"`:''}
           class="nav-item ${activePage===x.id?'active':''}">
            <span class="icon">${x.icon}</span>
            <span>${x.label}</span>
        </a>`).join('');

    const meta = ROLE_META[user.role] || {};
    document.getElementById('sidebar-placeholder').innerHTML = `
    <aside class="sidebar">
      <div class="sidebar-logo">🎵 Ascent-Music<span>Trang quản trị</span></div>
      <nav class="sidebar-nav">
        <div class="nav-section">🛍️ Cửa hàng</div>
        ${renderItems(shopItems)}
        <div class="nav-section" style="margin-top:.8rem">🎹 Trung tâm</div>
        ${renderItems(centerItems)}
        <div class="nav-section" style="margin-top:.8rem">⚙️ Hệ thống</div>
        ${renderItems(systemItems)}
      </nav>
      <div class="sidebar-user">
        <div class="sidebar-avatar">${(user.full_name?.[0]||'A').toUpperCase()}</div>
        <div class="sidebar-user-info">
          <div class="name">${user.full_name||'Admin'}</div>
          <div class="role" style="color:${meta.color||'var(--muted)'}">${meta.label||user.role}</div>
        </div>
        <button class="sidebar-logout" onclick="Auth.logout()" title="Đăng xuất">⎋</button>
      </div>
    </aside>`;
}
