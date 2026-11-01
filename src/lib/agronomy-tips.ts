// Agronomy Tip of the Day Knowledge Base & Service
// Grounded in UMass Extension ("Disease Management in the Home Vegetable Garden")
// and Texas A&M AgriLife Extension ("Common Diseases of Vegetable Crops and Their Management")

export interface AgronomyTip {
  id: string;
  headline: string;
  tip: string;
  category:
    | 'soil_health'
    | 'disease_prevention'
    | 'organic_defense'
    | 'water_irrigation'
    | 'crop_rotation'
    | 'pest_vectors';
  cropFamilyFocus?: string;
  extensionSource: string;
  seasonContext: string;
  actionableStep: string;
  prohibitedPracticeWarning?: string;
  timestamp: number;
  isAiGenerated?: boolean;
}

export interface AgronomyTipRequest {
  location?: string;
  temperature?: number;
  condition?: string;
  humidity?: number;
  cropNames?: string[];
  forceRefresh?: boolean;
}

/**
 * Curated Ingested Knowledge Base from Extension Bulletins & Organic Best Practices
 */
export const CURATED_AGRONOMY_TIPS: AgronomyTip[] = [
  {
    id: 'tip-solanaceae-splash',
    headline: 'Lower Leaf Pruning & Mulch Barrier for Solanaceae',
    tip: 'Early Blight (*Alternaria*) and Septoria leaf spot spores overwinter in soil and splash onto bottom leaves during watering or rain. Prune away tomato foliage within 10–12 inches of the soil once plants establish, and install 2–3 inches of straw mulch immediately.',
    category: 'disease_prevention',
    cropFamilyFocus: 'Solanaceae (Tomato, Pepper, Eggplant, Potato)',
    extensionSource: 'UMass Extension: Disease Management in the Home Vegetable Garden',
    seasonContext: 'Mid-Season Vegetative & Fruit Development',
    actionableStep: 'Strip suckers and foliage touching the ground with clean snips. Apply a thick straw or dry grass mulch ring around each stem.',
    prohibitedPracticeWarning: 'Never overhead-spray nightshades in late afternoon; leaf wetness exceeding 4 hours dramatically spikes spore germination.',
    timestamp: Date.now(),
  },
  {
    id: 'tip-disease-triangle',
    headline: 'Break the Disease Triangle: Host, Pathogen & Leaf Wetness',
    tip: 'Plant disease requires three simultaneous conditions: a susceptible host, a virulent pathogen, and a favorable environment (chiefly standing water and high relative humidity). By keeping leaf surfaces dry and spacing beds for airflow, you disrupt the triangle without synthetic sprays.',
    category: 'organic_defense',
    cropFamilyFocus: 'All Vegetable Crops',
    extensionSource: 'Texas A&M AgriLife Extension: Plant Pathology Bulletin',
    seasonContext: 'High Humidity / Rainy Cycles',
    actionableStep: 'Switch to drip or furrow watering at root level, and space plants 20% wider during humid months to accelerate dew evaporation.',
    timestamp: Date.now(),
  },
  {
    id: 'tip-cucurbit-row-covers',
    headline: 'Physical Exclusion Netting for Cucumber Beetle & Wilt',
    tip: 'Bacterial wilt (*Erwinia tracheiphila*) is injected directly into cucumber and melon vines by striped and spotted cucumber beetles. Insect exclusion row covers installed at transplanting prevent 95% of infections.',
    category: 'pest_vectors',
    cropFamilyFocus: 'Cucurbitaceae (Cucumber, Squash, Melon)',
    extensionSource: 'UMass Extension: Vegetable Pest Series',
    seasonContext: 'Early Season Sowing & Transplanting',
    actionableStep: 'Secure floating row covers or 50-mesh netting over cucurbit beds at seedling emergence; remove covers only once female flowers open to allow honeybee pollination.',
    prohibitedPracticeWarning: 'Do not leave netting closed once blooming begins, or blossoms will drop without fruit set.',
    timestamp: Date.now(),
  },
  {
    id: 'tip-blossom-end-rot',
    headline: 'Blossom-End Rot is Moisture Erraticism, Not Calcium Absence',
    tip: 'Black, leathery sunken lesions at the blossom end of tomatoes and peppers are caused by localized calcium deficiency in fruit tissue. In 90% of garden soils, adequate calcium exists, but fluctuating soil moisture impedes transpiration-driven calcium uptake.',
    category: 'water_irrigation',
    cropFamilyFocus: 'Solanaceae (Tomatoes & Habanero Peppers)',
    extensionSource: 'Texas A&M AgriLife Extension: Common Diseases & Abiotic Disorders',
    seasonContext: 'High Heat & Rapid Fruit Set',
    actionableStep: 'Maintain even root moisture (30–40% soil moisture index). Use deep soaking twice weekly rather than frequent shallow sprinkling.',
    prohibitedPracticeWarning: 'Avoid rapid high-nitrogen fertilizer dressings, which force leafy growth at the expense of fruit calcium transport.',
    timestamp: Date.now(),
  },
  {
    id: 'tip-crucifer-clubroot',
    headline: 'Clubroot Suppression in Brassicas via Soil pH Management',
    tip: 'Clubroot (*Plasmodiophora brassicae*) thrives in acidic soils, causing stunted, wilted brassicas with swollen, deformed root galls. Raising soil pH above 6.8–7.0 using agricultural lime significantly inhibits resting spore germination.',
    category: 'soil_health',
    cropFamilyFocus: 'Brassicaceae (Cabbage, Kale, Cauliflower, Broccoli)',
    extensionSource: 'UMass Extension: Brassica Disease Management',
    seasonContext: 'Pre-Planting Soil Preparation',
    actionableStep: 'Test bed pH before setting transplants. Incorporate calcitic or dolomitic lime 4–6 weeks before planting if pH tests below 6.5.',
    timestamp: Date.now(),
  },
  {
    id: 'tip-biofungicide-colonization',
    headline: 'Biofungicide Shielding: Bacillus subtilis Spore Defense',
    tip: '*Bacillus subtilis* and *Trichoderma* beneficial microbes act as biological shields. When sprayed preventively, these beneficial bacteria colonize plant surfaces and synthesize lipopeptides that inhibit fungal germ tubes from puncturing plant tissue.',
    category: 'organic_defense',
    cropFamilyFocus: 'Solanaceous & Cucurbit Crops',
    extensionSource: 'Texas A&M AgriLife Extension: Integrated Disease Management',
    seasonContext: 'Preventive Disease Scouting Phase',
    actionableStep: 'Apply organic Bacillus subtilis or Trichoderma drench at transplanting and re-apply every 10–14 days before disease symptoms appear.',
    prohibitedPracticeWarning: 'Biofungicides are preventative, not curative; do not wait until leaves are 50% blighted before application.',
    timestamp: Date.now(),
  },
  {
    id: 'tip-sulfur-safety-warning',
    headline: 'Crucial Organic Rule: Never Apply Sulfur to Cucurbits or Above 85°F',
    tip: 'Wettable sulfur is a venerable organic fungicide, but it causes severe phytotoxic leaf burning and death on squashes, melons, and cucumbers. Furthermore, applying sulfur to any crop when temperatures exceed 85°F (29°C) leads to extreme scorching.',
    category: 'organic_defense',
    cropFamilyFocus: 'Cucurbits & General Crops',
    extensionSource: 'UMass Extension: Organic Fungicide Precautions',
    seasonContext: 'Warm Weather Disease Management',
    actionableStep: 'For powdery mildew on cucurbits, use Potassium Bicarbonate (MilStop) or dilute horticultural neem oil in the cool evening instead.',
    prohibitedPracticeWarning: 'NEVER apply sulfur to cucurbits (squash/melons) or in hot sunlight (>29°C / 85°F).',
    timestamp: Date.now(),
  },
  {
    id: 'tip-tool-sanitization',
    headline: 'Sanitize Pruning Shears to Arrest Systemic Bacterial Spread',
    tip: 'Bacterial canker (*Clavibacter*) and Tobacco Mosaic Virus (TMV) are spread mechanically from vine to vine by unsterilized pruning shears and sticky sap on hands and garden stakes.',
    category: 'disease_prevention',
    cropFamilyFocus: 'Tomatoes, Peppers, Orchards',
    extensionSource: 'UMass Extension: Sanitation Guidelines',
    seasonContext: 'Pruning & Trellising Routine',
    actionableStep: 'Dip pruning shears in 70% isopropyl alcohol or a 1:9 bleach solution between rows or after removing suspicious leaves. Wash hands with soap after handling tobacco products.',
    timestamp: Date.now(),
  },
  {
    id: 'tip-whitefly-tylcv-netting',
    headline: '50-Mesh Barrier Netting to Neutralize Whitefly-Borne TYLCV',
    tip: 'Tomato Yellow Leaf Curl Virus (TYLCV) causes severe leaf curling, chlorosis, and total flower abortion. The virus is vectored within 20 minutes of feeding by the silverleaf whitefly (*Bemisia tabaci*).',
    category: 'pest_vectors',
    cropFamilyFocus: 'Solanaceae & Fabaceae',
    extensionSource: 'Texas A&M AgriLife Extension: Vector-Borne Vegetable Viruses',
    seasonContext: 'Hot, Dry Season & Harmattan Winds',
    actionableStep: 'Install ultra-fine 50-mesh insect netting over nursery beds and young plants. Place yellow sticky cards 6 inches above crop canopies to monitor whitefly influx.',
    timestamp: Date.now(),
  },
  {
    id: 'tip-allium-pink-root-rotation',
    headline: '5-Year Crop Rotation for Allium Soilborne Pink Root',
    tip: 'Pink root (*Phoma terrestris*) infects onion and garlic feeder roots, turning them pink, brown, and necrotic. The fungus survives in soil for 4 to 5 years even in the absence of allium hosts.',
    category: 'crop_rotation',
    cropFamilyFocus: 'Alliums (Onion, Garlic, Shallots, Leeks)',
    extensionSource: 'Texas A&M AgriLife Extension: Allium Disease Management',
    seasonContext: 'Crop Rotation Planning',
    actionableStep: 'Never plant onions or garlic in the same bed within a 4-year cycle. Rotate with legumes (cowpeas/beans) or cereals (maize/sorghum) which are non-hosts.',
    timestamp: Date.now(),
  },
  {
    id: 'tip-morning-drip-hygiene',
    headline: 'Morning Drip Hydration: The Golden Rule of Folia Protection',
    tip: 'Fungal spores require a film of free water on leaf cuticle for 4 to 8 hours to germinate and penetrate stomata. Watering before 9:00 AM ensures rising temperatures and morning breezes dry any inadvertent foliage moisture quickly.',
    category: 'water_irrigation',
    cropFamilyFocus: 'All Garden & Field Crops',
    extensionSource: 'UMass Extension & Texas A&M AgriLife Extension Guidelines',
    seasonContext: 'Daily Irrigation Protocol',
    actionableStep: 'Run irrigation early in the morning. Direct all water at soil level around the drip-line, keeping the canopy bone-dry.',
    prohibitedPracticeWarning: 'Avoid evening overhead sprinkler watering which leaves leaves damp through the entire cool night.',
    timestamp: Date.now(),
  },
  {
    id: 'tip-legume-rhizobia-check',
    headline: 'Biological Nitrogen Inoculation & Root Nodule Inspection',
    tip: 'Cowpeas and green beans form symbiotic relationships with *Rhizobium* bacteria, extracting atmospheric nitrogen and enriching the soil for subsequent leafy greens. Active fixation produces pink/red interior nodule coloration.',
    category: 'soil_health',
    cropFamilyFocus: 'Fabaceae / Legumes (Cowpea, Green Beans, Groundnut)',
    extensionSource: 'Texas A&M AgriLife Extension: Soil Fertility & Cover Crops',
    seasonContext: 'Sowing & Active Flowering',
    actionableStep: 'Carefully dig up a sacrificial legume root at flowering; slice open a nodule. A vibrant pink or reddish interior confirms active nitrogen fixation (leghemoglobin).',
    timestamp: Date.now(),
  },
  {
    id: 'tip-marigold-nematode-fumigation',
    headline: 'Marigold Bio-Fumigation for Root-Knot Nematodes (Meloidogyne)',
    tip: 'Root-knot nematodes cause severe root galls, chlorosis, and drought susceptibility in continuous tomato cropping. Planting African or French Marigold (*Tagetes patula*) for two months on harvested fields before transplanting tomato drastically reduces soil nematode populations via root-exuded alpha-terthienyl. Incorporate chopped marigold green manure directly into the soil.',
    category: 'soil_health',
    cropFamilyFocus: 'Solanaceae (Tomato, Eggplant, Pepper)',
    extensionSource: 'HortiFresh West Africa & CSIR-Crops Research Institute: Tomato Pest Management Guide',
    seasonContext: 'Pre-Planting Soil Preparation & Bio-Fumigation',
    actionableStep: 'Sow Tagetes patula marigolds 60 days prior to transplanting tomatoes; plough the flowering biomass directly into the top 15cm of soil.',
    prohibitedPracticeWarning: 'Avoid chemical nematicides and soil fumigants; rely on marigold bio-trapping and resistant cultivars like Kilele.',
    timestamp: Date.now(),
  },
  {
    id: 'tip-tomato-mosaic-virus-tsp',
    headline: 'Seed & Tool Disinfection Against Tomato Mosaic Virus (TMV)',
    tip: 'Tomato Mosaic Virus (TMV) causes fern-like leaves, mottled yellow-green patches, and fruit internal browning. The virus is seedborne and spread mechanically by handling and unsterilized shears. Soaking farmer-saved seeds in 10% trisodium phosphate (Na3PO4) for 15 minutes neutralizes viral coats.',
    category: 'disease_prevention',
    cropFamilyFocus: 'Solanaceae (Tomato & Pepper)',
    extensionSource: 'HortiFresh West Africa & CSIR-Crops Research Institute: Tomato Disease Management',
    seasonContext: 'Seed Sowing & Trellising Routine',
    actionableStep: 'Disinfect pruning shears, stakes, and footwear in 10% bleach solution between rows. Wash hands with soap and water before entering fields.',
    prohibitedPracticeWarning: 'Never handle or bring tobacco products (cigarettes or snuff) near tomato plots; tobacco users mechanically transmit mosaic virus.',
    timestamp: Date.now(),
  },
  {
    id: 'tip-tuta-absoluta-trapping',
    headline: 'Tuta absoluta Mass Trapping & Onion Intercropping',
    tip: 'South American tomato leafminer (*Tuta absoluta*) larvae tunnel into leaves and green fruits, producing destructive blotch mines. Intercropping tomatoes with Alliums (onions or shallots) deters adult moths while preserving native predatory mirid bugs (*Nesidiocoris tenuis*) and *Trichogramma* egg parasitoids.',
    category: 'pest_vectors',
    cropFamilyFocus: 'Solanaceae (Tomatoes & Potatoes)',
    extensionSource: 'HortiFresh West Africa & Univ of Ghana Soil and Irrigation Research Centre',
    seasonContext: 'Vegetative to Fruiting Cycle',
    actionableStep: 'Deploy pheromone delta traps (1 trap/ha for scouting, 40 traps/ha for mass trapping) or greenhouse light traps suspended over soapy water baths.',
    prohibitedPracticeWarning: 'Destroy all wild solanaceous weeds (such as black nightshade) around farm boundaries where Tuta moths overwinter.',
    timestamp: Date.now(),
  },
  {
    id: 'tip-afternoon-biopesticide-spraying',
    headline: 'Late Afternoon Biopesticide Timing (4:00 PM – 6:00 PM)',
    tip: 'Biological and microbial pesticides—including *Bacillus thuringiensis* (Bt), *Beauveria bassiana*, *Metarhizium anisopliae*, and cold-pressed Neem oil—are rapidly deactivated by intense midday solar UV rays. Spraying in the late afternoon prevents UV breakdown and protects honeybees and pollinators.',
    category: 'organic_defense',
    cropFamilyFocus: 'All Vegetable & Fruit Crops',
    extensionSource: 'HortiFresh West Africa IPM Manual & Purdue University Extension',
    seasonContext: 'Flowering & Active Fruiting Stage',
    actionableStep: 'Calibrate knapsack sprayers with cone nozzles and apply biopesticides strictly between 4:00 PM and 6:00 PM as temperatures cool.',
    prohibitedPracticeWarning: 'Never spray pesticides during peak morning pollinator activity (8:00 AM – 1:00 PM) or when plants are under severe midday drought stress.',
    timestamp: Date.now(),
  },
  {
    id: 'tip-alata-samina-soft-bodied',
    headline: 'Local Potassic Black Soap (Alata Samina) for Soft-Bodied Pests',
    tip: 'Soft-bodied pests like whiteflies (*Bemisia tabaci*), cotton aphids, and mealybugs suck sap and cause black sooty mould. A natural potassic black soap solution (*alata samina*) at 75g per 15L water safely dissolves insect waxy cuticles without leaving chemical residues.',
    category: 'organic_defense',
    cropFamilyFocus: 'Tomato, Pepper, Leafy Greens',
    extensionSource: 'HortiFresh West Africa & CSIR-Crops Research Institute Field Guide',
    seasonContext: 'Early Sucking Pest Infestation',
    actionableStep: 'Dissolve 75g of genuine potassic black soap in a 15-litre knapsack sprayer. Coat lower leaf surfaces thoroughly during early morning or dusk.',
    prohibitedPracticeWarning: 'Do not exceed 75g/15L concentration or apply under blazing midday sun to prevent leaf scorching.',
    timestamp: Date.now(),
  },
  {
    id: 'tip-bacterial-wilt-glass-test',
    headline: 'Bacterial Wilt (Ralstonia) Water Stream Diagnostic & 80cm Spacing',
    tip: '*Ralstonia solanacearum* causes sudden permanent wilting of green tomato plants. To confirm in the field, cut the stem base transversely and immerse it in clear cold water: after 2–3 minutes, milky white bacterial slime will stream out of vascular bundles.',
    category: 'disease_prevention',
    cropFamilyFocus: 'Solanaceae (Tomato, Eggplant, Pepper)',
    extensionSource: 'HortiFresh West Africa & Univ of Ghana Plant Pathology',
    seasonContext: 'Post-Seedling Vegetative Phase',
    actionableStep: 'Space tomato plants 80cm × 80cm for aeration. Rogue out and burn plants showing vascular streaming; rotate fields with maize or beans for 2–3 years.',
    prohibitedPracticeWarning: 'Do not spread irrigation runoff or move contaminated soil from wilted plants to healthy crop rows.',
    timestamp: Date.now(),
  },
  {
    id: 'tip-colorado-potato-beetle-straw',
    headline: '4–6 Inch Straw Mulch Barrier Against Colorado Potato Beetle',
    tip: 'Colorado potato beetles (*Leptinotarsa decemlineata*) overwinter in soil and walk toward emerging nightshades. Applying a thick 4 to 6 inch layer of clean straw mulch on both sides of the row immediately after hilling creates a physical obstacle that cuts beetle infestation by over 50%.',
    category: 'pest_vectors',
    cropFamilyFocus: 'Solanaceae (Potato, Tomato, Eggplant)',
    extensionSource: 'Purdue University Extension Entomology: Managing Insects in the Home Vegetable Garden',
    seasonContext: 'Early Sowing & Hilling Phase',
    actionableStep: 'Tuck 4 to 6 inches of clean straw or dry grass tightly along plant rows right after hilling. Handpick 1st and 2nd instar reddish larvae.',
    prohibitedPracticeWarning: 'Avoid broad-spectrum carbaryl (Sevin); beetles quickly become resistant while ladybugs, lacewings, and predatory ground beetles are killed.',
    timestamp: Date.now(),
  },
  {
    id: 'tip-beer-slug-pie-pan',
    headline: 'Beer-Baited Pie Pan Traps for Slugs in Cool, Wet Weather',
    tip: 'Slugs skeletonize leaves and defoliate young seedlings during prolonged cool, cloudy, or rainy periods. Because slugs are drawn to fermenting yeast volatiles, shallow pans baited with beer or yeast-water buried flush with the soil attract and drown slugs safely without metaldehyde poisons.',
    category: 'pest_vectors',
    cropFamilyFocus: 'Leafy Greens, Brassicas, Cucumbers',
    extensionSource: 'Purdue University Extension Entomology: Home Vegetable Garden Series',
    seasonContext: 'Cool, Rainy & Overcast Weather Spells',
    actionableStep: 'Bury recycled pie pans or plastic saucers flush with ground level near damp garden mulch. Fill with 1/2 inch of beer or fermented yeast water; empty weekly.',
    prohibitedPracticeWarning: 'Never apply chemical metaldehyde slug pellets where domestic pets, wildlife, or children can reach them.',
    timestamp: Date.now(),
  },
  {
    id: 'tip-squash-vine-borer-clearwing',
    headline: 'Squash Vine Borer: Daytime Clearwing Moth Scouting & Frass Alert',
    tip: 'Squash vine borer is a daytime-flying clearwing moth that resembles an orange and black wasp. Larvae bore into squash and pumpkin vine bases, pushing out greenish-brown sawdust-like frass and causing sudden runner wilt. Once inside, surface insecticides fail.',
    category: 'pest_vectors',
    cropFamilyFocus: 'Cucurbitaceae (Squash, Pumpkin, Zucchini)',
    extensionSource: 'Purdue University Extension Entomology Bulletin E-21-W',
    seasonContext: 'Mid-Season Vine Running & Early Flowering',
    actionableStep: 'Inspect vine bases for entry holes and frass. Slit the stem lengthwise with a clean razor to remove the grub, then bury the wounded stem with moist soil to root.',
    prohibitedPracticeWarning: 'Destroy all old squash crop residue and vines immediately after harvest to eliminate overwintering pupae in the soil.',
    timestamp: Date.now(),
  },
  {
    id: 'tip-conserve-beneficial-arthropods',
    headline: 'Conserve Beneficial Predators: Protect Ladybugs, Lacewings & Spiders',
    tip: 'Over 95% of insects in home gardens are beneficial or harmless. Lady beetle adults/larvae, green lacewing larvae ("aphid lions"), hoverfly maggots, predatory stink bugs, and jumping spiders provide constant free bio-control. Overuse of broad-spectrum insecticides wipes them out, triggering secondary pest explosions.',
    category: 'organic_defense',
    cropFamilyFocus: 'All Garden & Vegetable Crops',
    extensionSource: 'Purdue University Extension & HortiFresh Integrated Pest Management',
    seasonContext: 'Active Growing Season Scouting',
    actionableStep: 'Tolerate low, sub-threshold aphid or mite populations to provide food for beneficial predator larvae. Spot-treat only infested leaves with insecticidal soap.',
    prohibitedPracticeWarning: 'Never spray insecticides on crops during active bloom to protect foraging honeybees and native solitary pollinators.',
    timestamp: Date.now(),
  },
];

