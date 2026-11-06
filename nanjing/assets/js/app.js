/* 公共脚本：购物车、登录态、头部交互、滚动动效、提示条 */
(function () {
  'use strict';

  var JL = window.JL = window.JL || {};

  /* ---------------- 本地存储 ---------------- */
  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* 隐私模式下静默失败 */ }
  }

  JL.store = { read: read, write: write };

  JL.money = function (n) {
    return Number(n).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  JL.esc = function (str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  /* ---------------- 购物车 ---------------- */
  var CART_KEY = 'jl_cart_v1';

  var cart = JL.cart = {
    all: function () { return read(CART_KEY, []); },
    save: function (items) {
      write(CART_KEY, items);
      cart.syncBadge(true);
      document.dispatchEvent(new CustomEvent('jl:cartchange', { detail: { items: items } }));
    },
    count: function () {
      return cart.all().reduce(function (sum, it) { return sum + it.qty; }, 0);
    },
    total: function () {
      return cart.all().reduce(function (sum, it) { return sum + it.price * it.qty; }, 0);
    },
    add: function (product, spec, qty) {
      var items = cart.all();
      var key = product.id + '|' + (spec || '');
      var found = items.filter(function (it) { return it.key === key; })[0];
      if (found) {
        found.qty += qty;
      } else {
        items.push({
          key: key,
          id: product.id,
          name: product.name,
          price: product.price,
          img: product.img,
          spec: spec || '',
          qty: qty
        });
      }
      cart.save(items);
      return key;
    },
    setQty: function (key, qty) {
      var items = cart.all();
      items.forEach(function (it) { if (it.key === key) { it.qty = Math.max(1, qty); } });
      cart.save(items);
    },
    remove: function (key) {
      cart.save(cart.all().filter(function (it) { return it.key !== key; }));
    },
    clear: function () { cart.save([]); },
    syncBadge: function (bump) {
      var n = cart.count();
      document.querySelectorAll('.js-cart-count').forEach(function (el) {
        el.textContent = n > 99 ? '99+' : String(n);
        el.classList.toggle('is-on', n > 0);
        if (bump && n > 0) {
          el.classList.remove('is-bump');
          void el.offsetWidth;
          el.classList.add('is-bump');
        }
      });
    }
  };

  /* ---------------- 登录态 ---------------- */
  var USER_KEY = 'jl_user_v1';
  var USER_DB = 'jl_users_v1';

  var auth = JL.auth = {
    current: function () { return read(USER_KEY, null); },
    users: function () { return read(USER_DB, []); },
    register: function (user) {
      var users = auth.users();
      if (users.some(function (u) { return u.phone === user.phone; })) {
        return { ok: false, msg: '该手机号已注册，请直接登录' };
      }
      users.push(user);
      write(USER_DB, users);
      write(USER_KEY, { name: user.name, phone: user.phone });
      return { ok: true };
    },
    login: function (phone, password) {
      var users = auth.users();
      var hit = users.filter(function (u) { return u.phone === phone; })[0];
      if (!hit) { return { ok: false, msg: '该手机号尚未注册' }; }
      if (hit.password !== password) { return { ok: false, msg: '手机号或密码不正确' }; }
      write(USER_KEY, { name: hit.name, phone: hit.phone });
      return { ok: true, user: hit };
    },
    logout: function () {
      try { localStorage.removeItem(USER_KEY); } catch (e) {}
    }
  };

  JL.syncAuthLinks = function () {
    var user = auth.current();
    document.querySelectorAll('.js-auth-link').forEach(function (el) {
      if (user) {
        el.textContent = user.name;
        el.setAttribute('href', 'javascript:void(0)');
        el.setAttribute('title', '点击退出登录');
        el.classList.add('is-user');
      } else {
        el.textContent = '登录 / 注册';
        el.setAttribute('href', 'login.html');
        el.removeAttribute('title');
        el.classList.remove('is-user');
      }
    });
  };

  document.addEventListener('click', function (e) {
    var link = e.target.closest('.js-auth-link');
    if (link && link.classList.contains('is-user')) {
      if (window.confirm('确定退出当前账号吗？')) {
        auth.logout();
        JL.syncAuthLinks();
        JL.toast('已退出登录');
      }
      e.preventDefault();
    }
  });

  /* ---------------- 轻提示 ---------------- */
  var toastEl;
  var toastTimer;
  JL.toast = function (msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2200);
  };

  /* ---------------- 头部 / 抽屉 / 回顶 ---------------- */
  function initChrome() {
    var header = document.querySelector('.header');
    var backTop = document.querySelector('.back-top');
    var drawer = document.querySelector('.drawer');
    var burger = document.querySelector('.burger');

    function onScroll() {
      var y = window.scrollY || document.documentElement.scrollTop;
      if (header) { header.classList.toggle('is-stuck', y > 8); }
      if (backTop) { backTop.classList.toggle('is-on', y > 620); }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (backTop) {
      backTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    if (burger && drawer) {
      var close = drawer.querySelector('.js-drawer-close');
      burger.addEventListener('click', function () {
        var open = drawer.classList.toggle('is-open');
        burger.classList.toggle('is-open', open);
        document.body.style.overflow = open ? 'hidden' : '';
      });
      function hide() {
        drawer.classList.remove('is-open');
        burger.classList.remove('is-open');
        document.body.style.overflow = '';
      }
      if (close) { close.addEventListener('click', hide); }
      drawer.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', hide); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { hide(); } });
    }

    var searchBtn = document.querySelector('.js-search-toggle');
    var searchBar = document.querySelector('.search-bar');
    if (searchBtn && searchBar) {
      searchBtn.addEventListener('click', function () {
        searchBar.classList.toggle('is-open');
        if (searchBar.classList.contains('is-open')) {
          var input = searchBar.querySelector('input');
          if (input) { input.focus(); }
        }
      });
      var form = searchBar.querySelector('form');
      if (form) {
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          var q = (form.querySelector('input').value || '').trim();
          window.location.href = 'shop.html' + (q ? '?q=' + encodeURIComponent(q) : '');
        });
      }
    }

    document.querySelectorAll('.js-year').forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /* ---------------- 滚动进场 ---------------- */
  function initReveal() {
    var nodes = document.querySelectorAll('.reveal');
    if (!nodes.length) { return; }
    document.documentElement.classList.add('reveal-on');
    if (new URLSearchParams(window.location.search).has('static')) {
      nodes.forEach(function (n) { n.classList.add('is-in'); });
      return;
    }
    if (!('IntersectionObserver' in window)) {
      nodes.forEach(function (n) { n.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    nodes.forEach(function (n) { io.observe(n); });
  }

  /* ---------------- 商品卡片模板 ---------------- */
  JL.card = function (p) {
    var badge = p.badge
      ? '<span class="badge ' + (p.badgeStyle === 'red' ? 'badge--red' : p.badgeStyle === 'gold' ? 'badge--gold' : '') + '">' + JL.esc(p.badge) + '</span>'
      : '';
    var oldPrice = p.oldPrice ? '<span class="price-old">¥' + JL.money(p.oldPrice) + '</span>' : '';
    return '' +
      '<article class="product-card reveal">' +
        '<div class="card-media">' +
          '<a href="detail.html?id=' + p.id + '" aria-label="' + JL.esc(p.name) + '">' +
            '<img src="' + p.img + '" alt="' + JL.esc(p.name) + '" loading="lazy">' +
          '</a>' +
          '<div class="card-badges">' + badge + '</div>' +
          '<button class="quick-add js-add" type="button" data-id="' + p.id + '">加入购物车</button>' +
        '</div>' +
        '<div class="card-body">' +
          '<p class="card-cat">' + JL.esc(p.catName) + '</p>' +
          '<h3 class="card-name"><a href="detail.html?id=' + p.id + '">' + JL.esc(p.name) + '</a></h3>' +
          '<p class="card-desc">' + JL.esc(p.short) + '</p>' +
          '<div class="card-foot">' +
            '<span class="price"><small>¥</small>' + JL.money(p.price) + oldPrice + '</span>' +
            '<span class="card-note">已售 ' + p.sold + '</span>' +
          '</div>' +
        '</div>' +
      '</article>';
  };

  JL.bindAddButtons = function (root) {
    (root || document).querySelectorAll('.js-add').forEach(function (btn) {
      if (btn.dataset.bound) { return; }
      btn.dataset.bound = '1';
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var p = window.JL_FIND(btn.dataset.id);
        if (!p) { return; }
        cart.add(p, p.specs && p.specs[0] ? p.specs[0].options[0] : '', 1);
        JL.toast('已加入购物车 · ' + p.name);
      });
    });
  };

  JL.refreshReveal = function () { initReveal(); };

  /* ---------------- 启动 ---------------- */
  function boot() {
    initChrome();
    initReveal();
    cart.syncBadge(false);
    JL.syncAuthLinks();
    JL.bindAddButtons(document);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
