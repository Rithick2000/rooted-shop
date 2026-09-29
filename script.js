/* =========================================================
   ROOTED — script.js
   Beginner-friendly, commented in plain language.
   Sections: product data -> state -> rendering -> events
   ========================================================= */

// ---------- 1. Product data ----------
// Each product has the info a card and cart line need to display.
// "tags" match the data-category values on the filter chips.
const PRODUCTS = [
  {
    id: "snake-plant",
    name: "Snake Plant",
    price: 28,
    tags: ["low-light", "easy-care"],
    blurb: "Nearly impossible to kill. Thrives on neglect and dim corners.",
    image: "images/snake-plant.svg"
  },
  {
    id: "fiddle-leaf",
    name: "Fiddle Leaf Fig",
    price: 54,
    tags: ["statement"],
    blurb: "Big, glossy leaves that make a room feel finished. Loves bright light.",
    image: "images/fiddle-leaf.svg"
  },
  {
    id: "pothos",
    name: "Pothos",
    price: 19,
    tags: ["pet-safe", "easy-care"],
    blurb: "Trailing vines that grow fast in almost any light. Great for shelves.",
    image: "images/pothos.svg"
  },
  {
    id: "monstera",
    name: "Monstera Deliciosa",
    price: 42,
    tags: ["statement"],
    blurb: "Iconic split leaves. The plant everyone asks you about.",
    image: "images/monstera.svg"
  },
  {
    id: "zz-plant",
    name: "ZZ Plant",
    price: 32,
    tags: ["low-light", "easy-care"],
    blurb: "Waxy, upright leaves that tolerate dark rooms and missed waterings.",
    image: "images/zz-plant.svg"
  },
  {
    id: "calathea",
    name: "Calathea",
    price: 24,
    tags: ["pet-safe"],
    blurb: "Patterned leaves that fold up at night. A little drama, safely.",
    image: "images/calathea.svg"
  }
];

// ---------- 2. State ----------
// activeCategory / searchTerm control which products are visible.
// cart is an object like { "snake-plant": 2, "pothos": 1 }
let activeCategory = "all";
let searchTerm = "";
let cart = loadCart();

// ---------- 3. Helpers ----------

function formatPrice(amount) {
  return "$" + amount.toFixed(2);
}

function loadCart() {
  try {
    const saved = localStorage.getItem("rooted-cart");
    return saved ? JSON.parse(saved) : {};
  } catch (err) {
    // If localStorage is unavailable or the saved data is corrupt,
    // just start with an empty cart instead of breaking the page.
    return {};
  }
}

function saveCart() {
  localStorage.setItem("rooted-cart", JSON.stringify(cart));
}

function findProduct(id) {
  return PRODUCTS.find(function (p) { return p.id === id; });
}

function getVisibleProducts() {
  return PRODUCTS.filter(function (product) {
    const matchesCategory = activeCategory === "all" || product.tags.includes(activeCategory);
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });
}

function cartItemCount() {
  return Object.values(cart).reduce(function (sum, qty) { return sum + qty; }, 0);
}

function cartSubtotal() {
  return Object.entries(cart).reduce(function (sum, entry) {
    const product = findProduct(entry[0]);
    const qty = entry[1];
    return sum + (product ? product.price * qty : 0);
  }, 0);
}

// ---------- 4. Rendering ----------

function renderProductGrid() {
  const grid = document.getElementById("product-grid");
  const emptyState = document.getElementById("empty-state");
  const visible = getVisibleProducts();

  grid.innerHTML = "";
  emptyState.hidden = visible.length > 0;

  visible.forEach(function (product) {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML =
      '<div class="card-media"><img src="' + product.image + '" alt="Illustration of a ' + product.name + '" loading="lazy"></div>' +
      '<div class="card-body">' +
        '<div class="card-tags">' + product.tags.map(tagLabel).join("") + '</div>' +
        '<h3>' + product.name + '</h3>' +
        '<p class="card-blurb">' + product.blurb + '</p>' +
        '<div class="card-footer">' +
          '<span class="card-price">' + formatPrice(product.price) + '</span>' +
          '<button class="add-btn" data-add="' + product.id + '">Add to cart</button>' +
        '</div>' +
      '</div>';
    grid.appendChild(card);
  });
}