const LOCAL_STORAGE_TIP_KEY = 'verdescan_agronomy_tip_v1';
const LOCAL_STORAGE_DATE_KEY = 'verdescan_agronomy_tip_date';

/**
 * Get tip from localStorage if saved today and not forced
 */
export function getCachedDailyTip(): AgronomyTip | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const savedDate = window.localStorage.getItem(LOCAL_STORAGE_DATE_KEY);
    const today = new Date().toISOString().split('T')[0];
    if (savedDate !== today) return null;

    const raw = window.localStorage.getItem(LOCAL_STORAGE_TIP_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Cache tip in localStorage
 */
export function saveDailyTip(tip: AgronomyTip): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const today = new Date().toISOString().split('T')[0];
    window.localStorage.setItem(LOCAL_STORAGE_DATE_KEY, today);
    window.localStorage.setItem(LOCAL_STORAGE_TIP_KEY, JSON.stringify(tip));
  } catch {
    // Ignore storage quota
  }
}

/**
 * Fallback selector that matches user's current environment or crops
 */
export function selectCuratedFallbackTip(req?: AgronomyTipRequest): AgronomyTip {
  const crops = (req?.cropNames || []).map((c) => c.toLowerCase());
  const temp = req?.temperature ?? 26;
  const cond = (req?.condition || '').toLowerCase();
  const loc = (req?.location || '').toLowerCase();

  // Location-grounded matching (e.g. West Africa / Tropical / Ghana)
  const isWestAfricaOrTropical =
    loc.includes('ghana') ||
    loc.includes('kumasi') ||
    loc.includes('accra') ||
    loc.includes('west africa') ||
    loc.includes('tropical') ||
    loc.includes('nigeria') ||
    loc.includes('kenya');

  // If user has tomatoes/peppers in West Africa or warm region:
  if (crops.some((c) => c.includes('tomato') || c.includes('pepper') || c.includes('habanero'))) {
    if (isWestAfricaOrTropical) {
      // Prioritize HortiFresh West Africa practical tips
      const hortiTipIds = [
        'tip-marigold-nematode-fumigation',
        'tip-alata-samina-soft-bodied',
        'tip-tuta-absoluta-trapping',
        'tip-afternoon-biopesticide-spraying',
        'tip-bacterial-wilt-glass-test',
        'tip-tomato-mosaic-virus-tsp',
      ];
      const selectedId = hortiTipIds[new Date().getDate() % hortiTipIds.length];
      const match = CURATED_AGRONOMY_TIPS.find((t) => t.id === selectedId);
      if (match) return match;
    }

    if (temp >= 28) {
      return CURATED_AGRONOMY_TIPS.find((t) => t.id === 'tip-blossom-end-rot') || CURATED_AGRONOMY_TIPS[0];
    }
    return CURATED_AGRONOMY_TIPS.find((t) => t.id === 'tip-solanaceae-splash') || CURATED_AGRONOMY_TIPS[0];
  }

  // If user has potato or eggplant:
  if (crops.some((c) => c.includes('potato') || c.includes('eggplant'))) {
    return CURATED_AGRONOMY_TIPS.find((t) => t.id === 'tip-colorado-potato-beetle-straw') || CURATED_AGRONOMY_TIPS[0];
  }

  // If user has cucurbits (squash, pumpkin, cucumber, melon, zucchini):
  const hasCucurbit = crops.some(
    (c) =>
      c.includes('squash') ||
      c.includes('pumpkin') ||
      c.includes('zucchini') ||
      c.includes('cucumber') ||
      c.includes('melon')
  );

  if (hasCucurbit) {
    if (temp >= 28) {
      return CURATED_AGRONOMY_TIPS.find((t) => t.id === 'tip-sulfur-safety-warning') || CURATED_AGRONOMY_TIPS[0];
    }
    if (crops.some((c) => c.includes('squash') || c.includes('pumpkin') || c.includes('zucchini'))) {
      return CURATED_AGRONOMY_TIPS.find((t) => t.id === 'tip-squash-vine-borer-clearwing') || CURATED_AGRONOMY_TIPS[0];
    }
    return CURATED_AGRONOMY_TIPS.find((t) => t.id === 'tip-cucurbit-row-covers') || CURATED_AGRONOMY_TIPS[0];
  }

  // If rainy or cool/wet weather:
  if (cond.includes('rain') || cond.includes('humid') || cond.includes('drizzle')) {
    if (temp <= 22) {
      return CURATED_AGRONOMY_TIPS.find((t) => t.id === 'tip-beer-slug-pie-pan') || CURATED_AGRONOMY_TIPS[1];
    }
    return CURATED_AGRONOMY_TIPS.find((t) => t.id === 'tip-disease-triangle') || CURATED_AGRONOMY_TIPS[1];
  }

  // If cabbage/kale:
  if (crops.some((c) => c.includes('cabbage') || c.includes('kale') || c.includes('brassica'))) {
    return CURATED_AGRONOMY_TIPS.find((t) => t.id === 'tip-crucifer-clubroot') || CURATED_AGRONOMY_TIPS[4];
  }

  // General beneficial arthropods & biopesticides
  if (new Date().getDate() % 2 === 0) {
    return CURATED_AGRONOMY_TIPS.find((t) => t.id === 'tip-afternoon-biopesticide-spraying') || CURATED_AGRONOMY_TIPS[0];
  }

  // Pick by day of month for deterministic rotation
  const dayIndex = new Date().getDate() % CURATED_AGRONOMY_TIPS.length;
  return CURATED_AGRONOMY_TIPS[dayIndex] || CURATED_AGRONOMY_TIPS[0];
}

