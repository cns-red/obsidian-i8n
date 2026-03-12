import { App, Modal, Setting, WorkspaceLeaf } from "obsidian";
import type { LanguageEntry } from "../settings";
import { t } from "../i18n";

interface CompareModalPlugin {
  settings: { languages: LanguageEntry[] };
  compareManager: {
    startOrUpdateComparison(leaf: WorkspaceLeaf, langs: string[]): Promise<void>;
    endComparison(returnToAll: boolean): void;
  };
  getEffectiveLanguageForActiveLeaf(): string;
}

export class ComparisonModal extends Modal {
    private selectedLanguages = new Set<string>();

    constructor(
        app: App,
        private plugin: CompareModalPlugin,
        defaultSelectedLanguages: Set<string>,
        private availableLanguagesStr: string[]
    ) {
        super(app);
        for (const lang of defaultSelectedLanguages) {
            this.selectedLanguages.add(lang);
        }
    }

    onOpen(): void {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass("ml-comparison-modal");

        new Setting(contentEl).setName(t("menu.compare_languages")).setHeading();

        contentEl.createEl("p", {
            text: t("menu.compare_languages_desc"),
            cls: "setting-item-description"
        });

        const activeCodes = this.availableLanguagesStr.length > 0
            ? this.plugin.settings.languages.filter(l => this.availableLanguagesStr.includes(l.code.toLowerCase()))
            : this.plugin.settings.languages;

        for (const lang of activeCodes) {
            const isSelected = this.selectedLanguages.has(lang.code);

            new Setting(contentEl)
                .setName(lang.label)
                .addToggle((toggle) => {
                    toggle.setValue(isSelected).onChange((val) => {
                        if (val) {
                            this.selectedLanguages.add(lang.code);
                        } else {
                            this.selectedLanguages.delete(lang.code);
                            if (this.selectedLanguages.size === 0) {
                                this.selectedLanguages.add(lang.code);
                                toggle.setValue(true);
                            }
                        }
                    });
                });
        }

        const buttonContainer = contentEl.createDiv("ml-comparison-btn-row");

        const applyBtn = buttonContainer.createEl("button", { text: t("menu.apply_comparison") });
        applyBtn.addClass("mod-cta");
        applyBtn.addEventListener("click", () => {
            void (async () => {
                const primaryLeaf = this.app.workspace.getMostRecentLeaf();
                if (primaryLeaf) {
                    await this.plugin.compareManager.startOrUpdateComparison(primaryLeaf, Array.from(this.selectedLanguages));
                }
                this.close();
            })();
        });

        const resetBtn = buttonContainer.createEl("button", { text: t("menu.return_normal") });
        resetBtn.addEventListener("click", () => {
            this.plugin.compareManager.endComparison(true);
            this.close();
        });
    }

    onClose(): void {
        this.contentEl.empty();
    }
}
