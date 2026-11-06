/* 购物车：渲染、数量、删除、优惠码、模拟结算 */
(function () {
  'use strict';

  var listEl = document.getElementById('cartList');
  var emptyEl = document.getElementById('cartEmpty');
  var layoutEl = document.getElementById('cartLayout');
  var COUPON = { code: 'JINLING30', off: 30, min: 199 };
  var coupon = null;

  function money(n) { return window.JL.money(n); }

  function rows(items) {
    return items.map(function (it) {
      return '' +
        '<div class="cart-row" data-key="' + window.JL.esc(it.key) + '">' +
          '<a href="detail.html?id=' + it.id + '"><img class="cart-thumb" src="' + it.img + '" alt="' + window.JL.esc(it.name) + '"></a>' +
          '<div class="cart-info">' +
            '<p class="cart-name"><a href="detail.html?id=' + it.id + '">' + window.JL.esc(it.name) + '</a></p>' +
            '<p class="cart-spec">' + window.JL.esc(it.spec || '标准款') + '</p>' +
          '</div>' +
          '<p class="cart-unit">¥' + money(it.price) + '</p>' +
          '<div class="cart-qty">' +
            '<span class="qty qty--sm">' +
              '<button type="button" class="js-minus" aria-label="减少">−</button>' +
              '<input type="number" class="js-qty" value="' + it.qty + '" min="1" max="99" aria-label="数量">' +
              '<button type="button" class="js-plus" aria-label="增加">+</button>' +
            '</span>' +
          '</div>' +
          '<p class="cart-line">¥' + money(it.price * it.qty) + '</p>' +
          '<button type="button" class="cart-remove js-remove" aria-label="移除商品">' +
            '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 5l14 14M19 5 5 19"/></svg>' +
          '</button>' +
        '</div>';
    }).join('');
  }

  function totals(items) {
    var sub = items.reduce(function (s, it) { return s + it.price * it.qty; }, 0);
    var count = items.reduce(function (s, it) { return s + it.qty; }, 0);
    var ship = sub >= 199 || sub === 0 ? 0 : 12;
    var off = 0;
    if (coupon && coupon.code === COUPON.code && sub >= COUPON.min) { off = COUPON.off; }
    return { sub: sub, count: count, ship: ship, off: off, total: Math.max(0, sub - off + ship) };
  }

  function render() {
    var items = window.JL.cart.all();
    if (!items.length) {
      layoutEl.style.display = 'none';
      emptyEl.style.display = 'block';
      return;
    }
    layoutEl.style.display = '';
    emptyEl.style.display = 'none';
    listEl.innerHTML = rows(items);
    var t = totals(items);
    document.getElementById('sumCount').textContent = t.count + ' 件';
    document.getElementById('sumSub').textContent = '¥' + money(t.sub);
    document.getElementById('sumShip').textContent = t.ship === 0 ? '包邮' : '¥' + money(t.ship);
    document.getElementById('sumTotal').textContent = '¥' + money(t.total);
    var msg = document.getElementById('couponMsg');
    if (coupon && t.off) {
      msg.textContent = '已减免 ¥' + COUPON.off + '（满 ' + COUPON.min + ' 元可用）';
      msg.classList.remove('err');
    }
    bindRows();
  }

  function bindRows() {
    listEl.querySelectorAll('.cart-row').forEach(function (row) {
      var key = row.dataset.key;
      var input = row.querySelector('.js-qty');
      function setQty(n) {
        window.JL.cart.setQty(key, Math.max(1, Math.min(99, n)));
        render();
      }
      row.querySelector('.js-minus').addEventListener('click', function () { setQty(+input.value - 1); });
      row.querySelector('.js-plus').addEventListener('click', function () { setQty(+input.value + 1); });
      input.addEventListener('change', function () { setQty(parseInt(input.value, 10) || 1); });
      row.querySelector('.js-remove').addEventListener('click', function () {
        window.JL.cart.remove(key);
        window.JL.toast('已移出购物车');
        render();
      });
    });
  }

  /* 优惠码 */
  document.getElementById('couponBtn').addEventListener('click', function () {
    var input = document.getElementById('couponInput');
    var code = (input.value || '').trim().toUpperCase();
    var msg = document.getElementById('couponMsg');
    var sub = totals(window.JL.cart.all()).sub;
    if (!code) {
      msg.textContent = '请输入优惠码，试试 JINLING30';
      msg.classList.add('err');
      return;
    }
    if (code !== COUPON.code) {
      msg.textContent = '优惠码无效';
      msg.classList.add('err');
      coupon = null;
      render();
      return;
    }
    if (sub < COUPON.min) {
      msg.textContent = '满 ' + COUPON.min + ' 元方可使用该优惠码';
      msg.classList.add('err');
      return;
    }
    coupon = { code: code };
    render();
    window.JL.toast('优惠码已生效，立减 ¥' + COUPON.off);
  });

  /* 清空 */
  document.getElementById('clearCart').addEventListener('click', function () {
    if (!window.JL.cart.all().length) { return; }
    if (window.confirm('确定清空购物车吗？')) {
      window.JL.cart.clear();
      coupon = null;
      render();
    }
  });

  /* 结算 */
  var modal = document.getElementById('orderModal');
  document.getElementById('checkout').addEventListener('click', function () {
    var items = window.JL.cart.all();
    if (!items.length) { return; }
    if (!window.JL.auth.current()) {
      window.JL.toast('请先登录后结算');
      window.setTimeout(function () { window.location.href = 'login.html?next=cart.html'; }, 700);
      return;
    }
    var no = 'NO.' + String(new Date().getFullYear()) +
      String(new Date().getMonth() + 1).padStart(2, '0') +
      String(new Date().getDate()).padStart(2, '0') + '-' +
      String(Math.floor(Math.random() * 9000) + 1000);
    var order = {
      no: no,
      date: new Date().toISOString(),
      status: '待发货',
      items: items,
      total: totals(items).total
    };
    var orders = window.JL.store.read('jl_orders_v1', []);
    orders.unshift(order);
    window.JL.store.write('jl_orders_v1', orders);

    document.getElementById('orderNo').textContent = no;
    modal.classList.add('is-open');
    window.JL.cart.clear();
    coupon = null;
    render();
  });

  function closeModal() { modal.classList.remove('is-open'); }
  document.getElementById('orderClose').addEventListener('click', function () {
    closeModal();
    window.location.href = 'shop.html';
  });
  modal.addEventListener('click', function (e) { if (e.target === modal) { closeModal(); } });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeModal(); } });

  document.addEventListener('jl:cartchange', function () { render(); });

  document.addEventListener('DOMContentLoaded', render);
})();
