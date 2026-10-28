# 🌿 VerdeScan — Precision Agronomy & Crop Disease Diagnostics

> **Offline-First, AI-Powered Plant Health, Bio-Surveillance & Field Management Platform**

VerdeScan empowers smallholder farmers, commercial agricultural enterprises, extension agents, and home gardeners with instant crop disease identification, reviewed organic treatments, regional outbreak alerts, and field scouting audit reports.

---

## 🚀 Key Industry-Grade Features

### 📸 1. Multi-Photo Capture & Camera Wizard
- **Live Viewfinder & Gallery Upload**: Capture or upload up to 4 high-resolution photos per inspection (leaf upper/lower, stem, fruit, crown).
- **Automated EXIF Privacy Scrubbing**: Strips raw GPS metadata client-side before transmission via canvas re-encoding.
- **Hands-Free Field Voice Dictation**: Speech-to-text dictation button for seamless field notes (e.g., *"Applied neem yesterday; saw thrips near leaf axil"*).
- **Quality Assurance Guard**: Automatically flags blurry, underexposed, or overexposed imagery.

### 📈 2. Longitudinal Crop Health & Recovery Tracker
- **Interactive Before & After Slider**: Draggable split-screen visual comparison between initial infection (Day 0) and current foliage.
- **Biological Recovery Score (0–100%)**: Quantitative healing indicator tracking tissue regeneration and symptom remission.
- **Milestone Timeline Log**: Chronological audit of organic interventions (pruning, bio-fungicides, companion plantings) with audio readouts.

### 🚨 3. Regional Outbreak Radar & Early Warning System
- **Bio-Surveillance Radar**: Visualizes active pathogen and pest vectors within a 30 km radius (Fall Armyworm, Late Blight, Whiteflies).
- **Dynamic Risk Tiers**: Categorized by Critical, High, Moderate, and Low risk thresholds with wind vector and humidity correlations.
- **Preventive Action Checklists**: Step-by-step cultural and biological countermeasures to protect surrounding crops before vectors land.
- **Crowdsource Outbreak Reporting**: Allows growers to broadcast localized pest pressures to the regional farming mesh.

### 📋 4. GlobalG.A.P. Compliant Field Scouting Report Generator
- **Audit-Ready Certificate**: Formal phytosanitary field inspection reports compliant with GlobalG.A.P. Integrated Farm Assurance (IFA v6).
- **Automated Incidence & Severity Math**: Samples random quadrants, calculating exact infection incidence percentages.
- **Hands-Free Voice Notes & Differential Diagnosis**: Speech dictation for scout observations and secondary suspects.
- **One-Tap Printable / PDF Export**: Formats cleanly for official physical records and buyer compliance certification.

### 🧪 5. Organic Spray & Input Dosage Calculator
- **5 Reviewed Organic Formulations**:
  1. *Cold-Pressed Neem Oil Emulsion (0.5%)* with Castile soap emulsifier.
  2. *Potassium / Sodium Bicarbonate Wash* for powdery mildew and leaf spots.
  3. *Dilute Fresh Milk / Whey Spray (1:9)* for cucurbit powdery mildew.
  4. *Aerated Actively Brewed Compost Tea (AACT)* microbial foliar biofilm.
  5. *Sifted Hardwood Ash Slurry* for stem boring beetles and slug barriers.
- **Plot Area & Plant Count Sizing**: Enter square meters ($m^2$), square feet, or tree count to get exact carrier water volumes (Liters & Gallons) and milliliter/gram ingredient amounts.
- **Field Safety & Re-Entry Windows**: Explicit instructions on application timing (twilight to prevent phytotoxic leaf scorch) and re-entry intervals (REI).

### ⏱️ 6. Harvest & Days-to-Maturity (DTM) Countdown
- **Dynamic Maturation Clock**: Real-time days remaining countdown based on crop variety and planting date.
- **Stage Progress Stepper**: Tracks crops through *Seedling → Vegetative → Flowering → Fruit Set → Harvest Ready*.
- **Visual Ripening Cues**: Science-backed organoleptic checklist (breaker color, aroma, stem abscission ease, fruit firmness).
- **Post-Harvest Handling & Storage**: Optimal temperature and humidity guidance to prevent post-harvest spoilage.

### 🌦️ 7. Environmental Intelligence & Weather Alerts
- **GPS & Manual Farm Setting**: Automatically detects browser GPS with an instant manual selector for distant plots.
- **Real-Time Weather Alert Banners**: Warns of frost risk (< 13°C), heat stress (≥ 32°C), high fungal sporulation risk (> 78% RH), or prolonged drought.

### 📍 8. Find Seeds Map & Offline Data Caching
- **Interactive Agro-Dealer Map**: Locates certified seed suppliers, agricultural cooperatives, and research centers.
- **Download Offline Map**: One-click download caches regional suppliers and phone contacts in browser storage for use deep in rural areas without mobile signal.

### 🤝 9. Growers Community Hub & Resource Library
- **Peer-to-Peer Knowledge Exchange**: Filter remedies by crop (Tomatoes, Maize, Peppers, Cassava) and share organic recipes.
- **Plant Care Hub & Compost Calculator**: Interactive 30:1 Carbon-to-Nitrogen compost recipe balancing tool.

### 🧠 10. AI Botanist Consultant (Gemini 3.8 Flash)
- **Server-Side API**: All AI interactions execute via server-side `/api/botanist/chat` proxy; API keys are never exposed in client bundles.
- **3-Tier Fallback Resilience**: Seamlessly falls back to local curated agronomy engines if offline or unconfigured.

