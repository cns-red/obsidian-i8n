# li8n — Obsidian 多语言笔记插件

**语言:** [English](README.md) | [简体中文](README.zh-CN.md)

在同一个 Markdown 文件中编写所有语言版本的笔记，一键切换可见语言 —— 支持阅读模式、实时预览和源码模式。

---

## 功能特性

- **单文件多语言** —— 所有翻译版本保存在一个笔记中，无需复制文件。
- **四种等价语法** —— fenced-div（`:::li8n`）、Hexo 标签、Markdown 注释、Obsidian 注释，可混合使用。
- **多代码块** —— 一个块可同时对应多种语言：`:::li8n zh-CN en`。
- **全局语言切换** —— 通过 Ribbon 按钮、状态栏、命令面板或 `Alt+L` 切换。
- **分屏独立语言** —— 每个分屏可独立显示不同语言。
- **Frontmatter 覆盖** —— 在笔记 frontmatter 中设置 `li8n_view: <code>`（或 `lang: <code>`）可锁定该文件的显示语言。
- **阅读模式语言选择栏** —— 在每篇多语言笔记的阅读视图顶部注入语言切换按钮。
- **大纲/目录过滤** —— 大纲面板仅显示当前激活语言对应的标题。
- **并排对比** —— 同时打开所有语言版本，分屏并同步滚动。
- **AI 翻译** —— 通过任意兼容 OpenAI 的流式 API 生成新语言块。
- **按语言导出** —— 将指定语言的纯净内容导出为 `.md` 文件。
- **块外内容始终可见** —— 语言块之外的文本在任何语言下均显示。

---

## 安装

**通过 BRAT（推荐用于 Beta 版本）：**
1. 安装社区插件 [BRAT](https://github.com/TfTHacker/obsidian42-brat)。
2. 添加 `https://github.com/cns-red/obsidian-li8n` 为 Beta 插件。

**手动安装：**
1. 从最新 Release 下载 `main.js`、`manifest.json` 和 `styles.css`。
2. 将文件复制到 `<vault>/.obsidian/plugins/li8n/`。
3. 在 **Settings → Community plugins** 中启用 **li8n**。

---

## 语法

支持以下四种语法，可在同一笔记中混合使用：

```md
:::li8n zh-CN
这是中文版本。
:::

:::li8n en
This is the English version.
:::
```

```md
{% li8n zh-CN %}
这是中文版本。
{% endli8n %}
```

```md
[//]: # (li8n zh-CN)
这是中文版本。
[//]: # (endli8n)
```

```md
%% li8n zh-CN %%
这是中文版本。
%% endli8n %%
```

**多语言块** —— 同一块内容同时归属多个语言：

```md
:::li8n zh-CN zh-TW
这段内容对简体中文和繁体中文用户都显示。
:::
```

**规则：**
- 开始和结束标记必须独占一行，行首不能有空格。
- 语言代码匹配不区分大小写（`zh-CN` 与 `zh-cn` 视为相同）。
- 语言块外的文本在任何语言下均可见。
- 未关闭的块延伸至文件末尾。

---

## 切换语言

| 方式 | 操作 |
|---|---|
| 状态栏 | 点击语言标签 |
| Ribbon | 点击 🌍 图标 |
| 命令面板 | `li8n: Switch language` |
| 键盘快捷键 | `Alt+L` |
| 阅读模式语言栏 | 点击笔记顶部的语言按钮 |
| 大纲面板 | 点击大纲面板中的语言按钮 |

选择 **ALL** 可同时显示所有语言。

---

## 并排对比

点击状态栏中的分屏图标（或在命令面板中运行 **Compare languages**），在弹出的对话框中选择两种或多种语言，即可在同步滚动的分屏中对比各语言版本 —— 滚动任一分屏，其余分屏将按比例同步滚动。

---

## AI 翻译

打开笔记，将光标置于某个语言块内（或无块的笔记中任意位置），然后在命令面板运行 **li8n: Translate with AI**。弹出的对话框将以流式方式输出翻译结果，完成后自动插入新的语言块。

在 **Settings → li8n → AI Translation** 中配置：

| 设置项 | 说明 |
|---|---|
| API Base URL | 兼容 OpenAI 的接口地址（默认：`https://api.openai.com/v1`） |
| API Key | API 密钥（`sk-...`） |
| Model | 模型名称，如 `gpt-4o-mini` |
| System Prompt | 作为系统消息发送的翻译指令 |

---

## 按语言导出

在文件管理器中右键任意 `.md` 文件 → **Multilingual → Export → \<语言\>**，即可将该语言的纯净内容（已去除标记）下载为独立的 Markdown 文件。

---

## Frontmatter 覆盖

在笔记 frontmatter 中添加以下内容，可覆盖该文件的全局显示语言：

```yaml
---
li8n_view: zh-CN   # 此笔记仅显示中文
---
```

使用 `li8n_view: ALL` 可让该笔记始终显示所有语言，不受全局设置影响。

`lang` 键为 `li8n_view` 的别名，同样有效。

---

## 设置

打开 **Settings → li8n**：

| 设置项 | 说明 |
|---|---|
| 语言库 | 添加、删除或重命名语言代码与显示名称 |
| 激活语言 | 当前所有笔记的可见语言 |
| 默认语言 | 无语言块笔记的默认语言 |
| 显示语言标题栏 | 在阅读模式注入语言切换按钮栏 |
| 在编辑器中隐藏非激活块 | 在实时预览/源码模式中将非激活块替换为细条占位符 |
| 显示状态栏 | 控制底部状态栏的语言标签显示 |
| 显示 Ribbon 按钮 | 控制 🌍 Ribbon 图标显示 |

---

## 构建

```bash
git clone https://github.com/cns-red/obsidian-li8n
cd obsidian-li8n
npm install
npm run dev      # 监听模式
npm run build    # 生产构建 → main.js
```

---

## 已知限制

- 不支持句内（inline）多语言片段切换。
- 语言块内深层嵌套 Markdown 偶尔会出现后处理器归属判断偏差。
- 语言代码不做 ISO 标准校验。
- 移动端编辑器块替换行为为尽力支持，可能与桌面端存在细微差异。

---

## 许可证

MIT
