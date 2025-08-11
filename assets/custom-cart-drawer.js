document.addEventListener('DOMContentLoaded', () => {
  const drawer = document.getElementById('drawer');
  const overlay = document.getElementById('overlay');
  const closeBtn = document.getElementById('closeDrawerBtn');

  // 🔹 গ্লোবাল স্কোপে ফাংশন রাখছি
  window.openDrawer = function () {
    drawer.classList.remove('translate-x-full');
    drawer.classList.add('translate-x-0');
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };

  window.closeDrawer = function () {
    drawer.classList.add('translate-x-full');
    drawer.classList.remove('translate-x-0');
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
  };

  // ✅ Drawer trigger button গুলো হ্যান্ডেল করা
  document.querySelectorAll('[data-cart-type="drawer"]').forEach(openBtn => {
    openBtn.addEventListener('click', (e) => {
      // এখানে preventDefault কেবল লিঙ্ক বা non-form বাটনের জন্য
      if (openBtn.tagName.toLowerCase() === 'a') {
        e.preventDefault();
      }
      window.openDrawer();
    });
  });

  // ❌ Close events
  closeBtn?.addEventListener('click', window.closeDrawer);
  overlay?.addEventListener('click', window.closeDrawer);

  // Esc চাপলে বন্ধ
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') window.closeDrawer();
  });
});


// ===================
// 1. Cart Quantity, Remove & Count Update
// ===================
document.addEventListener('DOMContentLoaded', () => {
  // Loader দেখানোর/লুকানোর হেল্পার
  const showLoader = (line) => {
    document.querySelector(`.item-loader[data-line="${line}"]`)?.classList.remove('hidden');
  };

  const hideLoader = (line) => {
    document.querySelector(`.item-loader[data-line="${line}"]`)?.classList.add('hidden');
  };

  // কার্ট কাউন্ট আপডেট ফাংশন (একাধিক সিলেক্টরে আপডেট)
  const updateCartCount = () => {
    return fetch('/cart.js', {
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(res => res.json())
    .then(cart => {
      const count = cart.item_count;
      const countElements = document.querySelectorAll('.cart-count, .header-cart-count, #cart-count');
      countElements.forEach(el => {
        el.textContent = count;
      });
    });
  };

  // quantity আপডেট Ajax ফাংশন
  const updateCartQuantity = (line, quantity) => {
    if (quantity < 1) return;

    showLoader(line);

    return fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({ line: parseInt(line), quantity: quantity })
    })
    .then(res => res.json())
    .then(cart => {
      hideLoader(line);
      console.log('Cart updated:', cart);
      return updateCartCount();
    })
    .catch(err => {
      hideLoader(line);
      console.error('Cart update failed:', err);
    });
  };

  // কার্ট আইটেম রিমুভ (quantity=0)
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

    // DOM থেকে item সরানো (যদি প্রতিটি আইটেমে data-line থাকে)
    const itemEl = document.querySelector(`.cart-item[data-line="${line}"]`);
    if (itemEl) {
      itemEl.remove();
    }

    // যদি কার্ট খালি হয়ে যায়, তখন খালি মেসেজ দেখাও (প্রয়োজনে)
    if (cart.items.length === 0) {
      const cartContainer = document.querySelector('#cart-items-container');
      if (cartContainer) {
        cartContainer.innerHTML = '<p>Your cart is empty.</p>';
      }
    }
  })
  .catch(err => {
    hideLoader(line);
    console.error('Remove item failed:', err);
  });
};


  // Increase quantity বাটন
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

  // Decrease quantity বাটন
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

  // Quantity ইনপুট পরিবর্তন হলে (debounce 500ms)
  document.querySelectorAll('.quantityInput').forEach(input => {
    let timeout;
    input.addEventListener('input', e => {
      clearTimeout(timeout);
      const line = e.currentTarget.dataset.line;
      const val = parseInt(e.currentTarget.value);
      timeout = setTimeout(() => {
        if (val >= 1) {
          updateCartQuantity(line, val);
        }
      }, 500);
    });
  });

  // Remove আইকন ক্লিক — confirm ডায়ালগ ছাড়া সরাসরি রিমুভ
  document.querySelectorAll('.remove-icon').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const line = e.currentTarget.dataset.line;
      removeCartItem(line);
    });
  });
});


// ===================
// 2. AJAX Product Add to Cart + Drawer Open + Cart Count Update
// ===================
document.addEventListener('DOMContentLoaded', function () {
  const productForm = document.querySelector('.ajax-product-form');
  if (!productForm) return;

  productForm.addEventListener('submit', function (e) {
    e.preventDefault();

    addToCartAjax(new FormData(this));
  });

  function addToCartAjax(formData) {
    fetch('/cart/add.js', {
      method: 'POST',
      body: formData,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
    .then((res) => {
      if (!res.ok) throw new Error('Add to cart failed');
      return res.json();
    })
    .then((data) => {
      console.log('✅ Product added:', data);
      return updateCartCount();
    })
    .then(() => {
      if (typeof window.openCartDrawer === 'function') {
        window.openCartDrawer(); // Drawer open
      }
    })
    .catch((err) => {
      console.error('❌ Error adding to cart:', err);
      // ইউজারকে জানাতে পারো (alert, modal ইত্যাদি)
    });
  }

  function updateCartCount() {
    return fetch('/cart.js', {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
    .then((res) => res.json())
    .then((cart) => {
      const count = cart.item_count;
      // থিম অনুযায়ী এখানে সঠিক selector দিবে
      const countElements = document.querySelectorAll('.cart-count');
      countElements.forEach((el) => {
        el.textContent = count;
      });
    });
  }
});
