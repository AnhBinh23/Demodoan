// Render header & footer, init auth state
function renderHeader(activePage = '') {
    const user = Auth.getUser();
    const cartCount = getCartCount();

    const isInPages = window.location.pathname.includes('/pages/');
    const isInAdmin = window.location.pathname.includes('/admin/');
    const root  = isInAdmin ? '../../' : isInPages ? '../' : '';
    const pages = isInAdmin ? '../'    : isInPages ? ''    : 'pages/';

    const html = `
    <header class="header">
      <div class="header-inner">
        <a href="${root}index.html" class="logo">Ascent-<span>Music</span></a>

        <nav class="nav">
          <a href="${root}index.html" class="${activePage==='home' ? 'active' : ''}">Trang chủ</a>

          <div class="nav-dropdown">
            <a href="${pages}products.html" class="nav-dropdown-trigger ${activePage==='products' ? 'active' : ''}">
              Sản phẩm <span class="dropdown-arrow">▾</span>
            </a>
            <div class="nav-dropdown-menu">
              <a href="${pages}products.html">🎵 Tất cả sản phẩm</a>
              <div class="dropdown-divider"></div>
              <a href="${pages}products.html?category_id=1">🎹 Đàn Piano</a>
              <a href="${pages}products.html?category_id=2">🎹 Đàn Organ</a>
              <a href="${pages}products.html?category_id=3">🎸 Đàn Guitar</a>
              <a href="${pages}products.html?category_id=4">🎻 Đàn Violin</a>
            </div>
          </div>

          <a href="${pages}services.html" class="${activePage==='services' ? 'active' : ''}">Dịch vụ</a>
          <a href="${pages}news.html"     class="${activePage==='news'     ? 'active' : ''}">Tin tức</a>
          <a href="${pages}sheets.html" class="${activePage==='sheets' ? 'active' : ''}">🎼 Bản nhạc</a>
          <a href="${pages}contact.html"  class="${activePage==='contact'  ? 'active' : ''}">Liên hệ</a>
        </nav>

        <div class="header-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" placeholder="Tìm nhạc cụ..." id="searchInput" onkeydown="if(event.key==='Enter') doSearch()"/>
        </div>

        <div class="header-actions">
          <a href="${pages}cart.html" class="btn-icon" title="Giỏ hàng">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            <span class="cart-badge" style="display:${cartCount>0?'flex':'none'}">${cartCount}</span>
          </a>
          ${user ? `
          <div class="user-menu">
            <div class="user-avatar" onclick="toggleDropdown()">${user.full_name?.[0]?.toUpperCase()||'U'}</div>
            <div class="dropdown" id="userDropdown">
              <a href="${pages}profile.html">👤 Tài khoản của tôi</a>
              <a href="${pages}orders.html">📦 Đơn hàng</a>
              ${user.role==='admin' ? '<a href="' + pages + 'admin/index.html">⚙️ Quản trị</a>' : ''}
              <button onclick="Auth.logout()">⎋ Đăng xuất</button>
            </div>
          </div>` : `
          <a href="${pages}login.html" class="btn-login">Đăng nhập</a>`}
        </div>
      </div>
    </header>

    <style>
      .nav-dropdown { position: relative; }
      .nav-dropdown-trigger {
        display: flex; align-items: center; gap: 0.3rem;
        padding: 0.45rem 1rem; font-size: 0.9rem; font-weight: 500;
        color: var(--muted); border-radius: var(--radius); transition: var(--transition); cursor: pointer;
      }
      .nav-dropdown-trigger:hover,
      .nav-dropdown-trigger.active { color: var(--gold); background: rgba(201,168,76,0.08); }
      .dropdown-arrow { font-size: 0.7rem; transition: transform 0.2s; }
      .nav-dropdown:hover .dropdown-arrow { transform: rotate(180deg); }
      .nav-dropdown-menu {
        position: absolute; top: calc(100% + 8px); left: 0;
        background: var(--bg2); border: 1px solid var(--border);
        border-radius: var(--radius-lg); padding: 0.5rem;
        min-width: 200px; box-shadow: 0 12px 40px rgba(0,0,0,0.5);
        opacity: 0; visibility: hidden; transform: translateY(-8px);
        transition: all 0.2s ease; z-index: 200; white-space: nowrap;
      }
      .nav-dropdown:hover .nav-dropdown-menu { opacity: 1; visibility: visible; transform: translateY(0); }
      .nav-dropdown-menu a {
        display: flex; align-items: center; gap: 0.6rem;
        padding: 0.6rem 0.9rem; font-size: 0.88rem; color: var(--muted);
        border-radius: var(--radius); transition: var(--transition);
      }
      .nav-dropdown-menu a:hover { color: var(--gold); background: rgba(201,168,76,0.08); }
      .dropdown-divider { height: 1px; background: var(--border); margin: 0.3rem 0.5rem; }
      .dropdown { min-width: 200px !important; white-space: nowrap; }
    </style>`;

    document.getElementById('header-placeholder').innerHTML = html;
    updateCartBadge();
}

function toggleDropdown() {
    document.getElementById('userDropdown')?.classList.toggle('open');
}
document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-menu')) {
        document.getElementById('userDropdown')?.classList.remove('open');
    }
});

function doSearch() {
    const q = document.getElementById('searchInput')?.value.trim();
    if (!q) return;
    const isInPages = window.location.pathname.includes('/pages/');
    const isInAdmin = window.location.pathname.includes('/admin/');
    const pages = isInAdmin ? '../' : isInPages ? '' : 'pages/';
    window.location.href = pages + 'products.html?search=' + encodeURIComponent(q);
}

function renderFooter() {
    const isInPages = window.location.pathname.includes('/pages/');
    const isInAdmin = window.location.pathname.includes('/admin/');
    const pages = isInAdmin ? '../' : isInPages ? '' : 'pages/';

    document.getElementById('footer-placeholder').innerHTML = `
    <footer class="footer">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="logo">Ascent-<span>Music</span></div>
          <p>Cửa hàng nhạc cụ chính hãng — Piano, Organ, Guitar, Violin.<br>Đam mê âm nhạc, chất lượng đỉnh cao.</p>
        </div>
        <div class="footer-col">
          <h4>Sản phẩm</h4>
          <ul>
            <li><a href="${pages}products.html?category_id=1">Đàn Piano</a></li>
            <li><a href="${pages}products.html?category_id=2">Đàn Organ</a></li>
            <li><a href="${pages}products.html?category_id=3">Đàn Guitar</a></li>
            <li><a href="${pages}products.html?category_id=4">Đàn Violin</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Khám phá</h4>
          <ul>
            <li><a href="${pages}services.html">Dịch vụ</a></li>
            <li><a href="${pages}news.html">Tin tức</a></li>
            <li><a href="${pages}contact.html">Liên hệ</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Liên hệ</h4>
          <ul>
      
            <li><a href="#" style="white-space:nowrap">📍 B10B Nam Trung Yên - Trung Hoà, Hanoi</a></li>
            <li><a href="#">📞 033 341 9432</a></li>
            <li><a href="#" style="white-space:nowrap">✉️ ascentmusicstudio2026@gmail.com</a></li>
            <li><a href="${pages}contact.html">📬 Gửi tin nhắn</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">© 2024 Ascent-Music. Bản quyền thuộc về Ascent-Music.</div>
    </footer>`;
}