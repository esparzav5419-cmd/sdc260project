markdown
# The Gilded Panel

A fictional e-commerce storefront for rare, first-edition books and graded collectible comics, built as a multi-page site using HTML, CSS, and vanilla JavaScript.

## Live Features

- **Homepage** (`index.html`) — branded landing page with a featured product collection.
- **Shop** (`shop.html`) — dynamically rendered product grid pulled from a JavaScript data array, including category/condition filter controls.
- **Product Detail** (`product.html`) — individual item page with condition, edition, and authentication details, plus an Add to Cart button.
- **Shopping Cart** (`cart.html`) — dynamically rendered cart table with quantity adjustment, item removal, a running total, and a Clear Cart button. Cart state persists across page reloads using `localStorage`.
- **Inventory Tracking** — product stock decreases when items are added to the cart and is restored when items are removed or the cart is cleared. Out-of-stock products are greyed out, their Add to Cart button is disabled, and a cursor tooltip displays "Out of Stock."
- **Checkout** (`checkout.html`) — shipping and payment forms with full client-side validation (required fields, ZIP code, phone number, card number, expiration date, and security code formats), plus a coupon code discount tool that calculates a percentage off the live cart total.
- **Order Confirmation** (`confirmation.html`) — displayed after a successful checkout; the cart is cleared automatically.
- **About / Contact** (`about.html`) — brand story and a validated contact form.
- **Account** (`account.html`) — mock login form linking to Order History.
- **Order History** (`orders.html`) — table of a customer's past orders.
- **Network Connection Test** (`network.html`) — displays the local host name, communication port, transmission protocol, and last launch timestamp (stored via cookie) to verify the site is running on a local development server.

## Project Structure

/
├── index.html
├── shop.html
├── product.html
├── cart.html
├── checkout.html
├── confirmation.html
├── about.html
├── account.html
├── orders.html
├── network.html
├── styles.css
└── jsmain.js


## Technologies Used

- HTML5, CSS3 (custom properties, Flexbox, responsive breakpoints)
- Vanilla JavaScript (DOM manipulation, event delegation, `localStorage`, cookies, regex-based form validation)

## How to Run

Open `index.html` directly in a browser, or serve the folder through a local development server (e.g., VS Code Live Preview) for full functionality, including the Network Connection Test page.

## Author

Valentin Esparza
