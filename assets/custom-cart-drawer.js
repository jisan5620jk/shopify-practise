document.addEventListener('DOMContentLoaded', () => {
  const drawer = document.getElementById('drawer');
  const overlay = document.getElementById('overlay');
  const openBtn = document.getElementById('openDrawerBtn');
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

  openBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openDrawer();
  });

  closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });
});
