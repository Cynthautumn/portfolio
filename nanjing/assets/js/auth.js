/* 注册 / 登录：本地校验与登录态（数据存于浏览器 localStorage） */
(function () {
  'use strict';

  var RULES = {
    name: function (v) {
      if (!v) { return '请输入昵称'; }
      if (!/^[\u4e00-\u9fa5A-Za-z0-9_]{2,12}$/.test(v)) { return '昵称需为 2–12 个中英文、数字或下划线'; }
      return '';
    },
    phone: function (v) {
      if (!v) { return '请输入手机号'; }
      if (!/^1[3-9]\d{9}$/.test(v)) { return '手机号格式不正确，应为 11 位数字'; }
      return '';
    },
    email: function (v) {
      if (!v) { return '请输入邮箱'; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { return '邮箱格式不正确'; }
      return '';
    },
    password: function (v) {
      if (!v) { return '请输入密码'; }
      if (v.length < 8) { return '密码至少 8 位'; }
      if (!/[A-Za-z]/.test(v) || !/\d/.test(v)) { return '密码需同时包含字母与数字'; }
      return '';
    },
    confirm: function (v, form) {
      if (!v) { return '请再次输入密码'; }
      var pwd = form.querySelector('[name="password"]');
      if (pwd && v !== pwd.value) { return '两次输入的密码不一致'; }
      return '';
    }
  };

  function fieldOf(input) { return input.closest('.field'); }

  function setHint(input, message) {
    var field = fieldOf(input);
    if (!field) { return; }
    var hint = field.querySelector('.hint');
    field.classList.toggle('is-error', Boolean(message));
    if (hint) {
      hint.textContent = message || '';
      hint.classList.toggle('ok', !message);
      if (!message && input.value) { hint.textContent = '✓ 已通过校验'; }
    }
  }

  function validate(input, form, silent) {
    var rule = RULES[input.name];
    if (!rule) { return true; }
    var message = rule(input.value.trim(), form);
    if (!silent) { setHint(input, message); }
    return !message;
  }

  function scorePassword(v) {
    var s = 0;
    if (v.length >= 8) { s++; }
    if (/[A-Za-z]/.test(v) && /\d/.test(v)) { s++; }
    if (/[^A-Za-z0-9]/.test(v) || v.length >= 12) { s++; }
    return s;
  }

  /* ---------------- 注册 ---------------- */
  function initRegister() {
    var form = document.getElementById('registerForm');
    if (!form) { return; }

    var inputs = form.querySelectorAll('input[name]');
    inputs.forEach(function (input) {
      input.addEventListener('blur', function () { validate(input, form); });
      input.addEventListener('input', function () {
        var field = fieldOf(input);
        if (field && field.classList.contains('is-error')) { validate(input, form); }
        if (input.name === 'password') {
          var s = scorePassword(input.value);
          var meter = document.getElementById('strength');
          var label = document.getElementById('strengthLabel');
          meter.dataset.level = String(s);
          label.textContent = input.value ? ['', '强度：弱', '强度：中', '强度：强'][s] : '';
        }
        if (input.name === 'password') {
          var confirm = form.querySelector('[name="confirm"]');
          if (confirm && confirm.value) { validate(confirm, form); }
        }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      inputs.forEach(function (input) { if (!validate(input, form)) { ok = false; } });

      var agree = document.getElementById('regAgree');
      var alertBox = document.getElementById('regAlert');
      if (!agree.checked) {
        ok = false;
        alertBox.textContent = '请先阅读并勾选会员服务条款';
        alertBox.classList.add('is-on');
        alertBox.classList.remove('ok');
      } else {
        alertBox.classList.remove('is-on');
      }

      if (!ok) {
        var firstError = form.querySelector('.field.is-error input');
        if (firstError) { firstError.focus(); }
        return;
      }

      var data = {
        name: form.querySelector('[name="name"]').value.trim(),
        phone: form.querySelector('[name="phone"]').value.trim(),
        email: form.querySelector('[name="email"]').value.trim(),
        password: form.querySelector('[name="password"]').value
      };

      var result = window.JL.auth.register(data);
      if (!result.ok) {
        alertBox.textContent = result.msg;
        alertBox.classList.add('is-on');
        return;
      }

      alertBox.textContent = '注册成功，正在进入会员中心……';
      alertBox.classList.add('is-on', 'ok');
      window.JL.syncAuthLinks();

      var next = new URLSearchParams(window.location.search).get('next') || 'index.html';
      window.setTimeout(function () { window.location.href = next; }, 900);
    });
  }

  /* ---------------- 登录 ---------------- */
  function initLogin() {
    var form = document.getElementById('loginForm');
    if (!form) { return; }

    var inputs = form.querySelectorAll('input[name]');
    inputs.forEach(function (input) {
      input.addEventListener('blur', function () { validate(input, form); });
      input.addEventListener('input', function () {
        var field = fieldOf(input);
        if (field && field.classList.contains('is-error')) { validate(input, form); }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      inputs.forEach(function (input) { if (!validate(input, form)) { ok = false; } });

      var alertBox = document.getElementById('loginAlert');
      if (!ok) {
        alertBox.textContent = '请检查手机号与密码是否填写正确';
        alertBox.classList.add('is-on');
        var firstError = form.querySelector('.field.is-error input');
        if (firstError) { firstError.focus(); }
        return;
      }

      var phone = form.querySelector('[name="phone"]').value.trim();
      var password = form.querySelector('[name="password"]').value;
      var result = window.JL.auth.login(phone, password);

      if (!result.ok) {
        alertBox.textContent = result.msg;
        alertBox.classList.add('is-on');
        var pwdField = form.querySelector('[data-field="password"]');
        pwdField.classList.add('is-error');
        pwdField.querySelector('.hint').textContent = '手机号或密码不正确';
        pwdField.querySelector('.hint').classList.remove('ok');
        return;
      }

      alertBox.textContent = '登录成功，欢迎回来，' + result.user.name;
      alertBox.classList.add('is-on', 'ok');
      window.JL.syncAuthLinks();

      var next = new URLSearchParams(window.location.search).get('next') || 'index.html';
      window.setTimeout(function () { window.location.href = next; }, 800);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initRegister();
    initLogin();
  });
})();
