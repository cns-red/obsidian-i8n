import type { MultilingualNotesSettings } from "../settings";

export interface AIResponse {
    success: boolean;
    text?: string;
    error?: string;
}

export async function streamTranslation(
    sourceText: string,
    targetLangName: string,
    sourceLangName: string | undefined,
    settings: MultilingualNotesSettings,
    onChunk: (text: string) => void,
): Promise<void> {
    const { aiApiBase, aiApiKey, aiModel, aiSystemPrompt } = settings;

    if (!aiApiBase) throw new Error("API Base URL is not configured.");
    if (!aiApiKey) throw new Error("API Key is not configured.");
    if (!aiModel) throw new Error("AI Model is not configured.");

    const endpoint = aiApiBase.endsWith("/chat/completions")
        ? aiApiBase
        : aiApiBase.replace(/\/$/, "") + "/chat/completions";

    const prompt = `${aiSystemPrompt}\n\nSource language: ${sourceLangName ?? "Auto-detect"}\nTarget language: ${targetLangName}`;

    let response: Response;
    try {
        response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${aiApiKey}` },
            body: JSON.stringify({
                model: aiModel,
                messages: [
                    { role: "system", content: prompt },
                    { role: "user", content: sourceText },
                ],
                temperature: 0.3,
                stream: true,
            }),
        });
    } catch (err: any) {
        throw new Error(`Network error: ${err.message}. If using a local API, ensure CORS is enabled for app://obsidian.md.`);
    }

    if (!response.ok) {
        const errText = await response.text().catch(() => "Unknown error");
        throw new Error(`HTTP ${response.status}: ${errText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Response body is not readable.");

    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
            const clean = line.trim();
            if (!clean.startsWith("data: ")) continue;
            const data = clean.slice(6);
            if (data === "[DONE]") return;
            try {
                const chunk = JSON.parse(data).choices?.[0]?.delta?.content;
                if (chunk) onChunk(chunk);
            } catch {
                // Malformed SSE chunk — skip
            }
        }
    }
}
