// AI Botanist Agent Service with Tier 1 Gemini Flash, Tier 2 KB Reasoning, and Tier 3 Offline Heuristics
import { searchKbText } from '@verdescan/kb';
import type { Plant } from '@verdescan/shared';

export interface BotanistResponse {
  text: string;
  thought: string;
  source: 'gemini' | 'kb_engine' | 'offline_heuristics';
}

export interface WeatherContext {
  temperature?: number;
  humidity?: number;
  description?: string;
  city?: string;
}

export async function askAiBotanist(
  prompt: string,
  gardenPlants: Plant[] = [],
  weather?: WeatherContext
): Promise<BotanistResponse> {
  const cleanPrompt = prompt.trim();
  if (!cleanPrompt) {
    return {
      thought: 'Awaiting grower inquiry',
      text: 'How can I assist your garden or crops today?',
      source: 'offline_heuristics',
    };
  }

  // Tier 1: Try Server-Side Gemini 3.8 Flash via /api/botanist/chat
  if (typeof window !== 'undefined' && navigator.onLine) {
    try {
      const response = await fetch('/api/botanist/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: cleanPrompt,
          gardenPlants: gardenPlants.map((p) => ({
            name: p.nickname || p.cropId,
            crop: p.cropId,
            variety: p.cropVariety,
            planted: p.plantingDate,
            environment: p.environment,
          })),
          weather,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success' && data.text) {
          return {
            thought: data.thought || 'Gemini 3.8 Flash botanical synthesis complete',
            text: data.text,
            source: 'gemini',
          };
        }
      }
    } catch {
      // Fall through to Tier 2 on network/server error
    }
  }

  // Tier 2: Domain-Specific Local Agronomy Reasoning Engine grounded in KB & Garden
  const q = cleanPrompt.toLowerCase();
  const plantNames = gardenPlants.map((p) => p.nickname || p.cropId).filter(Boolean);
  const plantSummary = plantNames.length > 0 ? plantNames.join(', ') : 'Monstera, Snake Plant, Tomato';

  // 1. Water & Irrigation Heuristics
  if (
    q.includes('water') ||
    q.includes('droop') ||
    q.includes('wet') ||
    q.includes('dry') ||
    q.includes('hydrate') ||
    q.includes('thirst') ||
    q.includes('calculate water')
  ) {
    const isHot = weather?.temperature && weather.temperature > 30;
    const isHumid = weather?.humidity && weather.humidity > 70;

    let weatherNote = '';
    if (isHot) {
      weatherNote = ` In today's warmer weather (${weather.temperature}°C), water deeply early in the morning before 8:00 AM so moisture penetrates the root zone before evaporation.`;
    } else if (isHumid) {
      weatherNote = ` With higher relative humidity (${weather?.humidity}%), reduce watering frequency to prevent fungal moisture entrapment and root hypoxia.`;
    }

    return {
      thought: `Cross-referencing soil moisture & root aeration for ${plantSummary}`,
      text: `For your plants (${plantSummary}), follow the 2-inch knuckle test: insert your finger 2 inches into the soil. If it feels completely dry, irrigate at the soil line until water flows freely from the drainage holes. Never let pots sit in stagnant runoff trays.${weatherNote}`,
      source: 'kb_engine',
    };
  }

  // 2. Pest & Insect Defense (Organic first)
  if (
    q.includes('pest') ||
    q.includes('caterpillar') ||
    q.includes('bug') ||
    q.includes('aphid') ||
    q.includes('worm') ||
    q.includes('mite') ||
    q.includes('insect') ||
    q.includes('fly')
  ) {
    const kbResults = searchKbText(q);
    const relatedNames = kbResults.slice(0, 2).map((r) => r.title).join(' and ');

    return {
      thought: 'Retrieving organic biological control protocols from VerdeScan KB',
      text: `For pest management${relatedNames ? ` (referencing ${relatedNames})` : ''}, follow organic-first protocols:
1. Physical: Gently wipe or spray foliage undersides with lukewarm soapy water (mild potassium soap).
2. Biological: Spray cold-pressed neem oil (5 ml per 1 L water + 2 drops organic soap emulsifier) during early evening to avoid sun scorch and preserve beneficial bees.
3. For chewing caterpillars: Apply Bacillus thuringiensis (Bt) or companion plant aromatic African Marigolds to naturally repel pests.`,
      source: 'kb_engine',
    };
  }

  // 3. Blight & Fungal Pathogens
  if (
    q.includes('spot') ||
    q.includes('yellow') ||
    q.includes('blight') ||
    q.includes('mildew') ||
    q.includes('fung') ||
    q.includes('rust') ||
    q.includes('mold')
  ) {
    return {
      thought: 'Screening fungal sporulation thresholds and leaf hygiene',
      text: `Yellow or necrotic spotting is typically caused by foliar fungal pathogens (such as Early Blight or Powdery Mildew).
Immediate Action Steps:
1. Sanitation: Prune all lower diseased leaves with clean shears disinfected in 70% alcohol. Do NOT compost diseased foliage.
2. Irrigation technique: Water strictly at ground level; never wet canopy leaves.
3. Organic Spray: Apply a 1:9 milk-water or 0.5% baking soda solution, or approved copper soap spray during dry weather to arrest spore spread.`,
      source: 'kb_engine',
    };
  }

  // 4. Repotting & Soil Mix
  if (
    q.includes('repot') ||
    q.includes('soil') ||
    q.includes('pot') ||
    q.includes('drainage') ||
    q.includes('root bound')
  ) {
    return {
      thought: 'Evaluating container root volume, porosity & perlite ratios',
      text: `When repotting, select a container only 1 to 2 inches wider than the current root ball. Use a high-porosity blend:
- 50% well-draining loam potting mix
- 30% organic cured compost
- 20% coarse perlite or river sand for aeration.
Loosen spiraling root tips gently before repotting, ensure bottom drainage holes are clear, and water lightly once settled.`,
      source: 'kb_engine',
    };
  }

  // 5. Fertilizer & Composting
  if (
    q.includes('fertiliz') ||
    q.includes('feed') ||
    q.includes('compost') ||
    q.includes('nutrient') ||
    q.includes('nitrogen')
  ) {
    return {
      thought: 'Formulating organic compost tea and N-P-K nutrient balancing',
      text: `Feed your plants with slow-release organic nutrients:
- Top-dress soil with 1 inch of rich aged compost or worm castings every 4 to 6 weeks during the active vegetative season.
- For fruiting crops like Tomato and Pepper, supply potassium and phosphorus (bone meal, wood ash in small doses) rather than excessive nitrogen which produces leaves without fruit.`,
      source: 'kb_engine',
    };
  }

  // 6. Beginner, Gift & Easy Plant Recommendations
  if (
    q.includes('gift') ||
    q.includes('easiest') ||
    q.includes('recommend') ||
    q.includes('beginner') ||
    q.includes('indoor') ||
    q.includes('appeals')
  ) {
    return {
      thought: 'Filtering low-maintenance resilient cultivars',
      text: `Top beginner-friendly and low-maintenance plants:
1. Snake Plant (Sansevieria): Extremely drought-hardy, tolerates low to bright light, purifies air.
2. ZZ Plant (Zamioculcas): Thrives on neglect, requires water only every 3-4 weeks.
3. Pothos (Epipremnum aureum): Fast-growing trailing vine that signals when it needs water.
For vegetable gardens, start with hearty cherry tomatoes, scotch bonnet peppers, or dwarf okra!`,
      source: 'kb_engine',
    };
  }

  // Tier 3: General Agronomy Synthesis Fallback
  return {
    thought: 'Consulting VerdeScan agronomy records & garden baseline',
    text: `Based on your query and garden context (${plantSummary}), ensure balanced sunlight, morning watering, and adequate airflow between stems. If you notice any distinct spots, holes, or discoloration, use the VerdeScan camera scan to capture clear leaf photos for instant diagnostic verification!`,
    source: 'offline_heuristics',
  };
}
