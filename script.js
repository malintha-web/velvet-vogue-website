/* Shared site script for Velvet Vogue */

// Cart stored as array of {id,name,price,qty}
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Products stored separately so admin can modify locally
const defaultProducts = [
    { id: 1, name: 'Casual Shirt', price: 3500, img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80' },
    { id: 2, name: 'Denim Jacket', price: 7500, img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=80' },
    { id: 3, name: 'Velvet Dress', price: 9200, img: 'https://i.ytimg.com/vi/gts9khsNdNY/maxresdefault.jpg' },
];

function getProducts() {
    let p = JSON.parse(localStorage.getItem('vv_products'));
    if (!p || !Array.isArray(p)) {
        localStorage.setItem('vv_products', JSON.stringify(defaultProducts));
        return defaultProducts.slice();
    }
    return p;
}

function saveProducts(products) {
    localStorage.setItem('vv_products', JSON.stringify(products));
}

function renderProducts() {
    const list = document.getElementById('products-list');
    if (!list) return;
    const search = (document.getElementById('search')?.value || '').toLowerCase();
    const products = getProducts();
    list.innerHTML = '';

    products.filter(p => p.name.toLowerCase().includes(search)).forEach(p => {
        const col = document.createElement('div');
        col.className = 'col-md-4';
        col.innerHTML = `
            <div class="product-card">
                <img src="${p.img}" alt="${p.name}">
                <h5>${p.name}</h5>
                <p class="text-muted">Rs ${p.price}</p>
                <div class="d-flex justify-content-between">
                    <button class="btn btn-outline-secondary" onclick="viewDetails(${p.id})">Details</button>
                    <button class="btn btn-primary" onclick="addToCart(${p.id})">Add to Cart</button>
                </div>
            </div>
        `;
        list.appendChild(col);
    });
}

function viewDetails(id){
    const p = getProducts().find(x=>x.id===id);
    if(!p) return alert('Product not found');
    alert(`${p.name}\nPrice: Rs ${p.price}`);
}

function addToCart(productId) {
    const products = getProducts();
    const p = products.find(x => x.id === productId);
    if (!p) return alert('Product not found');

    const existing = cart.find(i => i.id === p.id);
    if (existing) existing.qty += 1; else cart.push({ id: p.id, name: p.name, price: p.price, qty: 1 });
    localStorage.setItem('cart', JSON.stringify(cart));
    // small non-blocking notice
    const notice = document.createElement('div');
    notice.className = 'toast-notice';
    notice.textContent = `${p.name} added to cart`;
    document.body.appendChild(notice);
    setTimeout(()=>notice.remove(),1200);
}

function loadCart() {
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    const tbody = document.getElementById('cart-items');
    if (!tbody) return;
    tbody.innerHTML = '';
    let total = 0;

    cart.forEach((item, idx) => {
        const tr = document.createElement('tr');
        const rowTotal = item.price * item.qty;
        total += rowTotal;
        tr.innerHTML = `
            <td>${item.name}</td>
            <td>Rs ${item.price}</td>
            <td><input class="form-control" type="number" min="1" value="${item.qty}" onchange="updateQty(${idx}, this.value)"></td>
            <td>Rs ${rowTotal}</td>
            <td><button class="btn btn-sm btn-outline-danger" onclick="removeItem(${idx})">Remove</button></td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('total').innerText = 'Rs ' + total;
}

function updateQty(index, qty) {
    qty = parseInt(qty) || 1;
    cart[index].qty = qty;
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
}

function removeItem(index){
    cart.splice(index,1);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
}

function clearCart(){
    if(!confirm('Clear cart?')) return;
    cart = [];
    localStorage.removeItem('cart');
    loadCart();
}

function checkout(){
    if(!cart.length) return alert('Your cart is empty');
    // simulated checkout
    alert('Thank you — order placed (simulation)');
    clearCart();
}

function login() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    // simple client-side check for demo only
    if (user === 'admin' && pass === 'admin123') {
        window.location.href = 'admin.html';
    } else {
        alert('Invalid credentials');
    }
}

/* Admin functions */
function addProductFromAdmin(){
    const name = document.getElementById('admin-name').value.trim();
    const price = parseFloat(document.getElementById('admin-price').value);
    const img = document.getElementById('admin-img').value.trim() || 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80';
    if(!name || !price) return alert('Please provide name and price');
    const products = getProducts();
    const id = products.length ? Math.max(...products.map(p=>p.id))+1 : 1;
    products.push({id,name,price,img});
    saveProducts(products);
    document.getElementById('admin-name').value='';
    document.getElementById('admin-price').value='';
    document.getElementById('admin-img').value='';
    renderAdminProducts();
    renderProducts();
}

function renderAdminProducts(){
    const root = document.getElementById('admin-products');
    if(!root) return;
    const products = getProducts();
    root.innerHTML='';
    products.forEach((p, idx) => {
        const col = document.createElement('div');
        col.className='col-md-4';
        col.innerHTML = `
            <div class="product-card">
                <img src="${p.img}" alt="${p.name}">
                <h5>${p.name}</h5>
                <p class="text-muted">Rs ${p.price}</p>
                <div class="d-flex justify-content-between">
                    <button class="btn btn-sm btn-danger" onclick="deleteProduct(${p.id})">Delete</button>
                </div>
            </div>
        `;
        root.appendChild(col);
    });
}

function deleteProduct(id){
    if(!confirm('Delete this product?')) return;
    let products = getProducts().filter(p=>p.id!==id);
    saveProducts(products);
    renderAdminProducts();
    renderProducts();
}

/* Contact form */
function submitContact(e){
    e.preventDefault();
    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const msg = document.getElementById('contact-message').value.trim();
    if(!name || !email || !msg) return alert('Please fill the form');
    // Simulate send
    document.getElementById('contact-success').classList.remove('d-none');
    document.getElementById('contact-success').innerText = 'Thanks, your message was sent (simulation).';
    document.getElementById('contact-form').reset();
}

// Expose for in-page onload calls
window.renderProducts = renderProducts;
window.loadCart = loadCart;
window.addToCart = addToCart;
window.updateQty = updateQty;
window.login = login;
window.renderAdminProducts = renderAdminProducts;
window.addProductFromAdmin = addProductFromAdmin;
window.deleteProduct = deleteProduct;
window.clearCart = clearCart;
window.checkout = checkout;
window.submitContact = submitContact;
