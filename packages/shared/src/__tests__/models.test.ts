// T-003: Comprehensive Canonical Models Unit Tests (Section 4)
import { describe, expect, it } from 'vitest';
import {
  PlantSchema,
  DiagnosisSchema,
  KbProblemSchema,
  KbTreatmentSchema,
  KbGuideSchema,
  KbChunkSchema,
  CandidateSchema,
} from '../index';

describe('T-003: Canonical Models Tests', () => {
  it('validates a valid Plant document', () => {
    const validPlant = {
      id: 'plant-001',
      cropId: 'tomato',
      nickname: 'Big Red Heirloom',
      plantedOn: '2026-10-01T00:00:00Z',
      location: 'bed',
      sunExposure: 'full',
      createdAt: '2026-10-01T00:00:00Z',
    };
    expect(PlantSchema.safeParse(validPlant).success).toBe(true);
  });

  it('rejects an invalid Plant location', () => {
    const invalidPlant = {
      id: 'plant-001',
      cropId: 'tomato',
      location: 'rooftop_experimental', // invalid location
      createdAt: '2026-10-01T00:00:00Z',
    };
    expect(PlantSchema.safeParse(invalidPlant).success).toBe(false);
  });

  it('validates a full Diagnosis document', () => {
    const validDiagnosis = {
      id: 'diag-123',
      uid: 'user-001',
      status: 'complete',
      images: [
        {
          storagePath: 'users/user-001/diagnoses/diag-123/1.jpg',
          part: 'leaf',
          widthPx: 1024,
          heightPx: 768,
        },
      ],
      context: {
        cropId: 'tomato',
      },
      candidates: [
        {
          problemId: 'tomato-early-blight',
          category: 'disease',
          confidence: 0.85,
          evidence: ['concentric rings on lower leaves'],
          rulesOut: ['no stem rot seen'],
        },
      ],
      topProblemId: 'tomato-early-blight',
      followUpQuestions: [],
      treatmentIds: ['remove-infected-leaves', 'neem-oil-spray'],
      safetyNotes: ['safety.followProductLabel'],
      modelId: 'gemini-1.5-flash',
      kbVersion: 'v1.0.0',
      promptVersion: 'diag-v1',
      createdAt: '2026-10-20T10:00:00Z',
      updatedAt: '2026-10-20T10:00:05Z',
    };
    expect(DiagnosisSchema.safeParse(validDiagnosis).success).toBe(true);
  });

  it('validates KbProblemSchema and enforces rules: min 3 symptoms, 1 confirm step, 1 treatment', () => {
    const validProblem = {
      id: 'tomato-early-blight',
      category: 'disease',
      cropIds: ['tomato', 'potato'],
      names: {
        en: 'Early blight',
        tw: 'Ntini wui',
        fr: 'Brûlure alternarienne',
        ha: 'Cutar ganye',
        sw: 'Ukungu wa mapema',
        es: 'Tizón temprano',
      },
      summary: {
        en: 'Fungal disease affecting older leaves first.',
        tw: 'Fungus a ɛsɛe nhaban.',
        fr: 'Maladie fongique touchant les vieilles feuilles.',
        ha: 'Cutar fungal da ke shafar tsofaffin ganye.',
        sw: 'Ugonjwa wa fangasi unaoathiri majani ya zamani.',
        es: 'Enfermedad fúngica que afecta primero las hojas viejas.',
      },
      symptoms: [
        'Brown spots with concentric rings on older lower leaves',
        'Yellow halo around spots',
        'Spots can spread to stems and fruit',
      ],
      lookAlikes: ['tomato-septoria-leaf-spot', 'tomato-late-blight'],
      confirmSteps: ['Check whether spots start on the oldest leaves'],
      treatmentIds: ['remove-infected-leaves', 'copper-based-fungicide-label'],
      preventionIds: ['crop-rotation', 'avoid-overhead-watering'],
      referenceImages: ['kb/problems/early-blight-1.jpg'],
      reviewedBy: 'agronomist-001',
      version: 1,
    };
    expect(KbProblemSchema.safeParse(validProblem).success).toBe(true);

    // Should fail if only 2 symptoms
    const invalidProblemFewerSymptoms = {
      ...validProblem,
      symptoms: ['Brown spots with rings', 'Yellow halo'],
    };
    expect(KbProblemSchema.safeParse(invalidProblemFewerSymptoms).success).toBe(false);
  });

  it('validates KbTreatmentSchema with kind and safety requirements', () => {
    const validTreatment = {
      id: 'neem-oil-spray',
      kind: 'organic_input',
      title: {
        en: 'Neem oil foliar spray',
        tw: 'Neem ngo foforɔ',
        fr: 'Pulvérisation foliaire à base huile de neem',
        ha: 'Feshin man neem',
        sw: 'Dawa ya majani ya mafuta ya neem',
        es: 'Pulverización foliar de aceite de neem',
      },
      steps: {
        en: ['Dilute pure cold-pressed neem oil', 'Spray late afternoon away from bees'],
        tw: ['Fa neem ngo gu nsuom', 'Fie anwummere'],
        fr: ['Diluer huile de neem', 'Pulvériser en fin après-midi'],
        ha: ['Narke man neem a ruwa', 'Fesa da yamma'],
        sw: ['Changanya mafuta ya neem na maji', 'Nyunyizia jioni'],
        es: ['Diluir aceite de neem', 'Pulverizar por la tarde'],
      },
      materials: ['Cold-pressed neem oil', 'Horticultural mild soap', 'Water sprayer'],
      costTier: 'low',
      safety: {
        en: ['Do not spray during full sun to avoid leaf scorch', 'Keep away from waterways'],
        tw: ['Mfa nsuo no ngu nhaban so berɛ a awia dɔɔso'],
        fr: ['Ne pas appliquer en plein soleil'],
        ha: ['Kada a fesa a rana sosai'],
        sw: ['Usinyunyizie wakati wa jua kali'],
        es: ['No aplicar a pleno sol'],
      },
      labelReferenceRequired: false,
      reviewedBy: 'expert-002',
      version: 1,
    };
    expect(KbTreatmentSchema.safeParse(validTreatment).success).toBe(true);
  });

  it('validates KbGuideSchema with educational topics and safety notes', () => {
    const validGuide = {
      id: 'scrap-regrow-spring-onion',
      topic: 'scrap_regrow',
      title: {
        en: 'Regrow Spring Onions from Kitchen Scraps',
        tw: 'Sɛnea wobɛtumi adua gyeene foforɔ',
        fr: 'Faire repousser les oignons verts',
        ha: 'Sake shuka albasa daga ragowar kicin',
        sw: 'Kukuza vitunguu maji kutoka kwa mabaki',
        es: 'Rebrotar cebolletas a partir de restos',
      },
      body: {
        en: 'Place root bottoms in shallow clean water on a windowsill...',
        tw: 'Fa ntini no to nsuo kakra mu...',
        fr: 'Placez les racines dans un fond eau propre...',
        ha: 'Sanya tushen albasa a cikin ruwa kadan...',
        sw: 'Weka sehemu ya mizizi kwenye maji safi...',
        es: 'Coloca la base con raíces en un recipiente con agua...',
      },
      materials: ['Spring onion root ends', 'Glass or small jar', 'Clean water'],
      difficulty: 'easy',
      timeEstimate: '7-10 days',
      safetyNotes: {
        en: ['Change water every 2 days to prevent bacterial growth'],
        tw: ['Sesa nsuo no mprɛnsa da biara'],
        fr: ['Changer eau tous les 2 jours'],
        ha: ['Canja ruwan duk bayan kwana 2'],
        sw: ['Badilisha maji kila siku 2'],
        es: ['Cambia el agua cada 2 días'],
      },
      version: 1,
    };
    expect(KbGuideSchema.safeParse(validGuide).success).toBe(true);
  });

  it('validates KbChunkSchema for vector retrieval', () => {
    const validChunk = {
      id: 'chunk-early-blight-01',
      sourceType: 'problem',
      sourceId: 'tomato-early-blight',
      locale: 'en',
      text: 'Early blight causes dark brown target-like concentric lesions on older lower foliage of tomato plants.',
      embedding: new Array(768).fill(0.01),
      cropIds: ['tomato', 'potato'],
    };
    expect(KbChunkSchema.safeParse(validChunk).success).toBe(true);
  });

  it('validates CandidateSchema bounds', () => {
    const validCandidate = {
      problemId: 'tomato-early-blight',
      category: 'disease',
      confidence: 0.95,
      evidence: ['concentric rings on leaves'],
      rulesOut: [],
    };
    expect(CandidateSchema.safeParse(validCandidate).success).toBe(true);

    const invalidConfidence = {
      ...validCandidate,
      confidence: 1.2, // > 1
    };
    expect(CandidateSchema.safeParse(invalidConfidence).success).toBe(false);
  });
});
