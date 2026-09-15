(function () {
  const pages = [
    { file: 'index.html', label: 'Kingdom Generator' },
    { file: 'newKingdom.html', label: 'New Kingdom' },
    { file: 'kingdomTest.html', label: 'Kingdom Test' },
    { file: 'test.html', label: 'Name Test' },
    { file: 'minecraftseed.html', label: 'Minecraft Seed' }
  ];

  const scriptUrl = new URL(document.currentScript.src);
  const rootUrl = new URL('../', scriptUrl);
  const currentFile = decodeURIComponent(window.location.pathname.split('/').pop()) || 'index.html';

  const style = document.createElement('style');
  style.textContent = `
    .page-navigation {
      position: fixed;
      top: 0.75rem;
      right: 0.75rem;
      z-index: 10000;
      width: min(15rem, calc(100vw - 1.5rem));
      color: #f8f1df;
      font: 600 0.95rem/1.4 system-ui, sans-serif;
    }
    .page-navigation summary {
      display: block;
      padding: 0.65rem 0.85rem;
      border: 1px solid #8f743d;
      border-radius: 0.35rem;
      background: #342719;
      box-shadow: 0 0.2rem 0.6rem rgb(0 0 0 / 25%);
      cursor: pointer;
      list-style: none;
      user-select: none;
    }
    .page-navigation summary::-webkit-details-marker { display: none; }
    .page-navigation summary::after { content: ' +'; float: right; }
    .page-navigation[open] summary::after { content: ' -'; }
    .page-navigation ul {
      margin: 0.35rem 0 0;
      padding: 0.35rem;
      border: 1px solid #8f743d;
      border-radius: 0.35rem;
      background: #fffaf0;
      box-shadow: 0 0.2rem 0.6rem rgb(0 0 0 / 25%);
      list-style: none;
    }
    .page-navigation li { margin: 0; padding: 0; }
    .page-navigation a {
      display: block;
      padding: 0.5rem 0.65rem;
      border-radius: 0.25rem;
      color: #342719;
      text-decoration: none;
    }
    .page-navigation a:hover,
    .page-navigation a:focus-visible { background: #eee1c5; outline: none; }
    .page-navigation a[aria-current='page'] {
      background: #76572e;
      color: #fffaf0;
    }
  `;

  const navigation = document.createElement('details');
  navigation.className = 'page-navigation';

  const summary = document.createElement('summary');
  summary.textContent = 'Navigate pages';
  navigation.append(summary);

  const list = document.createElement('ul');
  pages.forEach(({ file, label }) => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = new URL(file, rootUrl).href;
    link.textContent = label;

    if (file.toLowerCase() === currentFile.toLowerCase()) {
      link.setAttribute('aria-current', 'page');
      summary.textContent = label;
    }

    item.append(link);
    list.append(item);
  });

  navigation.append(list);
  document.head.append(style);
  document.body.prepend(navigation);
})();
