 document.oncontextmenu = null;
  window.oncontextmenu = null;

  document.onkeydown = null;
  window.onkeydown = null;

  document.querySelectorAll('*').forEach(el => {
      el.oncontextmenu = null;
      el.onkeydown = null;
  });

  window.addEventListener('contextmenu', e => {
      e.stopImmediatePropagation();
  }, true);

  window.addEventListener('keydown', e => {
      e.stopImmediatePropagation();
  }, true);

  console.log('Right-click blockers removed');