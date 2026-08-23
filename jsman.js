/*
    Author: Valentin Esparza
    Date: 8/23/2026
    Purpose: Handles dynamic product display, shopping cart (add/remove/quantity),
    inventory/stock tracking with out-of-stock states, cart persistence via
    localStorage, form validation, coupon discounts, and checkout logic for
    The Gilded Panel.
*/

/* =========================================
   PRODUCT DATA (id + stock added)
========================================= */
const products = [
    { id: 1, name: "The Amazing Comet-Man #1", category: "Comic", condition: "Near Mint (9.4)", price: 145.00, stock: 3 },
    { id: 2, name: "Wanderer's Almanac", category: "Book", condition: "Very Good", price: 38.00, stock: 5 },
    { id: 3, name: "Basilisk #3", category: "Comic", condition: "Fine", price: 62.00, stock: 4 },
    { id: 4, name: "Kelpie's Reach", category: "Graphic Novel", condition: "Near Mint", price: 54.00, stock: 2 },
    { id: 5, name: "The Ironclad Letters", category: "Book", condition: "Fine", price: 29.00, stock: 6 },
    { id: 6, name: "Nightfall Sentinel #7", category: "Comic", condition: "Near Mint (9.6)", price: 178.00, stock: 1 },
    { id: 7, name: "The Cartographer's Dream", category: "Book", condition: "Very Good", price: 45.00, stock: 3 },
    { id: 8, name: "Hollow Star Vol. 2", category: "Graphic Novel", condition: "Fine", price: 33.00, stock: 0 },
    { id: 9, name: "Emberfall #1", category: "Comic", condition: "Near Mint", price: 96.00, stock: 4 },
    { id: 10, name: "The Salt Road", category: "Book", condition: "Very Good", price: 41.00, stock: 5 },
    { id: 11, name: "Widow's Peak #12", category: "Comic", condition: "Fine", price: 58.00, stock: 2 },
    { id: 12, name: "Lantern Keeper's Ledger", category: "Graphic Novel", condition: "Near Mint", price: 47.00, stock: 3 }
];

/* =========================================
   CART STORAGE (localStorage)
========================================= */
function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

let stockLevels = JSON.parse(localStorage.getItem("stockLevels"));
if (!stockLevels) {
    stockLevels = {};
    products.forEach(p => stockLevels[p.id] = p.stock);
    localStorage.setItem("stockLevels", JSON.stringify(stockLevels));
}

function saveStock() {
    localStorage.setItem("stockLevels", JSON.stringify(stockLevels));
}

/* =========================================
   TOOLTIP FOR OUT OF STOCK ITEMS
========================================= */
const tooltip = document.createElement("div");
tooltip.classList.add("mouse-tooltip");
tooltip.textContent = "Out of Stock";
document.body.appendChild(tooltip);

/* =========================================
   RENDER PRODUCTS (shop.html)
========================================= */
const productGrid = document.getElementById("productGrid");

function renderProducts() {
    if (!productGrid) return;
    productGrid.innerHTML = "";

    products.forEach(function (item) {
        const stock = stockLevels[item.id];
        const outOfStock = stock <= 0;

        const card = document.createElement("article");
        card.classList.add("product-card");
        if (outOfStock) card.classList.add("out-of-stock");

        card.innerHTML = `
            <div class="cover"></div>
            <h3>${item.name}</h3>
            <p>${item.condition} &middot; ${item.category}</p>
            <p class="price">$${item.price.toFixed(2)}</p>
            <p class="stock-count">${outOfStock ? "Out of Stock" : "In Stock: " + stock}</p>
            <button
                class="btn add-cart-btn"
                data-id="${item.id}"
                ${outOfStock ? "disabled" : ""}
            >
                Add to Cart
            </button>
        `;

        if (outOfStock) {
            card.addEventListener("mousemove", event => {
                tooltip.style.left = `${event.clientX + 12}px`;
                tooltip.style.top = `${event.clientY + 12}px`;
                tooltip.classList.add("show");
            });
            card.addEventListener("mouseleave", () => {
                tooltip.classList.remove("show");
            });
        }

        productGrid.appendChild(card);
    });
}

