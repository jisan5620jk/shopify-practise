document.addEventListener('DOMContentLoaded', () => {

  // --- Drawer elements ---
  const drawer = document.getElementById('drawer');
  const overlay = document.getElementById('overlay');
  const closeBtn = document.getElementById('closeDrawerBtn');

  // Drawer open function - globally accessible
  window.openCartDrawer = function () {
    drawer.classList.remove('translate-x-full');
    drawer.classList.add('translate-x-0');
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };

  // Drawer close function - globally accessible
  window.closeCartDrawer = function () {
    drawer.classList.add('translate-x-full');
    drawer.classList.remove('translate-x-0');
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
  };

  // Drawer close event listeners
  closeBtn.addEventListener('click', window.closeCartDrawer);
  overlay.addEventListener('click', window.closeCartDrawer);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') window.closeCartDrawer();
  });

  // Drawer open triggers (যেকোনো বাটনে data-cart-type="drawer" থাকলে)
  document.querySelectorAll('[data-cart-type="drawer"]').forEach(el => {
    el.addEventListener('click', e => {
      if (el.tagName.toLowerCase() === 'a') {
        e.preventDefault();
      }
      window.openCartDrawer();
    });
  });


  // --- Loader helper ---
  const showLoader = (line) => {
    document.querySelector(`.item-loader[data-line="${line}"]`)?.classList.remove('hidden');
  };
  const hideLoader = (line) => {
    document.querySelector(`.item-loader[data-line="${line}"]`)?.classList.add('hidden');
  };

  // --- Update cart count in all counters ---
  const updateCartCount = () => {
    return fetch('/cart.js', {
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(res => res.json())
    .then(cart => {
      const count = cart.item_count;
      document.querySelectorAll('.cart-count, .header-cart-count, #cart-count')
        .forEach(el => el.textContent = count);
    });
  };

  // --- Update cart item quantity ---
  const updateCartQuantity = (line, quantity) => {
    if (quantity < 1) return;
    showLoader(line);
    return fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({ line: parseInt(line), quantity })
    })
    .then(res => res.json())
    .then(cart => {
      hideLoader(line);
      updateCartCount();
    })
    .catch(err => {
      hideLoader(line);
      console.error('Cart update failed:', err);
    });
  };

  // --- Remove cart item ---
  const removeCartItem = (line) => {
    showLoader(line);
    fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({ line: parseInt(line), quantity: 0 })
    })
    .then(res => res.json())
    .then(cart => {
      hideLoader(line);
      updateCartCount();

      // DOM থেকে আইটেম সরানো
      const itemEl = document.querySelector(`.cart-item[data-line="${line}"]`);
      if (itemEl) itemEl.remove();

      // যদি কার্ট খালি হয়, খালি মেসেজ দেখানো
      if (cart.items.length === 0) {
        const container = document.querySelector('#cart-items-container');
        if (container) container.innerHTML = '<p>Your cart is empty.</p>';
      }
    })
    .catch(err => {
      hideLoader(line);
      console.error('Remove item failed:', err);
    });
  };

  // --- Increase quantity button ---
  document.querySelectorAll('.increaseBtn').forEach(btn => {
    btn.addEventListener('click', e => {
      const line = e.currentTarget.dataset.line;
      const input = document.querySelector(`.quantityInput[data-line="${line}"]`);
      let qty = parseInt(input.value) || 1;
      qty++;
      input.value = qty;
      updateCartQuantity(line, qty);
    });
  });

  // --- Decrease quantity button ---
  document.querySelectorAll('.decreaseBtn').forEach(btn => {
    btn.addEventListener('click', e => {
      const line = e.currentTarget.dataset.line;
      const input = document.querySelector(`.quantityInput[data-line="${line}"]`);
      let qty = parseInt(input.value) || 1;
      if (qty > 1) qty--;
      input.value = qty;
      updateCartQuantity(line, qty);
    });
  });

  // --- Quantity input manual change (debounce 500ms) ---
  document.querySelectorAll('.quantityInput').forEach(input => {
    let timeout;
    input.addEventListener('input', e => {
      clearTimeout(timeout);
      const line = e.currentTarget.dataset.line;
      const val = parseInt(e.currentTarget.value);
      timeout = setTimeout(() => {
        if (val >= 1) updateCartQuantity(line, val);
      }, 500);
    });
  });

  // --- Remove icon click ---
  document.querySelectorAll('.remove-icon').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const line = e.currentTarget.dataset.line;
      removeCartItem(line);
    });
  });

  // --- AJAX Product Add to Cart Form ---
  const productForm = document.querySelector('.ajax-product-form');

  if (!productForm) {
    console.warn('No form with class .ajax-product-form found');
    return;
  }

  productForm.addEventListener('submit', e => {
    e.preventDefault();

    const variantInput = productForm.querySelector('input[name="id"]');
    if (!variantInput || !variantInput.value) {
      alert('Please select a product variant');
      return;
    }

    const formData = new FormData(productForm);

    fetch('/cart/add.js', {
      method: 'POST',
      body: formData,
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(res => {
      if (!res.ok) throw new Error('Add to cart failed');
      return res.json();
    })
    .then(data => {
      console.log('Product added:', data);
      // Update cart count এবং ড্রয়ার ওপেন
      updateCartCount().then(() => window.openCartDrawer());
    })
    .catch(err => {
      console.error('Add to cart error:', err);
      alert('Failed to add product to cart.');
    });
  });
});
