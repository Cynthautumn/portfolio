# 金陵造物 · 南京文创电商（静态站）

《Web 前端开发》课程设计作品。纯 HTML5 + CSS3 + 原生 JavaScript，无框架、无构建、无外部 CDN，**双击 `index.html` 即可运行**。

## 页面（1 首页 + 7 子页）

| 文件 | 页面 | 说明 |
|---|---|---|
| index.html | 首页 | logo、导航悬停效果、3 屏轮播 banner、品类、好物、非遗短片、故事、品牌承诺、订阅 |
| shop.html | 文创商城 | 品类 / 价格 / 特色筛选 + 搜索 + 排序，支持 URL 参数 `?cat=yunjin`、`?q=关键词` |
| detail.html | 商品详情 | `?id=p01` 动态渲染、多图切换、规格选择、数量加减、加购、详情/工艺/售后选项卡、相关推荐 |
| cart.html | 购物车 | 数量增减、删除、清空、优惠码 `JINLING30`（满 199 减 30）、模拟结算弹窗 |
| orders.html | 我的订单 | 结算后写入本地订单，可查看订单号/商品/合计，支持「再来一单」 |
| register.html | 注册 | 昵称/手机号/邮箱/密码/确认密码本地校验、密码强度条、协议勾选 |
| login.html | 登录 | 手机号与密码非空及格式校验、错误提示、登录态保持 |
| story.html | 金陵故事 | 云锦、灯彩、折扇三段内容 + 时间轴 |
| about.html | 关于我们 | 品牌介绍、门店信息、AIGC 说明 |

## JavaScript 功能（≥ 4 项）

1. Banner 轮播：自动播放、圆点/箭头切换、进度条、悬停暂停、页面隐藏暂停
2. 购物车：localStorage 持久化、角标同步、数量增减、小计与合计、删除/清空
3. 商品筛选与搜索：多条件组合、已选条件标签、排序、空状态
4. 表单校验：注册五项规则 + 密码强度、登录非空校验、错误抖动提示
5. 登录态：注册写入本地、登录/退出、导航栏用户名联动
6. 优惠码与模拟结算：满减计算、订单号生成、结算弹窗
7. 其他：返回顶部、滚动进场动画、移动端抽屉菜单、头部搜索、订阅校验

## 目录结构

```
nanjing-shop/
├─ index.html  shop.html  detail.html  cart.html
├─ register.html  login.html  story.html  about.html
├─ assets/
│  ├─ css/site.css          设计系统与响应式
│  ├─ js/                    data.js 数据、app.js 公共、home/shop/detail/cart/auth 各页逻辑
│  ├─ img/                  17 个原创 SVG（商品、Banner、故事、印章、favicon）
│  └─ media/                film.mp4（16 秒自制短片）、film-poster.jpg、score.wav
├─ docs/                    课程任务书副本与提取文本
└─ scripts/                 素材生成脚本（make_assets.py、make_video.py）
```

## 演示提示

- 商品、订单、账号数据仅保存在浏览器 localStorage，删除浏览器数据即重置。
- 结算前需先注册/登录（模拟），登录后购物车可正常下单。
- 视频为 H.264 MP4，Chrome / Edge / Firefox 可直接播放；若浏览器静音策略限制，点击播放即可。
- 商品/故事插画为本项目原创绘制；故事页、关于页与首页第二屏的真实照片来自 Pexels（免费商用、无需署名），目录 ssets/img/photos/。
- 短片为自制合成，配乐为程序生成。

## 验收对照（任务书要求）

- [x] 静态网站：1 首页 + 7 子页，超链接互通
- [x] 首页：logo、导航悬停变化、banner 动画、图片、多媒体（视频）、文字
- [x] 注册页本地表单验证；登录页非空验证
- [x] 至少 4 个 JS 功能（实际 7 类）
- [x] 页面命名规范、目录结构清晰、代码含中文注释
