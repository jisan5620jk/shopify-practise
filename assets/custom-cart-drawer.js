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
