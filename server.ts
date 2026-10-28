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