renderProducts();

/* =========================================
   ADD TO CART (event delegation, works on shop.html and product.html)
========================================= */
document.addEventListener("click", function (event) {
    if (event.target.classList.contains("add-cart-btn")) {
        const id = Number(event.target.dataset.id);
        addToCart(id);
    }
    if (event.target.classList.contains("increase-btn")) {
        updateQuantity(Number(event.target.dataset.id), 1);
    }
    if (event.target.classList.contains("decrease-btn")) {
        updateQuantity(Number(event.target.dataset.id), -1);
    }
    if (event.target.classList.contains("remove-btn")) {
        removeFromCart(Number(event.target.dataset.id));
    }
});

function addToCart(id) {
    if (stockLevels[id] <= 0) return;

    const product = products.find(p => p.id === id);
    const cart = getCart();
    const existing = cart.find(item => item.id === id);

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1 });
    }

    stockLevels[id]--;
    saveStock();
    saveCart(cart);
    renderProducts();
    updateCartBadge();
    showNotification(`${product.name} added to cart!`);
}

/* =========================================
   UPDATE / REMOVE CART ITEMS (cart.html)
========================================= */
function updateQuantity(id, change) {
    const cart = getCart();
    const item = cart.find(product => product.id === id);
    if (!item) return;

    item.quantity += change;
    stockLevels[id] -= change;

    if (item.quantity <= 0) {
        removeFromCart(id);
        return;
    }

    saveCart(cart);
    saveStock();
    renderCartPage();
    updateCartBadge();
}

function removeFromCart(id) {
    const cart = getCart();
    const item = cart.find(product => product.id === id);

    if (item) {
        stockLevels[id] += item.quantity;
        saveStock();
    }

    const updatedCart = cart.filter(product => product.id !== id);
    saveCart(updatedCart);
    renderCartPage();
    updateCartBadge();
}

function clearCart() {
    const cart = getCart();
    cart.forEach(item => {
        stockLevels[item.id] += item.quantity;
    });
    saveStock();
    saveCart([]);
    renderCartPage();
    updateCartBadge();
}

/* =========================================
   VISUAL FEEDBACK NOTIFICATION
========================================= */
function showNotification(message) {
    let note = document.getElementById("cartNotification");
    if (!note) {
        note = document.createElement("div");
        note.id = "cartNotification";
        note.classList.add("notification");
        document.body.appendChild(note);
    }
    note.textContent = message;
    note.classList.add("show");
    setTimeout(() => note.classList.remove("show"), 1500);
}

/* =========================================
   CART BADGE IN NAV
========================================= */
function updateCartBadge() {
    const cartLink = document.querySelector('.main-nav a[href="cart.html"]');
    if (!cartLink) return;
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartLink.textContent = count > 0 ? `Cart (${count})` : "Cart";
}

updateCartBadge();

/* =========================================
   RENDER CART PAGE (cart.html)
========================================= */
const cartTableBody = document.getElementById("cartTableBody");
const cartTotalDisplay = document.getElementById("cartTotalDisplay");

