/* 作品集导航：从南京文创项目一键返回作品集首页（不改动原项目逻辑） */
(function () {
  'use strict';
  if (window.__PORTFOLIO_BACK__) return;
  window.__PORTFOLIO_BACK__ = true;

  var style = document.createElement('style');
  style.textContent = [
    '#portfolioBack{position:fixed;left:18px;bottom:18px;z-index:9999;display:inline-flex;align-items:center;gap:8px;',
    'padding:9px 14px;border-radius:999px;background:rgba(24,21,17,.92);color:#e8d7b9;',
    'border:1px solid rgba(200,169,107,.45);box-shadow:0 8px 24px rgba(0,0,0,.22);',
    'font:500 12.5px/1 "PingFang SC","Microsoft YaHei",sans-serif;letter-spacing:.4px;',
    'text-decoration:none;backdrop-filter:blur(8px);transition:.18s ease;}',
    '#portfolioBack:hover{background:#2b241b;color:#fff;border-color:#c8a96b;transform:translateY(-1px);}',
    '@media(max-width:560px){#portfolioBack{left:50%;bottom:12px;transform:translateX(-50%);padding:8px 12px;}}'
  ].join('');
  document.head.appendChild(style);

  var a = document.createElement('a');
  a.id = 'portfolioBack';
  a.href = '../index.html';
  a.innerHTML = '<span aria-hidden="true">←</span> 返回作品集';
  a.setAttribute('aria-label', '返回喻思诚作品集');
  document.body.appendChild(a);
})();
