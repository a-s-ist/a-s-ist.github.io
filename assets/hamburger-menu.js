(function () {
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.site-nav');
  if (!toggle || !nav) return;

  var originalParent = nav.parentNode;
  var originalNext = nav.nextElementSibling;

  // オーバーレイ用の閉じるボタンを作成
  var closeBtn = document.createElement('button');
  closeBtn.className = 'nav-close';
  closeBtn.setAttribute('aria-label', '閉じる');
  closeBtn.textContent = '\u00d7';

  function openMenu() {
    document.body.appendChild(nav);
    nav.insertBefore(closeBtn, nav.firstChild);
    nav.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  }

  function closeMenu() {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    if (closeBtn.parentNode === nav) nav.removeChild(closeBtn);
    if (originalNext) {
      originalParent.insertBefore(nav, originalNext);
    } else {
      originalParent.appendChild(nav);
    }
  }

  closeBtn.addEventListener('click', closeMenu);

  toggle.addEventListener('click', function () {
    var expanded = toggle.getAttribute('aria-expanded') === 'true';
    if (expanded) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      closeMenu();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      closeMenu();
      toggle.focus();
    }
  });
})();