function renderCartPage() {
    if (!cartTableBody) return;

    const cart = getCart();
    cartTableBody.innerHTML = "";

    if (cart.length === 0) {
        cartTableBody.innerHTML = `<tr><td colspan="4">Your cart is empty.</td></tr>`;
        cartTotalDisplay.textContent = "Total: $0.00";
        return;
    }

    let total = 0;

    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.name}</td>
            <td>
                <button class="decrease-btn" data-id="${item.id}">-</button>
                ${item.quantity}
                <button class="increase-btn" data-id="${item.id}">+</button>
            </td>
            <td>$${item.price.toFixed(2)}</td>
            <td>$${subtotal.toFixed(2)}
                <button class="remove-btn" data-id="${item.id}">Remove</button>
            </td>
        `;
        cartTableBody.appendChild(row);
    });

    cartTotalDisplay.textContent = `Total: $${total.toFixed(2)}`;
}

renderCartPage();

const clearCartBtn = document.getElementById("clearCartBtn");
if (clearCartBtn) {
    clearCartBtn.addEventListener("click", clearCart);
}

/* =========================================
   VALIDATION HELPERS
========================================= */
function isEmailValid(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

function isCardNumberValid(cardNumber) {
    const cardPattern = /^\d{16}$/;
    return cardPattern.test(cardNumber.replace(/\s/g, ""));
}

function isExpirationValid(expiration) {
    const expPattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
    return expPattern.test(expiration);
}

function isSecurityCodeValid(code) {
    const cvvPattern = /^\d{3,4}$/;
    return cvvPattern.test(code);
}

function isZipValid(zip) {
    const zipPattern = /^\d{5}(-\d{4})?$/;
    return zipPattern.test(zip);
}

function isPhoneValid(phone) {
    const phonePattern = /^\d{3}-\d{3}-\d{4}$/;
    return phonePattern.test(phone);
}

/* =========================================
   CONTACT FORM VALIDATION (about.html)
========================================= */
const contactForm = document.getElementById("contactForm");

if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("contact-email").value;
        const message = document.getElementById("message").value;
        let errors = [];

        if (!isEmailValid(email)) errors.push("Please enter a valid email address.");
        if (message.trim() === "") errors.push("Message is required.");

        if (errors.length > 0) {
            alert(errors.join("\n"));
        } else {
            alert("Message sent successfully!");
            contactForm.reset();
        }
    });
}

/* =========================================
   CHECKOUT FORM VALIDATION + ORDER LOGIC (checkout.html)
========================================= */
const checkoutForm = document.getElementById("checkoutForm");

if (checkoutForm) {
    checkoutForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const shipName = document.getElementById("name").value.trim();
        const street = document.getElementById("street").value.trim();
        const city = document.getElementById("city").value.trim();
        const state = document.getElementById("state").value.trim();
        const zip = document.getElementById("zip").value.trim();
        const phone = document.getElementById("phone").value.trim();

        const cardName = document.getElementById("cardName").value.trim();
        const cardNumber = document.getElementById("card").value.trim();
        const expiration = document.getElementById("expiration").value.trim();
        const securityCode = document.getElementById("securityCode").value.trim();

        let errors = [];

        if (shipName === "") errors.push("Full Name is required.");
        if (street === "") errors.push("Street Address is required.");
        if (city === "") errors.push("City is required.");
        if (state === "") errors.push("State is required.");
        if (!isZipValid(zip)) errors.push("Enter a valid ZIP code (e.g. 12345 or 12345-6789).");
        if (!isPhoneValid(phone)) errors.push("Enter phone number as 555-555-5555.");

        if (cardName === "") errors.push("Cardholder Name is required.");
        if (!isCardNumberValid(cardNumber)) errors.push("Enter a valid 16-digit card number.");
        if (!isExpirationValid(expiration)) errors.push("Enter expiration as MM/YY.");
        if (!isSecurityCodeValid(securityCode)) errors.push("Enter a valid 3 or 4-digit security code.");

        const cart = getCart();
        if (cart.length === 0) errors.push("Your cart is empty.");

        if (errors.length > 0) {
            alert(errors.join("\n"));
        } else {
            // Order confirmed — clear the cart (do not restore stock, item is sold)
            saveCart([]);
            window.location.href = "confirmation.html";
        }
    });
}

/* =========================================
   COUPON / DISCOUNT LOGIC (checkout.html)
   Now calculates from the real cart total.
========================================= */
const validCoupons = {
    "GILDED10": 10,
    "FIRST15": 15,
    "COLLECT20": 20
};

function getCartTotal() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function applyCoupon() {
    const couponInput = document.getElementById("coupon").value.trim().toUpperCase();
    const discountResult = document.getElementById("discountResult");
    const orderTotal = getCartTotal();

    if (validCoupons.hasOwnProperty(couponInput)) {
        const discountPercent = validCoupons[couponInput];
        const discountedTotal = orderTotal - (orderTotal * (discountPercent / 100));
        discountResult.textContent = `Coupon applied! ${discountPercent}% off — New Total: $${discountedTotal.toFixed(2)}`;
    } else if (couponInput === "") {
        discountResult.textContent = "";
    } else {
        discountResult.textContent = "Invalid coupon code.";
    }
}
