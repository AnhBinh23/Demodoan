const API_URL = 'http://localhost:5000/api';

async function request(path, options = {}) {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(API_URL + path, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Có lỗi xảy ra!');
    return data;
}

// Hàm upload FormData (ảnh, file)
async function uploadForm(path, formData, method = 'POST') {
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(API_URL + path, { method, headers, body: formData });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Có lỗi xảy ra!');
    return data;
}

const api = {
    get:      (path)           => request(path),
    post:     (path, body)     => request(path, { method: 'POST',   body: JSON.stringify(body) }),
    put:      (path, body)     => request(path, { method: 'PUT',    body: JSON.stringify(body) }),
    delete:   (path)           => request(path, { method: 'DELETE' }),
    postForm: (path, formData) => uploadForm(path, formData, 'POST'),  // ✅ MỚI
    putForm:  (path, formData) => uploadForm(path, formData, 'PUT'),   // ✅ MỚI
};

const Auth = {
    login:    (email, password) => api.post('/auth/login',    { email, password }),
    register: (data)            => api.post('/auth/register', data),
    profile:  ()                => api.get('/auth/profile'),
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('cartCount');
        const isAdmin = window.location.pathname.includes('/admin/');
        window.location.href = isAdmin ? '/index.html' : '../index.html';
    },
    isLoggedIn() { return !!localStorage.getItem('token'); },
    getUser()    { return JSON.parse(localStorage.getItem('user') || 'null'); },
    saveUser(token, user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    },
};

const Products = {
    getAll:  (params = {}) => api.get('/products?' + new URLSearchParams(params)),
    getById: (id)          => api.get('/products/' + id),
    create:  (data)        => api.post('/products',      data),
    update:  (id, data)    => api.put('/products/' + id, data),
    delete:  (id)          => api.delete('/products/' + id),
};

const Categories = {
    getAll: () => api.get('/categories'),
};

const Cart = {
    get:    ()                         => api.get('/cart'),
    add:    (product_id, quantity = 1) => api.post('/cart', { product_id, quantity }),
    update: (cart_id, quantity)        => api.put('/cart/' + cart_id, { quantity }),
    remove: (cart_id)                  => api.delete('/cart/' + cart_id),
};

const Orders = {
    create:       (data) => api.post('/orders',           data),
    getMyOrders:  ()     => api.get('/orders/my-orders'),
    getById:      (id)   => api.get('/orders/' + id),
    cancel:       (id)   => api.put('/orders/' + id + '/cancel'),
    getAllOrders:  ()     => api.get('/orders/admin/all'),
};

// ✅ MỚI: Reviews
const Reviews = {
    getByProduct: (product_id) => api.get('/reviews/product/' + product_id),
    create:       (data)       => api.post('/reviews', data),
    delete:       (id)         => api.delete('/reviews/' + id),
};

// ✅ MỚI: Stats
const Stats = {
    overview:     () => api.get('/stats/overview'),
    revenueMonth: () => api.get('/stats/revenue-month'),
    topProducts:  () => api.get('/stats/top-products'),
};
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const icons = { success: '✓', error: '✕', info: '♪' };
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML = '<span>' + icons[type] + '</span> ' + message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

function getCartCount() {
    return parseInt(localStorage.getItem('cartCount') || '0');
}

async function updateCartBadge() {
    if (!Auth.isLoggedIn()) return;
    try {
        const items = await Cart.get();
        const count = items.reduce((s, i) => s + i.quantity, 0);
        localStorage.setItem('cartCount', count);
        document.querySelectorAll('.cart-badge').forEach(el => {
            el.textContent = count;
            el.style.display = count > 0 ? 'flex' : 'none';
        });
    } catch {}
}