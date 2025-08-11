document.addEventListener('DOMContentLoaded', () => {
  const drawer = document.getElementById('drawer');
  const overlay = document.getElementById('overlay');
  const closeBtn = document.getElementById('closeDrawerBtn');
  const drawerLoader = document.getElementById('drawer-loader');

  if (!drawer || !overlay) {
    console.warn('Drawer or overlay element missing');
    return;
  }

  // Drawer open
  window.openCartDrawer = function () {
    drawer.classList.remove('translate-x-full');
    drawer.classList.add('translate-x-0');
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };

  // Drawer close
  window.closeCartDrawer = function () {
    drawer.classList.add('translate-x-full');
    drawer.classList.remove('translate-x-0');
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', window.closeCartDrawer);
  overlay.addEventListener('click', window.closeCartDrawer);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') window.closeCartDrawer();
  });

  // Drawer open triggers
  document.querySelectorAll('[data-cart-type="drawer"]').forEach(el => {
    el.addEventListener('click', async e => {
      if (el.tagName.toLowerCase() === 'a') e.preventDefault();
      await refreshCartDrawer();
      window.openCartDrawer();
    });
  });

  // Loader show/hide for quantity updates and remove (optional)
  const showLoader = (line) => {
    document.querySelector(`.item-loader[data-line="${line}"]`)?.classList.remove('hidden');
  };
  const hideLoader = (line) => {
    document.querySelector(`.item-loader[data-line="${line}"]`)?.classList.add('hidden');
  };

  // Update cart count
  const updateCartCount = () => {
    return fetch('/cart.js', {
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
      .then(res => res.json())
      .then(cart => {
        const count = cart.item_count || 0;
        document.querySelectorAll('.cart-count, .header-cart-count, #cart-count')
          .forEach(el => el.textContent = count);
      })
      .catch(err => {
        console.error('Failed to update cart count:', err);
      });
  };

  // Slider initialize function
  function initUpsellSlider() {
    if (typeof Swiper !== 'undefined') {
      const upsellSlider = document.querySelector('.cart-upsell-slider.swiper-container');
      if (upsellSlider && !upsellSlider.classList.contains('swiper-initialized')) {
        new Swiper(upsellSlider, {
          slidesPerView: 1,
          spaceBetween: 16,
          navigation: {
            nextEl: upsellSlider.querySelector('.swiper-button-next'),
            prevEl: upsellSlider.querySelector('.swiper-button-prev'),
          },
        });
      }
    }
  }

  // Cart drawer loader show/hide (only for add to cart)
  function showCartLoader() {
    if (drawerLoader) drawerLoader.classList.remove('hidden');
  }
  function hideCartLoader() {
    if (drawerLoader) drawerLoader.classList.add('hidden');
  }

  // Refresh drawer content WITHOUT loader (loader only on add to cart)
  const refreshCartDrawer = () => {
    return fetch('/cart?view=drawer')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch cart drawer HTML');
        return res.text();
      })
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newCartContent = doc.querySelector('#cart-items-container');
        const currentCartContainer = document.querySelector('#cart-items-container');

        if (newCartContent && currentCartContainer) {
          currentCartContainer.innerHTML = newCartContent.innerHTML;
          attachCartItemEventListeners();
          initUpsellSlider(); // init slider on content update
        }
      })
      .catch(err => {
        console.error('Error refreshing cart drawer:', err);
      });
  };

  // Update quantity
  const updateCartQuantity = (line, quantity) => {
    if (quantity < 1) return Promise.resolve();
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
        return cart;
      })
      .catch(err => {
        hideLoader(line);
        console.error('Cart update failed:', err);
        alert('Failed to update cart quantity.');
        throw err;
      });
  };

  // Remove item
  const removeCartItem = (line) => {
    showLoader(line);
    return fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({ line: parseInt(line), quantity: 0 })
    })
      .then(res => res.json())
      .then(cart => {
        hideLoader(line);
        updateCartCount();
        return cart;
      })
      .catch(err => {
        hideLoader(line);
        console.error('Remove item failed:', err);
        alert('Failed to remove item from cart.');
        throw err;
      });
  };

  // Attach event listeners on cart items inside drawer
  const attachCartItemEventListeners = () => {
    // Remove old event listeners by cloning nodes
    document.querySelectorAll('.increaseBtn').forEach(btn => btn.replaceWith(btn.cloneNode(true)));
    document.querySelectorAll('.decreaseBtn').forEach(btn => btn.replaceWith(btn.cloneNode(true)));
    document.querySelectorAll('.quantityInput').forEach(input => input.replaceWith(input.cloneNode(true)));
    document.querySelectorAll('.remove-icon').forEach(link => link.replaceWith(link.cloneNode(true)));

    // Add new event listeners
    document.querySelectorAll('.increaseBtn').forEach(btn => {
      btn.addEventListener('click', e => {
        const line = e.currentTarget.dataset.line;
        const input = document.querySelector(`.quantityInput[data-line="${line}"]`);
        if (!input) return;
        let qty = parseInt(input.value) || 1;
        qty++;
        input.value = qty;
        updateCartQuantity(line, qty).then(() => refreshCartDrawer());
      });
    });

    document.querySelectorAll('.decreaseBtn').forEach(btn => {
      btn.addEventListener('click', e => {
        const line = e.currentTarget.dataset.line;
        const input = document.querySelector(`.quantityInput[data-line="${line}"]`);
        if (!input) return;
        let qty = parseInt(input.value) || 1;
        if (qty > 1) qty--;
        input.value = qty;
        updateCartQuantity(line, qty).then(() => refreshCartDrawer());
      });
    });

    document.querySelectorAll('.quantityInput').forEach(input => {
      let timeout;
      input.addEventListener('input', e => {
        clearTimeout(timeout);
        const line = e.currentTarget.dataset.line;
        const val = parseInt(e.currentTarget.value);
        timeout = setTimeout(() => {
          if (val >= 1) updateCartQuantity(line, val).then(() => refreshCartDrawer());
        }, 500);
      });
    });

    document.querySelectorAll('.remove-icon').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const line = e.currentTarget.dataset.line;
        removeCartItem(line).then(() => refreshCartDrawer());
      });
    });
  };

  // Initial attach on page load
  attachCartItemEventListeners();

  // AJAX Add to Cart Form
  const productForm = document.querySelector('.ajax-product-form');

  if (!productForm) {
    console.warn('No form with class .ajax-product-form found');
  } else {
    productForm.addEventListener('submit', e => {
      e.preventDefault();

      const variantInput = productForm.querySelector('input[name="id"]');
      if (!variantInput || !variantInput.value) {
        alert('Please select a product variant');
        return;
      }

      // Show drawer-loader ONLY on add to cart
      showCartLoader();

      // Open drawer immediately with existing content
      window.openCartDrawer();

      const formData = new FormData(productForm);

      fetch('/cart/add.js', {
        method: 'POST',
        body: formData,
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      })
        .then(async res => {
          if (!res.ok) {
            let errorMessage = 'Add to cart failed.';
            try {
              const errorData = await res.json();
              if (errorData && errorData.description) errorMessage = errorData.description;
            } catch { }
            throw new Error(errorMessage);
          }
          return res.json();
        })
        .then(data => {
          console.log('Product added:', data);
          updateCartCount()
            .then(() => refreshCartDrawer())
            .finally(() => {
              hideCartLoader();
            });
        })
        .catch(err => {
          console.error('Add to cart error:', err);
          alert(err.message || 'Failed to add product to cart.');
          hideCartLoader();
        });
    });
  }

  // 6. On Shopify's cart update event, reinitialize slider
  document.addEventListener('cart:updated', initUpsellSlider);

  // 7. Use MutationObserver to watch for changes inside cart drawer and reinit slider
  const drawerElement = document.querySelector('cart-drawer');
  if (drawerElement) {
    const observer = new MutationObserver(() => {
      initUpsellSlider();
    });
    observer.observe(drawerElement, { childList: true, subtree: true });
  }
});
