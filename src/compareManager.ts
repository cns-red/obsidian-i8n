import { App, MarkdownView, WorkspaceLeaf } from "obsidian";
import type MultilingualNotesPlugin from "../main";

export class CompareManager {
    private activeComparisonLeaves = new Set<WorkspaceLeaf>();
    private preComparisonLanguage: string | null = null;

    /** True while constructing splits; suppresses layout-change → refreshAllViews() bursts. */
    public isSettingUp = false;

    constructor(private app: App, private plugin: MultilingualNotesPlugin) { }

    public isComparisonLeaf(leaf: WorkspaceLeaf): boolean {
        return this.activeComparisonLeaves.has(leaf);
    }

    public getActiveComparisonLanguages(): Set<string> {
        const langs = new Set<string>();
        for (const leaf of this.activeComparisonLeaves) {
            langs.add(this.plugin.getEffectiveLanguageForLeaf(leaf));
        }
        return langs;
    }

    async startOrUpdateComparison(primaryLeaf: WorkspaceLeaf, selectedLangs: string[]): Promise<void> {
        const file = (primaryLeaf.view as MarkdownView).file;
        if (!file) return;

        let actualPrimary = primaryLeaf;
        if (this.activeComparisonLeaves.has(primaryLeaf)) {
            actualPrimary = Array.from(this.activeComparisonLeaves)[0];
        } else {
            this.preComparisonLanguage = this.plugin.getEffectiveLanguageForLeaf(actualPrimary);
        }

        this.isSettingUp = true;
        try {
            this.endComparison(false);
            this.activeComparisonLeaves.add(actualPrimary);

            if (selectedLangs.length === 1) {
                await this.plugin.setLanguageForSpecificLeaf(actualPrimary, selectedLangs[0]);
                return;
            }

            const primaryViewState = actualPrimary.getViewState();
            if (primaryViewState.type === "markdown" && primaryViewState.state) {
                primaryViewState.state.mode = "preview";
                await actualPrimary.setViewState(primaryViewState);
            }

            await this.plugin.setLanguageForSpecificLeaf(actualPrimary, selectedLangs[0]);

            for (let i = 1; i < selectedLangs.length; i++) {
                const lang = selectedLangs[i];
                const newLeaf = this.app.workspace.getLeaf("split", "vertical");
                const resolvedLang = lang !== "ALL"
                    ? (this.plugin.settings.languages.find(l => l.code.toLowerCase() === lang.toLowerCase())?.code ?? lang)
                    : "ALL";

                this.plugin.leafLanguageOverrides.set(newLeaf, { code: resolvedLang, filePath: file.path });
                this.plugin.spawningLanguage = resolvedLang;
                await newLeaf.openFile(file, { active: false, state: { mode: "preview" } });
                this.plugin.spawningLanguage = null;
                this.activeComparisonLeaves.add(newLeaf);
            }

            this.setupScrollSync();
        } finally {
            this.isSettingUp = false;
        }
    }

    endComparison(returnToAllMode = false): void {
        if (this.activeComparisonLeaves.size === 0) return;

        const leavesArray = Array.from(this.activeComparisonLeaves);
        const primaryLeaf = leavesArray[0];

        for (let i = 1; i < leavesArray.length; i++) leavesArray[i].detach();
        this.activeComparisonLeaves.clear();
        this.removeScrollSync();

        if (returnToAllMode && primaryLeaf) {
            this.plugin.setLanguageForSpecificLeaf(primaryLeaf, this.preComparisonLanguage ?? "ALL");
            this.app.workspace.setActiveLeaf(primaryLeaf, { focus: true });
        }
    }

    private isSyncingScroll = false;
    private scrollHandlers = new Map<HTMLElement, () => void>();

    private setupScrollSync(): void {
        this.removeScrollSync();
        if (this.activeComparisonLeaves.size < 2) return;

        for (const leaf of this.activeComparisonLeaves) {
            if (!(leaf.view instanceof MarkdownView)) continue;
            const scrollers: HTMLElement[] = [
                leaf.view.containerEl.querySelector(".markdown-preview-view") as HTMLElement,
                leaf.view.containerEl.querySelector(".cm-scroller") as HTMLElement,
            ].filter(Boolean);

            for (const el of scrollers) {
                const handler = () => this.onScroll(el);
                this.scrollHandlers.set(el, handler);
                el.addEventListener("scroll", handler);
            }
        }
    }

    private removeScrollSync(): void {
        for (const [el, handler] of this.scrollHandlers) el.removeEventListener("scroll", handler);
        this.scrollHandlers.clear();
    }

    private onScroll(sourceEl: HTMLElement): void {
        if (this.isSyncingScroll) return;
        const maxScroll = sourceEl.scrollHeight - sourceEl.clientHeight;
        if (maxScroll <= 0) return;
        const percentage = sourceEl.scrollTop / maxScroll;
        this.isSyncingScroll = true;
        for (const targetEl of this.scrollHandlers.keys()) {
            if (targetEl === sourceEl) continue;
            const targetMax = targetEl.scrollHeight - targetEl.clientHeight;
            if (targetMax > 0) targetEl.scrollTop = percentage * targetMax;
        }
        requestAnimationFrame(() => { this.isSyncingScroll = false; });
    }
}
