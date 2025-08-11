<script>
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('ajax-product-form');
    const drawer = document.getElementById('drawer');
    const overlay = document.getElementById('overlay');
    const closeBtn = document.getElementById('closeDrawerBtn');

    const openDrawer = () => {
      drawer.classList.remove('translate-x-full');
      drawer.classList.add('translate-x-0');
      overlay.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    };

    const closeDrawer = () => {
      drawer.classList.add('translate-x-full');
      drawer.classList.remove('translate-x-0');
      overlay.classList.add('hidden');
      document.body.style.overflow = '';
    };

    closeBtn.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDrawer();
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const formData = new FormData(form);
      const cartType = form.querySelector('[data-cart-type]')?.dataset.cartType;

      fetch('/cart/add.js', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
      .then(res => res.json())
      .then(data => {
        console.log('Added to cart:', data);

        if (cartType === 'drawer') {
          openDrawer();
          // 🔁 Optionally re-render cart drawer content here
        } else {
          // ✅ Fallback: redirect to cart page or show toast
          window.location.href = '/cart';
        }
      })
      .catch(err => {
        console.error('Error:', err);
        // ❌ Show error message if needed
      });
    });
  });
</script>
