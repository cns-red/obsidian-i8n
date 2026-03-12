/** Status-bar and language menu rendering helpers. */

import { Menu, setIcon } from "obsidian";
import { t } from "../i18n";
import type { MultilingualNotesSettings } from "../settings";

export function getActiveLabel(settings: MultilingualNotesSettings, activeLanguage: string): string {
  if (activeLanguage === "ALL") return t("status_bar.all_languages");
  const lang = settings.languages.find((l) => l.code.toLowerCase() === activeLanguage.toLowerCase());
  return lang ? lang.label : activeLanguage;
}

export function buildStatusBar(
  statusBarEl: HTMLElement,
  settings: MultilingualNotesSettings,
  onLanguageClick: (evt: MouseEvent) => void,
  onCompareClick: (evt: MouseEvent) => void,
  activeLanguage: string,
  activeImplTip: boolean
): void {
  statusBarEl.empty();
  statusBarEl.addClass("ml-status-bar-container");

  const wrapper = statusBarEl.createDiv("ml-status-wrapper");
  const icon = wrapper.createSpan("ml-status-icon");
  setIcon(icon, "languages");

  const label = wrapper.createSpan("ml-status-label");
  label.textContent = getActiveLabel(settings, activeLanguage);
  label.setAttribute("title", t("status_bar.click_to_switch"));
  wrapper.onclick = onLanguageClick;

  const compareBtn = statusBarEl.createDiv("ml-status-compare-btn");
  setIcon(compareBtn, "flip-horizontal-2");
  compareBtn.setAttribute("title", t("menu.compare_languages"));
  compareBtn.onclick = onCompareClick;

  const fullImpl = statusBarEl.createDiv("ml-status-impl");
  setIcon(fullImpl, "keyboard");
  fullImpl.setAttribute("title", t("status_bar.missing_translations"));
  fullImpl.toggleClass("ml-status-impl--hidden", !activeImplTip);
}

export function showLanguageMenu(
  evt: MouseEvent,
  settings: MultilingualNotesSettings,
  onSetActiveLanguage: (code: string) => Promise<void>,
  availableCodes?: Set<string>,
  currentLeafLanguage?: string
): void {
  const menu = new Menu();

  menu.addItem((item) => {
    item
      .setTitle(t("menu.show_all_languages"))
      .setChecked((currentLeafLanguage || settings.activeLanguage) === "ALL")
      .onClick(() => { void onSetActiveLanguage("ALL"); });
  });

  menu.addSeparator();

  for (const lang of settings.languages) {
    if (availableCodes && availableCodes.size > 0 && !availableCodes.has(lang.code.toLowerCase()) && lang.code.toLowerCase() !== "all") {
      continue;
    }
    menu.addItem((item) => {
      item
        .setTitle(lang.label)
        .setChecked((currentLeafLanguage || settings.activeLanguage).toLowerCase() === lang.code.toLowerCase())
        .onClick(() => { void onSetActiveLanguage(lang.code); });
    });
  }

  menu.showAtMouseEvent(evt);
}
