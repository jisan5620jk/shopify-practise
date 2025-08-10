  document.addEventListener('DOMContentLoaded', () => {
    const drawer = document.getElementById('drawer');
    const overlay = document.getElementById('overlay');
    const openBtn = document.getElementById('openDrawerBtn');
    const closeBtn = document.getElementById('closeDrawerBtn');

    const toggleDrawer = (show) => {
      drawer.classList.toggle('-translate-x-full', !show);
      overlay.classList.toggle('hidden', !show);
      document.body.style.overflow = show ? 'hidden' : '';
    };

    openBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleDrawer(true);
    });

    closeBtn.addEventListener('click', () => toggleDrawer(false));
    overlay.addEventListener('click', () => toggleDrawer(false));

    window.addEventListener('resize', () => {
      toggleDrawer(window.innerWidth >= 768);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !drawer.classList.contains('-translate-x-full')) {
        toggleDrawer(false);
      }
    });

    toggleDrawer(window.innerWidth >= 768);
  });