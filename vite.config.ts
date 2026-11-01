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

      // Daily Agronomy Tip endpoint grounded in UMass Extension & Texas A&M AgriLife Bulletins
      server.middlewares.use('/api/agronomy/tip', async (req, res) => {
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
                message: 'No GEMINI_API_KEY configured; utilizing local extension knowledge base',
              })
            );
            return;
          }

          try {
            const parsed = JSON.parse(bodyStr || '{}');
            const location = parsed.location || 'Local Farm & Garden';
            const temp = parsed.temperature !== undefined ? `${parsed.temperature}°C` : 'seasonal temp';
            const condition = parsed.condition || 'variable weather';
            const crops = Array.isArray(parsed.cropNames) && parsed.cropNames.length > 0
              ? parsed.cropNames.join(', ')
              : 'common vegetable crops (Tomato, Pepper, Leafy Greens, Cucurbits)';

            const ai = new GoogleGenAI({
              apiKey,
              httpOptions: {
                headers: {
                  'User-Agent': 'aistudio-build',
                },
              },
            });

            const systemPrompt = `You are a Senior Agronomist and Extension Plant Pathologist for VerdeScan.
Generate a seasonal "Agronomy Tip of the Day" directly grounded in the following university extension publications:
1. HortiFresh West Africa / CSIR / Univ of Ghana: "Pest Management Guide for Tomato"
2. Purdue University Extension Entomology: "Managing Insects in the Home Vegetable Garden"
3. UMass Extension: "Disease Management in the Home Vegetable Garden"
4. Texas A&M AgriLife Extension: "Common Diseases of Vegetable Crops and Their Management"

STRICT EXTENSION PRINCIPLES:
- Disclose and break the "Disease Triangle" (Host, Pathogen, Environment/Free Leaf Wetness).
- Prioritize cultural controls: drip or furrow irrigation early in the morning, bottom pruning lower 10-12 inches of Solanaceae foliage to prevent soil splash, raised beds for drainage, 2-3 inch clean straw mulching.
- Physical exclusion: 50-mesh insect netting for whiteflies (TYLCV), row covers before flowering for cucumber beetles (bacterial wilt), 4-6 inch straw mulch buffer against Colorado potato beetle, daytime clearwing moth scouting for squash vine borer, beer pie-pan traps for slugs.
- Botanical family rotations: Solanaceae (2-3 yrs), Brassicas (pH > 6.8 calcitic lime against clubroot), Alliums (4-5 yrs against pink root), Marigold (Tagetes patula) 2-month pre-planting bio-fumigation against Meloidogyne nematodes.
- Organic biofungicides & biopesticides: Bacillus subtilis, Trichoderma, Potassium Bicarbonate, Alata Samina (local potassic black soap 75g/15L).
- TIMING PROTOCOL: Spray biopesticides (Bt, Metarhizium, Beauveria, Neem) late in the afternoon (4:00 PM - 6:00 PM) to avoid solar UV degradation and safeguard pollinators.
- NON-NEGOTIABLE SAFETY RESTRICTION: NEVER recommend sulfur on Cucurbits (causes extreme phytotoxic burn) or when temperatures exceed 85°F (29°C). Never recommend synthetic chemical dosing from memory; only organic and cultural practices.

Context:
- Farm Location: ${location}
- Current Weather: ${condition}, ${temp}
- Growing Crops: ${crops}

Output strictly valid JSON with this exact schema:
{
  "headline": "Punchy 5-8 word actionable title",
  "tip": "2-3 clear sentences explaining the biological mechanism and defense rationale",
  "category": "disease_prevention" | "organic_defense" | "soil_health" | "water_irrigation" | "crop_rotation" | "pest_vectors",
  "cropFamilyFocus": "e.g. Solanaceae (Tomato/Pepper) or Cucurbitaceae",
  "extensionSource": "UMass Extension & Texas A&M AgriLife Protocol",
  "seasonContext": "e.g. Mid-Season Humid Phase or Dry Harmattan Season",
  "actionableStep": "One direct action the grower can perform in the garden today",
  "prohibitedPracticeWarning": "One dangerous or counterproductive practice to strictly avoid"
}`;

            const response = await ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: 'Generate today\'s agronomy tip for the farmer.',
              config: {
                systemInstruction: systemPrompt,
                responseMimeType: 'application/json',
              },
            });

            const text = response.text || '';
            const tipData = JSON.parse(text);

            res.statusCode = 200;
            res.end(
              JSON.stringify({
                status: 'success',
                tip: tipData,
              })
            );
          } catch (err: unknown) {
            res.statusCode = 500;
            res.end(
              JSON.stringify({
                status: 'fallback',
                error: err instanceof Error ? err.message : 'Tip generation failed',
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
