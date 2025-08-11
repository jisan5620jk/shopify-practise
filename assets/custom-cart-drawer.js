// গ্লোবাল স্কোপে ফাংশন রাখার জন্য
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

document.addEventListener('DOMContentLoaded', () => {
  const drawer = document.getElementById('drawer');
  const overlay = document.getElementById('overlay');
  const closeBtn = document.getElementById('closeDrawerBtn');

  // ✅ Loop through all drawer triggers
  document.querySelectorAll('[data-cart-type="drawer"]').forEach(openBtn => {
    openBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.openDrawer();
    });
  });

  closeBtn.addEventListener('click', window.closeDrawer);
  overlay.addEventListener('click', window.closeDrawer);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') window.closeDrawer();
  });
});
