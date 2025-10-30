"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerLocators = registerLocators;
function registerLocators({ router }) {
    router.post('/locators/generate', async (req, res) => {
        try {
            const { inputType = 'html', content, preferredStrategy = 'role', framework = 'playwright', groupIntoPOM = true, openaiKey, geminiKey } = req.body || {};
            if (!content || typeof content !== 'string') {
                return res.status(400).json({ success: false, error: 'content is required' });
            }
            const finalOpenaiKey = openaiKey || process.env.OPENAI_API_KEY;
            const finalGeminiKey = geminiKey || process.env.GEMINI_API_KEY;
            if (!finalOpenaiKey && !finalGeminiKey) {
                return res.status(400).json({ success: false, error: 'At least one API key is required (OpenAI or Gemini) via body or env' });
            }
            const { LocatorService } = require('../../services/locatorService');
            // If input is a URL, fetch server-side and replace content with fetched HTML
            let finalInput = content;
            if (inputType === 'url') {
                try {
                    // Basic URL validation
                    const url = new URL(content);
                    const resp = await fetch(url.toString(), {
                        method: 'GET',
                        redirect: 'follow',
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0 Safari/537.36',
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                            'Accept-Language': 'en-US,en;q=0.9',
                            'Cache-Control': 'no-cache',
                            'Pragma': 'no-cache',
                        }
                    });
                    if (!resp.ok) {
                        return res.status(400).json({ success: false, error: `Failed to fetch URL (${resp.status})` });
                    }
                    let html = await resp.text();
                    // Strip scripts and styles to reduce noise/hallucinations
                    html = html
                        .replace(/<script[\s\S]*?<\/script>/gi, '')
                        .replace(/<style[\s\S]*?<\/style>/gi, '')
                        .replace(/<!--([\s\S]*?)-->/g, '');
                    // Guard extremely large pages
                    const MAX_LEN = 400000; // ~400 KB
                    if (html.length > MAX_LEN)
                        html = html.slice(0, MAX_LEN);
                    finalInput = html;
                }
                catch (err) {
                    return res.status(400).json({ success: false, error: `Unable to fetch provided URL: ${err?.message || String(err)}` });
                }
            }
            const generateFn = async (prompt) => {
                if (!finalGeminiKey)
                    throw new Error('No LLM provider configured');
                const { GoogleGenerativeAI } = require('@google/generative-ai');
                const genAI = new GoogleGenerativeAI(finalGeminiKey);
                const models = ['gemini-2.5-pro', 'gemini-2.5-flash'];
                const delays = [500, 1500, 3000];
                for (const modelName of models) {
                    for (let attempt = 0; attempt < delays.length; attempt++) {
                        try {
                            const model = genAI.getGenerativeModel({
                                model: modelName,
                                generationConfig: { maxOutputTokens: 4000, temperature: 0.1 }
                            });
                            const result = await model.generateContent(prompt);
                            const text = result?.response?.text?.() || '';
                            if (!text)
                                throw new Error('Empty response from Gemini');
                            return text;
                        }
                        catch (err) {
                            const isOverloaded = (err?.status === 503) || /overloaded|unavailable|503/i.test(String(err?.message || ''));
                            if (isOverloaded && attempt < delays.length - 1) {
                                await new Promise(r => setTimeout(r, delays[attempt]));
                                continue; // retry same model
                            }
                            if (isOverloaded)
                                break; // try next model
                            throw err; // non-retryable
                        }
                    }
                }
                throw new Error('Service temporarily unavailable. Please try again in a minute.');
            };
            const service = new LocatorService(generateFn);
            const code = await service.generate(finalInput, { preferredStrategy, framework, groupIntoPOM });
            return res.json({ success: true, code, metadata: { strategyOrder: [], framework } });
        }
        catch (error) {
            console.error('❌ Locator API Error:', error);
            return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal error' });
        }
    });
}
//# sourceMappingURL=locators.js.map