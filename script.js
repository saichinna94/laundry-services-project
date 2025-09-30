// ---------- Elements ----------
const serviceListEl = document.getElementById('serviceList');
const cartItemsEl = document.getElementById('cartItems');
const totalAmountEl = document.getElementById('totalAmount');
const heroBookBtn = document.getElementById('heroBookBtn');
const bookForm = document.getElementById('bookForm');
const thankYouEl = document.getElementById('thankYou');
const bookNowBtn = document.querySelector('#bookForm .cta');

// ---------- Cart Logic ----------
let cart = {}; // {id: {id,name,price,qty}}

// Format currency
function formatINR(amount) {
  return '₹' + amount.toFixed(2);
}

// ---------- Add/remove item logic with single-button toggle ----------
serviceListEl.addEventListener('click', (e) => {
  const target = e.target;
  const li = target.closest('li');
  if (!li) return;

  const id = li.dataset.id;
  const name = li.dataset.name;
  const price = Number(li.dataset.price);

  const addBtn = li.querySelector('.btn.add');
  const removeBtn = li.querySelector('.btn.remove');

  if (target.classList.contains('add')) {
    if (!cart[id]) cart[id] = { id, name, price, qty: 0 };
    cart[id].qty += 1;
    renderCart();

    addBtn.style.display = 'none';
    removeBtn.style.display = 'inline-block';

  } else if (target.classList.contains('remove')) {
    if (cart[id]) {
      cart[id].qty = Math.max(0, cart[id].qty - 1);
      if (cart[id].qty === 0) delete cart[id];
      renderCart();
    }

    removeBtn.style.display = 'none';
    addBtn.style.display = 'inline-block';
  }
});

// Initially hide all remove buttons
document.querySelectorAll('.service-list li .btn.remove').forEach(btn => {
  btn.style.display = 'none';
});

// ---------- Render cart and update Book Now button ----------
function renderCart() {
  const keys = Object.keys(cart);
  if (keys.length === 0) {
    cartItemsEl.innerHTML = 'No items added.';
    totalAmountEl.textContent = formatINR(0);
  } else {
    const rows = keys.map((k, i) => {
      const it = cart[k];
      return `<div class="cart-row"><div>${i+1}. ${it.name} x ${it.qty}</div><div>${formatINR(it.price * it.qty)}</div></div>`;
    }).join('');
    cartItemsEl.innerHTML = rows;
    const total = keys.reduce((s, k) => s + cart[k].price * cart[k].qty, 0);
    totalAmountEl.textContent = formatINR(total);
  }

  updateBookNowState();
}

// Enable/disable Book Now button
function updateBookNowState() {
  if (Object.keys(cart).length === 0) {
    bookNowBtn.disabled = true;
    bookNowBtn.style.opacity = 0.5;
    bookNowBtn.style.cursor = 'not-allowed';
  } else {
    bookNowBtn.disabled = false;
    bookNowBtn.style.opacity = 1;
    bookNowBtn.style.cursor = 'pointer';
  }
}

// Disable on page load
updateBookNowState();

// ---------- Hero scroll behavior ----------
heroBookBtn.addEventListener('click', () => {
  document.getElementById('booking').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// ---------- EmailJS integration ----------
(function () {
  if (window.emailjs) {
    emailjs.init('YOUR_USER_ID'); // Replace with your EmailJS user/public key
  } else {
    console.warn('EmailJS SDK not loaded.');
  }
})();

bookForm.addEventListener('submit', (ev) => {
  ev.preventDefault();
  const name = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const cartKeys = Object.keys(cart);

  if (!name || !email || !phone) {
    thankYouEl.style.color = 'red';
    thankYouEl.textContent = 'Please fill all booking fields.';
    return;
  }
  if (cartKeys.length === 0) {
    thankYouEl.style.color = 'red';
    thankYouEl.textContent = 'Please add at least one service to cart before booking.';
    return;
  }

  const orderLines = cartKeys.map(k => `${cart[k].name} x ${cart[k].qty} = ₹${(cart[k].price * cart[k].qty).toFixed(2)}`);
  const total = cartKeys.reduce((s, k) => s + cart[k].price * cart[k].qty, 0);

  thankYouEl.style.color = 'green';
  thankYouEl.textContent = 'Thank you For Booking the Service! We will get back to you soon.';

  const serviceID = 'YOUR_SERVICE_ID';
  const templateID = 'YOUR_TEMPLATE_ID';

  const templateParams = {
    to_name: 'Service Owner',
    from_name: name,
    customer_email: email,
    phone: phone,
    order_details: orderLines.join('\n'),
    total_amount: '₹' + total.toFixed(2),
    message: `New booking from ${name}`
  };

  if (window.emailjs) {
    emailjs.send(serviceID, templateID, templateParams)
      .then(response => {
        console.log('Email sent', response);
        cart = {};
        renderCart();
        bookForm.reset();

        // Reset all service buttons
        document.querySelectorAll('.service-list li .btn.add').forEach(btn => btn.style.display = 'inline-block');
        document.querySelectorAll('.service-list li .btn.remove').forEach(btn => btn.style.display = 'none');
      }, err => {
        console.error('EmailJS error', err);
      });
  } else {
    console.warn('EmailJS not available.');
  }
});

// ---------- Newsletter subscription ----------
document.getElementById('subscribeForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const n = document.getElementById('subName').value.trim();
  const eMail = document.getElementById('subEmail').value.trim();
  if (n && eMail) {
    alert('Thanks for subscribing, ' + n + '!');
    document.getElementById('subscribeForm').reset();
  }
});