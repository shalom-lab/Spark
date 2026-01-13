<div align="center">

# ✨ Spark

**灵感与代码保险库 · 优雅的代码片段管理工具**

[![Vue 3](https://img.shields.io/badge/Vue-3-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Sync-181717?logo=github&logoColor=white)](https://github.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[📖 使用文档](#-快速开始) · [🐛 问题反馈](https://github.com/shalom-lab/Spark/issues) · [⭐ Star](https://github.com/shalom-lab/Spark)

</div>

---

## 🚀 快速开始

### 1️⃣ Fork 仓库

Fork 本项目到你的 GitHub 账号，数据将存储在 `snippets.json` 文件中。

### 2️⃣ 部署到 GitHub Pages

1. 进入你 Fork 的仓库
2. 点击 **Settings** → **Pages**
3. 在 **Source** 中选择 **Deploy from a branch**
4. 选择分支：**master**（或 **main**）
5. 选择文件夹：**/ (root)**
6. 点击 **Save**
7. 等待几分钟后，访问 `https://你的用户名.github.io/Spark` 即可

### 3️⃣ 使用方法

1. 打开部署后的页面
2. 点击 **设置**（右上角齿轮图标）
3. 输入 **GitHub Token** 和 **仓库路径**
4. 点击 **同步并保存配置**

<details>
<summary><b>📝 获取 Fine-grained Token（点击展开）</b></summary>

1. 前往 [GitHub Settings > Fine-grained tokens](https://github.com/settings/tokens?type=beta)
2. 创建新 Token，选择你 Fork 的仓库
3. 权限设置：仅需 `Contents: Read and write` 权限
4. 格式：`github_pat_xxxxxx`

✅ **优势**：仅对指定仓库有效，权限更精细，更安全

</details>

**仓库格式：** `你的用户名/Spark`

### 4️⃣ 开始使用

添加代码片段，自动同步到 GitHub 的 `snippets.json` 文件 ✨

---

## 📸 核心功能

| 功能 | 说明 |
|:---:|:---|
| 📝 **代码片段管理** | 添加、编辑、删除、复制代码片段 |
| 🔍 **智能搜索** | 输入 `#标签名` 精确匹配标签，或输入关键词搜索标题/代码内容 |
| 🎨 **语言筛选** | 按 JavaScript、Python、R、SQL 等筛选 |
| 🏷️ **标签切换** | 点击标签切换筛选状态 |
| 🔖 **配置备份** | 生成书签链接，跨设备同步配置 |

---

## 🎨 自定义

### 添加新语言

编辑 `app.js` 中的 `LANGUAGE_CONFIG`：

```javascript
{
    value: 'NEW_LANG',                    // 语言代码（大写，用于存储）
    label: 'New Language',                // 显示名称（下拉菜单和标签中显示）
    tagStyle: 'text-[#color] border border-[#color]/20',  // 标签样式（Tailwind CSS 类）
    colorDot: 'bg-[#color]',              // 颜色点样式（语言选择器中使用）
    hljsAlias: 'language-alias'           // highlight.js 的语言别名（用于代码高亮）
}
```

---

## 📁 项目结构

```
Spark/
├── index.html      # 主页面
├── app.js          # 应用逻辑
├── styles.css      # 样式文件
└── snippets.json   # 数据文件（GitHub 同步存储）
```

> 💡 **数据存储**：所有代码片段数据都存储在 GitHub 仓库的 `snippets.json` 文件中，通过 GitHub API 自动同步。

---
## 🔒 数据安全

- ✅ Token 存储在本地 localStorage
- ✅ 数据同步到 GitHub 私有仓库
- ✅ 支持 JSON 导出备份

---

<div align="center">

### Made with ❤️ by [shalom-lab](https://github.com/shalom-lab)

**[⬆ 返回顶部](#-spark)**

</div>
