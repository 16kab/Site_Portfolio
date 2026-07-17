// Appliquer le thème initial avant le premier rendu (évite le flash).
// Externalisé (plutôt qu'inline) pour rester compatible avec la CSP.
(function () {
  var theme = localStorage.getItem('theme');
  var isDark = theme !== 'light';

  if (isDark) {
    document.documentElement.classList.add('dark');
  }

  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', isDark ? '#111111' : '#F2F2F2');
  }
})();
