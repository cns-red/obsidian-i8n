/** Outline panel filtering and language-selector bar injection. */

import { WorkspaceLeaf } from "obsidian";
import { langMatch, parseLangBlocks } from "../markdownProcessor";
import type { MultilingualNotesSettings } from "../settings";

type HeadingInfo = { heading: string; position: { start: { line: number } } };

export function applyOutlineFilter(
  outlineLeaves: WorkspaceLeaf[],
  headings: HeadingInfo[],
  source: string,
  active: string,
  defaultLanguage: string,
): void {
  const blocks = parseLangBlocks(source);
  const visible: boolean[] = headings.map((h) => {
    const line = h.position.start.line;
    if (blocks.length === 0) return langMatch(defaultLanguage, active);
    for (const block of blocks) {
      if (line > block.openLine && (block.closeLine < 0 || line < block.closeLine)) {
        return langMatch(block.langCode, active);
      }
    }
    return true;
  });

  for (const leaf of outlineLeaves) {
    const items = Array.from(leaf.view.containerEl.querySelectorAll<HTMLElement>(".tree-item"));
    items.forEach((item, i) => {
      item.toggleClass("ml-outline-hidden", i < visible.length && !visible[i]);
    });
  }
}

export function ensureOutlineControl(
  outlineLeaves: WorkspaceLeaf[],
  settings: MultilingualNotesSettings,
  onSwitch: (code: string) => void,
  activeLanguage: string,
  presentCodes?: Set<string>,
): void {
  for (const leaf of outlineLeaves) {
    const containerEl = leaf.view.containerEl;

    containerEl.querySelector(".ml-outline-lang-bar")?.remove();

    if (presentCodes && presentCodes.size === 0) continue;

    const bar = document.createElement("div");
    bar.className = "ml-outline-lang-bar";

    const active = activeLanguage;

    if (!presentCodes || presentCodes.size > 1) {
      bar.appendChild(createOutlinePill("ALL", "ALL", active === "ALL", onSwitch));
    }

    const codesToRender = presentCodes
      ? settings.languages.filter(l => Array.from(presentCodes).some(pc => pc.toLowerCase() === l.code.toLowerCase()))
      : settings.languages;

    for (const lang of codesToRender) {
      bar.appendChild(
        createOutlinePill(lang.code, lang.label, active.toLowerCase() === lang.code.toLowerCase(), onSwitch),
      );
    }

    const viewContent = containerEl.querySelector<HTMLElement>(".view-content");
    if (viewContent) {
      viewContent.before(bar);
    } else {
      containerEl.prepend(bar);
    }
  }
}

function createOutlinePill(
  code: string,
  label: string,
  isActive: boolean,
  onSwitch: (code: string) => void,
): HTMLElement {
  const pill = document.createElement("span");
  pill.className = "ml-outline-pill" + (isActive ? " ml-outline-pill--active" : "");
  pill.textContent = label;
  pill.setAttribute("data-lang", code);
  pill.addEventListener("click", () => onSwitch(code));
  return pill;
}
