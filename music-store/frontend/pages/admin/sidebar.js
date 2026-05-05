// Kiểm tra quyền admin
function checkAdmin() {
    if (!Auth.isLoggedIn()) { window.location.href = '../login.html'; return; }
    const user = Auth.getUser();
    if (user?.role !== 'admin') { window.location.href = '../../index.html'; return; }
    return user;
}

function renderSidebar(activePage) {
    const user = checkAdmin();
    if (!user) return;

    const navItems = [
        { id: 'dashboard', icon: '📊', label: 'Dashboard',        href: 'index.html' },
        { id: 'products',  icon: '🎵', label: 'Sản phẩm',         href: 'products.html' },
        { id: 'categories',icon: '📂', label: 'Danh mục',         href: 'categories.html' },
        { id: 'orders',    icon: '📦', label: 'Đơn hàng',         href: 'orders.html' },
        { id: 'users',     icon: '👥', label: 'Khách hàng',       href: 'users.html' },
        { id: 'sheets',    icon: '🎼', label: 'Bản nhạc',          href: 'admin-sheets.html' },
    ];

    document.getElementById('sidebar-placeholder').innerHTML = `
    <aside class="sidebar">
      <div class="sidebar-logo">
        MusicStore
        <span>Trang quản trị</span>
      </div>
      <nav class="sidebar-nav">
        <div class="nav-section">Quản lý</div>
        ${navItems.map(item => `
          <a href="${item.href}" class="nav-item ${activePage === item.id ? 'active' : ''}">
            <span class="icon">${item.icon}</span>
            <span>${item.label}</span>
          </a>`).join('')}
        <div class="nav-section" style="margin-top:1rem">Hệ thống</div>
        <a href="../../index.html" class="nav-item" target="_blank">
          <span class="icon">🌐</span>
          <span>Xem trang web</span>
        </a>
      </nav>
      <div class="sidebar-user">
        <div class="sidebar-avatar">${user.full_name?.[0]?.toUpperCase() || 'A'}</div>
        <div class="sidebar-user-info">
          <div class="name">${user.full_name || 'Admin'}</div>
          <div class="role">Quản trị viên</div>
        </div>
        <button class="sidebar-logout" onclick="Auth.logout()" title="Đăng xuất">⎋</button>
      </div>
    </aside>`;
}
