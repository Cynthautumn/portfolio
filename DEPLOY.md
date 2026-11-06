# GitHub Pages 上线步骤（约 5 分钟）

> 最短路径：新建 public 仓库 `portfolio` → 上传 `portfolio-site` 里的全部内容 → Settings → Pages → main / root。

> 目标：得到一个稳定、免费、可写进简历的公网地址：
> `https://cynthautumn.github.io/portfolio/`
>
> 简历里的链接与二维码已经按这个地址生成；你只需要完成第 1–5 步的仓库创建与上传。

## 1. 登录 GitHub

你已经注册成功，用户名是 `Cynthautumn`。打开 <https://github.com> 登录即可。

> 如果之后想换用户名，页面地址也会跟着变，告诉我重新生成简历即可。

## 2. 新建仓库

1. 直接打开：<https://github.com/new?name=portfolio&visibility=public>（已预填仓库名 `portfolio` 和 Public）
2. Repository name 填：`portfolio`
3. 选择 `Public`
4. 不要勾选 `Add a README file`
5. 点 `Create repository`

## 3. 上传网站文件

1. 打开上传页：<https://github.com/Cynthautumn/portfolio/upload/main>
2. 打开本文件夹 `portfolio-site`，**进入文件夹内部**，全选以下内容后拖进浏览器：
   - `index.html`、`resume.pdf`、`resume.docx`
   - `assets/`、`campus/`、`nanjing/`
   - `README.md`、`DEPLOY.md`、`.nojekyll`
3. 等待上传完成（约 10 MB），Commit changes 填 `add portfolio site`，点 `Commit changes`

> 注意：不要拖 `portfolio-site` 这个外层文件夹，否则地址会变成 `.../portfolio/portfolio-site/`。

## 4. 开启 GitHub Pages

1. 打开：<https://github.com/Cynthautumn/portfolio/settings/pages>
2. `Build and deployment` → `Source` 选 `Deploy from a branch`
3. Branch 选 `main`，目录选 `/ (root)`，点 `Save`
4. 等待 1–2 分钟，页面顶部会出现：
   `Your site is live at https://cynthautumn.github.io/portfolio/`

## 5. 检查

- 首页：`https://cynthautumn.github.io/portfolio/`
- 一卡通：`https://cynthautumn.github.io/portfolio/campus/`
- 南京文创：`https://cynthautumn.github.io/portfolio/nanjing/`
- 简历：`https://cynthautumn.github.io/portfolio/resume.pdf`

## 6. 如果之后改了仓库名或用户名

当前 `resume.pdf` 顶部的链接、超链接和二维码已经指向 `cynthautumn.github.io/portfolio`，不需要再改。只有当你改了**用户名**或**仓库名**时，才需要重新生成简历。

## 临时方案：Netlify Drop

如果 GitHub 注册遇到问题：

1. 打开 <https://app.netlify.com/drop>
2. 注册/登录后，把 `portfolio-site` 文件夹拖进去
3. 得到 `https://xxxx.netlify.app` 地址
4. 在 Netlify 设置里把站点名改成 `yusicheng-portfolio` 之类
5. 这个地址也可以写进简历；之后随时可以迁移到 GitHub Pages

## 常见问题

**打开是 404？**
- 确认仓库根目录直接有 `index.html`，不是 `portfolio-site/index.html`
- Pages 的 Branch 选的是 `main` + `/ (root)`
- 刚开启 Pages 需要等 1–2 分钟

**样式/图片丢失？**
- 上传时保持 `assets/`、`campus/assets/`、`nanjing/assets/` 的目录结构
- 不要只上传 HTML 文件

**视频不能播放？**
- 南京文创的 `film.mp4` 约 4 MB，GitHub Pages 支持；首次加载稍慢
