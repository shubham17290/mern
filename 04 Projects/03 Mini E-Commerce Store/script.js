// Mini E-Commerce Store — full implementation
const CART_KEY = "ministore-cart";
const WISH_KEY = "ministore-wishlist";
const THEME_KEY = "ministore-theme";
const PROMO_KEY = "ministore-promo";

let products = [];
let cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
let wishlist = new Set(JSON.parse(localStorage.getItem(WISH_KEY) || "[]"));
let promo = localStorage.getItem(PROMO_KEY) || "";
let modalProduct = null;

const productsEl = document.getElementById("products");
const emptyEl = document.getElementById("empty");
const cartBtn = document.getElementById("cartBtn");
const cartCount = document.getElementById("cartCount");
const wishBtn = document.getElementById("wishBtn");
const wishCount = document.getElementById("wishCount");
const cartDrawer = document.getElementById("cartDrawer");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const subtotalEl = document.getElementById("subtotal");
const discountEl = document.getElementById("discount");
const searchInput = document.getElementById("search");
const categorySel = document.getElementById("category");
const sortSel = document.getElementById("sort");
const themeToggle = document.getElementById("themeToggle");
const toast = document.getElementById("toast");

// ---------- Theme ----------
function applyTheme(dark) {
  document.body.classList.toggle("dark", dark);
  themeToggle.textContent = dark ? "☀️" : "🌙";
}
applyTheme(localStorage.getItem(THEME_KEY) === "dark");
themeToggle.addEventListener("click", () => {
  const dark = !document.body.classList.contains("dark");
  applyTheme(dark);
  localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
});

// ---------- Persistence ----------
function saveCart() { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
function saveWish() { localStorage.setItem(WISH_KEY, JSON.stringify([...wishlist])); }

// ---------- Load products ----------
async function loadProducts() {
  // skeleton
  productsEl.innerHTML = Array(8).fill('<div class="skeleton"></div>').join("");
  try {
    const res = await fetch("products.json");
    products = await res.json();
    buildCategories();
    renderProducts();
  } catch (e) {
    productsEl.innerHTML = `<p class="empty">Failed to load products. Serve via http server.</p>`;
  }
}

function buildCategories() {
  const cats = [...new Set(products.map(p => p.category))];
  cats.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c; opt.textContent = c;
    categorySel.appendChild(opt);
  });
}

// ---------- Render products ----------
function renderProducts() {
  const q = searchInput.value.toLowerCase().trim();
  const cat = categorySel.value;
  const sort = sortSel.value;
  let list = products.filter(p =>
    p.name.toLowerCase().includes(q) && (cat === "all" || p.category === cat)
  );
  if (sort === "price-asc") list.sort((a,b) => a.price - b.price);
  if (sort === "price-desc") list.sort((a,b) => b.price - a.price);
  if (sort === "name") list.sort((a,b) => a.name.localeCompare(b.name));

  if (!list.length) {
    productsEl.innerHTML = "";
    emptyEl.classList.remove("hidden");
    return;
  }
  emptyEl.classList.add("hidden");
  productsEl.innerHTML = list.map(p => `
    <div class="card" data-id="${p.id}">
      <img src="${p.image}" alt="${escapeHtml(p.name)}" loading="lazy" data-view="${p.id}" />
      <div class="card-body">
        <h3>${escapeHtml(p.name)}</h3>
        <p class="card-cat">${escapeHtml(p.category)}</p>
        <p class="price">₹${p.price}</p>
        <div class="card-actions">
          <button class="wish ${wishlist.has(p.id) ? "active" : ""}" data-wish="${p.id}" title="Wishlist">
            ${wishlist.has(p.id) ? "❤️" : "🤍"}
          </button>
          <button data-add="${p.id}">Add to Cart</button>
        </div>
      </div>
    </div>`).join("");

  productsEl.querySelectorAll("[data-view]").forEach(el =>
    el.addEventListener("click", () => openModal(+el.dataset.view)));
  productsEl.querySelectorAll("[data-add]").forEach(btn =>
    btn.addEventListener("click", () => addToCart(+btn.dataset.add)));
  productsEl.querySelectorAll("[data-wish]").forEach(btn =>
    btn.addEventListener("click", () => toggleWish(+btn.dataset.wish)));
}

// ---------- Cart ----------
function addToCart(id, qty = 1) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  const existing = cart.find(x => x.id === id);
  if (existing) existing.qty += qty;
  else cart.push({ id: p.id, name: p.name, price: p.price, image: p.image, qty });
  saveCart();
  updateCartUI();
  showToast(`Added "${p.name}" to cart`);
}
function removeFromCart(id) {
  cart = cart.filter(x => x.id !== id);
  saveCart(); updateCartUI();
}
function setQty(id, qty) {
  const item = cart.find(x => x.id === id);
  if (!item) return;
  item.qty = Math.max(1, qty);
  saveCart(); updateCartUI();
}

