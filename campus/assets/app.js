/* =========================================================
   校园一卡通 · 数据驾驶舱（作品演示版）
   纯原生 JavaScript：数据可视化 / CSV 导入 / 资助审核 / 预警结案
   ========================================================= */
(function () {
  "use strict";

  var SEED = window.CAMPUS_DATA;
  var STORAGE_KEY = "campus-demo-v3";
  var PAGE_SIZE = 12;

  if (!SEED) {
    document.getElementById("app").innerHTML =
      '<div style="padding:60px;font-family:sans-serif">数据加载失败：请确认 assets/data.js 已正确引入。</div>';
    return;
  }

  var state = loadState();
  var page = document.body.getAttribute("data-page") || "dashboard";
  var ui = {
    consume: { page: 1, q: "", type: "" },
    aid: { page: 1, min: 0, max: 700, sort: "asc" },
    warn: { page: 1, status: "all", level: "" }
  };

  /* ---------------- storage ---------------- */
  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.meta && parsed.students && parsed.records) {
          return parsed;
        }
      }
    } catch (e) { /* ignore */ }
    var s = JSON.parse(JSON.stringify(SEED));
    s.meta.lastUpdated = s.meta.lastUpdated || "2024-10-26";
    return s;
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  function syncMeta() {
    state.meta.students = state.students.length;
    state.meta.records = state.students.reduce(function (a, s) { return a + s.count; }, 0);
    state.meta.totalAmount = round2(state.students.reduce(function (a, s) { return a + s.total; }, 0));
    state.meta.warningCount = state.warnings.length;
    state.meta.pendingAid = state.aid.filter(function (a) { return a.status === "pending"; }).length;
    state.meta.avgMonth = state.students.length ? round2(state.meta.totalAmount / state.students.length / 10) : 0;
    state.warnings.forEach(function (w) {
      var s = findStudent(w.no);
      if (s) w.name = s.name;
    });
    state.aid.forEach(function (a) {
      a.warnCount = state.warnings.filter(function (w) { return w.no === a.no; }).length;
    });
    updateShellMeta();
  }

  function updateShellMeta() {
    var warn = state.warnings.filter(function (w) { return w.status === "pending"; }).length;
    var aid = state.aid.filter(function (a) { return a.status === "pending"; }).length;
    var wb = document.querySelector('.nav a[href="warning.html"] .nav-badge');
    var ab = document.querySelector('.nav a[href="aid.html"] .nav-badge');
    if (wb) { wb.textContent = warn; wb.style.display = warn ? "" : "none"; }
    if (ab) { ab.textContent = aid; ab.style.display = aid ? "" : "none"; }
    var live = document.querySelector(".live-dot");
    if (live) live.textContent = "数据更新至 " + (state.meta.lastUpdated || "2024-10-26");
  }
  syncMeta();

  /* ---------------- helpers ---------------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function round2(n) { return Math.round((Number(n) + Number.EPSILON) * 100) / 100; }
  function num(n) { return Number(n || 0).toLocaleString("zh-CN"); }
  function money(n) {
    return "¥" + Number(n || 0).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function pct(n) { return (Number(n || 0) * 100).toFixed(1) + "%"; }
  function esc(v) {
    return String(v === null || v === undefined ? "" : v).replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  }
  function findStudent(no) {
    for (var i = 0; i < state.students.length; i++) if (state.students[i].no === no) return state.students[i];
    return null;
  }
  function findWarningByRecord(id) {
    for (var i = 0; i < state.warnings.length; i++) if (state.warnings[i].recordId === id) return state.warnings[i];
    return null;
  }
  function nextId(list, key) {
    return list.reduce(function (m, x) { return Math.max(m, Number(x[key]) || 0); }, 0) + 1;
  }
  function shortTime(t) { return t ? String(t).slice(5, 16) : "-"; }
  function statusText(s) { return s === "approved" ? "已通过" : s === "rejected" ? "已驳回" : "待审核"; }
  function statusBadge(s) {
    if (s === "approved") return '<span class="badge ok">已通过</span>';
    if (s === "rejected") return '<span class="badge muted">已驳回</span>';
    return '<span class="badge mid">待审核</span>';
  }
  function riskBadge(level) {
    return level === "高风险"
      ? '<span class="badge high">高风险</span>'
      : '<span class="badge mid">中风险</span>';
  }

  var ICONS = {
    dashboard: '<rect x="3" y="3" width="7" height="7" rx="1.6"/><rect x="14" y="3" width="7" height="7" rx="1.6"/><rect x="3" y="14" width="7" height="7" rx="1.6"/><rect x="14" y="14" width="7" height="7" rx="1.6"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z"/><path d="M9 8h6M9 12h6"/>',
    wallet: '<rect x="3" y="6" width="18" height="14" rx="2.5"/><path d="M3 10h18"/><path d="M16 15h2"/>',
    alert: '<path d="M10.3 3.7 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0z"/><path d="M12 9v4"/><circle cx="12" cy="17" r=".8" fill="currentColor" stroke="none"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><circle cx="12" cy="8" r=".8" fill="currentColor" stroke="none"/>',
    reset: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>',
    left: '<path d="M15 18l-6-6 6-6"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>',
    upload: '<path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
    download: '<path d="M12 4v12"/><path d="m7 11 5 5 5-5"/><path d="M4 20h16"/>',
    check: '<path d="m5 12 4.5 4.5L19 7"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/><path d="M16 5.2a3 3 0 0 1 0 5.6"/><path d="M18.5 14.5c1.8.8 3 2.5 3 4.5"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    shield: '<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8 7.5 9.5 4.3-1.5 7.5-4.9 7.5-9.5V6L12 3z"/><path d="m9 12 2 2 4-4"/>',
    spark: '<path d="m12 3 1.6 4.8L18 9.5l-4.4 1.7L12 16l-1.6-4.8L6 9.5l4.4-1.7L12 3z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z"/>',
    file: '<path d="M6 2h8l4 4v16H6V2z"/><path d="M14 2v5h5"/><path d="M9 13h6M9 17h6"/>',
    bolt: '<path d="m13 2-9 12h7l-1 8 9-12h-7l1-8z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    arrowRight: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
    refresh: '<path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 12A9 9 0 0 1 18.5 5.8L21 8"/><path d="M3 21v-5h5M21 3v5h-5"/>'
  };
  function icon(name, cls) {
    return '<svg class="' + (cls || "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || "") + "</svg>";
  }

  function toast(msg, type) {
    var wrap = $(".toast-wrap");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "toast-wrap";
      document.body.appendChild(wrap);
    }
    var el = document.createElement("div");
    el.className = "toast " + (type || "info");
    el.innerHTML = icon(type === "err" ? "alert" : type === "ok" ? "check" : "info") + "<div>" + esc(msg) + "</div>";
    wrap.appendChild(el);
    setTimeout(function () {
      el.style.opacity = "0";
      el.style.transform = "translateY(6px)";
      el.style.transition = ".2s";
      setTimeout(function () { el.remove(); }, 220);
    }, 3200);
  }

  function openModal(title, body, actions) {
    var wrap = document.createElement("div");
    wrap.className = "modal-wrap";
    var acts = actions && actions.length ? actions : [{ label: "知道了", primary: true }];
    wrap.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true">' +
        '<div class="modal-head"><h3>' + esc(title) + '</h3><button class="icon-btn x" data-close aria-label="关闭">' + icon("close") + "</button></div>" +
        '<div class="modal-body">' + body + "</div>" +
        '<div class="modal-foot">' + acts.map(function (a, i) {
          return '<button class="btn ' + (a.primary ? "primary" : "ghost") + '" data-idx="' + i + '">' + esc(a.label) + "</button>";
        }).join("") + "</div>" +
      "</div>";
    document.body.appendChild(wrap);
    wrap.addEventListener("click", function (e) { if (e.target === wrap) wrap.remove(); });
    $("[data-close]", wrap).addEventListener("click", function () { wrap.remove(); });
    $$("[data-idx]", wrap).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var a = acts[Number(btn.getAttribute("data-idx"))];
        if (a && a.onClick) {
          var keep = a.onClick();
          if (keep === false) return;
        }
        wrap.remove();
      });
    });
    return wrap;
  }

  /* ---------------- shell ---------------- */
  var PAGE_META = {
    dashboard: { title: "系统工作台", crumb: "数据总览" },
    consume: { title: "消费数据管理", crumb: "数据接入" },
    aid: { title: "精准资助推荐", crumb: "资助审核" },
    warning: { title: "异常消费预警", crumb: "风险处置" }
  };

  function renderShell() {
    var meta = PAGE_META[page] || PAGE_META.dashboard;
    var pendingWarn = state.warnings.filter(function (w) { return w.status === "pending"; }).length;
    var pendingAid = state.aid.filter(function (a) { return a.status === "pending"; }).length;
    var nav = [
      { key: "dashboard", href: "index.html", label: "首页工作台", icon: "dashboard" },
      { key: "consume", href: "consume.html", label: "消费数据管理", icon: "receipt" },
      { key: "aid", href: "aid.html", label: "精准资助推荐", icon: "wallet", badge: pendingAid },
      { key: "warning", href: "warning.html", label: "异常消费预警", icon: "alert", badge: pendingWarn }
    ];
    var app = document.getElementById("app");
    app.innerHTML =
      '<div class="layout">' +
        '<div class="scrim" id="scrim"></div>' +
        '<aside class="sidebar" id="sidebar">' +
          '<a class="brand" href="index.html">' +
            '<span class="brand-mark">' + icon("dashboard") + "</span>" +
            '<span class="brand-text"><b>一卡通 · 数据驾驶舱</b><span>CAMPUS DATA</span></span>' +
          "</a>" +
          '<div class="nav-label">WORKSPACE</div>' +
          '<nav class="nav">' + nav.map(function (n) {
            return '<a href="' + n.href + '" class="' + (n.key === page ? "active" : "") + '">' +
              icon(n.icon) + "<span>" + n.label + "</span>" +
              (n.badge ? '<span class="nav-badge">' + n.badge + "</span>" : "") +
            "</a>";
          }).join("") + "</nav>" +
          '<div class="sidebar-foot">' +
            '<div class="demo-pill"><i></i> 演示模式 · 本地数据</div>' +
            '<button class="side-link" data-action="project-info">' + icon("info") + " 项目说明</button>" +
            '<a class="side-link" href="../index.html">' + icon("left") + " 返回作品集</a>" +
            '<button class="side-link danger" data-action="reset-demo">' + icon("reset") + " 重置演示数据</button>" +
          "</div>" +
        "</aside>" +
        '<div class="main">' +
          '<header class="topbar">' +
            '<button class="icon-btn menu-btn" data-action="toggle-menu" aria-label="打开菜单">' + icon("menu") + "</button>" +
            '<div class="crumb"><span>' + meta.crumb + "</span><b>" + meta.title + "</b></div>" +
            '<div class="top-actions">' +
              '<span class="live-dot">数据更新至 ' + esc(state.meta.lastUpdated || "2024-10-26") + "</span>" +
              '<button class="btn ghost sm" data-action="project-info">' + icon("info") + " 项目说明</button>" +
            "</div>" +
          "</header>" +
          '<main class="content" id="content"></main>' +
        "</div>" +
      "</div>";
  }

  function closeMenu() {
    var sb = $("#sidebar"); var sc = $("#scrim");
    if (sb) sb.classList.remove("open");
    if (sc) sc.classList.remove("show");
  }

  function projectInfo() {
    var m = state.meta;
    openModal("项目说明 · 校园一卡通数据平台",
      '<p>面向高校资助与校园安全场景，把一卡通消费流水转成两类可执行信号：<b>谁可能需要资助</b>、<b>哪笔消费可能异常</b>。</p>' +
      '<div class="info-grid">' +
        '<div><b>' + num(m.students) + '</b><span>覆盖学生</span></div>' +
        '<div><b>' + num(m.records) + '</b><span>消费流水</span></div>' +
        '<div><b>' + money(m.totalAmount) + '</b><span>消费总额</span></div>' +
        '<div><b>' + num(m.warningCount) + '</b><span>命中预警</span></div>' +
      "</div>" +
      "<h4>业务链路</h4>" +
      "<ul><li><b>数据接入：</b>CSV 流水导入，自动识别 UTF-8 / GBK 编码，校验字段并清洗异常行。</li>" +
      "<li><b>资助筛选：</b>按学生聚合月均消费，支持区间阈值与排序，生成候选名单并完成审核闭环。</li>" +
      "<li><b>风险识别：</b>规则引擎识别「单笔大额且超过个人均值 3 倍」与「23:00–05:00 非营业时段刷卡」。</li>" +
      "<li><b>行为画像：</b>在资助名单中关联预警记录，提示审核人员先核查风险再发放。</li></ul>" +
      "<h4>技术实现</h4>" +
      '<div class="tech-row"><span>Python</span><span>Flask</span><span>SQLite</span><span>Pandas</span><span>SQL 聚合</span><span>HTML5</span><span>CSS3</span><span>原生 JavaScript</span></div>' +
      '<p style="margin-top:10px">原始系统为 Flask + SQLite + Pandas；本页是保留全部交互的纯静态演示版，数据已脱敏并内置在浏览器中，审核/结案操作只写入本地 localStorage，不会影响真实数据。</p>' +
      "<h4>演示提示</h4>" +
      "<ul><li>消费数据页可上传 CSV，或点击「注入 3 条演示异常」快速看到预警规则生效。</li>" +
      "<li>资助页调整区间后点击「执行计算」，可新增候选并审批。</li>" +
      "<li>预警页可对待处理记录执行结案。</li></ul>",
      [{ label: "进入演示", primary: true }]
    );
  }

  function resetDemo() {
    openModal("重置演示数据",
      "<p>将清除浏览器里保存的审核、结案和导入记录，恢复到初始演示数据。原始项目文件不会受到影响。</p>",
      [
        { label: "取消" },
        { label: "确认重置", primary: true, onClick: function () {
          try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
          location.reload();
        } }
      ]
    );
  }

  /* ---------------- charts ---------------- */
  function niceMax(v) {
    if (v <= 0) return 100;
    var step = v <= 1000 ? 200 : v <= 5000 ? 500 : v <= 10000 ? 1000 : 2000;
    return Math.ceil(v / step) * step;
  }
  function smoothPath(pts) {
    var d = "M " + pts[0].x.toFixed(2) + " " + pts[0].y.toFixed(2);
    for (var i = 1; i < pts.length; i++) {
      var p0 = pts[i - 1], p1 = pts[i], cx = (p0.x + p1.x) / 2;
      d += " C " + cx.toFixed(2) + " " + p0.y.toFixed(2) + ", " + cx.toFixed(2) + " " + p1.y.toFixed(2) + ", " + p1.x.toFixed(2) + " " + p1.y.toFixed(2);
    }
    return d;
  }
  function trendChart(data) {
    if (!data || !data.length) return '<div class="chart-empty">暂无趋势数据</div>';
    var W = 760, H = 250, L = 48, R = 16, T = 18, B = 34;
    var vals = data.map(function (d) { return Number(d.amount) || 0; });
    var max = niceMax(Math.max.apply(null, vals));
    var n = data.length;
    var x = function (i) { return L + (W - L - R) * i / Math.max(1, n - 1); };
    var y = function (v) { return T + (H - T - B) * (1 - v / max); };
    var pts = vals.map(function (v, i) { return { x: x(i), y: y(v) }; });
    var line = smoothPath(pts);
    var area = line + " L " + x(n - 1).toFixed(2) + " " + (H - B) + " L " + x(0).toFixed(2) + " " + (H - B) + " Z";
    var grid = "";
    for (var i = 0; i <= 4; i++) {
      var gy = T + (H - T - B) * i / 4;
      var gv = max * (1 - i / 4);
      grid += '<line class="grid-line" x1="' + L + '" y1="' + gy.toFixed(2) + '" x2="' + (W - R) + '" y2="' + gy.toFixed(2) + '"/>' +
        '<text class="axis-text" x="' + (L - 9) + '" y="' + (gy + 3).toFixed(2) + '" text-anchor="end">' + (gv >= 1000 ? (gv / 1000).toFixed(1) + "k" : Math.round(gv)) + "</text>";
    }
    var xlabels = "";
    data.forEach(function (d, i) {
      if (i % 5 === 0 || i === n - 1) {
        xlabels += '<text class="axis-text" x="' + x(i).toFixed(2) + '" y="' + (H - 10) + '" text-anchor="middle">' + esc(d.date.slice(5)) + "</text>";
      }
    });
    var dots = pts.map(function (p, i) {
      if (i !== n - 1 && i % 5 !== 0) return "";
      return '<circle cx="' + p.x.toFixed(2) + '" cy="' + p.y.toFixed(2) + '" r="' + (i === n - 1 ? 4 : 2.6) + '" fill="#fff" stroke="#2563eb" stroke-width="2"><title>' + esc(data[i].date) + " · " + money(data[i].amount) + "</title></circle>";
    }).join("");
    return '<svg class="chart-svg" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="近30天消费趋势">' +
      '<defs><linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2563eb" stop-opacity=".22"/><stop offset="1" stop-color="#2563eb" stop-opacity="0"/></linearGradient></defs>' +
      grid +
      '<path d="' + area + '" fill="url(#trendFill)"/>' +
      '<path d="' + line + '" fill="none" stroke="#2563eb" stroke-width="2.4" stroke-linecap="round"/>' +
      dots + xlabels +
      "</svg>";
  }

  function histChart() {
    var bins = [
      { label: "500-600", min: 500, max: 600, color: "#2563eb" },
      { label: "600-700", min: 600, max: 700, color: "#0ea5e9" },
      { label: "700-1000", min: 700, max: 1000, color: "#cbd5e1" },
      { label: "1000-1200", min: 1000, max: 1200, color: "#cbd5e1" },
      { label: "1200-1300", min: 1200, max: 1300.01, color: "#d97706" }
    ];
    bins.forEach(function (b) {
      b.count = state.students.filter(function (s) { return s.monthAvg >= b.min && s.monthAvg < b.max; }).length;
    });
    var W = 380, H = 230, L = 30, R = 12, T = 26, B = 42;
    var max = Math.max.apply(null, bins.map(function (b) { return b.count; })) || 1;
    var bw = (W - L - R) / bins.length;
    var bars = bins.map(function (b, i) {
      var h = (H - T - B) * (b.count / max);
      var x = L + bw * i + 7;
      var y = H - B - h;
      return '<rect x="' + x.toFixed(2) + '" y="' + y.toFixed(2) + '" width="' + (bw - 14).toFixed(2) + '" height="' + Math.max(2, h).toFixed(2) + '" rx="5" fill="' + b.color + '" opacity="' + (b.count ? 1 : .45) + '"><title>' + b.label + " 元 · " + b.count + " 人</title></rect>" +
        '<text class="axis-text" x="' + (x + (bw - 14) / 2).toFixed(2) + '" y="' + (y - 6).toFixed(2) + '" text-anchor="middle" font-weight="700" fill="#334155">' + b.count + "</text>" +
        '<text class="axis-text" x="' + (x + (bw - 14) / 2).toFixed(2) + '" y="' + (H - 20) + '" text-anchor="middle">' + b.label.replace("-", "–") + "</text>";
    }).join("");
    return '<svg class="chart-svg" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="月均消费分布">' +
      '<line class="grid-line" x1="' + L + '" y1="' + (H - B) + '" x2="' + (W - R) + '" y2="' + (H - B) + '"/>' +
      bars +
      '<text class="axis-text" x="' + L + '" y="14">人数</text>' +
      "</svg>";
  }

  /* ---------------- dashboard ---------------- */
  function renderDashboard() {
    var m = state.meta;
    var pendingWarn = state.warnings.filter(function (w) { return w.status === "pending"; }).length;
    var highRisk = state.warnings.filter(function (w) { return w.status === "pending" && w.level === "高风险"; }).length;
    var pendingAid = state.aid.filter(function (a) { return a.status === "pending"; }).length;
    var avgSingle = m.records ? m.totalAmount / m.records : 0;
    var recent = state.warnings.slice().sort(function (a, b) { return a.time < b.time ? 1 : -1; }).slice(0, 4);
    var aidPending = state.aid.filter(function (a) { return a.status === "pending"; }).sort(function (a, b) { return a.monthAvg - b.monthAvg; });
    var aidTop = aidPending.filter(function (a) { return a.type === "走读"; }).slice(0, 3)
      .concat(aidPending.filter(function (a) { return a.type === "住读"; }).slice(0, 2))
      .sort(function (a, b) { return a.monthAvg - b.monthAvg; });

    var content = $("#content");
    content.innerHTML =
      '<div class="page-head">' +
        "<div><h1>数据驾驶舱</h1><p>把 " + num(m.records) + " 条校园一卡通流水，变成可解释的资助依据与风险信号。当前为免登录演示模式，所有操作仅在浏览器本地生效。</p></div>" +
        '<div class="head-actions"><span class="chip green">● 数据已脱敏</span><span class="chip">免登录体验</span></div>' +
      "</div>" +
      '<div class="kpi-grid">' +
        kpi("users", "覆盖学生", num(m.students), "人", "10 个月", "blue") +
        kpi("receipt", "消费流水", num(m.records), "条", "日均 " + num(Math.round(m.records / 300)) + " 笔", "cyan") +
        kpi("wallet", "消费总额", "¥" + (m.totalAmount / 10000).toFixed(2), "万", "人均 " + money(m.avgMonth), "green") +
        kpi("alert", "待处理预警", num(pendingWarn), "条", "高风险 " + highRisk, "red") +
        kpi("file", "待审核资助", num(pendingAid), "人", "低消费候选", "amber") +
      "</div>" +
      '<div class="grid grid-8-4" style="margin-bottom:18px">' +
        '<section class="card">' +
          '<div class="card-head"><div><h3>近 30 天消费趋势</h3><p>按日聚合消费金额，展示学期内的波动</p></div><div class="head-right chart-legend"><span><i style="background:#2563eb"></i>消费金额</span></div></div>' +
          '<div class="chart-wrap">' + trendChart(state.daily) + "</div>" +
        "</section>" +
        '<section class="card">' +
          '<div class="card-head"><div><h3>月均消费分布</h3><p>资助筛选的核心依据</p></div><span class="chip blue">≤700 元</span></div>' +
          '<div class="chart-wrap">' + histChart() + "</div>" +
          '<div class="tiny" style="margin-top:4px">共 ' + num(state.students.filter(function (s) { return s.monthAvg < 700; }).length) + " 人月均低于 700 元；建议结合走读/住读身份二次校准。</div>" +
        "</section>" +
      "</div>" +
      '<div class="grid grid-7-5" style="margin-bottom:18px">' +
        '<section class="card table-card" style="box-shadow:var(--shadow-sm)">' +
          '<div class="table-head"><div><h3>最近预警</h3><p>规则引擎命中的异常消费</p></div><a class="btn ghost sm" href="warning.html">查看全部 ' + icon("arrowRight") + "</a></div>" +
          '<div class="table-scroll"><table><thead><tr><th>学生</th><th>预警类型</th><th>风险</th><th>时间</th><th>状态</th></tr></thead><tbody>' +
            (recent.length ? recent.map(function (w) {
              return "<tr><td><b>" + esc(w.name) + '</b><span class="sub">' + esc(w.no) + "</span></td><td>" + esc(w.type) + "</td><td>" + riskBadge(w.level) + "</td><td class=\"nowrap\">" + esc(shortTime(w.time)) + "</td><td>" + (w.status === "resolved" ? '<span class="badge ok">已结案</span>' : '<span class="badge mid">待处理</span>') + "</td></tr>";
            }).join("") : '<tr class="empty-row"><td colspan="5">暂无预警记录</td></tr>') +
          "</tbody></table></div>" +
        "</section>" +
        '<section class="card">' +
          '<div class="card-head"><div><h3>资助候选 Top 5</h3><p>按月均消费从低到高</p></div><a class="btn ghost sm" href="aid.html">去审核 ' + icon("arrowRight") + "</a></div>" +
          '<div class="mini-list">' + (aidTop.length ? aidTop.map(function (a) {
            return '<div class="mini-row"><span class="avatar">' + esc(a.name.slice(0, 1)) + '</span><div class="meta"><b>' + esc(a.name) + "</b><span>" + esc(a.no) + " · " + esc(a.type) + '</span></div><div class="right"><b>' + money(a.monthAvg) + "</b><span>/ 月</span></div></div>";
          }).join("") : '<div class="empty">暂无待审核候选</div>') + "</div>" +
        "</section>" +
      "</div>" +
      '<div class="grid grid-3">' +
        insight("spark", "80%", "学生月均消费低于 800 元", "仅看消费总额容易把「走读只吃午餐」误判为贫困，系统保留身份字段供人工复核。") +
        insight("clock", "1 笔", "非营业时段刷卡", "23:00–05:00 的刷卡会被自动标记为中风险，提醒核实设备延迟或卡片遗失。") +
        insight("shield", "2 条", "风险规则命中", "大额规则要求同时满足「单笔 > 50 元」与「超过个人均值 3 倍」，降低误报。") +
      "</div>";
  }

  function kpi(ic, label, value, unit, note, tone) {
    var map = {
      blue: ["#eff6ff", "#1d4ed8"],
      cyan: ["#ecfeff", "#0891b2"],
      green: ["#ecfdf5", "#047857"],
      red: ["#fef2f2", "#b91c1c"],
      amber: ["#fffbeb", "#b45309"]
    };
    var c = map[tone] || map.blue;
    return '<div class="kpi" style="--tint:' + c[0] + ";--tone:" + c[1] + '">' +
      '<div class="kpi-top"><span class="kpi-icon" title="' + esc(note) + '">' + icon(ic) + "</span></div>" +
      '<div class="kpi-value">' + value + "<small>" + unit + "</small></div>" +
      '<div class="kpi-label">' + esc(label) + "</div></div>";
  }
  function insight(ic, big, title, text) {
    return '<div class="card insight"><span class="ico">' + icon(ic) + "</span><div><b><span class=\"big\">" + big + "</span>" + esc(title) + "</b><p>" + esc(text) + "</p></div></div>";
  }

  /* ---------------- consume ---------------- */
  function renderConsume() {
    var m = state.meta;
    var avg = m.records ? m.totalAmount / m.records : 0;
    $("#content").innerHTML =
      '<div class="page-head">' +
        "<div><h1>消费数据管理</h1><p>导入一卡通流水，系统会自动清洗、聚合，并按规则生成异常预警。演示版在浏览器内完成解析，不上传任何文件。</p></div>" +
        '<div class="head-actions"><button class="btn ghost" id="downloadTpl">' + icon("download") + ' 下载 CSV 模板</button><button class="btn soft" id="injectDemo">' + icon("bolt") + " 注入 3 条演示异常</button></div>" +
      "</div>" +
      '<div class="upload-grid">' +
        '<div class="card">' +
          '<div class="dropzone" id="dropzone">' +
            '<span class="up-icon">' + icon("upload") + "</span>" +
            "<b>拖拽 CSV 文件到这里，或点击选择文件</b>" +
            "<span>支持 UTF-8 / GBK 编码 · 自动识别表头 · 单文件建议 ≤ 5 MB</span>" +
            "<code>student_no, consume_time, amount, location, type</code>" +
            '<input type="file" id="csvFile" accept=".csv,text/csv" hidden>' +
          "</div>" +
        "</div>" +
        '<div class="card upload-side">' +
          "<h4>导入后会发生什么？</h4>" +
          "<p>逐行校验学号、时间与金额；写入流水后更新学生的月均消费，并立即执行两条预警规则。</p>" +
          '<div class="code-block">2024001,2024-10-27 12:30:00,15.80,一食堂,餐饮<br>2024088,2024-10-27 02:18:00,96.50,校园超市,购物</div>' +
          '<p class="tiny">提示：导入数据只保存在当前浏览器，刷新不会丢失；重置演示数据可恢复初始状态。</p>' +
        "</div>" +
      "</div>" +
      '<div class="stat-strip">' +
        stat("累计流水", num(m.records), "条") +
        stat("消费总额", money(m.totalAmount), "") +
        stat("覆盖学生", num(m.students), "人") +
        stat("平均客单价", money(avg), "/ 笔") +
      "</div>" +
      '<section class="card table-card">' +
        '<div class="table-head"><div><h3>消费流水</h3><p>按时间倒序，展示最近导入与历史记录</p></div>' +
          '<div class="head-right"><div class="search-wrap">' + icon("search") + '<input class="input search" id="q" placeholder="搜索学号 / 姓名" value="' + esc(ui.consume.q) + '"></div>' +
          '<select class="select" id="typeFilter"><option value="">全部类型</option><option value="餐饮"' + (ui.consume.type === "餐饮" ? " selected" : "") + ">餐饮</option><option value=\"购物\"" + (ui.consume.type === "购物" ? " selected" : "") + ">购物</option></select></div>" +
        "</div>" +
        '<div class="table-scroll"><table><thead><tr><th>时间</th><th>学号</th><th>姓名</th><th>地点</th><th>类型</th><th>金额</th><th>风险</th></tr></thead><tbody id="recordBody"></tbody></table></div>' +
        '<div class="table-foot"><span class="count" id="recordCount"></span><div class="pager"><button id="prevPage">' + icon("left") + '</button><span id="pageInfo"></span><button id="nextPage">' + icon("arrowRight") + "</button></div></div>" +
      "</section>";

    bindConsume();
    updateConsumeTable();
  }

  function stat(label, value, unit) {
    return '<div class="stat"><span>' + esc(label) + "</span><b>" + value + (unit ? "<small> " + esc(unit) + "</small>" : "") + "</b></div>";
  }

  function bindConsume() {
    var dz = $("#dropzone");
    var file = $("#csvFile");
    dz.addEventListener("click", function () { file.click(); });
    dz.addEventListener("dragover", function (e) { e.preventDefault(); dz.classList.add("drag"); });
    dz.addEventListener("dragleave", function () { dz.classList.remove("drag"); });
    dz.addEventListener("drop", function (e) {
      e.preventDefault(); dz.classList.remove("drag");
      if (e.dataTransfer.files && e.dataTransfer.files[0]) handleCsvFile(e.dataTransfer.files[0]);
    });
    file.addEventListener("change", function () {
      if (file.files && file.files[0]) handleCsvFile(file.files[0]);
      file.value = "";
    });
    $("#downloadTpl").addEventListener("click", downloadTemplate);
    $("#injectDemo").addEventListener("click", injectDemo);
    $("#q").addEventListener("input", function (e) { ui.consume.q = e.target.value; ui.consume.page = 1; updateConsumeTable(); });
    $("#typeFilter").addEventListener("change", function (e) { ui.consume.type = e.target.value; ui.consume.page = 1; updateConsumeTable(); });
    $("#prevPage").addEventListener("click", function () { if (ui.consume.page > 1) { ui.consume.page--; updateConsumeTable(); } });
    $("#nextPage").addEventListener("click", function () { ui.consume.page++; updateConsumeTable(); });
  }

  function updateConsumeTable() {
    var q = ui.consume.q.trim().toLowerCase();
    var list = state.records.filter(function (r) {
      if (q && r.no.toLowerCase().indexOf(q) < 0 && r.name.toLowerCase().indexOf(q) < 0) return false;
      if (ui.consume.type && r.type !== ui.consume.type) return false;
      return true;
    });
    var totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (ui.consume.page > totalPages) ui.consume.page = totalPages;
    var start = (ui.consume.page - 1) * PAGE_SIZE;
    var rows = list.slice(start, start + PAGE_SIZE);
    var body = $("#recordBody");
    body.innerHTML = rows.length ? rows.map(function (r) {
      var w = findWarningByRecord(r.id);
      return "<tr><td class=\"nowrap\">" + esc(r.time) + "</td><td>" + esc(r.no) + "</td><td>" + esc(r.name) + "</td><td>" + esc(r.location) + "</td><td><span class=\"chip\">" + esc(r.type) + "</span></td><td class=\"amount" + (r.amount >= 50 ? " big" : "") + "\">" + money(r.amount) + "</td><td>" + (w ? '<span class="badge ' + (w.level === "高风险" ? "high" : "mid") + '">命中预警</span>' : '<span class="badge ok">正常</span>') + "</td></tr>";
    }).join("") : '<tr class="empty-row"><td colspan="7">没有匹配的流水，试试清空搜索条件</td></tr>';
    $("#recordCount").textContent = "共 " + num(list.length) + " 条" + (list.length !== state.records.length ? "（已筛选）" : "");
    $("#pageInfo").textContent = ui.consume.page + " / " + totalPages;
    $("#prevPage").disabled = ui.consume.page <= 1;
    $("#nextPage").disabled = ui.consume.page >= totalPages;
  }

  function downloadTemplate() {
    var csv = "\uFEFFstudent_no,consume_time,amount,location,type\n2024001,2024-10-27 12:30:00,15.80,一食堂,餐饮\n2024088,2024-10-27 02:18:00,96.50,校园超市,购物\n";
    var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "consume_template.csv";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    toast("模板已下载，可填入自己的流水后导入", "ok");
  }

  function decodeBuffer(buf) {
    var text = new TextDecoder("utf-8", { fatal: false }).decode(buf);
    if (text.indexOf("\uFFFD") >= 0) {
      try { text = new TextDecoder("gbk").decode(buf); } catch (e) { /* ignore */ }
    }
    return text.replace(/^\uFEFF/, "");
  }

  function splitCsvLine(line) {
    var out = [], cur = "", quote = false;
    for (var i = 0; i < line.length; i++) {
      var c = line[i];
      if (c === '"') {
        if (quote && line[i + 1] === '"') { cur += '"'; i++; }
        else quote = !quote;
      } else if (c === "," && !quote) { out.push(cur); cur = ""; }
      else cur += c;
    }
    out.push(cur);
    return out.map(function (s) { return s.trim(); });
  }

  function parseCsv(text) {
    var lines = text.split(/\r?\n/).filter(function (l) { return l.trim().length; });
    if (lines.length < 2) throw new Error("文件内容为空，至少需要表头 + 1 行数据");
    var aliases = {
      "学号": "student_no", "student_no": "student_no", "studentno": "student_no",
      "消费时间": "consume_time", "consume_time": "consume_time", "time": "consume_time",
      "金额": "amount", "amount": "amount",
      "地点": "location", "location": "location",
      "类型": "type", "type": "type"
    };
    var header = splitCsvLine(lines[0]).map(function (h) { return aliases[h.toLowerCase()] || aliases[h] || h.toLowerCase(); });
    var idx = {};
    header.forEach(function (h, i) { idx[h] = i; });
    ["student_no", "consume_time", "amount"].forEach(function (k) {
      if (idx[k] === undefined) throw new Error("缺少必需字段：" + k + "（可用中文表头：学号 / 消费时间 / 金额）");
    });
    var rows = [], skipped = 0;
    for (var i = 1; i < lines.length; i++) {
      var cells = splitCsvLine(lines[i]);
      var no = (cells[idx.student_no] || "").trim();
      var time = (cells[idx.consume_time] || "").trim();
      var amount = Number(cells[idx.amount]);
      var location = idx.location !== undefined ? (cells[idx.location] || "").trim() : "未知地点";
      var type = idx.type !== undefined ? (cells[idx.type] || "").trim() : "餐饮";
      if (!no || !time || !isFinite(amount) || amount <= 0 || !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(time)) { skipped++; continue; }
      if (time.length === 16) time += ":00";
      rows.push({ no: no, time: time, amount: round2(amount), location: location || "未知地点", type: type || "其他" });
    }
    if (!rows.length) throw new Error("没有解析到有效数据，请检查时间格式（YYYY-MM-DD HH:mm:ss）");
    return { rows: rows, skipped: skipped };
  }

  function handleCsvFile(file) {
    if (!/\.csv$/i.test(file.name)) { toast("请选择 .csv 文件", "err"); return; }
    if (file.size > 5 * 1024 * 1024) { toast("文件超过 5 MB，请拆分后再导入", "err"); return; }
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var text = decodeBuffer(reader.result);
        var parsed = parseCsv(text);
        applyImport(parsed.rows, parsed.skipped, "CSV 导入");
      } catch (e) {
        toast(e.message || "CSV 解析失败", "err");
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function applyImport(rows, skipped, source) {
    var inserted = 0, warnAdded = 0, unknown = 0;
    var maxRecord = state.records.reduce(function (m, r) { return Math.max(m, r.id); }, 0);
    var maxWarn = state.warnings.reduce(function (m, w) { return Math.max(m, w.id); }, 0);
    var avgMap = {};
    state.students.forEach(function (s) { avgMap[s.no] = s.avgSingle; });
    var lastTime = state.meta.lastUpdated || "2024-10-26";

    rows.forEach(function (r) {
      var s = findStudent(r.no);
      if (!s) { unknown++; return; }
      inserted++;
      var rid = ++maxRecord;
      var rec = { id: rid, no: s.no, name: s.name, time: r.time, amount: r.amount, location: r.location, type: r.type };
      state.records.unshift(rec);

      s.total = round2(s.total + r.amount);
      s.count += 1;
      s.avgSingle = round2(s.total / s.count);
      s.monthAvg = round2(s.total / 10);
      s.lastTime = r.time;
      if (r.time > lastTime) lastTime = r.time;

      var mk = r.time.slice(0, 7);
      var mm = state.monthly.filter(function (x) { return x.month === mk; })[0];
      if (mm) { mm.amount = round2(mm.amount + r.amount); mm.count++; }
      else state.monthly.push({ month: mk, amount: r.amount, count: 1 });

      var hour = Number(r.time.slice(11, 13));
      var beforeAvg = avgMap[s.no] || s.avgSingle;
      if (r.amount > 50 && r.amount > beforeAvg * 3) {
        state.warnings.unshift({ id: ++maxWarn, no: s.no, name: s.name, recordId: rid, type: "异常大额消费（疑似盗刷）", level: "高风险", time: r.time, amount: r.amount, location: r.location, status: "pending" });
        warnAdded++;
      }
      if (hour >= 23 || hour <= 5) {
        state.warnings.unshift({ id: ++maxWarn, no: s.no, name: s.name, recordId: rid, type: "非营业时段刷卡（请核实）", level: "中风险", time: r.time, amount: r.amount, location: r.location, status: "pending" });
        warnAdded++;
      }
    });

    state.meta.lastUpdated = lastTime;
    state.records = state.records.slice(0, 1200);
    syncMeta();
    saveState();
    ui.consume.page = 1;

    var msg = "<p>" + esc(source) + "完成：成功写入 <b>" + inserted + "</b> 条流水" +
      (skipped ? "，跳过 <b>" + skipped + "</b> 条格式错误行" : "") +
      (unknown ? "，<b>" + unknown + "</b> 条学号不存在" : "") + "。</p>" +
      "<p>本次触发 <b>" + warnAdded + "</b> 条新预警，累计待处理 <b>" +
      state.warnings.filter(function (w) { return w.status === "pending"; }).length + "</b> 条。</p>" +
      '<p class="tiny">数据已写入浏览器本地，刷新后仍然保留；可在左下角重置演示数据。</p>';
    renderConsume();
    openModal("导入结果", msg, [{ label: "继续查看", primary: true }]);
    toast("已导入 " + inserted + " 条流水，触发 " + warnAdded + " 条预警", warnAdded ? "ok" : "info");
  }

  function injectDemo() {
    var demo = [
      { no: "2024088", time: "2024-10-27 02:18:00", amount: 96.5, location: "校园超市", type: "购物" },
      { no: "2024075", time: "2024-10-27 03:05:00", amount: 18.0, location: "一食堂", type: "餐饮" },
      { no: "2024054", time: "2024-10-27 16:40:00", amount: 72.0, location: "校园超市", type: "购物" }
    ];
    applyImport(demo, 0, "演示异常注入");
  }

  /* ---------------- aid ---------------- */
  function renderAid() {
    var pending = state.aid.filter(function (a) { return a.status === "pending"; }).length;
    var approved = state.aid.filter(function (a) { return a.status === "approved"; }).length;
    var rejected = state.aid.filter(function (a) { return a.status === "rejected"; }).length;
    var linked = state.aid.filter(function (a) { return a.warnCount > 0; }).length;
    $("#content").innerHTML =
      '<div class="page-head">' +
        "<div><h1>精准资助推荐</h1><p>以「月均消费 + 身份 + 行为画像」筛选资助候选人。调整区间后执行计算，新增候选会进入审核队列。</p></div>" +
        '<div class="head-actions"><span class="chip amber">规则：月均消费低于阈值</span></div>' +
      "</div>" +
      '<section class="card filter-card">' +
        '<div class="range-row">' +
          '<div class="field"><label>最低月均（元）</label><input class="input" id="minThreshold" type="number" min="0" step="10" value="' + ui.aid.min + '"></div>' +
          '<span class="sep">—</span>' +
          '<div class="field"><label>最高月均（元）</label><input class="input" id="maxThreshold" type="number" min="0" step="10" value="' + ui.aid.max + '"></div>' +
          '<div class="field"><label>排序方式</label><select class="select" id="sortOrder"><option value="asc"' + (ui.aid.sort === "asc" ? " selected" : "") + '>金额从低到高</option><option value="desc"' + (ui.aid.sort === "desc" ? " selected" : "") + ">金额从高到低</option></select></div>" +
          '<button class="btn primary" id="generateAid">' + icon("bolt") + " 执行计算</button>" +
          '<button class="btn ghost" id="resetFilter">重置区间</button>' +
        "</div>" +
        '<p class="tiny" style="margin-top:12px">计算口径：2024.01–2024.10 累计消费 ÷ 10 个月；当前为模拟数据，结果仅用于演示。</p>' +
      "</section>" +
      '<div class="aid-summary">' +
        '<span class="chip blue">候选总数 ' + state.aid.length + "</span>" +
        '<span class="chip amber">待审核 ' + pending + "</span>" +
        '<span class="chip green">已通过 ' + approved + "</span>" +
        '<span class="chip red">关联预警 ' + linked + "</span>" +
      "</div>" +
      '<section class="card table-card">' +
        '<div class="table-head"><div><h3>候选学生明细</h3><p>行为画像会提示该生是否有待处理预警</p></div><div class="head-right"><span class="chip">' + rejected + " 人已驳回</span></div></div>" +
        '<div class="table-scroll"><table><thead><tr><th>学号</th><th>姓名</th><th>身份</th><th>月均消费</th><th>行为画像</th><th>审核状态</th><th>操作</th></tr></thead><tbody id="aidBody"></tbody></table></div>' +
        '<div class="table-foot"><span class="count" id="aidCount"></span><div class="pager"><button id="aidPrev">' + icon("left") + '</button><span id="aidPageInfo"></span><button id="aidNext">' + icon("arrowRight") + "</button></div></div>" +
      "</section>" +
      '<div class="grid grid-2" style="margin-top:18px">' +
        '<section class="card"><div class="card-head"><div><h3>筛选逻辑</h3><p>从「消费能力」到「资助决策」</p></div></div><div class="rule-list">' +
          '<div class="rule"><span class="n">1</span><div><b>聚合月均消费</b><p>按学号汇总 10 个月流水，除以月数得到月均消费，避免单笔波动影响判断。</p></div></div>' +
          '<div class="rule"><span class="n">2</span><div><b>区间筛选与排序</b><p>支持设置最低/最高阈值，按金额升序优先关注消费能力最弱的学生。</p></div></div>' +
          '<div class="rule"><span class="n">3</span><div><b>行为画像复核</b><p>关联预警记录：有异常消费的学生先核查再发放，降低「骗补/盗刷」风险。</p></div></div>' +
        "</div></section>" +
        '<section class="card"><div class="card-head"><div><h3>审核概览</h3><p>当前队列状态</p></div></div>' +
          '<div style="display:flex;justify-content:space-between;font-size:11.5px;color:var(--muted);margin-bottom:8px"><span>审核进度</span><span>' + (state.aid.length ? Math.round((approved + rejected) / state.aid.length * 100) : 0) + "%</span></div>" +
          '<div class="progress"><i style="width:' + (state.aid.length ? Math.round((approved + rejected) / state.aid.length * 100) : 0) + '%"></i></div>' +
          '<div class="hr"></div>' +
          '<div class="mini-list">' +
            '<div class="mini-row"><span class="avatar" style="background:#fffbeb;color:#b45309">待</span><div class="meta"><b>待审核</b><span>需要人工确认</span></div><div class="right"><b>' + pending + "</b><span>人</span></div></div>" +
            '<div class="mini-row"><span class="avatar" style="background:#ecfdf5;color:#047857">通</span><div class="meta"><b>已通过</b><span>进入资助名单</span></div><div class="right"><b>' + approved + "</b><span>人</span></div></div>" +
            '<div class="mini-row"><span class="avatar" style="background:#fef2f2;color:#b91c1c">驳</span><div class="meta"><b>已驳回</b><span>不满足条件</span></div><div class="right"><b>' + rejected + "</b><span>人</span></div></div>" +
          "</div>" +
        "</section>" +
      "</div>";

    bindAid();
    updateAidTable();
  }

  function bindAid() {
    $("#generateAid").addEventListener("click", generateAid);
    $("#resetFilter").addEventListener("click", function () {
      ui.aid.min = 0; ui.aid.max = 700; ui.aid.sort = "asc"; ui.aid.page = 1; renderAid();
    });
    $("#aidPrev").addEventListener("click", function () { if (ui.aid.page > 1) { ui.aid.page--; updateAidTable(); } });
    $("#aidNext").addEventListener("click", function () { ui.aid.page++; updateAidTable(); });
  }

  function sortedAid() {
    return state.aid.slice().sort(function (a, b) {
      return ui.aid.sort === "asc" ? a.monthAvg - b.monthAvg : b.monthAvg - a.monthAvg;
    });
  }

  function updateAidTable() {
    var list = sortedAid();
    var totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (ui.aid.page > totalPages) ui.aid.page = totalPages;
    var start = (ui.aid.page - 1) * PAGE_SIZE;
    var rows = list.slice(start, start + PAGE_SIZE);
    $("#aidBody").innerHTML = rows.length ? rows.map(function (a) {
      var warn = a.warnCount > 0
        ? '<span class="badge high">' + icon("alert") + " " + a.warnCount + " 条预警</span>"
        : '<span class="badge ok">行为正常</span>';
      var type = a.type === "走读" ? '<span class="chip blue">走读</span>' : '<span class="chip violet">住读</span>';
      var actions = a.status === "pending"
        ? '<button class="btn sm primary" data-aid="' + a.id + '" data-status="approved">通过</button> <button class="btn sm danger-soft" data-aid="' + a.id + '" data-status="rejected">驳回</button>'
        : '<span class="tiny">已处理</span>';
      return "<tr><td>" + esc(a.no) + "</td><td><b>" + esc(a.name) + "</b></td><td>" + type + "</td><td class=\"amount\">" + money(a.monthAvg) + "</td><td>" + warn + "</td><td>" + statusBadge(a.status) + "</td><td class=\"nowrap\">" + actions + "</td></tr>";
    }).join("") : '<tr class="empty-row"><td colspan="7">暂无候选，调整区间后点击「执行计算」</td></tr>';
    $("#aidCount").textContent = "共 " + state.aid.length + " 名候选，当前第 " + ui.aid.page + " / " + totalPages + " 页";
    $("#aidPageInfo").textContent = ui.aid.page + " / " + totalPages;
    $("#aidPrev").disabled = ui.aid.page <= 1;
    $("#aidNext").disabled = ui.aid.page >= totalPages;
    $$("[data-aid]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = Number(btn.getAttribute("data-aid"));
        var status = btn.getAttribute("data-status");
        var item = state.aid.filter(function (x) { return x.id === id; })[0];
        if (!item) return;
        item.status = status;
        syncMeta(); saveState(); renderAid();
        toast(item.name + " 已" + (status === "approved" ? "通过资助审核" : "驳回"), status === "approved" ? "ok" : "info");
      });
    });
  }

  function generateAid() {
    var min = Number($("#minThreshold").value);
    var max = Number($("#maxThreshold").value);
    ui.aid.sort = $("#sortOrder").value;
    if (!isFinite(min) || !isFinite(max) || min < 0 || max <= min) { toast("请输入有效的区间：最低值需小于最高值", "err"); return; }
    ui.aid.min = min; ui.aid.max = max; ui.aid.page = 1;
    var existing = {};
    state.aid.forEach(function (a) { existing[a.no] = true; });
    var matches = state.students.filter(function (s) { return s.monthAvg >= min && s.monthAvg <= max; });
    var id = state.aid.reduce(function (m, a) { return Math.max(m, a.id); }, 0);
    var added = 0;
    matches.forEach(function (s) {
      if (existing[s.no]) return;
      state.aid.push({
        id: ++id, no: s.no, name: s.name, type: s.type, monthAvg: s.monthAvg,
        status: "pending", warnCount: state.warnings.filter(function (w) { return w.no === s.no; }).length,
        createTime: "2024-10-31 09:00:00"
      });
      added++;
    });
    syncMeta(); saveState(); renderAid();
    openModal("计算完成",
      "<p>当前区间 <b>" + money(min) + " – " + money(max) + "</b>，命中 <b>" + matches.length + "</b> 名学生。</p>" +
      "<p>其中新增候选 <b>" + added + "</b> 名，已在下方列表中等待审核。</p>" +
      '<p class="tiny">若新增为 0，说明该区间学生都已在候选队列中。可调整区间再次计算。</p>',
      [{ label: "查看名单", primary: true }]
    );
    toast(added ? "新增 " + added + " 名候选人" : "没有新增候选人", added ? "ok" : "info");
  }

  /* ---------------- warning ---------------- */
  function renderWarning() {
    var pending = state.warnings.filter(function (w) { return w.status === "pending"; }).length;
    var resolved = state.warnings.filter(function (w) { return w.status === "resolved"; }).length;
    var high = state.warnings.filter(function (w) { return w.level === "高风险"; }).length;
    var mid = state.warnings.filter(function (w) { return w.level === "中风险"; }).length;
    $("#content").innerHTML =
      '<div class="page-head">' +
        "<div><h1>异常消费预警</h1><p>规则引擎自动识别大额与深夜刷卡，支持筛选、核实与结案。演示版可注入异常流水，观察规则实时命中。</p></div>" +
        '<div class="head-actions"><button class="btn soft" id="warnInject">' + icon("bolt") + " 注入演示异常</button></div>" +
      "</div>" +
      '<div class="warn-stat">' +
        stat("预警总数", num(state.warnings.length), "条") +
        stat("待处理", num(pending), "条") +
        stat("高风险", num(high), "条") +
        stat("已结案", num(resolved), "条") +
      "</div>" +
      '<section class="card table-card">' +
        '<div class="table-head"><div><h3>预警记录</h3><p>按发生时间倒序</p></div><div class="head-right">' +
          '<div class="seg" id="statusSeg"><button data-status="all" class="' + (ui.warn.status === "all" ? "active" : "") + '">全部</button><button data-status="pending" class="' + (ui.warn.status === "pending" ? "active" : "") + '">待处理</button><button data-status="resolved" class="' + (ui.warn.status === "resolved" ? "active" : "") + '">已结案</button></div>' +
          '<select class="select" id="levelFilter"><option value="">全部风险</option><option value="高风险"' + (ui.warn.level === "高风险" ? " selected" : "") + ">高风险</option><option value=\"中风险\"" + (ui.warn.level === "中风险" ? " selected" : "") + ">中风险</option></select>" +
        "</div></div>" +
        '<div class="table-scroll"><table><thead><tr><th>学生</th><th>预警类型</th><th>风险等级</th><th>金额</th><th>发生时间</th><th>地点</th><th>状态</th><th>操作</th></tr></thead><tbody id="warnBody"></tbody></table></div>' +
        '<div class="table-foot"><span class="count" id="warnCount"></span><div class="pager"><button id="warnPrev">' + icon("left") + '</button><span id="warnPageInfo"></span><button id="warnNext">' + icon("arrowRight") + "</button></div></div>" +
      "</section>" +
      '<div class="grid grid-2" style="margin-top:18px">' +
        '<section class="card"><div class="card-head"><div><h3>预警规则</h3><p>两条规则独立命中，可同时触发</p></div></div><div class="rule-list">' +
          '<div class="rule"><span class="n">A</span><div><b>异常大额消费（疑似盗刷）</b><p>单笔金额 &gt; 50 元，且超过该生历史平均单笔消费的 3 倍，标记为高风险。</p></div></div>' +
          '<div class="rule"><span class="n">B</span><div><b>非营业时段刷卡（请核实）</b><p>刷卡时间在 23:00–05:00 之间，标记为中风险，提示核实设备延迟或卡片遗失。</p></div></div>' +
        "</div></section>" +
        '<section class="card"><div class="card-head"><div><h3>风险构成</h3><p>当前预警等级分布</p></div></div>' +
          '<div style="display:flex;justify-content:space-between;font-size:11.5px;color:var(--muted)"><span>高风险 ' + high + " 条</span><span>中风险 " + mid + " 条</span></div>" +
          '<div class="risk-bar"><i class="h" style="width:' + (state.warnings.length ? high / state.warnings.length * 100 : 0) + '%"></i><i class="m" style="width:' + (state.warnings.length ? mid / state.warnings.length * 100 : 0) + '%"></i></div>' +
          '<div class="hr"></div>' +
          '<p class="tiny">预警不是处罚结论，而是人工核实的起点。结案后会保留记录，便于后续审计与规则调优。</p>' +
          '<div style="margin-top:12px"><span class="chip green">已结案 ' + resolved + "</span> <span class=\"chip red\">待处理 " + pending + "</span></div>" +
        "</section>" +
      "</div>";

    bindWarning();
    updateWarnTable();
  }

  function bindWarning() {
    $("#warnInject").addEventListener("click", injectDemo);
    $("#levelFilter").addEventListener("change", function (e) { ui.warn.level = e.target.value; ui.warn.page = 1; updateWarnTable(); });
    $$("#statusSeg button").forEach(function (b) {
      b.addEventListener("click", function () {
        ui.warn.status = b.getAttribute("data-status");
        ui.warn.page = 1;
        $$("#statusSeg button").forEach(function (x) { x.classList.remove("active"); });
        b.classList.add("active");
        updateWarnTable();
      });
    });
    $("#warnPrev").addEventListener("click", function () { if (ui.warn.page > 1) { ui.warn.page--; updateWarnTable(); } });
    $("#warnNext").addEventListener("click", function () { ui.warn.page++; updateWarnTable(); });
  }

  function updateWarnTable() {
    var list = state.warnings.filter(function (w) {
      if (ui.warn.status !== "all" && w.status !== ui.warn.status) return false;
      if (ui.warn.level && w.level !== ui.warn.level) return false;
      return true;
    }).sort(function (a, b) { return a.time < b.time ? 1 : -1; });
    var totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (ui.warn.page > totalPages) ui.warn.page = totalPages;
    var start = (ui.warn.page - 1) * PAGE_SIZE;
    var rows = list.slice(start, start + PAGE_SIZE);
    $("#warnBody").innerHTML = rows.length ? rows.map(function (w) {
      return "<tr><td><b>" + esc(w.name) + '</b><span class="sub">' + esc(w.no) + "</span></td><td>" + esc(w.type) + "</td><td>" + riskBadge(w.level) + "</td><td class=\"amount\">" + money(w.amount) + "</td><td class=\"nowrap\">" + esc(w.time) + "</td><td>" + esc(w.location) + "</td><td>" + (w.status === "resolved" ? '<span class="badge ok">已结案</span>' : '<span class="badge mid">待处理</span>') + "</td><td>" + (w.status === "resolved" ? '<span class="tiny">已处理</span>' : '<button class="btn sm primary" data-warn="' + w.id + '">标记结案</button>') + "</td></tr>";
    }).join("") : '<tr class="empty-row"><td colspan="8">当前筛选下暂无预警记录</td></tr>';
    $("#warnCount").textContent = "共 " + list.length + " 条记录";
    $("#warnPageInfo").textContent = ui.warn.page + " / " + totalPages;
    $("#warnPrev").disabled = ui.warn.page <= 1;
    $("#warnNext").disabled = ui.warn.page >= totalPages;
    $$("[data-warn]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = Number(btn.getAttribute("data-warn"));
        var w = state.warnings.filter(function (x) { return x.id === id; })[0];
        if (!w) return;
        openModal("确认结案",
          "<p>将 <b>" + esc(w.name) + "（" + esc(w.no) + "）</b> 的预警标记为已结案。</p>" +
          '<div class="info-grid"><div><b>' + money(w.amount) + "</b><span>消费金额</span></div><div><b>" + esc(w.level) + "</b><span>风险等级</span></div></div>" +
          "<p class=\"tiny\">结案只改变处理状态，不会删除记录；建议先完成电话核实或现场确认。</p>",
          [
            { label: "取消" },
            { label: "确认结案", primary: true, onClick: function () {
              w.status = "resolved";
              syncMeta(); saveState(); renderWarning();
              toast("预警已结案", "ok");
            } }
          ]
        );
      });
    });
  }

  /* ---------------- global ---------------- */
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-action]");
    if (!t) return;
    var action = t.getAttribute("data-action");
    if (action === "toggle-menu") {
      var sb = $("#sidebar"); var sc = $("#scrim");
      sb.classList.add("open"); sc.classList.add("show");
    } else if (action === "project-info") {
      projectInfo();
    } else if (action === "reset-demo") {
      resetDemo();
    }
  });
  document.addEventListener("click", function (e) {
    if (e.target.id === "scrim") closeMenu();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      var m = document.querySelector(".modal-wrap");
      if (m) m.remove();
      closeMenu();
    }
  });

  /* ---------------- boot ---------------- */
  function boot() {
    renderShell();
    if (page === "consume") renderConsume();
    else if (page === "aid") renderAid();
    else if (page === "warning") renderWarning();
    else renderDashboard();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
