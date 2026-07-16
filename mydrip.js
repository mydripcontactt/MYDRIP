// The name used to store the customer’s bag in their browser.
const CART_KEY = 'mydrip-cart';

// Turns a number such as 799 into a display price such as ₹799.
const money = (amount) => `₹${Number(amount).toLocaleString('en-IN')}`;

// Read the saved bag. If there is no saved bag yet, return an empty list.
const getCart = () => JSON.parse(localStorage.getItem(CART_KEY) || '[]');

// Save the bag and refresh every bag counter on the page.
const setCart = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
};

function updateCartCount() {
  const totalItems = getCart().reduce((total, item) => total + item.quantity, 0);

  document.querySelectorAll('[data-cart-count]').forEach((counter) => {
    counter.textContent = totalItems;
  });
}

function showToast(message) {
  const toast = document.querySelector('.toast');

  // Some pages may not need a toast, so safely stop if it is missing.
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  window.setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

function addProduct(product) {
  const cart = getCart();

  // The same T-shirt in different sizes is stored as a separate bag item.
  const existingItem = cart.find(
    (item) => item.id === product.id && item.size === product.size
  );

  if (existingItem) {
    existingItem.quantity += product.quantity;
  } else {
    cart.push(product);
  }

  setCart(cart);
  showToast(`${product.name} added to your bag.`);
}

function productForm() {
  const form = document.querySelector('[data-product-form]');

  // Stop here on a page that does not have a product form.
  if (!form) return;

  // Product ID, name, and price are stored in the HTML data-product attribute.
  const productDetails = JSON.parse(form.dataset.product);

  function getSelectedProduct() {
    return {
      ...productDetails,
      size: form.querySelector('[name=size]').value,
      quantity: Math.max(
        1,
        Number(form.querySelector('[name=quantity]').value || 1)
      ),
    };
  }

  form.querySelector('[data-add-cart]').addEventListener('click', () => {
    addProduct(getSelectedProduct());
  });

  form.querySelector('[data-buy-now]').addEventListener('click', () => {
    addProduct(getSelectedProduct());
    window.location.href = 'checkout.html';
  });
}

function renderCheckout() {
  const itemList = document.querySelector('[data-summary-items]');

  // This code only runs on checkout.html.
  if (!itemList) return;

  const cart = getCart();
  const checkoutButton = document.querySelector('[data-checkout-button]');

  if (!cart.length) {
    itemList.innerHTML = `
      <p class="empty-cart">
        Your bag is empty. <a href="mydrip.html#shop"><u>Browse the drop</u></a>.
      </p>
    `;
    document.querySelector('[data-subtotal]').textContent = money(0);
    document.querySelector('[data-total]').textContent = money(0);
    checkoutButton.disabled = true;
    return;
  }

  itemList.innerHTML = cart
    .map(
      (item) => `
        <div class="summary-item">
          <span>${item.name}<br><small>${item.size} × ${item.quantity}</small></span>
          <strong>${money(item.price * item.quantity)}</strong>
        </div>
      `
    )
    .join('');

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  document.querySelector('[data-subtotal]').textContent = money(subtotal);
  document.querySelector('[data-total]').textContent = money(subtotal);
}

function checkoutForm() {
  const form = document.querySelector('[data-checkout-form]');

  // This code only runs on checkout.html.
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!getCart().length) return;

    // Real payment goes here after you connect a secure Razorpay/Stripe server.
    showToast(
      'Payment is not connected yet. Add your secure payment provider configuration before taking orders.'
    );
  });
}

// Start the parts that are relevant to whichever page the customer opened.
updateCartCount();
productForm();
renderCheckout();
checkoutForm();