---

## 🏛️ System Architecture

```
verdescan/
├── src/                     # React 19 Frontend (Vite + Tailwind CSS v4)
│   ├── components/          # Shared UI (PhoneFrame, BottomNav, WeatherWidget, Alerts)
│   ├── features/
│   │   ├── ai_botanist/     # Gemini AI agronomist chat
│   │   ├── calculator/      # Organic spray dosage calculator
│   │   ├── community/       # Growers community hub
│   │   ├── diagnose/        # Camera wizard, scan modal, result view
│   │   ├── garden/          # Plants, plots & harvest DTM countdown
│   │   ├── history/         # Diagnostic inspection history
│   │   ├── home/            # Main dashboard, search & command center
│   │   ├── radar/           # Regional outbreak radar
│   │   ├── recovery/        # Longitudinal crop recovery tracker
│   │   ├── reports/         # Field scouting PDF/Print reports
│   │   ├── resources/       # Plant care & compost maker
│   │   ├── seeds/           # Interactive seed map & offline cache
│   │   └── settings/        # Locale, profile & preferences
│   ├── lib/                 # Auth, Dexie DB, speech utilities, offline queue
│   └── App.tsx              # Main application orchestrator
├── packages/
│   ├── shared/              # Zod schemas & TypeScript types (@verdescan/shared)
│   ├── kb/                  # Verified botanical knowledge base (@verdescan/kb)
│   └── eval/                # Golden evaluation suite
├── server.ts                # Production Express server (Render runner & API proxy)
├── render.yaml              # Render blueprint specification
├── vite.config.ts           # Development server & Tailwind plugin
└── package.json             # Monorepo dependencies & npm scripts
```

---

## 💻 Local Development Setup

### Prerequisites
- **Node.js**: v20 or higher
- **npm** or **pnpm**

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/verdescan.git
cd verdescan
npm install
```

### 2. Configure Environment Variables
Copy the example environment configuration:
```bash
cp .env.example .env
```
Populate your `.env` file:
```env
# Server-side Gemini API (Optional for AI Botanist; mock fallback active by default)
GEMINI_API_KEY=your_gemini_api_key_here

# Port
PORT=3000
```

### 3. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 4. Run Verification Suite
```bash
npm run typecheck   # Strict TypeScript checks
npm run lint        # ESLint syntax & import validation
npm test            # Run Vitest test suite
npm run build       # Build production bundle
```

---

## 🚀 Deploying VerdeScan on Render

Render is a modern cloud hosting platform offering automated SSL, continuous Git deployments, zero-downtime rolling deploys, and native Node.js support.

### Option A: Deploy as a Web Service (Recommended — Full Stack)

This option deploys the complete VerdeScan application, including the server-side Gemini AI Botanist proxy route (`/api/botanist/chat`) and static asset delivery.

1. **Push your code to GitHub / GitLab**.
2. Go to the [Render Dashboard](https://dashboard.render.com/) and click **New +** → **Web Service**.
3. Connect your VerdeScan Git repository.
4. Configure the Web Service settings:
   - **Name**: `verdescan`
   - **Region**: Choose the region closest to your users (e.g., *Frankfurt*, *Oregon*, or *Ohio*).
   - **Branch**: `main`
   - **Root Directory**: Leave blank (uses repository root).
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install && npm run build
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
   - **Instance Type**: `Free` or `Starter`
5. Click **Advanced** and add **Environment Variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `3000`
   - `GEMINI_API_KEY`: *(Your Google AI Studio API Key)*
6. Set the **Health Check Path** to:
   ```
   /healthz
   ```
7. Click **Create Web Service**. Render will install dependencies, build the Vite frontend, start `server.ts`, and provide an HTTPS URL (e.g. `https://verdescan.onrender.com`).

---

### Option B: Deploy Using Render Blueprints (`render.yaml`)

VerdeScan includes a pre-configured `render.yaml` infrastructure-as-code file.

1. In your [Render Dashboard](https://dashboard.render.com/), click **Blueprints** → **New Blueprint Instance**.
2. Select your VerdeScan repository.
3. Render will automatically parse `render.yaml`, configure the build commands, environment variables, health checks, and service parameters.
4. Provide your `GEMINI_API_KEY` when prompted in the dashboard.
5. Click **Apply**. Render will automatically provision and deploy your service.

---

### Option C: Deploy as a Static Site (Client Only)

If you only wish to deploy the frontend PWA as a pure static site:

1. In the Render Dashboard, click **New +** → **Static Site**.
2. Connect your repository.
3. Set the build parameters:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
4. Add a **Rewrite Rule** in the **Redirects / Rewrites** tab:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`
5. Click **Create Static Site**.

---

## 🛡️ Agronomic Safety Constitution

1. **Organic-First Principle**: All pesticide and chemical advice defaults strictly to reviewed cultural controls, biological solutions (Bacillus thuringiensis, Beauveria bassiana), and organic preparations (Neem, Potassium Bicarbonate).
2. **Zero Hallucination Tolerance**: Chemical pesticide dosages are never synthesized from unverified model memory; guidance references verified agronomy labels exclusively.
3. **Privacy by Default**: User field photos have EXIF geographical tags stripped client-side prior to server upload.
4. **Calibrated Confidence**: Every diagnostic output conveys an explicit confidence score and safety advisory.

---

## 📄 License
MIT License. Built for global sustainable agriculture and smallholder farmer resilience.
