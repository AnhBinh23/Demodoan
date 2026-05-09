// =============================================
// KIỂM TRA QUYỀN TRUY CẬP ADMIN
// =============================================
function checkAdmin() {
    if (!Auth.isLoggedIn()) { window.location.href = '../login.html'; return null; }
    const user = Auth.getUser();
    const allowed = ['admin', 'super_admin', 'staff'];
    if (!allowed.includes(user?.role)) {
        window.location.href = '../../index.html';
        return null;
    }
    return user;
}

// Nhãn & màu vai trò
const ROLE_META = {
    super_admin: { label:'👑 Super Admin', cls:'color:#da70d6' },
    admin:       { label:'🛡️ Admin',       cls:'color:var(--gold)' },
    staff:       { label:'👤 Nhân viên',   cls:'color:#6495ed' },
    customer:    { label:'Khách hàng',     cls:'color:var(--muted)' },
};

// =============================================
// RENDER SIDEBAR
// =============================================
function renderSidebar(activePage) {
    const user = checkAdmin();
    if (!user) return;

    const isSuperAdmin = user.role === 'super_admin';
    const isAdmin      = user.role === 'admin' || isSuperAdmin;
    const isStaff      = user.role === 'staff' || isAdmin;

    // Các mục sidebar theo nhóm
    const shopItems = [
        { id:'dashboard',  icon:'📊', label:'Dashboard',    href:'index.html',        show: isAdmin },
        { id:'products',   icon:'🎵', label:'Sản phẩm',     href:'products.html',     show: isAdmin },
        { id:'categories', icon:'📂', label:'Danh mục',     href:'categories.html',   show: isAdmin },
        { id:'orders',     icon:'📦', label:'Đơn hàng',     href:'orders.html',       show: isStaff },
        { id:'users',      icon:'👥', label:'Khách hàng',   href:'users.html',        show: isAdmin },
        { id:'sheets',     icon:'🎼', label:'Bản nhạc',     href:'admin-sheets.html', show: isAdmin },
    ];

    const centerItems = [
        { id:'teachers', icon:'👨‍🏫', label:'Giáo viên', href:'teachers.html', show: isStaff },
        { id:'students', icon:'🎓', label:'Học viên',  href:'students.html', show: isStaff },
        { id:'classes',  icon:'📅', label:'Lớp học',   href:'classes.html',  show: isStaff },
    ];

    const systemItems = [
        { id:'admins', icon:'🔐', label:'Phân quyền',   href:'admins.html',       show: isSuperAdmin },
        { id:'web',    icon:'🌐', label:'Xem trang web', href:'../../index.html',  show: true, target:'_blank' },
    ];

    const renderItems = (items) => items
        .filter(x => x.show)
        .map(x => `
            <a href="${x.href}" ${x.target?`target="${x.target}"`:''}
               class="nav-item ${activePage === x.id ? 'active' : ''}">
                <span class="icon">${x.icon}</span>
                <span>${x.label}</span>
            </a>`).join('');

    const roleMeta = ROLE_META[user.role] || ROLE_META.customer;

    document.getElementById('sidebar-placeholder').innerHTML = `
    <aside class="sidebar">
      <div class="sidebar-logo">
        🎵 Ascent-Music
        <span>Trang quản trị</span>
      </div>
      <nav class="sidebar-nav">

        <!-- CỬA HÀNG -->
        <div class="nav-section">🛍️ Cửa hàng</div>
        ${renderItems(shopItems)}

        <!-- TRUNG TÂM ÂM NHẠC -->
        <div class="nav-section" style="margin-top:.8rem">🎹 Trung tâm</div>
        ${renderItems(centerItems)}

        <!-- HỆ THỐNG -->
        <div class="nav-section" style="margin-top:.8rem">⚙️ Hệ thống</div>
        ${renderItems(systemItems)}

      </nav>

      <!-- THÔNG TIN NGƯỜI DÙNG -->
      <div class="sidebar-user">
        <div class="sidebar-avatar">${(user.full_name?.[0] || 'A').toUpperCase()}</div>
        <div class="sidebar-user-info">
          <div class="name">${user.full_name || 'Admin'}</div>
          <div class="role" style="${roleMeta.cls}">${roleMeta.label}</div>
        </div>
        <button class="sidebar-logout" onclick="Auth.logout()" title="Đăng xuất">⎋</button>
      </div>
    </aside>`;
}