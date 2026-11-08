# 喻思诚 · 在线作品集

一个不依赖框架、不依赖 CDN 的静态作品集，包含两个可以直接交互的项目：

| 项目 | 入口 | 说明 |
|---|---|---|
| 校园一卡通消费精准资助与异常预警系统 | `campus/` | 15,939 条模拟流水；数据驾驶舱、CSV 导入、资助审核、异常预警 |
| 金陵造物 · 南京文创电商 | `nanjing/` | 1 首页 + 7 子页；原生 JS 购物车、筛选、表单校验、模拟结算 |

## 本地预览

直接双击 `index.html` 即可（校园一卡通与南京文创都使用相对路径）。

也可以双击 `preview.bat`，通过本地 HTTP 服务打开：

```text
http://localhost:8000
```

> 校园一卡通的审核、结案、CSV 导入只写入浏览器 localStorage；左下角「重置演示数据」可以恢复初始状态。

## 目录结构

```text
portfolio-site/
├─ index.html                 # 作品集首页
├─ resume.pdf                 # 一页简历（含作品集链接与二维码）
├─ resume.docx                # 简历可编辑版
├─ assets/
│  ├─ site.css / site.js      # 作品集样式与交互
│  ├─ favicon.svg
│  └─ img/                    # 项目截图、OG 封面
├─ campus/                    # 校园一卡通静态演示
│  ├─ index.html / consume.html / aid.html / warning.html
│  └─ assets/                 # 样式、数据、逻辑、图标
├─ nanjing/                   # 南京文创电商静态站
│  ├─ index.html / shop.html / detail.html / cart.html
│  ├─ orders.html / login.html / register.html / story.html / about.html
│  └─ assets/                 # 样式、数据、图片、短片、音频
├─ preview.bat                # 本地预览
├─ DEPLOY.md                  # GitHub Pages 上线步骤
└─ .nojekyll
```

## 数据说明

- 一卡通数据为课程项目生成的模拟数据，已脱敏；姓名做了 `姓*名` 处理。
- 南京文创商品、订单、账号均为演示数据，保存在浏览器 localStorage。
- 南京文创故事页与关于页的部分真实照片来自 Pexels（免费商用、无需署名），其余插画与短片为项目自制/AIGC 素材。

## 上线

见 [DEPLOY.md](DEPLOY.md)。当前简历链接：<https://cynthautumn.github.io/portfolio/>

## 原始项目

- 校园一卡通原始 Flask + SQLite 项目仍保留在桌面原目录，本作品集是保留交互的纯静态复刻版。
- 南京文创原始项目仍保留在桌面原目录，本目录是部署副本（额外加入了「返回作品集」悬浮按钮）。
