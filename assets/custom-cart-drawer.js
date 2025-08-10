document.addEventListener('DOMContentLoaded', () => {
  const openBtn = document.querySelector('#openDrawer');
  const drawer = document.querySelector('#drawer');

  if (openBtn && drawer) {
    openBtn.addEventListener('click', function (e) {
      e.preventDefault(); // <a> tag er default link navigation off
      drawer.classList.remove('-translate-x-full');
      drawer.classList.add('translate-x-0');
    });
  }
});