/**
 * Fetches an AI-powered localized agronomy tip via Gemini server proxy,
 * gracefully falling back to extension-grounded curated tips.
 */
export async function fetchAgronomyTip(req: AgronomyTipRequest = {}): Promise<AgronomyTip> {
  // If not forcing refresh, check daily cache first
  if (!req.forceRefresh) {
    const cached = getCachedDailyTip();
    if (cached) return cached;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8500);

    const response = await fetch('/api/agronomy/tip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        location: req.location || 'Local Farm & Garden',
        temperature: req.temperature,
        condition: req.condition,
        humidity: req.humidity,
        cropNames: req.cropNames || [],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.status === 'success' && data.tip) {
        const aiTip: AgronomyTip = {
          id: `tip-ai-${Date.now()}`,
          headline: data.tip.headline || 'Localized Agronomic Advisory',
          tip: data.tip.tip || 'Follow organic crop management principles to safeguard your harvest.',
          category: data.tip.category || 'disease_prevention',
          cropFamilyFocus: data.tip.cropFamilyFocus || 'Garden Vegetable Crops',
          extensionSource: data.tip.extensionSource || 'UMass Extension & Texas A&M AgriLife Knowledge Base',
          seasonContext: data.tip.seasonContext || 'Current Growing Phase',
          actionableStep: data.tip.actionableStep || 'Inspect lower leaves and maintain steady root hydration.',
          prohibitedPracticeWarning: data.tip.prohibitedPracticeWarning,
          timestamp: Date.now(),
          isAiGenerated: true,
        };

        saveDailyTip(aiTip);
        return aiTip;
      }
    }
  } catch (err) {
    console.warn('[AgronomyTip] Remote fetch failed or timed out, loading extension knowledge base:', err);
  }

  // Curated Fallback
  const fallback = selectCuratedFallbackTip(req);
  saveDailyTip(fallback);
  return fallback;
}
