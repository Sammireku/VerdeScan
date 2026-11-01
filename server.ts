// T-025: Production Full-Stack Server for VerdeScan (Render Web Service / Node.js Runner)
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Health Check Endpoint for Render Zero-Downtime Deployments
app.get('/healthz', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'verdescan-production', timestamp: new Date().toISOString() });
});

// Server-Side Gemini AI Botanist Proxy Route
app.post('/api/botanist/chat', async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({
      status: 'fallback',
      message: 'No GEMINI_API_KEY configured; utilizing tier 2 local agronomy engine',
    });
    return;
  }

  try {
    const userPrompt = req.body?.prompt || '';
    const gardenContext = req.body?.gardenPlants ? JSON.stringify(req.body.gardenPlants) : '';
    const weatherContext = req.body?.weather ? JSON.stringify(req.body.weather) : '';

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'verdescan-production',
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
  "thought": "A brief 5-10 word summary of what you are checking or analyzing",
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

    res.status(200).json({
      status: 'success',
      thought: jsonOutput.thought || 'Consulting botanical records with Gemini Flash',
      text: jsonOutput.text || text,
    });
  } catch (err: unknown) {
    res.status(500).json({
      status: 'fallback',
      error: err instanceof Error ? err.message : 'Gemini request failed',
    });
  }
});

// Daily Agronomy Tip endpoint grounded in UMass Extension & Texas A&M AgriLife Bulletins
app.post('/api/agronomy/tip', async (req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({
      status: 'fallback',
      message: 'No GEMINI_API_KEY configured; utilizing local extension knowledge base',
    });
    return;
  }

  try {
    const { location = 'Local Farm & Garden', temperature, condition = 'variable weather', cropNames = [] } = req.body || {};
    const temp = temperature !== undefined ? `${temperature}°C` : 'seasonal temp';
    const crops = Array.isArray(cropNames) && cropNames.length > 0
      ? cropNames.join(', ')
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

    res.status(200).json({
      status: 'success',
      tip: tipData,
    });
  } catch (err: unknown) {
    res.status(500).json({
      status: 'fallback',
      error: err instanceof Error ? err.message : 'Tip generation failed',
    });
  }
});

// Serve Vite Static Production Bundle from /dist
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// SPA Catch-All fallback to index.html
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[VerdeScan] Production server running on port ${PORT}`);
});
