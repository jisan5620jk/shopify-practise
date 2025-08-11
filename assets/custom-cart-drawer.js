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


document.addEventListener('DOMContentLoaded', () => {
  // Loader দেখানোর/লুকানোর হেল্পার
  const showLoader = (line) => {
    document.querySelector(`.item-loader[data-line="${line}"]`)?.classList.remove('hidden');
  };

  const hideLoader = (line) => {
    document.querySelector(`.item-loader[data-line="${line}"]`)?.classList.add('hidden');
  };

  // কার্ট কাউন্ট আপডেট ফাংশন
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

  // কার্ট আইটেম রিমুভ AJAX
  const removeCartItem = (line) => {
    showLoader(line);

    fetch('/cart/change.js', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'X-Requested-With': 'XMLHttpRequest' 
      },
      body: JSON.stringify({ line: parseInt(line), quantity: 0 })
    })
    .then(res => res.json())
    .then(cart => {
      hideLoader(line);
      updateCartCount();

      // DOM থেকে item সরানো
      const itemEl = document.querySelector(`.cart-item[data-line="${line}"]`);
      if (itemEl) itemEl.remove();

      // কার্ট খালি হলে মেসেজ দেখানো
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

  // Remove আইকন ক্লিক ইভেন্ট
  document.querySelectorAll('.remove-icon').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const line = e.currentTarget.dataset.line;
      removeCartItem(line);
    });
  });

  // --- অন্য প্রয়োজনীয় ফাংশন যেমন কার্ট quantity update ইত্যাদি যদি দরকার --- //
});
