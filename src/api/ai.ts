// NOTE: This module intentionally uses the native fetch() API instead of
// Obsidian's requestUrl(). requestUrl() buffers the entire response before
// returning and therefore cannot support Server-Sent Events (SSE). Real-time
// streaming requires a ReadableStream, which only fetch() exposes. The
// AbortSignal passed by callers ensures the connection is cancelled promptly
// when the user closes the translation modal, preventing wasted API tokens.
// This will be documented in the Obsidian community plugin PR submission.

import type { MultilingualNotesSettings } from "../settings";

export async function streamTranslation(
    sourceText: string,
    targetLangName: string,
    sourceLangName: string | undefined,
    settings: MultilingualNotesSettings,
    onChunk: (text: string) => void,
    signal?: AbortSignal,
): Promise<void> {
    const { aiApiBase, aiApiKey, aiModel, aiSystemPrompt } = settings;

    if (!aiApiBase) throw new Error("API Base URL is not configured.");
    if (!aiApiKey) throw new Error("API Key is not configured.");
    if (!aiModel) throw new Error("AI Model is not configured.");

    const endpoint = aiApiBase.endsWith("/chat/completions")
        ? aiApiBase
        : aiApiBase.replace(/\/$/, "") + "/chat/completions";

    const prompt = `${aiSystemPrompt}\n\nSource language: ${sourceLangName ?? "Auto-detect"}\nTarget language: ${targetLangName}`;

    // eslint-disable-next-line no-restricted-globals
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${aiApiKey}`,
        },
        body: JSON.stringify({
            model: aiModel,
            messages: [
                { role: "system", content: prompt },
                { role: "user", content: sourceText },
            ],
            temperature: 0.3,
            stream: true,
        }),
        signal,
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    if (!response.body) throw new Error("Response body is empty.");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed === "data: [DONE]") continue;
                if (!trimmed.startsWith("data: ")) continue;
                try {
                    const json = JSON.parse(trimmed.slice(6)) as {
                        choices?: Array<{ delta?: { content?: string } }>;
                    };
                    const delta = json.choices?.[0]?.delta?.content;
                    if (typeof delta === "string" && delta) onChunk(delta);
                } catch {
                    // malformed SSE line — skip
                }
            }
        }
    } finally {
        reader.releaseLock();
    }
}