function updateCartUI() {
  cartCount.textContent = cart.reduce((s, i) => s + i.qty, 0);
  if (!cart.length) {
    cartItems.innerHTML = `<p class="muted" style="text-align:center;padding:2rem 0;">Your cart is empty.</p>`;
  } else {
    cartItems.innerHTML = cart.map(i => `
      <div class="cart-item">
        <img src="${i.image}" alt="${escapeHtml(i.name)}" />
        <div>
          <div class="ci-name">${escapeHtml(i.name)}</div>
          <div class="ci-price">₹${i.price} each</div>
        </div>
        <div class="ci-qty">
          <button data-dec="${i.id}">−</button>
          <span>${i.qty}</span>
          <button data-inc="${i.id}">+</button>
        </div>
        <div>₹${i.price * i.qty}</div>
        <button class="ci-remove" data-remove="${i.id}" aria-label="Remove">✕</button>
      </div>`).join("");
  }
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  let discount = 0;
  if (promo === "SAVE10") discount = Math.round(subtotal * 0.1);
  subtotalEl.textContent = "₹" + subtotal;
  discountEl.textContent = "₹" + discount;
  cartTotal.textContent = "₹" + (subtotal - discount);
}

cartItems.addEventListener("click", (e) => {
  const dec = e.target.dataset.dec;
  const inc = e.target.dataset.inc;
  const rem = e.target.dataset.remove;
  if (dec) setQty(+dec, cart.find(x => x.id == dec).qty - 1);
  if (inc) setQty(+inc, cart.find(x => x.id == inc).qty + 1);
  if (rem) removeFromCart(+rem);
});

cartBtn.addEventListener("click", () => cartDrawer.classList.remove("hidden"));
document.getElementById("closeCart").addEventListener("click", () => cartDrawer.classList.add("hidden"));

document.getElementById("checkout").addEventListener("click", () => {
  if (!cart.length) { showToast("Cart is empty"); return; }
  showToast("Order placed! (demo) 🎉");
  cart = []; promo = ""; localStorage.removeItem(PROMO_KEY);
  document.getElementById("promoInput").value = "";
  document.getElementById("promoMsg").textContent = "";
  saveCart(); updateCartUI();
  cartDrawer.classList.add("hidden");
});

// Promo
document.getElementById("applyPromo").addEventListener("click", () => {
  const code = document.getElementById("promoInput").value.trim().toUpperCase();
  const msg = document.getElementById("promoMsg");
  if (code === "SAVE10") {
    promo = code;
    localStorage.setItem(PROMO_KEY, code);
    msg.textContent = "Promo applied: 10% off!";
    msg.className = "promo-msg ok";
    updateCartUI();
  } else {
    promo = "";
    localStorage.removeItem(PROMO_KEY);
    msg.textContent = "Invalid promo code.";
    msg.className = "promo-msg err";
    updateCartUI();
  }
});
if (promo) document.getElementById("promoInput").value = promo;

// ---------- Wishlist ----------
function toggleWish(id) {
  if (wishlist.has(id)) wishlist.delete(id); else wishlist.add(id);
  saveWish();
  wishCount.textContent = wishlist.size;
  renderProducts();
  const p = products.find(x => x.id === id);
  showToast(wishlist.has(id) ? `Added "${p.name}" to wishlist` : `Removed from wishlist`);
}
wishCount.textContent = wishlist.size;

wishBtn.addEventListener("click", () => {
  // show only wishlisted
  const wishProducts = products.filter(p => wishlist.has(p.id));
  if (!wishProducts.length) { showToast("Wishlist is empty"); return; }
  // temporarily render wishlist by filtering
  const prev = searchInput.value;
  // simple: alert list
  showToast(`${wishProducts.length} item(s) in wishlist`);
});

// ---------- Modal ----------
const modal = document.getElementById("modal");
function openModal(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  modalProduct = p;
  document.getElementById("modalImg").src = p.image;
  document.getElementById("modalImg").alt = p.name;
  document.getElementById("modalName").textContent = p.name;
  document.getElementById("modalCat").textContent = p.category;
  document.getElementById("modalPrice").textContent = "₹" + p.price;
  document.getElementById("modalWish").textContent = wishlist.has(p.id) ? "❤️ Wishlisted" : "🤍 Wishlist";
  modal.classList.remove("hidden");
}
function closeModal() { modal.classList.add("hidden"); modalProduct = null; }
document.getElementById("modalClose").addEventListener("click", closeModal);
document.getElementById("modalBackdrop").addEventListener("click", closeModal);
document.getElementById("modalAdd").addEventListener("click", () => {
  if (modalProduct) { addToCart(modalProduct.id); closeModal(); }
});
document.getElementById("modalWish").addEventListener("click", () => {
  if (modalProduct) { toggleWish(modalProduct.id); openModal(modalProduct.id); }
});

// ---------- Toast ----------
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add("hidden"), 2200);
}

// ---------- Events ----------
searchInput.addEventListener("input", renderProducts);
categorySel.addEventListener("change", renderProducts);
sortSel.addEventListener("change", renderProducts);

// ---------- Utils ----------
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}

loadProducts();
updateCartUI();