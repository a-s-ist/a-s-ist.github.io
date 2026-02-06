/**
 * 共通ヘッダー・フッターコンポーネント
 * 各ページでインポートして使用
 */
(function () {
  // 現在のページから見たルートへの相対パスを計算
  function getBasePath() {
    var path = window.location.pathname;
    var depth = (path.match(/\//g) || []).length - 1;
    if (path.endsWith('/') || path.endsWith('/index.html')) {
      depth = path.replace(/\/index\.html$/, '').replace(/\/$/, '').split('/').filter(Boolean).length;
    }
    if (depth === 0) return '';
    return '../'.repeat(depth);
  }

  var base = getBasePath();

  // ヘッダーHTML生成
  function createHeader(isHome) {
    var headerClass = isHome ? 'site-header site-header-home' : 'site-header';
    var currentPage = window.location.pathname;

    function isActive(href) {
      var fullHref = base + href;
      if (href === 'index.html' && (currentPage === '/' || currentPage.endsWith('/index.html') && currentPage.split('/').length <= 2)) {
        return true;
      }
      return currentPage.includes(href.replace('index.html', '').replace(/\/$/, ''));
    }

    return '<header class="' + headerClass + '">' +
      '<div class="container header-inner">' +
        '<a class="brand" href="' + base + 'index.html">' +
          '<img src="' + base + 'image/a-s-ist-logo-named.png" alt="株式会社a.s.ist ロゴ" width="120" height="32" />' +
        '</a>' +
        '<button class="menu-toggle" aria-label="メニュー" aria-expanded="false">' +
          '<span></span><span></span><span></span>' +
        '</button>' +
        '<nav class="site-nav" aria-label="主要ナビゲーション">' +
          '<a href="' + base + 'index.html"' + (isActive('index.html') && !currentPage.includes('/solutions') && !currentPage.includes('/members') && !currentPage.includes('/company') && !currentPage.includes('/news') ? ' aria-current="page"' : '') + '>ホーム</a>' +
          '<a href="' + base + 'solutions/index.html"' + (currentPage.includes('/solutions') || currentPage.includes('/cases') ? ' aria-current="page"' : '') + '>ソリューション・事例紹介</a>' +
          '<a href="' + base + 'members/index.html"' + (currentPage.includes('/members') ? ' aria-current="page"' : '') + '>メンバー</a>' +
          '<a href="' + base + 'company/index.html"' + (currentPage.includes('/company') ? ' aria-current="page"' : '') + '>会社情報</a>' +
          '<a href="' + base + 'news/index.html"' + (currentPage.includes('/news') ? ' aria-current="page"' : '') + '>ニュース</a>' +
        '</nav>' +
        '<a class="btn primary" href="' + base + 'contact/index.html">お問い合わせ</a>' +
      '</div>' +
    '</header>';
  }

  // フッターHTML生成
  function createFooter() {
    return '<footer class="site-footer">' +
      '<div class="container footer-grid">' +
        '<div>' +
          '<img src="' + base + 'image/a-s-ist-logo-named.png" alt="株式会社a.s.ist" width="120" height="32" style="margin-bottom: 0.75rem;" />' +
          '<p class="note">研究・製造の現場課題に寄り添う<br>解析ソフトウェアを開発しています。</p>' +
        '</div>' +
        '<div>' +
          '<p class="footer-title">メニュー</p>' +
          '<div class="footer-links">' +
            '<a href="' + base + 'solutions/index.html">ソリューション・事例紹介</a>' +
            '<a href="' + base + 'members/index.html">メンバー</a>' +
            '<a href="' + base + 'company/index.html">会社情報</a>' +
            '<a href="' + base + 'news/index.html">ニュース</a>' +
            '<a href="' + base + 'contact/index.html">お問い合わせ</a>' +
            '<a href="' + base + 'privacy/index.html">プライバシーポリシー</a>' +
          '</div>' +
        '</div>' +
        '<div>' +
          '<p class="footer-title">Company</p>' +
          '<p class="note">ソフトウェア開発 / データ解析支援</p>' +
          '<p class="note">公式サイト: <a href="https://www.a-s-ist.com/" target="_blank" rel="noopener">https://www.a-s-ist.com/</a></p>' +
        '</div>' +
      '</div>' +
      '<div class="container footer-bottom">' +
        '<small>© 2026 a.s.ist Inc. All rights reserved.</small>' +
      '</div>' +
    '</footer>';
  }

  // DOMにヘッダー・フッターを挿入
  document.addEventListener('DOMContentLoaded', function () {
    var headerPlaceholder = document.getElementById('site-header');
    var footerPlaceholder = document.getElementById('site-footer');
    var isHome = document.body.classList.contains('home-page');

    if (headerPlaceholder) {
      headerPlaceholder.outerHTML = createHeader(isHome);
    }

    if (footerPlaceholder) {
      footerPlaceholder.outerHTML = createFooter();
    }
  });
})();