function tagLabel(tag) {
  const labels = {
    "low-light": "Low light",
    "pet-safe": "Pet safe",
    "statement": "Statement",
    "easy-care": "Easy care"
  };
  return '<span class="card-tag">' + (labels[tag] || tag) + '</span>';
}

function renderCart() {
  const list = document.getElementById("cart-items");
  const emptyMsg = document.getElementById("cart-empty");
  const entries = Object.entries(cart);

  list.innerHTML = "";
  emptyMsg.hidden = entries.length > 0;

  entries.forEach(function (entry) {
    const product = findProduct(entry[0]);
    const qty = entry[1];
    if (!product) return;

    const line = document.createElement("div");
    line.className = "cart-line";
    line.innerHTML =
      '<img src="' + product.image + '" alt="">' +
      '<div class="cart-line-info">' +
        '<h4>' + product.name + '</h4>' +
        '<div class="cart-line-price">' + formatPrice(product.price) + ' each</div>' +
        '<div class="qty-controls">' +
          '<button data-decrease="' + product.id + '" aria-label="Decrease quantity">−</button>' +
          '<span>' + qty + '</span>' +
          '<button data-increase="' + product.id + '" aria-label="Increase quantity">+</button>' +
        '</div>' +
        '<button class="remove-line" data-remove="' + product.id + '">Remove</button>' +
      '</div>';
    list.appendChild(line);
  });

  document.getElementById("cart-subtotal").textContent = formatPrice(cartSubtotal());
  document.getElementById("cart-count").textContent = cartItemCount();
}

// ---------- 5. Cart actions ----------

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  renderCart();
  showToast(findProduct(id).name + " added to cart");
}

function changeQty(id, delta) {
  if (!cart[id]) return;
  cart[id] += delta;
  if (cart[id] <= 0) delete cart[id];
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  delete cart[id];
  saveCart();
  renderCart();
}

// ---------- 6. Toast feedback ----------

let toastTimer = null;

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("is-visible");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toast.classList.remove("is-visible");
  }, 1800);
}

// ---------- 7. Cart drawer open/close ----------

function openCart() {
  document.getElementById("cart-drawer").classList.add("is-open");
  document.getElementById("cart-backdrop").classList.add("is-visible");
  document.getElementById("cart-drawer").setAttribute("aria-hidden", "false");
}

function closeCart() {
  document.getElementById("cart-drawer").classList.remove("is-open");
  document.getElementById("cart-backdrop").classList.remove("is-visible");
  document.getElementById("cart-drawer").setAttribute("aria-hidden", "true");
}

// ---------- 8. Event wiring ----------

document.getElementById("cart-toggle").addEventListener("click", openCart);
document.getElementById("cart-close").addEventListener("click", closeCart);
document.getElementById("cart-backdrop").addEventListener("click", closeCart);

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") closeCart();
});

// Category chips: clicking one sets the active category and re-renders.
document.getElementById("category-chips").addEventListener("click", function (e) {
  const chip = e.target.closest(".chip");
  if (!chip) return;

  document.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("is-active"); });
  chip.classList.add("is-active");
  activeCategory = chip.dataset.category;
  renderProductGrid();
});

// Search box: filter as the user types.
document.getElementById("search-input").addEventListener("input", function (e) {
  searchTerm = e.target.value;
  renderProductGrid();
});

// Add-to-cart buttons live inside the grid, which gets rebuilt often,
// so we listen on the grid's parent container instead of each button.
document.getElementById("product-grid").addEventListener("click", function (e) {
  const btn = e.target.closest("[data-add]");
  if (!btn) return;
  addToCart(btn.dataset.add);
});

// Quantity +/- and remove buttons inside the cart drawer.
document.getElementById("cart-items").addEventListener("click", function (e) {
  const increase = e.target.closest("[data-increase]");
  const decrease = e.target.closest("[data-decrease]");
  const remove = e.target.closest("[data-remove]");

  if (increase) changeQty(increase.dataset.increase, 1);
  if (decrease) changeQty(decrease.dataset.decrease, -1);
  if (remove) removeFromCart(remove.dataset.remove);
});

// Checkout is a demo action — no real payment happens.
document.getElementById("checkout-btn").addEventListener("click", function () {
  if (Object.keys(cart).length === 0) {
    showToast("Your cart is empty");
    return;
  }
  showToast("Demo checkout — order placed!");
  cart = {};
  saveCart();
  renderCart();
  closeCart();
});

// ---------- 9. Initial render ----------

renderProductGrid();
renderCart();
