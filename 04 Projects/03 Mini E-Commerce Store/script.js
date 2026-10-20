// Mini E-Commerce Store — script
let products = [];
let cart = JSON.parse(localStorage.getItem("cart") || "[]");

const productsEl = document.getElementById("products");
const cartBtn = document.getElementById("cartBtn");
const cartCount = document.getElementById("cartCount");
const cartDrawer = document.getElementById("cartDrawer");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const searchInput = document.getElementById("search");
const categorySel = document.getElementById("category");
const sortSel = document.getElementById("sort");

async function loadProducts() {
  // Use local products.json (serve via http server for fetch to work)
  const res = await fetch("products.json");
  products = await res.json();
  buildCategories();
  renderProducts();
}

function buildCategories() {
  const cats = [...new Set(products.map(p => p.category))];
  cats.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c; opt.textContent = c;
    categorySel.appendChild(opt);
  });
}

function renderProducts() {
  const q = searchInput.value.toLowerCase();
  const cat = categorySel.value;
  const sort = sortSel.value;
  let list = products.filter(p =>
    p.name.toLowerCase().includes(q) && (cat === "all" || p.category === cat)
  );
  if (sort === "price-asc") list.sort((a,b) => a.price - b.price);
  if (sort === "price-desc") list.sort((a,b) => b.price - a.price);

  productsEl.innerHTML = list.map(p => `
    <div class="card">
      <img src="${p.image}" alt="${p.name}" loading="lazy" />
      <div class="card-body">
        <h3>${p.name}</h3>
        <p class="price">₹${p.price}</p>
        <button onclick="addToCart(${p.id})">Add to Cart</button>
      </div>
    </div>`).join("");
}

function addToCart(id) {
  const p = products.find(x => x.id === id);
  const existing = cart.find(x => x.id === id);
  if (existing) existing.qty++;
  else cart.push({ ...p, qty: 1 });
  saveCart(); updateCartUI();
}

function saveCart() { localStorage.setItem("cart", JSON.stringify(cart)); }

function updateCartUI() {
  cartCount.textContent = cart.reduce((s, i) => s + i.qty, 0);
  cartItems.innerHTML = cart.map(i => `
    <div class="cart-item">
      <span>${i.name} × ${i.qty}</span>
      <span>₹${i.price * i.qty}</span>
    </div>`).join("");
  cartTotal.textContent = "₹" + cart.reduce((s, i) => s + i.price * i.qty, 0);
}

cartBtn.addEventListener("click", () => cartDrawer.classList.remove("hidden"));
document.getElementById("closeCart").addEventListener("click", () => cartDrawer.classList.add("hidden"));
searchInput.addEventListener("input", renderProducts);
categorySel.addEventListener("change", renderProducts);
sortSel.addEventListener("change", renderProducts);
document.getElementById("checkout").addEventListener("click", () => {
  alert("Checkout complete! (demo)");
  cart = []; saveCart(); updateCartUI(); cartDrawer.classList.add("hidden");
});

loadProducts();
updateCartUI();
// TODO: remove item, quantity controls, wishlist, promo code