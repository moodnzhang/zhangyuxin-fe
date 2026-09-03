(() => {
  const root = document.documentElement;
  const meta = document.querySelector('meta[name="theme-color"]');
  const buttons = [...document.querySelectorAll('[data-theme-toggle]')];

  const paint = theme => {
    root.dataset.theme = theme;
    const isDay = theme === 'day';
    buttons.forEach(button => {
      button.setAttribute('aria-label', isDay ? '切换至夜间主题' : '切换至白天主题');
      button.setAttribute('title', isDay ? '切换至夜间主题' : '切换至白天主题');
      const icon = button.querySelector('[data-theme-icon]');
      const label = button.querySelector('[data-theme-label]');
      if (icon) icon.textContent = isDay ? '◐' : '☼';
      if (label) label.textContent = isDay ? '夜间' : '白昼';
    });
    if (meta) meta.content = isDay ? '#e7e6e1' : (document.body.classList.contains('pet-home') ? '#0b0a0b' : '#090b0d');
    window.dispatchEvent(new CustomEvent('portfolio-theme-change', { detail: { theme } }));
  };

  paint(root.dataset.theme === 'day' ? 'day' : 'night');
  buttons.forEach(button => button.addEventListener('click', () => {
    const next = root.dataset.theme === 'day' ? 'night' : 'day';
    try { localStorage.setItem('portfolio-theme', next); } catch {}
    paint(next);
  }));
})();
