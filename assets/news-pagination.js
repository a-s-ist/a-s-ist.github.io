(() => {
  const PER_PAGE = 10;
  const grid = document.querySelector('.news-grid');
  if (!grid) return;

  const articles = Array.from(grid.querySelectorAll('.news-card'));
  if (articles.length <= PER_PAGE) return;

  const totalPages = Math.ceil(articles.length / PER_PAGE);

  function getPage() {
    const params = new URLSearchParams(window.location.search);
    const p = parseInt(params.get('page'), 10);
    return (p >= 1 && p <= totalPages) ? p : 1;
  }

  function render(page) {
    const start = (page - 1) * PER_PAGE;
    const end = start + PER_PAGE;
    articles.forEach((el, i) => {
      el.style.display = (i >= start && i < end) ? '' : 'none';
    });
    renderPager(page);
    grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderPager(current) {
    let nav = document.querySelector('.pagination');
    if (!nav) {
      nav = document.createElement('nav');
      nav.className = 'pagination';
      nav.setAttribute('aria-label', 'ページナビゲーション');
      grid.parentNode.insertBefore(nav, grid.nextSibling);
    }

    let html = '';

    // Prev
    if (current > 1) {
      html += '<a class="pagination-btn" href="?page=' + (current - 1) + '" data-page="' + (current - 1) + '" aria-label="前のページ">&laquo;</a>';
    } else {
      html += '<span class="pagination-btn disabled" aria-hidden="true">&laquo;</span>';
    }

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (i === current) {
        html += '<span class="pagination-btn active" aria-current="page">' + i + '</span>';
      } else {
        html += '<a class="pagination-btn" href="?page=' + i + '" data-page="' + i + '">' + i + '</a>';
      }
    }

    // Next
    if (current < totalPages) {
      html += '<a class="pagination-btn" href="?page=' + (current + 1) + '" data-page="' + (current + 1) + '" aria-label="次のページ">&raquo;</a>';
    } else {
      html += '<span class="pagination-btn disabled" aria-hidden="true">&raquo;</span>';
    }

    nav.innerHTML = html;

    // Click handlers
    nav.querySelectorAll('a[data-page]').forEach(function(a) {
      a.addEventListener('click', function(e) {
        e.preventDefault();
        var p = parseInt(this.dataset.page, 10);
        var url = new URL(window.location);
        url.searchParams.set('page', p);
        history.pushState(null, '', url);
        render(p);
      });
    });
  }

  // Handle browser back/forward
  window.addEventListener('popstate', function() {
    render(getPage());
  });

  // Initial render
  render(getPage());
})();
