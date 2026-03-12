import { App, Component, Modal, Notice, ButtonComponent, MarkdownRenderer, setIcon } from "obsidian";
import type { MultilingualNotesSettings, LanguageEntry } from "../settings";
import { t } from "../i18n";
import { streamTranslation } from "../api/ai";

interface TranslationPlugin {
    settings: MultilingualNotesSettings;
    extractLanguageContent(source: string, targetLangCode: string): string;
}

export class TranslationModal extends Modal {
    private plugin: TranslationPlugin;
    private sourceContent: string;
    private sourceLanguage: string;
    private targetLanguage: string;
    private noteExistingLanguages: Set<string>;

    private sourceRenderEl: HTMLElement | null = null;
    private previewRenderEl: HTMLElement | null = null;
    private previewTextArea: HTMLTextAreaElement | null = null;
    private generateBtn: ButtonComponent | null = null;
    private insertBtn: ButtonComponent | null = null;

    private extractedSourceContent: string = "";
    private translatedContent: string = "";
    private isStreaming: boolean = false;
    private isEditMode: boolean = false;
    private abortController: AbortController | null = null;

    public onInsertCallback: ((text: string, targetLangCode: string) => void) | null = null;

    constructor(
        app: App,
        plugin: TranslationPlugin,
        sourceContent: string,
        activeEditorLangCode: string,
        existingLanguages: Set<string>
    ) {
        super(app);
        this.plugin = plugin;
        this.sourceContent = sourceContent;
        this.noteExistingLanguages = existingLanguages;

        if (activeEditorLangCode && existingLanguages.has(activeEditorLangCode.toLowerCase())) {
            this.sourceLanguage = activeEditorLangCode.toLowerCase();
        } else if (existingLanguages.size > 0) {
            this.sourceLanguage = Array.from(existingLanguages)[0].toLowerCase();
        } else {
            this.sourceLanguage = plugin.settings.defaultLanguage.toLowerCase();
        }

        this.targetLanguage = "";
        const availableTargets = plugin.settings.languages.filter(
            l => !existingLanguages.has(l.code.toLowerCase())
        );
        if (availableTargets.length > 0) {
            this.targetLanguage = availableTargets[0].code;
        }
    }

