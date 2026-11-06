/* 商品详情：渲染、规格选择、数量、加入购物车、相关推荐 */
(function () {
  'use strict';

  var products = window.JL_PRODUCTS || [];
  var params = new URLSearchParams(window.location.search);
  var product = window.JL_FIND(params.get('id')) || products[0];
  if (!product) { return; }

  document.title = product.name + ' · 金陵造物';

  var specState = {};
  (product.specs || []).forEach(function (s, i) { specState[s.label] = s.options[0]; });

  /* ---------- 基础信息 ---------- */
  document.getElementById('crumbName').textContent = product.name;
  document.getElementById('galleryTag').textContent = product.badge || '非遗手作';
  document.getElementById('detailCat').textContent = product.catName;
  document.getElementById('detailTitle').textContent = product.name;
  document.getElementById('detailShort').textContent = product.short;
  document.getElementById('detailPrice').textContent = window.JL.money(product.price);
  document.getElementById('detailRating').textContent = product.rating.toFixed(1);
  document.getElementById('detailSold').textContent = String(product.sold);

  var oldEl = document.getElementById('detailOld');
  if (product.oldPrice) {
    oldEl.textContent = '¥' + window.JL.money(product.oldPrice);
  } else {
    oldEl.style.display = 'none';
  }
  document.getElementById('detailSave').textContent = product.tags[0] + ' · ' + product.tags[1];

  /* ---------- 图片 ---------- */
  var main = document.getElementById('mainImage');
  main.src = product.img;
  main.alt = product.name;

  var thumbs = document.getElementById('thumbs');
  thumbs.innerHTML = product.gallery.map(function (src, i) {
    return '<button class="thumb' + (i === 0 ? ' is-active' : '') + '" type="button" data-src="' + src + '" aria-label="查看第 ' + (i + 1) + ' 张图">' +
      '<img src="' + src + '" alt=""></button>';
  }).join('');
  thumbs.querySelectorAll('.thumb').forEach(function (btn) {
    btn.addEventListener('click', function () {
      thumbs.querySelectorAll('.thumb').forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      main.src = btn.dataset.src;
      main.style.opacity = '0';
      window.requestAnimationFrame(function () {
        main.style.transition = 'opacity .35s';
        main.style.opacity = '1';
      });
    });
  });

  /* ---------- 规格 ---------- */
  var specWrap = document.getElementById('specWrap');
  specWrap.innerHTML = (product.specs || []).map(function (s) {
    return '<div class="spec" style="margin-top:22px">' +
      '<p class="spec-label">' + window.JL.esc(s.label) + '：<span class="js-spec-value" data-label="' + window.JL.esc(s.label) + '" style="color:var(--ink)">' + window.JL.esc(s.options[0]) + '</span></p>' +
      '<div class="spec-options">' + s.options.map(function (op, i) {
        return '<button class="spec-opt' + (i === 0 ? ' is-active' : '') + '" type="button" data-label="' + window.JL.esc(s.label) + '" data-value="' + window.JL.esc(op) + '">' + window.JL.esc(op) + '</button>';
      }).join('') + '</div></div>';
  }).join('');

  specWrap.querySelectorAll('.spec-opt').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var label = btn.dataset.label;
      specState[label] = btn.dataset.value;
      specWrap.querySelectorAll('.spec-opt[data-label="' + label + '"]').forEach(function (b) {
        b.classList.toggle('is-active', b === btn);
      });
      specWrap.querySelectorAll('.js-spec-value[data-label="' + label + '"]').forEach(function (el) {
        el.textContent = btn.dataset.value;
      });
    });
  });

  /* ---------- 数量 ---------- */
  var qtyInput = document.getElementById('qtyInput');
  function setQty(n) {
    qtyInput.value = Math.min(99, Math.max(1, n));
  }
  document.querySelector('.js-qty-minus').addEventListener('click', function () { setQty(+qtyInput.value - 1); });
  document.querySelector('.js-qty-plus').addEventListener('click', function () { setQty(+qtyInput.value + 1); });
  qtyInput.addEventListener('change', function () { setQty(parseInt(qtyInput.value, 10) || 1); });

  function specText() {
    return (product.specs || []).map(function (s) { return specState[s.label]; }).join(' / ');
  }

  /* ---------- 购买 ---------- */
  document.getElementById('addCart').addEventListener('click', function () {
    window.JL.cart.add(product, specText(), +qtyInput.value);
    window.JL.toast('已加入购物车 · ' + product.name);
  });
  document.getElementById('buyNow').addEventListener('click', function () {
    window.JL.cart.add(product, specText(), +qtyInput.value);
    window.location.href = 'cart.html';
  });

  /* ---------- 详情 / 工艺 ---------- */
  document.getElementById('descBody').innerHTML =
    '<h3>关于这件好物</h3><p>' + window.JL.esc(product.desc) + '</p>' +
    '<h3>它的来历</h3><p>' + window.JL.esc(product.story) + '</p>' +
    '<h3>规格参数</h3>' +
    '<table class="spec-table"><tbody>' +
      '<tr><th>材质</th><td>' + window.JL.esc(product.material) + '</td></tr>' +
      '<tr><th>尺寸</th><td>' + window.JL.esc(product.size) + '</td></tr>' +
      '<tr><th>工艺</th><td>' + window.JL.esc(product.craft) + '</td></tr>' +
      '<tr><th>产地</th><td>江苏 · 南京</td></tr>' +
    '</tbody></table>';

  document.getElementById('craftBody').innerHTML =
    '<h3>手艺说明</h3><p>' + window.JL.esc(product.craft) + '。每一件由工坊师傅手工完成，纹样、色泽会有细微差异，这正是手作的证据。</p>' +
    '<h3>保养建议</h3><p>' + (product.cat === 'yunjin'
      ? '真丝忌暴晒与香水直喷，建议干洗或冷水手洗后阴干，收纳时避免重压。'
      : product.cat === 'dengcai'
        ? '绢面请用软毛刷除尘，避免潮湿与明火；长期不用请取出电池。'
        : '避免磕碰与长时间浸水，黄铜件可用软布擦拭，保持干燥。') + '</p>' +
    '<h3>非遗背景</h3><p>南京云锦织造技艺、秦淮灯彩均列入国家级非物质文化遗产名录。购买本品的一部分收入，将用于工坊青年学徒计划。</p>';

  /* ---------- 相关推荐 ---------- */
  var related = products.filter(function (p) { return p.id !== product.id; }).slice(0, 4);
  document.getElementById('related').innerHTML = related.map(function (p) { return window.JL.card(p); }).join('');
  window.JL.bindAddButtons(document.getElementById('related'));

  /* ---------- 选项卡 ---------- */
  document.querySelectorAll('.tabs-bar .tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.tabs-bar .tab').forEach(function (t) { t.classList.remove('is-active'); });
      tab.classList.add('is-active');
      document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('is-active'); });
      var panel = document.getElementById('panel-' + tab.dataset.tab);
      if (panel) { panel.classList.add('is-active'); }
    });
  });
})();
