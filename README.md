# li8n — Multilingual Notes for Obsidian

**Languages:** [English](README.md) | [简体中文](README.zh-CN.md)

Write all language versions of a note in a single Markdown file. Switch the visible language with one click — in Reading mode, Live Preview, and Source mode.

---

## Features

- **Single-file multilingual** — keep every translation in one note, no file duplication.
- **Four equivalent syntaxes** — fenced-div (`:::li8n`), Hexo tag, Markdown comment, Obsidian comment. Mix freely.
- **Multi-code blocks** — one block can cover several languages: `:::li8n zh-CN en`.
- **Global language switch** — ribbon button, status bar, command palette, or `Alt+L`.
- **Per-pane overrides** — each split view can show a different language independently.
- **Frontmatter override** — set `li8n_view: <code>` (or `lang: <code>`) in a note's frontmatter to lock that file's view language.
- **Reading-mode pill bar** — a language selector is injected at the top of every multilingual note in Reading mode.
- **Outline/TOC filtering** — the Outline panel shows only the headings belonging to the active language.
- **Side-by-side comparison** — open all languages simultaneously in synchronized split panes.
- **AI translation** — generate a new language block via any OpenAI-compatible streaming API.
- **Per-language export** — export a language-stripped version of a note as a `.md` file.
- **Unnested content always visible** — text outside any language block is shown in every language.

---

## Installation

**Via BRAT (recommended for beta):**
1. Install the [BRAT](https://github.com/TfTHacker/obsidian42-brat) community plugin.
2. Add `https://github.com/cns-red/obsidian-li8n` as a beta plugin.

**Manual:**
1. Download `main.js`, `manifest.json`, and `styles.css` from the latest release.
2. Copy them to `<vault>/.obsidian/plugins/li8n/`.
3. Enable **li8n** in **Settings → Community plugins**.

---

## Syntax

Four styles are supported and can be mixed within the same note:

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

**Multi-language block** — assign the same content to multiple languages at once:

```md
:::li8n zh-CN zh-TW
这段内容对简体中文和繁体中文用户都显示。
:::
```

**Rules:**
- Open and close markers must be on their own line with no leading spaces.
- Language code matching is case-insensitive (`zh-CN` and `zh-cn` are treated identically).
- Text outside any block is always visible regardless of the active language.
- Unclosed blocks extend to the end of the file.

---

## Switching Languages

| Method | Action |
|---|---|
| Status bar | Click the language label |
| Ribbon | Click the 🌍 ribbon icon |
| Command palette | `li8n: Switch language` |
| Keyboard shortcut | `Alt+L` |
| Reading-mode pill bar | Click any pill at the top of a multilingual note |
| Outline panel | Click any pill in the outline language bar |

Select **ALL** to show every language simultaneously.

---

## Side-by-Side Comparison

Click the split-pane icon in the status bar (or use **Compare languages** from the command palette) to open a comparison modal. Select two or more languages to view them in synchronized split panes — scrolling one pane scrolls all others proportionally.

---

## AI Translation

Open a note, place the cursor inside a language block (or anywhere in a note without blocks), then run **li8n: Translate with AI** from the command palette. A modal streams the translation from your configured API and inserts a ready-to-use language block when finished.

Configure the AI under **Settings → li8n → AI Translation**:

| Setting | Description |
|---|---|
| API Base URL | Base URL of any OpenAI-compatible endpoint (default: `https://api.openai.com/v1`) |
| API Key | Your API key (`sk-...`) |
| Model | Model name, e.g. `gpt-4o-mini` |
| System Prompt | Translation instruction sent as the system message |

---

## Per-Language Export

Right-click any `.md` file in the file explorer → **Multilingual → Export → \<language\>** to download a plain Markdown file containing only that language's content (markers stripped).

---

## Frontmatter Overrides

Add to any note's frontmatter to override the global active language for that file:

```yaml
---
li8n_view: zh-CN   # show only Chinese in this note
---
```

Use `li8n_view: ALL` to always show all languages in this note regardless of the global setting.

The `lang` key is also accepted as an alias for `li8n_view`.

---

## Settings

Open **Settings → li8n**:

| Setting | Description |
|---|---|
| Language library | Add, remove, or rename language codes and display labels |
| Active language | Currently visible language across all notes |
| Default language | Assumed language for notes that have no language blocks |
| Show language header | Inject a pill selector bar in Reading mode |
| Hide non-active blocks in editor | Replace inactive blocks with a thin placeholder bar in Live Preview / Source mode |
| Show status bar | Toggle the language label in the bottom status bar |
| Show ribbon button | Toggle the 🌍 ribbon icon |

---

## Build

```bash
git clone https://github.com/cns-red/obsidian-li8n
cd obsidian-li8n
npm install
npm run dev      # watch mode
npm run build    # production build → main.js
```

---

## Limitations

- Inline multilingual spans (within a sentence) are not supported.
- Deeply nested Markdown inside language blocks can occasionally be mis-attributed by the post-processor.
- Language codes are not validated against any ISO standard.
- Mobile editor block-replacement behavior is best-effort and may differ slightly from desktop.

---

## License

MIT
