import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import { GoogleGenAI } from '@google/genai';

function botanistApiPlugin(): Plugin {
  return {
    name: 'botanist-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/botanist/chat', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        let bodyStr = '';
        req.on('data', (chunk) => {
          bodyStr += chunk;
        });

        req.on('end', async () => {
          res.setHeader('Content-Type', 'application/json');

          const apiKey = process.env.GEMINI_API_KEY;
          if (!apiKey) {
            res.statusCode = 503;
            res.end(
              JSON.stringify({
                status: 'fallback',
                message: 'No GEMINI_API_KEY configured; utilizing tier 2 local agronomy engine',
              })
            );
            return;
          }

          try {
            const parsed = JSON.parse(bodyStr || '{}');
            const userPrompt = parsed.prompt || '';
            const gardenContext = parsed.gardenPlants ? JSON.stringify(parsed.gardenPlants) : '';
            const weatherContext = parsed.weather ? JSON.stringify(parsed.weather) : '';

            const ai = new GoogleGenAI({
              apiKey,
              httpOptions: {
                headers: {
                  'User-Agent': 'aistudio-build',
                },
              },
            });

            const systemPrompt = `You are an expert agronomist, plant pathologist, and botanical consultant for VerdeScan.
You provide friendly, precise, and scientifically accurate plant care, disease diagnosis, and pest control advice.
NON-NEGOTIABLE SAFETY RULES:
1. Always prioritize organic-first, cultural, and biological treatments (e.g. neem oil, compost tea, companion planting, airflow).
2. Never hallucinate pesticide chemical dosages. Only recommend safe, reviewed agricultural practices.
3. Be concise and actionable.
User Garden Crops Context: ${gardenContext}
Local Weather Context: ${weatherContext}

Format your output strictly as valid JSON with two fields:
{
  "thought": "A brief 5-10 word summary of what you are checking or analyzing (e.g. 'Checking soil moisture & humidity tolerances', 'Analyzing biological pest control protocols')",
  "text": "Your helpful response to the grower or gardener (1-3 short paragraphs max)."
}`;

            const response = await ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: userPrompt,
              config: {
                systemInstruction: systemPrompt,
                responseMimeType: 'application/json',
              },
            });

            const text = response.text || '';
            let jsonOutput: { thought?: string; text?: string } = {};
            try {
              jsonOutput = JSON.parse(text);
            } catch {
              jsonOutput = {
                thought: 'Synthesizing agronomic principles from Gemini',
                text: text || 'I am ready to help you with your plants and garden crops.',
              };
            }

            res.statusCode = 200;
            res.end(
              JSON.stringify({
                status: 'success',
                thought: jsonOutput.thought || 'Consulting botanical records with Gemini Flash',
                text: jsonOutput.text || text,
              })
            );
          } catch (err: unknown) {
            res.statusCode = 500;
            res.end(
              JSON.stringify({
                status: 'fallback',
                error: err instanceof Error ? err.message : 'Gemini request failed',
              })
            );
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), botanistApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname ?? '.', '.'),
        '@verdescan/shared': path.resolve(import.meta.dirname ?? '.', 'packages/shared/src/index.ts'),
        '@verdescan/kb': path.resolve(import.meta.dirname ?? '.', 'packages/kb/src/index.ts'),
        '@verdescan/functions': path.resolve(import.meta.dirname ?? '.', 'functions/src/index.ts'),
        '@verdescan/eval': path.resolve(import.meta.dirname ?? '.', 'packages/eval/src/runner.ts'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
