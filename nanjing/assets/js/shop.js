/* 商城：品类 / 价格 / 特色筛选 + 搜索 + 排序 */
(function () {
  'use strict';

  var products = window.JL_PRODUCTS || [];
  var cats = window.JL_CATEGORIES || [];

  var state = {
    cats: new Set(),
    price: 'all',
    tags: new Set(),
    q: '',
    sort: 'default'
  };

  var grid = document.getElementById('shopGrid');
  var countEl = document.getElementById('resultCount');
  var chipsEl = document.getElementById('activeFilters');
  var searchInput = document.getElementById('shopSearch');
  var sortSelect = document.getElementById('sortSelect');
  var catBox = document.getElementById('catFilters');

  /* ---------- 读取 URL 参数 ---------- */
  function readUrl() {
    var params = new URLSearchParams(window.location.search);
    var cat = params.get('cat');
    if (cat) { state.cats.add(cat); }
    var q = params.get('q');
    if (q) { state.q = q; if (searchInput) { searchInput.value = q; } }
  }

  /* ---------- 构建品类筛选 ---------- */
  function buildCats() {
    if (!catBox) { return; }
    catBox.innerHTML = cats.map(function (c) {
      var n = products.filter(function (p) { return p.cat === c.id; }).length;
      var checked = state.cats.has(c.id) ? ' checked' : '';
      return '<label class="check"><input type="checkbox" name="cat" value="' + c.id + '"' + checked + '> ' +
        window.JL.esc(c.name) + '<span class="check-count">' + n + '</span></label>';
    }).join('');
    catBox.querySelectorAll('input').forEach(function (input) {
      input.addEventListener('change', function () {
        if (input.checked) { state.cats.add(input.value); } else { state.cats.delete(input.value); }
        apply();
      });
    });
  }

  /* ---------- 筛选 ---------- */
  function inPrice(p) {
    if (state.price === 'all') { return true; }
    if (state.price === '0-99') { return p.price <= 99; }
    if (state.price === '100-199') { return p.price >= 100 && p.price <= 199; }
    if (state.price === '200+') { return p.price >= 200; }
    return true;
  }

  function inTags(p) {
    if (!state.tags.size) { return true; }
    var hit = false;
    state.tags.forEach(function (t) {
      if ((p.tags || []).indexOf(t) > -1) { hit = true; }
    });
    return hit;
  }

  function inQuery(p) {
    if (!state.q) { return true; }
    var q = state.q.toLowerCase();
    return (p.name + p.desc + p.catName + (p.tags || []).join('')).toLowerCase().indexOf(q) > -1;
  }

  function sorted(list) {
    var arr = list.slice();
    if (state.sort === 'price-asc') { arr.sort(function (a, b) { return a.price - b.price; }); }
    if (state.sort === 'price-desc') { arr.sort(function (a, b) { return b.price - a.price; }); }
    if (state.sort === 'sold') { arr.sort(function (a, b) { return b.sold - a.sold; }); }
    return arr;
  }

  /* ---------- 已选筛选条 ---------- */
  function renderChips() {
    if (!chipsEl) { return; }
    var chips = [];
    state.cats.forEach(function (id) {
      var c = cats.filter(function (x) { return x.id === id; })[0];
      if (c) { chips.push({ label: c.name, kind: 'cat', value: id }); }
    });
    if (state.price !== 'all') {
      var map = { '0-99': '¥99 以下', '100-199': '¥100 – ¥199', '200+': '¥200 以上' };
      chips.push({ label: map[state.price], kind: 'price', value: state.price });
    }
    state.tags.forEach(function (t) { chips.push({ label: t, kind: 'tag', value: t }); });
    if (state.q) { chips.push({ label: '搜索：' + state.q, kind: 'q', value: state.q }); }

    chipsEl.innerHTML = chips.map(function (c) {
      return '<span class="chip">' + window.JL.esc(c.label) +
        '<button type="button" data-kind="' + c.kind + '" data-value="' + window.JL.esc(c.value) + '" aria-label="移除筛选">×</button></span>';
    }).join('');

    chipsEl.querySelectorAll('button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var kind = btn.dataset.kind;
        var value = btn.dataset.value;
        if (kind === 'cat') {
          state.cats.delete(value);
          var box = catBox.querySelector('input[value="' + value + '"]');
          if (box) { box.checked = false; }
        }
        if (kind === 'price') {
          state.price = 'all';
          var radio = document.querySelector('input[name="price"][value="all"]');
          if (radio) { radio.checked = true; }
        }
        if (kind === 'tag') {
          state.tags.delete(value);
          var box2 = document.querySelector('input[name="tag"][value="' + value + '"]');
          if (box2) { box2.checked = false; }
        }
        if (kind === 'q') {
          state.q = '';
          if (searchInput) { searchInput.value = ''; }
        }
        apply();
      });
    });
  }

  /* ---------- 主流程 ---------- */
  function apply() {
    var list = products.filter(function (p) {
      return (state.cats.size === 0 || state.cats.has(p.cat)) && inPrice(p) && inTags(p) && inQuery(p);
    });
    var result = sorted(list);

    if (countEl) { countEl.textContent = String(result.length); }

    if (!result.length) {
      grid.innerHTML = '<div class="empty"><strong>没有找到相符的好物</strong>换个关键词，或清除部分筛选条件再看。</div>';
    } else {
      grid.innerHTML = result.map(function (p) { return window.JL.card(p); }).join('');
      window.JL.bindAddButtons(grid);
      window.JL.refreshReveal();
    }
    renderChips();

    var url = new URL(window.location.href);
    if (state.cats.size === 1) { url.searchParams.set('cat', Array.from(state.cats)[0]); }
    else { url.searchParams.delete('cat'); }
    if (state.q) { url.searchParams.set('q', state.q); } else { url.searchParams.delete('q'); }
    window.history.replaceState(null, '', url.toString());
  }

  /* ---------- 事件 ---------- */
  document.querySelectorAll('input[name="price"]').forEach(function (r) {
    r.addEventListener('change', function () { state.price = r.value; apply(); });
  });
  document.querySelectorAll('input[name="tag"]').forEach(function (c) {
    c.addEventListener('change', function () {
      if (c.checked) { state.tags.add(c.value); } else { state.tags.delete(c.value); }
      apply();
    });
  });
  if (sortSelect) {
    sortSelect.addEventListener('change', function () { state.sort = sortSelect.value; apply(); });
  }
  if (searchInput) {
    var timer;
    searchInput.addEventListener('input', function () {
      window.clearTimeout(timer);
      timer = window.setTimeout(function () { state.q = searchInput.value.trim(); apply(); }, 220);
    });
  }
  var reset = document.getElementById('resetFilters');
  if (reset) {
    reset.addEventListener('click', function () {
      state.cats.clear();
      state.tags.clear();
      state.price = 'all';
      state.q = '';
      document.querySelectorAll('input[name="cat"], input[name="tag"]').forEach(function (i) { i.checked = false; });
      var all = document.querySelector('input[name="price"][value="all"]');
      if (all) { all.checked = true; }
      if (searchInput) { searchInput.value = ''; }
      apply();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    readUrl();
    buildCats();
    apply();
  });
})();
