/* 首页：Banner 轮播、品类筛选、订阅表单 */
(function () {
  'use strict';

  /* ---------------- Banner 轮播 ---------------- */
  function initHero() {
    var hero = document.getElementById('hero');
    if (!hero) { return; }

    var isStatic = new URLSearchParams(window.location.search).has('static');

    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var currentEl = hero.querySelector('.js-hero-current');
    var index = 0;
    var timer = null;
    var DURATION = 6000;
    var paused = false;

    function pad(n) { return n < 10 ? '0' + n : String(n); }

    function go(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (s, i) { s.classList.toggle('is-active', i === index); });
      dots.forEach(function (d, i) {
        var on = i === index;
        d.classList.remove('is-active');
        if (on) {
          // 重启进度条动画
          var bar = d.querySelector('span');
          if (bar) {
            bar.style.animation = 'none';
            void bar.offsetWidth;
            bar.style.animation = '';
          }
          d.classList.add('is-active');
        }
      });
      if (currentEl) { currentEl.textContent = pad(index + 1); }
      restart();
    }

    function restart() {
      window.clearInterval(timer);
      if (paused || isStatic) { return; }
      timer = window.setInterval(function () { go(index + 1); }, DURATION);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { go(i); });
    });
    var prev = hero.querySelector('.js-hero-prev');
    var next = hero.querySelector('.js-hero-next');
    if (prev) { prev.addEventListener('click', function () { go(index - 1); }); }
    if (next) { next.addEventListener('click', function () { go(index + 1); }); }

    hero.addEventListener('mouseenter', function () {
      paused = true;
      hero.classList.add('is-paused');
      window.clearInterval(timer);
    });
    hero.addEventListener('mouseleave', function () {
      paused = false;
      hero.classList.remove('is-paused');
      restart();
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        window.clearInterval(timer);
      } else {
        restart();
      }
    });

    restart();
  }

  /* ---------------- 甄选好物 ---------------- */
  function initFeatured() {
    var grid = document.getElementById('featured');
    if (!grid) { return; }

    var products = window.JL_PRODUCTS || [];
    var tabs = document.querySelectorAll('[data-filter]');

    function render(filter) {
      var list = filter === 'all'
        ? products
        : products.filter(function (p) { return p.cat === filter; });
      grid.innerHTML = list.map(function (p) { return window.JL.card(p); }).join('');
      window.JL.bindAddButtons(grid);
      window.JL.refreshReveal();
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('is-active'); });
        tab.classList.add('is-active');
        render(tab.dataset.filter);
      });
    });

    render('all');
  }

  /* ---------------- 订阅 ---------------- */
  function initNews() {
    var form = document.getElementById('newsForm');
    if (!form) { return; }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('input');
      var value = (input.value || '').trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
        window.JL.toast('请输入有效的邮箱地址');
        input.focus();
        return;
      }
      form.reset();
      window.JL.toast('订阅成功，下个月《金陵手记》见');
    });
  }


  /* ---------------- 非遗短片：自动播放 + 失败兜底 ---------------- */
  function initFilm() {
    var video = document.querySelector('.film-media video');
    if (!video) { return; }
    var media = video.closest('.film-media');

    function fail() {
      if (media) { media.classList.add('is-failed'); }
    }
    video.addEventListener('error', fail);
    var source = video.querySelector('source');
    if (source) { source.addEventListener('error', fail); }

    var playBtn = document.querySelector('.film-play');
    function markPlaying() { if (media) { media.classList.add('is-playing'); } }
    video.addEventListener('playing', markPlaying);
    if (playBtn) {
      playBtn.addEventListener('click', function () {
        video.muted = false;
        video.play();
        markPlaying();
      });
    }

    var p = video.play();
    if (p && typeof p.catch === 'function') {
      p.catch(function () { /* 浏览器禁止自动播放时保留海报与控制条 */ });
    }
    video.addEventListener('click', function () {
      video.muted = false;
      video.play();
    }, { once: true });
  }
  document.addEventListener('DOMContentLoaded', function () {
    initHero();
    initFeatured();
    initNews();
    initFilm();
  });
})();
