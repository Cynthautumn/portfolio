/* 我的订单：读取本地订单记录并渲染（课程演示用，无后端） */
(function () {
  'use strict';

  var listEl = document.getElementById('orderList');
  var emptyEl = document.getElementById('orderEmpty');
  var KEY = 'jl_orders_v1';

  function fmtDate(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) { return ''; }
    function p(n) { return n < 10 ? '0' + n : String(n); }
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) +
      ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  function rows(items) {
    return (items || []).map(function (it) {
      return '' +
        '<div class="order-item">' +
          '<a href="detail.html?id=' + it.id + '"><img src="' + it.img + '" alt="' + window.JL.esc(it.name) + '"></a>' +
          '<div>' +
            '<p class="name"><a href="detail.html?id=' + it.id + '">' + window.JL.esc(it.name) + '</a></p>' +
            '<p class="spec">' + window.JL.esc(it.spec || '标准款') + '</p>' +
          '</div>' +
          '<p style="font-size:12px;color:var(--muted)">¥' + window.JL.money(it.price) + ' × ' + it.qty + '</p>' +
          '<p class="sum">¥' + window.JL.money(it.price * it.qty) + '</p>' +
        '</div>';
    }).join('');
  }

  function render() {
    var orders = window.JL.store.read(KEY, []);
    if (!orders.length) {
      listEl.innerHTML = '';
      emptyEl.style.display = 'block';
      return;
    }
    emptyEl.style.display = 'none';
    listEl.innerHTML = orders.map(function (o) {
      var count = (o.items || []).reduce(function (s, it) { return s + it.qty; }, 0);
      return '' +
        '<article class="order-card">' +
          '<div class="order-head">' +
            '<span>订单号 <b>' + window.JL.esc(o.no) + '</b></span>' +
            '<span>' + fmtDate(o.date) + '</span>' +
            '<span class="order-status">' + window.JL.esc(o.status || '待发货') + '</span>' +
          '</div>' +
          '<div class="order-items">' + rows(o.items) + '</div>' +
          '<div class="order-foot">' +
            '<span class="total">共 ' + count + ' 件，合计<b>¥' + window.JL.money(o.total) + '</b></span>' +
            '<div class="order-actions">' +
              '<button class="btn btn-ghost btn-sm js-again" type="button" data-no="' + window.JL.esc(o.no) + '">再来一单</button>' +
              '<a class="btn btn-sm" href="shop.html">继续逛逛</a>' +
            '</div>' +
          '</div>' +
        '</article>';
    }).join('');

    listEl.querySelectorAll('.js-again').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var orders2 = window.JL.store.read(KEY, []);
        var order = orders2.filter(function (o) { return o.no === btn.dataset.no; })[0];
        if (!order) { return; }
        (order.items || []).forEach(function (it) {
          window.JL.cart.add({ id: it.id, name: it.name, price: it.price, img: it.img }, it.spec, it.qty);
        });
        window.JL.toast('已把 ' + order.items.length + ' 件商品加回购物车');
        window.setTimeout(function () { window.location.href = 'cart.html'; }, 700);
      });
    });
  }

  document.addEventListener('jl:cartchange', function () { /* 保持角标同步 */ });

  document.addEventListener('DOMContentLoaded', render);
})();