    onOpen(): void {
        const { contentEl } = this;
        contentEl.empty();

        this.modalEl.addClass("ml-tr-modal");

        // ── Error state ───────────────────────────────────────────────────────
        if (!this.plugin.settings.aiApiKey) {
            const err = contentEl.createDiv("ml-tr-error");
            err.createEl("p", { text: t("notice.api_key_missing") });
            return;
        }

        // ── Header ────────────────────────────────────────────────────────────
        const header = contentEl.createDiv("ml-tr-header");
        header.createEl("h2", { text: t("menu.smart_translate"), cls: "ml-tr-title" });

        // ── Language Selector Row ─────────────────────────────────────────────
        const langRow = header.createDiv("ml-tr-lang-row");

        // Source language
        const srcGroup = langRow.createDiv("ml-tr-lang-group");
        srcGroup.createEl("span", { text: t("settings.source_language"), cls: "ml-tr-lang-label" });
        const srcSelect = srcGroup.createEl("select", { cls: "ml-tr-select" });

        const sourceLangs = this.plugin.settings.languages.filter(
            l => this.noteExistingLanguages.has(l.code.toLowerCase())
        );
        const finalSourceLangs = sourceLangs.length > 0 ? sourceLangs : this.plugin.settings.languages;
        finalSourceLangs.forEach(l => {
            const opt = srcSelect.createEl("option", { text: l.label, value: l.code });
            if (l.code.toLowerCase() === this.sourceLanguage) opt.selected = true;
        });
        srcSelect.addEventListener("change", () => {
            this.sourceLanguage = srcSelect.value;
            this.updateSourcePreview();
        });

        // Arrow
        langRow.createEl("span", { text: "→", cls: "ml-tr-arrow" });

        // Target language
        const tgtGroup = langRow.createDiv("ml-tr-lang-group");
        tgtGroup.createEl("span", { text: t("settings.target_language"), cls: "ml-tr-lang-label" });
        const tgtSelect = tgtGroup.createEl("select", { cls: "ml-tr-select" });

        const targetLangs = this.plugin.settings.languages.filter(
            l => !this.noteExistingLanguages.has(l.code.toLowerCase())
        );
        if (targetLangs.length === 0) {
            tgtSelect.createEl("option", {
                text: t("notice.fully_internationalized"),
                value: "",
            });
        } else {
            targetLangs.forEach(l => {
                const opt = tgtSelect.createEl("option", { text: l.label, value: l.code });
                if (l.code === this.targetLanguage) opt.selected = true;
            });
        }
        tgtSelect.addEventListener("change", () => {
            this.targetLanguage = tgtSelect.value;
            this.updateGenerateBtnState();
        });

        // Generate button
        const btnWrap = langRow.createDiv("ml-tr-btn-wrap");
        this.generateBtn = new ButtonComponent(btnWrap)
            .setButtonText(t("button.translate"))
            .setCta()
            .onClick(() => { void this.runStreamTranslation(); });
        this.generateBtn.buttonEl.addClass("ml-tr-generate-btn");
        this.updateGenerateBtnState();

        // ── Split Panel ───────────────────────────────────────────────────────
        const split = contentEl.createDiv("ml-tr-split");

        // Left: Source
        const srcPanel = split.createDiv("ml-tr-panel");
        const srcHead = srcPanel.createDiv("ml-tr-panel-head");
        srcHead.createEl("span", { text: t("label.source_text"), cls: "ml-tr-panel-label" });
        this.sourceRenderEl = srcPanel.createDiv("ml-tr-panel-body ml-tr-preview");
        this.updateSourcePreview();

        // Right: Translation
        const tgtPanel = split.createDiv("ml-tr-panel");
        const tgtHead = tgtPanel.createDiv("ml-tr-panel-head");
        tgtHead.createEl("span", { text: t("label.translation"), cls: "ml-tr-panel-label" });

        // Edit/preview toggle
        const editBtn = tgtHead.createEl("button", { cls: "ml-tr-icon-btn", attr: { title: t("tooltip.edit_translation") } });
        this.setEditBtnIcon(editBtn, false);
        editBtn.addEventListener("click", () => {
            this.isEditMode = !this.isEditMode;
            this.setEditBtnIcon(editBtn, this.isEditMode);
            this.syncViewMode();
        });

        const tgtBody = tgtPanel.createDiv("ml-tr-panel-body");
        this.previewRenderEl = tgtBody.createDiv("ml-tr-preview");
        this.renderTranslation();

        this.previewTextArea = tgtBody.createEl("textarea", { cls: "ml-tr-textarea ml-tr-hidden" });
        this.previewTextArea.placeholder = t("placeholder.translation_preview");
        this.previewTextArea.value = this.translatedContent;
        this.previewTextArea.addEventListener("input", () => {
            this.translatedContent = this.previewTextArea!.value;
            this.renderTranslation();
            this.updateInsertBtnState();
        });

        // ── Footer ────────────────────────────────────────────────────────────
        const footer = contentEl.createDiv("ml-tr-footer");

        new ButtonComponent(footer)
            .setButtonText(t("button.cancel"))
            .onClick(() => {
                this.cancelStream();
                this.close();
            });

        this.insertBtn = new ButtonComponent(footer)
            .setButtonText(t("button.insert"))
            .setCta()
            .setDisabled(true)
            .onClick(() => {
                if (!this.translatedContent.trim()) {
                    new Notice(t("notice.empty_insertion"));
                    return;
                }
                this.doInsert();
            });
        this.insertBtn.buttonEl.addClass("ml-tr-insert-btn");
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private cancelStream(): void {
        this.isStreaming = false;
        this.abortController?.abort();
        this.abortController = null;
    }

    private setEditBtnIcon(el: HTMLElement, editing: boolean): void {
        el.empty();
        if (editing) {
            setIcon(el, "eye");
            el.setAttribute("data-active", "true");
        } else {
            setIcon(el, "pencil");
            el.removeAttribute("data-active");
        }
    }

    private syncViewMode(): void {
        if (!this.previewRenderEl || !this.previewTextArea) return;
        if (this.isEditMode) {
            this.previewRenderEl.addClass("ml-tr-hidden");
            this.previewTextArea.removeClass("ml-tr-hidden");
        } else {
            this.previewRenderEl.removeClass("ml-tr-hidden");
            this.previewTextArea.addClass("ml-tr-hidden");
        }
    }

    private stripFrontmatter(content: string): string {
        const match = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
        return match ? content.slice(match[0].length) : content;
    }

    private updateSourcePreview(): void {
        if (!this.sourceRenderEl) return;
        this.sourceRenderEl.empty();
        this.extractedSourceContent = this.stripFrontmatter(
            this.plugin.extractLanguageContent(this.sourceContent, this.sourceLanguage)
        );
        void MarkdownRenderer.render(
            this.app,
            this.extractedSourceContent || "_No source text found for this language._",
            this.sourceRenderEl, "", this as unknown as Component
        );
    }

    private renderTranslation(): void {
        if (!this.previewRenderEl) return;
        this.previewRenderEl.empty();
        void MarkdownRenderer.render(
            this.app,
            this.translatedContent || "_Translation will appear here…_",
            this.previewRenderEl, "", this as unknown as Component
        );
    }

    private updateGenerateBtnState(): void {
        this.generateBtn?.setDisabled(!this.targetLanguage || !this.sourceLanguage || this.isStreaming);
    }

    private updateInsertBtnState(): void {
        this.insertBtn?.setDisabled(!this.translatedContent.trim() || this.isStreaming);
    }

    private async runStreamTranslation(): Promise<void> {
        if (!this.generateBtn || !this.previewTextArea) return;

        this.abortController = new AbortController();
        this.isStreaming = true;
        this.translatedContent = "";
        this.previewTextArea.value = "";
        this.renderTranslation();

        this.generateBtn.setButtonText(t("button.translating"));
        this.generateBtn.buttonEl.addClass("ml-tr-spinning");
        this.updateGenerateBtnState();
        this.updateInsertBtnState();

        // Switch to preview mode during streaming
        if (this.isEditMode) {
            this.isEditMode = false;
            this.syncViewMode();
        }

        // Add streaming cursor
        this.previewRenderEl?.addClass("ml-tr-streaming");

        try {
            const srcName = this.plugin.settings.languages.find(
                (l: LanguageEntry) => l.code.toLowerCase() === this.sourceLanguage
            )?.label || this.sourceLanguage;
            const tgtName = this.plugin.settings.languages.find(
                (l: LanguageEntry) => l.code === this.targetLanguage
            )?.label || this.targetLanguage;

            await streamTranslation(
                this.extractedSourceContent, tgtName, srcName, this.plugin.settings,
                (chunk: string) => {
                    if (!this.isStreaming) return;
                    this.translatedContent += chunk;
                    window.requestAnimationFrame(() => {
                        this.renderTranslation();
                        if (this.previewRenderEl) {
                            this.previewRenderEl.scrollTop = this.previewRenderEl.scrollHeight;
                        }
                    });
                },
                this.abortController.signal,
            );
        } catch (err) {
            // AbortError is expected when the user cancels — don't show a notice
            if (err instanceof Error && err.name === "AbortError") return;
            const msg = err instanceof Error ? err.message : String(err);
            new Notice(`Error: ${msg}`);
        } finally {
            this.isStreaming = false;
            this.abortController = null;
            this.previewRenderEl?.removeClass("ml-tr-streaming");
            this.generateBtn.setButtonText(t("button.regenerate"));
            this.generateBtn.buttonEl.removeClass("ml-tr-spinning");
            this.updateGenerateBtnState();
            if (this.previewTextArea) this.previewTextArea.value = this.translatedContent;
            this.renderTranslation();
            this.updateInsertBtnState();
        }
    }

    private doInsert(): void {
        this.onInsertCallback?.(this.translatedContent, this.targetLanguage);
        this.close();
    }

    onClose(): void {
        this.cancelStream();
        this.contentEl.empty();
    }
}
