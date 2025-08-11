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
  // Helpers
  const showLoader = (line) => {
    document.querySelector(`.item-loader[data-line="${line}"]`)?.classList.remove('hidden');
  };

  const hideLoader = (line) => {
    document.querySelector(`.item-loader[data-line="${line}"]`)?.classList.add('hidden');
  };

  // Ajax কার্ট update ফাংশন
  const updateCartQuantity = (line, quantity) => {
    if (quantity < 1) return; // min 1

    showLoader(line);

    fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({ line: line, quantity: quantity })
    })
      .then(res => res.json())
      .then(cart => {
        hideLoader(line);
        // এখানে তুমি চাইলে পুরো cart রিফ্রেশ বা count আপডেট করতে পারো
        console.log('Cart updated:', cart);
      })
      .catch(err => {
        hideLoader(line);
        console.error('Cart update failed:', err);
      });
  };

  // Ajax কার্ট আইটেম রিমুভ ফাংশন (quantity = 0)
  const removeCartItem = (line) => {
    showLoader(line);

    fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({ line: line, quantity: 0 })
    })
      .then(res => res.json())
      .then(cart => {
        hideLoader(line);
        // এখানে চাইলে cart রিফ্রেশ বা ডম আপডেট করো
        console.log('Item removed:', cart);
        // Optional: page refresh or remove DOM element
        location.reload(); // অথবা চাইলে ডম ম্যানিপুলেশন করতে পারো
      })
      .catch(err => {
        hideLoader(line);
        console.error('Remove item failed:', err);
      });
  };

  // Increase button ক্লিক
  document.querySelectorAll('.increaseBtn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const line = e.currentTarget.dataset.line;
      const input = document.querySelector(`.quantityInput[data-line="${line}"]`);
      let qty = parseInt(input.value) || 1;
      qty++;
      input.value = qty;
      updateCartQuantity(line, qty);
    });
  });

  // Decrease button ক্লিক
  document.querySelectorAll('.decreaseBtn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const line = e.currentTarget.dataset.line;
      const input = document.querySelector(`.quantityInput[data-line="${line}"]`);
      let qty = parseInt(input.value) || 1;
      if (qty > 1) qty--;
      input.value = qty;
      updateCartQuantity(line, qty);
    });
  });

  // Quantity ইনপুটে ম্যানুয়াল চেঞ্জ হলে debounce দিয়ে আপডেট (ঐচ্ছিক)
  document.querySelectorAll('.quantityInput').forEach(input => {
    let timeout;
    input.addEventListener('input', (e) => {
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

  // Remove icon ক্লিক
  document.querySelectorAll('.remove-icon').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const line = e.currentTarget.dataset.line;
      if (confirm('Are you sure you want to remove this item?')) {
        removeCartItem(line);
      }
    });
  });
});
