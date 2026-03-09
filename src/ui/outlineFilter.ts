/** Outline filtering utilities to mirror active-language visibility. */

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
    if (blocks.length === 0) return langMatch(active, defaultLanguage);
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
      item.style.display = i < visible.length && !visible[i] ? "none" : "";
    });
  }
}

/**
 * Inject (or refresh) a compact language-selector bar into each outline panel.
 * Called every time the active language or outline view changes so the active
 * pill always reflects the current state.
 */
export function ensureOutlineControl(
  outlineLeaves: WorkspaceLeaf[],
  settings: MultilingualNotesSettings,
  onSwitch: (code: string) => void,
): void {
  for (const leaf of outlineLeaves) {
    const containerEl = leaf.view.containerEl;

    // Remove stale bar so active-pill state is always fresh.
    containerEl.querySelector(".ml-outline-lang-bar")?.remove();

    const bar = document.createElement("div");
    bar.className = "ml-outline-lang-bar";

    const active = settings.activeLanguage;

    // ALL pill
    bar.appendChild(createOutlinePill("ALL", "ALL", active === "ALL", onSwitch));

    // One pill per configured language
    for (const lang of settings.languages) {
      bar.appendChild(
        createOutlinePill(lang.code, lang.label, active === lang.code, onSwitch),
      );
    }

    // Insert before the scrollable content area if it exists.
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
