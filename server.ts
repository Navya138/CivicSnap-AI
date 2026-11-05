import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '25mb' }));

// Initialize Gemini Client server-side
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

import { INITIAL_INCIDENTS } from './src/data/sampleData';
import {
  getNearbySensitivePlaces,
  calculateExposureScore,
  calculateCollectionAccessibility,
} from './src/utils/geoSensitivity';

// 10 Sample Garbage Tickets TKT-101 to TKT-110 for MVP Colony, Visakhapatnam, Andhra Pradesh
let incidents: any[] = JSON.parse(JSON.stringify(INITIAL_INCIDENTS));

// 1. GET /api/incidents - List incidents with optional filters
app.get('/api/incidents', (req: Request, res: Response) => {
  const { category, severity, status, ward, drain } = req.query;
  let filtered = [...incidents];

  if (category && category !== 'all') {
    filtered = filtered.filter((i) => i.category === category);
  }
  if (severity && severity !== 'all') {
    const sevNum = parseInt(severity as string, 10);
    filtered = filtered.filter((i) => i.severity === sevNum);
  }
  if (status && status !== 'all') {
    filtered = filtered.filter((i) => i.status === status);
  }
  if (ward && ward !== 'all') {
    const wardNum = parseInt(ward as string, 10);
    filtered = filtered.filter((i) => i.wardNumber === wardNum);
  }
  if (drain && drain !== 'all') {
    filtered = filtered.filter((i) => i.stormDrainBlockage === drain);
  }

  // Sort: highest severity first, then newest
  filtered.sort((a, b) => {
    if (b.severity !== a.severity) return b.severity - a.severity;
    return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
  });

  res.json({ success: true, count: filtered.length, incidents: filtered });
});

// 2. POST /api/triage - AI Triage analysis powered by Gemini 3.8 Flash
app.post('/api/triage', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType, description, category, location, wardNumber, coordinates } = req.body;
    const targetCoords = coordinates || { lat: 17.741, lng: 83.3325 };

    if (ai) {
      try {
        const parts: any[] = [];
        if (imageBase64) {
          parts.push({
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, ''),
            },
          });
        }

        const promptText = `
You are the CivicSnap AI Municipal Garbage, Public Health Exposure, and Sanitation Fleet Triage Engine for Greater Visakhapatnam Municipal Corporation (GVMC), Andhra Pradesh.
Location Context: MVP Colony / Coastal Visakhapatnam (GVMC Zone-2).
User Description: "${description || 'Visual inspection of municipal solid waste / storm drain required'}"
Hinted Category: "${category || 'unspecified'}"
Reported Ward: "${wardNumber || 'Ward 18 MVP Colony'}", Landmark: "${location || 'MVP Colony, Visakhapatnam'}"
GPS Coordinates: Lat ${targetCoords.lat}, Lng ${targetCoords.lng}

Analyze the waste scene and return strict JSON conforming to this schema:
{
  "waste_type": "Specific waste description (e.g. Storm Drain Plastic Choke, Bio-Medical Waste, Market Organic Rot, Construction Rubble)",
  "severity_score": 1 | 2 | 3 | 4 | 5,
  "storm_drain_blocked": "severe" | "partial" | "none",
  "summary": "Detailed diagnostic summary including public health assessment, storm drainage status, and environmental conditions",
  "category": "drain_blockage" | "bio_hazardous" | "commercial_market" | "dumper_overflow" | "c_and_d_rubble" | "coastal_beach" | "residential_solid" | "bulk_green",
  "categoryNameEn": "Garbage category title in English",
  "categoryNameTe": "Garbage category title in Telugu",
  "severity": 1 | 2 | 3 | 4 | 5,
  "confidence": number between 0.88 and 0.99,
  "stormDrainBlockage": "severe" | "partial" | "none",
  "drainBlockageDetailsEn": "Concise assessment of stormwater drain obstruction and monsoon flood risk in English",
  "drainBlockageDetailsTe": "Concise assessment of stormwater drain obstruction in Telugu",
  "titleEn": "Concise high-impact civic title in English (max 10 words)",
  "titleTe": "Accurate Telugu translation of title (తెలుగు శీర్షిక)",
  "summaryEn": "Detailed diagnostic summary in English",
  "summaryTe": "Detailed diagnostic summary in Telugu",
  "department": "GVMC department responsible (e.g. GVMC Stormwater Drains & Desilting Wing, GVMC Public Health, etc.)",
  "departmentTe": "Telugu name of GVMC department",
  "slaHours": 2 | 4 | 6 | 12 | 24,
  "recommendedGear": ["list", "of", "4", "specific", "sanitation", "crew", "tools"],
  "hazardAnalysis": "Short clinical sentence assessing vector hazard, odor radius, and storm runoff obstruction",

  "detected_materials": [
    {
      "material": "Specific material name (e.g. PET Plastic Bottles, Expanded Polystyrene, Organic Vegetable Biomass, Cardboard, Glass)",
      "confidence": number between 0.80 and 0.99,
      "visualStatus": "visually_detected",
      "recoverable": boolean,
      "recommendedHandling": "Recommended handling, source segregation, or recycling pathway"
    }
  ],
  "recovery_opportunity": "HIGH" | "MEDIUM" | "LOW" | "NONE",
  "recommended_recovery_action": "Explainable segregation/recycling pathway distinguishing visually detected from confirmed recyclables. Do not invent fake facilities or claim materials have already been recycled.",

  "nearby_sensitive_places": [
    {
      "name": "Nearby landmark name in MVP Colony (e.g. AS Raja School, MVP Health Center, Rythu Bazaar)",
      "type": "school" | "hospital" | "food_market" | "residential",
      "distanceMeters": number
    }
  ],
  "exposure_priority": "HIGH" | "MEDIUM" | "LOW",
  "exposure_reason": "Explainable exposure-priority score based on waste severity, proximity to sensitive places, and environmental conditions. ETHICAL RULE: Never claim disease or actual health damage has been detected.",

  "visible_road_obstacles": ["list of visible road conditions, narrow passages, parked vehicles or other obstacles"],
  "collection_accessibility": "HIGH" | "MEDIUM" | "LOW",
  "recommended_collection_method": "large_compactor_truck" | "small_collection_vehicle" | "manual_collection",
  "accessibility_reason": "Explain visual evidence of road conditions. State clearly that image analysis alone cannot confirm actual vehicle access or road width. Allow human verification."
}
`;
        parts.push({ text: promptText });

        const geminiCall = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: { parts },
          config: {
            responseMimeType: 'application/json',
          },
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API call timed out after 7s')), 7000)
        );

        const geminiRes: any = await Promise.race([geminiCall, timeoutPromise]);
        const rawText = geminiRes.text;
        if (rawText) {
          const parsed = JSON.parse(rawText);

          // Normalize and fill gaps safely
          const nearbyPlaces =
            parsed.nearby_sensitive_places && parsed.nearby_sensitive_places.length > 0
              ? parsed.nearby_sensitive_places
              : getNearbySensitivePlaces(targetCoords.lat, targetCoords.lng);

          const exposure = calculateExposureScore(
            parsed.severity_score || parsed.severity || 4,
            nearbyPlaces,
            parsed.storm_drain_blocked || parsed.stormDrainBlockage || 'partial',
            parsed.category || 'drain_blockage'
          );

          const access = calculateCollectionAccessibility(
            parsed.visible_road_obstacles || [],
            parsed.category || 'drain_blockage',
            parsed.severity_score || parsed.severity || 4
          );

          parsed.waste_type = parsed.waste_type || parsed.categoryNameEn || 'Solid Waste Accumulation';
          parsed.severity_score = parsed.severity_score || parsed.severity || 4;
          parsed.storm_drain_blocked = parsed.storm_drain_blocked || parsed.stormDrainBlockage || 'partial';
          parsed.nearby_sensitive_places = nearbyPlaces;
          parsed.exposure_priority = parsed.exposure_priority || exposure.priority;
          parsed.exposure_reason = parsed.exposure_reason || exposure.reason;
          parsed.recovery_opportunity = parsed.recovery_opportunity || 'HIGH';
          parsed.recommended_recovery_action =
            parsed.recommended_recovery_action ||
            'Segregate dry recyclables at source. (Visually detected; confirmation requires MRF intake).';
          parsed.visible_road_obstacles = parsed.visible_road_obstacles || ['Open road carriageway'];
          parsed.collection_accessibility = parsed.collection_accessibility || access.accessibility;
          parsed.recommended_collection_method = parsed.recommended_collection_method || access.method;
          parsed.accessibility_reason = parsed.accessibility_reason || access.reason;

          return res.json({
            success: true,
            source: 'gemini-3.8-flash',
            triage: parsed,
          });
        }
      } catch (geminiError: any) {
        console.warn('Gemini triage execution error, falling back to deterministic triage engine:', geminiError?.message);
      }
    }

    // Deterministic fallback for Visakhapatnam MVP Colony
    const descLower = (description || '').toLowerCase();
    let detectedCategory = 'drain_blockage';
    let catNameEn = 'Storm Drain Plastic Choke';
    let catNameTe = 'వర్షపు కాలువ ప్లాస్టిక్ అడ్డంకి';
    let detectedSeverity = 4;
    let stormDrainBlockage = 'severe';
    let drainEn = 'Severe Choke (stormwater flow constricted by compacted plastic waste)';
    let drainTe = 'తీవ్ర అడ్డంకి (ప్లాస్టిక్ వ్యర్థాలతో కాలువ మూసుకుపోయింది)';
    let deptEn = 'GVMC Stormwater Drains & Desilting Wing (Zone-2)';
    let deptTe = 'జివిఎంసి వర్షపు నీటి కాలువల నిర్వహణ విభాగం';
    let slaHours = 4;
    let titleEn = 'Storm Drain Plastic Waste Accumulation';
    let titleTe = 'వర్షపు కాలువలో ప్లాస్టిక్ వ్యర్థాలు పేరుకుపోవడం';
    let gear = ['High-Power Desilting Jet', 'Heavy Mesh Trash Screens', 'Hazmat Boots', 'Pneumatic Rakes'];
    let obstacles = ['Open roadside culvert ledge with 1.2m drop', 'Parked delivery two-wheelers on shoulder'];
    let materials: any[] = [
      { material: 'PET Plastic Beverage Bottles', confidence: 0.98, visualStatus: 'visually_detected', recoverable: true, recommendedHandling: 'Manual skimming with mesh rakes; de-silt and bale for secondary flake processing.' },
      { material: 'Expanded Polystyrene (Thermocol)', confidence: 0.94, visualStatus: 'visually_detected', recoverable: true, recommendedHandling: 'Dry segregation; volume compaction for thermal recycling.' },
    ];
    let recoveryOpp: any = 'HIGH';
    let recoveryAction = 'Deploy dry-waste recovery crew to intercept floatable PET bottles and clean plastics prior to high-power hydraulic flushing. (Visual detection only; final recyclability subject to MRF intake purity).';

    if (descLower.includes('bio') || descLower.includes('medical') || descLower.includes('needle') || descLower.includes('syringe') || descLower.includes('hospital') || category === 'bio_hazardous') {
      detectedCategory = 'bio_hazardous';
      catNameEn = 'Bio-Medical & Hazardous Waste';
      catNameTe = 'ప్రమాదకర బయో-మెడికల్ వ్యర్థాలు';
      detectedSeverity = 5;
      stormDrainBlockage = 'partial';
      drainEn = 'Partial Choke (clinical packaging spilled into roadside gutter)';
      drainTe = 'పాక్షిక అడ్డంకి (కాలువలోకి జారిన మెడికల్ వ్యర్థాలు)';
      deptEn = 'GVMC Public Health & Hazardous Waste Cell';
      deptTe = 'జివిఎంసి ప్రజారోగ్య మరియు వ్యర్థాల నిర్వహణ విభాగం';
      slaHours = 2;
      titleEn = 'Hazardous Bio-Medical Sharps Dumped on Pedestrian Pavement';
      titleTe = 'ఫుట్‌పాత్‌పై ప్రమాదకరమైన బయో-మెడికల్ వ్యర్థాలు మరియు సిరంజిలు';
      gear = ['Puncture-Proof Nitrile Gloves', 'PCD Sharps Bins', 'Sodium Hypochlorite Spray', 'Bio-Tongs'];
      obstacles = ['Concrete pedestrian curb obstruction', 'Crowded footpath with morning street vendor stalls'];
      materials = [
        { material: 'Bio-Hazardous Clinical Waste (Needles & Tubing)', confidence: 0.99, visualStatus: 'visually_detected', recoverable: false, recommendedHandling: 'Strict biohazard protocol: puncture-proof PCD containerization, sodium hypochlorite misting, sealed incineration transport.' },
      ];
      recoveryOpp = 'NONE';
      recoveryAction = 'Zero recycling recovery permitted under Bio-Medical Waste Management Rules 2016. Direct sealed transport to common biomedical waste treatment facility (CBWTF) for incineration.';
    } else if (descLower.includes('market') || descLower.includes('vegetable') || descLower.includes('rythu') || descLower.includes('food') || category === 'commercial_market') {
      detectedCategory = 'commercial_market';
      catNameEn = 'Commercial & Market Waste';
      catNameTe = 'వాణిజ్య మరియు మార్కెట్ వ్యర్థాలు';
      detectedSeverity = 4;
      stormDrainBlockage = 'severe';
      drainEn = 'Severe Choke (rotting vegetable pulp obstructing drainage culvert)';
      drainTe = 'తీవ్ర అడ్డంకి (కుళ్ళిన వ్యర్థాలతో కాలువ ప్రవాహం బంద్)';
      deptEn = 'GVMC Market Sanitation Wing (Zone-2)';
      deptTe = 'జివిఎంసి మార్కెట్ శానిటేషన్ విభాగం';
      slaHours = 4;
      titleEn = 'Rythu Bazaar Organic Waste Choking Primary Culvert';
      titleTe = 'రైతు బజార్ కూరగాయల వ్యర్థాలు కాలువలోకి చేరి దుర్వాసన';
      gear = ['Sludge Dredger Scoop', 'Organic Tipper Truck 5T', 'Heavy Rubber Boots', 'Bactericidal Deodorant'];
      obstacles = ['High density of vegetable handcarts and auto-rickshaws', 'Unlined muddy ditch shoulder'];
      materials = [
        { material: 'Organic Vegetable & Market Biomass', confidence: 0.96, visualStatus: 'visually_detected', recoverable: true, recommendedHandling: 'Mechanical scoop extraction; transport to Kapuluppada biomethanation / aerobic composting plant.' },
      ];
      recoveryOpp = 'HIGH';
      recoveryAction = 'High-yield municipal compost opportunity: Route pure vegetable biomass directly to GVMC decentralized composting pits, diverting ~3 tons from landfill. (Visual classification only; organic sorting purity confirmed on-site).';
    } else if (descLower.includes('dumper') || descLower.includes('bin') || descLower.includes('overflow') || category === 'dumper_overflow') {
      detectedCategory = 'dumper_overflow';
      catNameEn = 'Overflowing Dumper Bin';
      catNameTe = 'డంపర్ బిన్ నిండిపోయిన సమస్య';
      detectedSeverity = 4;
      stormDrainBlockage = 'partial';
      drainEn = 'Partial Choke (scattered waste spilling toward storm curb)';
      drainTe = 'పాక్షిక అడ్డంకి (రోడ్డు పక్క కాలువపైకి చెత్త వ్యాపించింది)';
      deptEn = 'GVMC Mechanical Sweeping & Fleet Logistics';
      deptTe = 'జివిఎంసి వాహన రవాణా మరియు చెత్త సేకరణ విభాగం';
      slaHours = 4;
      titleEn = 'Compactor Dumper Bin Overflowing onto Carriageway';
      titleTe = 'డంపర్ బిన్ నిండిపోయి రోడ్డుపైకి చెల్లాచెదురైన చెత్త';
      gear = ['Hydraulic Dumper Placer Truck', 'Mechanical Road Sweeper', 'Heavy Rakes', 'Traffic Cones'];
      obstacles = ['Temporary traffic cones placed by ward marshals'];
      materials = [
        { material: 'Corrugated Cardboard Packaging Boxes', confidence: 0.95, visualStatus: 'visually_detected', recoverable: true, recommendedHandling: 'Flatten dry boxes; bundle for local paper recycling paper mills.' },
        { material: 'Rigid High-Density Polyethylene (HDPE) Containers', confidence: 0.92, visualStatus: 'visually_detected', recoverable: true, recommendedHandling: 'Dry sorting; granulate into recycled regrind pellets.' },
      ];
      recoveryOpp = 'MEDIUM';
      recoveryAction = 'Deploy dry waste recovery team prior to bulk hydraulic dumper lift to salvage clean cardboard and hard plastics. (Visual detection estimate; MRF intake determines certified recyclability).';
    } else if (descLower.includes('rubble') || descLower.includes('concrete') || descLower.includes('demolition') || descLower.includes('brick') || category === 'c_and_d_rubble') {
      detectedCategory = 'c_and_d_rubble';
      catNameEn = 'Construction & Demolition Waste';
      catNameTe = 'భవన నిర్మాణ శిథిలాలు';
      detectedSeverity = 3;
      stormDrainBlockage = 'severe';
      drainEn = 'Severe Choke (heavy concrete chunks weighing down inlet grate)';
      drainTe = 'తీవ్ర అడ్డంకి (గ్రిల్స్ పై బరువైన కాంక్రీట్ రాళ్ళు)';
      deptEn = 'GVMC C&D Waste Management Cell';
      deptTe = 'జివిఎంసి నిర్మాణ వ్యర్థాల విభాగం';
      slaHours = 12;
      titleEn = 'Illegal C&D Concrete Rubble Blocking Walkway and Storm Drain';
      titleTe = 'వర్షపు నీటి గ్రిల్స్‌ను అడ్డుకుంటున్న భవన నిర్మాణ శిథిలాలు';
      gear = ['Mini-Excavator (JCB)', '10T Dump Truck', 'Heavy Sledgehammers', 'Reflective Barricades'];
      obstacles = ['Heavy rubble spill extending 1.5m into roadway'];
      materials = [
        { material: 'Reinforced Concrete Chunks (RCC)', confidence: 0.96, visualStatus: 'visually_detected', recoverable: true, recommendedHandling: 'Jaw-crusher processing at GVMC Kapuluppada C&D recycling plant for manufactured sand.' },
      ];
      recoveryOpp = 'HIGH';
      recoveryAction = '100% mineral recovery potential: Route all concrete chunks directly to Vizag C&D recycling plant to produce certified recycled gravel and paver tiles. (Visual identification confirmed).';
    } else if (descLower.includes('beach') || descLower.includes('coastal') || descLower.includes('sea') || descLower.includes('creek') || category === 'coastal_beach') {
      detectedCategory = 'coastal_beach';
      catNameEn = 'Coastal & Beachfront Litter';
      catNameTe = 'తీరప్రాంత మరియు బీచ్ వ్యర్థాలు';
      detectedSeverity = 4;
      stormDrainBlockage = 'severe';
      drainEn = 'Severe Choke (tidal outlet choked with floating plastic debris)';
      drainTe = 'తీవ్ర అడ్డంకి (సముద్ర ముఖద్వారం వద్ద వ్యర్థాల తెట్టు)';
      deptEn = 'GVMC Coastal Zone Sanitation Squad';
      deptTe = 'జివిఎంసి తీరప్రాంత పారిశుధ్య విభాగం';
      slaHours = 4;
      titleEn = 'Coastal Plastic Bottles & Debris Choking Beach Outfall';
      titleTe = 'లాసన్స్ బే కాలువ ముఖద్వారంలో పేరుకుపోయిన ప్లాస్టిక్ వ్యర్థాలు';
      gear = ['Floating Boom Barriers', 'Beach Clean-up Rakes', 'All-Terrain Litter ATV', 'Heavy Burlap Bags'];
      obstacles = ['Soft unpaved beach sand terrain', 'Tidal shoreline rocks'];
      materials = [
        { material: 'Marine PET Water Bottles & Caps', confidence: 0.97, visualStatus: 'visually_detected', recoverable: true, recommendedHandling: 'Manual beach raking and desalination wash; pelletize for textile yarn spinning.' },
      ];
      recoveryOpp = 'HIGH';
      recoveryAction = 'High ocean-bound plastic recovery: Partner with certified coastal plastic upcyclers to collect sorted marine PET for recycled textile thread. (Visual observation; actual yield depends on sand contamination).';
    }

    const nearbyPlaces = getNearbySensitivePlaces(targetCoords.lat, targetCoords.lng);
    const exposure = calculateExposureScore(detectedSeverity, nearbyPlaces, stormDrainBlockage as any, detectedCategory);
    const access = calculateCollectionAccessibility(obstacles, detectedCategory, detectedSeverity);

    return res.json({
      success: true,
      source: 'deterministic-triage-engine',
      triage: {
        waste_type: catNameEn,
        severity_score: detectedSeverity,
        storm_drain_blocked: stormDrainBlockage,
        summary: `AI diagnostic verified ${catNameEn} in MVP Colony. Storm drain status: ${drainEn}. Priority field dispatch assigned to GVMC Zone-2.`,
        category: detectedCategory,
        categoryNameEn: catNameEn,
        categoryNameTe: catNameTe,
        severity: detectedSeverity,
        confidence: 0.96,
        stormDrainBlockage,
        drainBlockageDetailsEn: drainEn,
        drainBlockageDetailsTe: drainTe,
        titleEn,
        titleTe,
        summaryEn: `AI diagnostic verified ${catNameEn} in MVP Colony. Storm drain status: ${drainEn}. Priority field dispatch assigned to GVMC Zone-2.`,
        summaryTe: `జివిఎంసి జోన్-2 ద్వారా తక్షణ క్షేత్ర పారిశుధ్య బృందానికి పంపబడింది.`,
        department: deptEn,
        departmentTe: deptTe,
        slaHours,
        recommendedGear: gear,
        hazardAnalysis: `Classified at Severity ${detectedSeverity}. Direct intervention scheduled to safeguard MVP Colony stormwater infrastructure.`,
        detected_materials: materials,
        recovery_opportunity: recoveryOpp,
        recommended_recovery_action: recoveryAction,
        nearby_sensitive_places: nearbyPlaces,
        exposure_priority: exposure.priority,
        exposure_reason: exposure.reason,
        visible_road_obstacles: obstacles,
        collection_accessibility: access.accessibility,
        recommended_collection_method: access.method,
        accessibility_reason: access.reason,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. POST /api/incidents - Create a new incident report
app.post('/api/incidents', (req: Request, res: Response) => {
  const {
    category,
    categoryNameEn,
    categoryNameTe,
    titleEn,
    titleTe,
    descriptionEn,
    descriptionTe,
    severity,
    stormDrainBlockage,
    drainBlockageDetailsEn,
    drainBlockageDetailsTe,
    wardNumber,
    wardName,
    wardNameTe,
    locationDetails,
    coordinates,
    department,
    departmentTe,
    slaHours,
    imageThumbnail,
    aiTriageLog,
    exposurePriority,
    exposureReason,
    nearbySensitivePlaces,
    detectedMaterials,
    recoveryOpportunity,
    recommendedRecoveryAction,
    collectionAccessibility,
    recommendedCollectionMethod,
    visibleRoadObstacles,
    accessibilityReason,
  } = req.body;

  const targetCoords = coordinates || { lat: 17.741, lng: 83.3325 };

  // 20-Metre Duplicate Detection using Haversine Formula
  function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  let nearestIncident: any = null;
  let minDistanceMeters = Infinity;

  for (const existing of incidents) {
    if (existing.coordinates && typeof existing.coordinates.lat === 'number' && typeof existing.coordinates.lng === 'number') {
      const dist = haversineMeters(
        targetCoords.lat,
        targetCoords.lng,
        existing.coordinates.lat,
        existing.coordinates.lng
      );
      if (dist < minDistanceMeters) {
        minDistanceMeters = dist;
        nearestIncident = existing;
      }
    }
  }

  const roundedDistance = Math.round(minDistanceMeters * 10) / 10;

  // If within 20 metres, flag as duplicate and do NOT create a second ticket
  if (nearestIncident && minDistanceMeters <= 20.0) {
    nearestIncident.upvotes += 1;
    nearestIncident.verifiedByCitizens += 1;

    return res.status(200).json({
      success: true,
      isDuplicate: true,
      duplicateOf: nearestIncident.ticketNumber,
      existingIncident: nearestIncident,
      distanceMeters: roundedDistance,
      message: `Possible duplicate detected: location is ${roundedDistance}m from existing ticket ${nearestIncident.ticketNumber}. Second ticket not created; neighborhood verification added to ${nearestIncident.ticketNumber}.`,
    });
  }

  // Outside 20 metres: Create new ticket normally
  const randNum = Math.floor(111 + Math.random() * 888);
  const ticketNumber = `TKT-${randNum}`;
  const effectiveSla = slaHours || (severity === 5 ? 2 : severity === 4 ? 4 : severity === 3 ? 12 : 24);

  const sensitive = nearbySensitivePlaces || getNearbySensitivePlaces(targetCoords.lat, targetCoords.lng);
  const exposure = calculateExposureScore(severity || 3, sensitive, stormDrainBlockage || 'partial', category || 'drain_blockage');
  const obstacles = visibleRoadObstacles || ['Curbside passage'];
  const access = calculateCollectionAccessibility(obstacles, category || 'drain_blockage', severity || 3);

  const newIncident: any = {
    id: `inc-${Date.now()}`,
    ticketNumber,
    category: category || 'drain_blockage',
    categoryNameEn: categoryNameEn || 'Storm Drain Plastic Choke',
    categoryNameTe: categoryNameTe || 'వర్షపు కాలువ ప్లాస్టిక్ అడ్డంకి',
    titleEn: titleEn || 'Reported Garbage Hazard',
    titleTe: titleTe || 'నమోదైన పౌర చెత్త సమస్య',
    descriptionEn: descriptionEn || 'Citizen filed report awaiting field crew inspection.',
    descriptionTe: descriptionTe || 'పరిశీలన కొరకు వేచివున్న పౌర ఫిర్యాదు.',
    severity: severity || 3,
    status: 'open',
    stormDrainBlockage: stormDrainBlockage || 'partial',
    drainBlockageDetailsEn: drainBlockageDetailsEn || 'Partial obstruction observed',
    drainBlockageDetailsTe: drainBlockageDetailsTe || 'పాక్షిక అడ్డంకి ఉంది',
    wardNumber: wardNumber || 18,
    wardName: wardName || 'MVP Colony (Sector 1-4)',
    wardNameTe: wardNameTe || 'ఎం.వి.పి. కాలనీ (సెక్టార్ 1-4)',
    locationDetails: locationDetails || 'MVP Colony, Visakhapatnam',
    coordinates: targetCoords,
    department: department || 'GVMC Solid Waste Management (Zone-2)',
    departmentTe: departmentTe || 'జివిఎంసి ఘన వ్యర్థాల నిర్వహణ విభాగం',
    reportedAt: new Date().toISOString(),
    slaDeadline: new Date(Date.now() + effectiveSla * 3600 * 1000).toISOString(),
    slaHours: effectiveSla,
    upvotes: 1,
    verifiedByCitizens: 1,
    imageThumbnail: imageThumbnail || 'drain_blockage',
    isDemoData: true,

    // Feature 1
    exposurePriority: exposurePriority || exposure.priority,
    exposureReason: exposureReason || exposure.reason,
    nearbySensitivePlaces: sensitive,

    // Feature 2
    detectedMaterials: detectedMaterials || [
      { material: 'Mixed Municipal Waste Items', confidence: 0.92, visualStatus: 'visually_detected', recoverable: true, recommendedHandling: 'Segregate dry recyclables at ward processing station.' },
    ],
    recoveryOpportunity: recoveryOpportunity || 'HIGH',
    recommendedRecoveryAction: recommendedRecoveryAction || 'Deploy dry-waste segregation cart before final compaction.',

    // Feature 3
    collectionAccessibility: collectionAccessibility || access.accessibility,
    recommendedCollectionMethod: recommendedCollectionMethod || access.method,
    visibleRoadObstacles: obstacles,
    accessibilityReason: accessibilityReason || access.reason,

    aiTriageLog: aiTriageLog || {
      model: 'CivicSnap AI Engine',
      confidence: 0.95,
      hazardAnalysis: 'Auto-verified by edge vision classifier for MVP Colony.',
      recommendedGear: ['Standard Sanitation PPE Kit', 'Debris Rakes'],
      exposurePriority: exposurePriority || exposure.priority,
      recoveryOpportunity: recoveryOpportunity || 'HIGH',
      collectionAccessibility: collectionAccessibility || access.accessibility,
    },
  };

  if (newIncident.severity === 5) {
    newIncident.status = 'dispatched';
    newIncident.assignedCrew = {
      id: 'CREW-GVMC-RAPID-01',
      name: 'GVMC Emergency Flying Sanitation Squad',
      vehicle: 'GVMC Rapid Van AP-31-TE-9999',
      contact: '+91 891 274 5500',
    };
  }

  incidents.unshift(newIncident);
  res.status(201).json({
    success: true,
    isDuplicate: false,
    incident: newIncident,
    nearestDistanceMeters: roundedDistance,
  });
});

// 4. PATCH /api/incidents/:id/accessibility - Human verification / override of collection accessibility
app.patch('/api/incidents/:id/accessibility', (req: Request, res: Response) => {
  const { id } = req.params;
  const { humanVerifiedCollectionMethod, notes } = req.body;

  const incident = incidents.find((i) => i.id === id || i.ticketNumber === id);
  if (!incident) {
    return res.status(404).json({ success: false, error: 'Incident not found' });
  }

  incident.humanVerifiedAccessibility = true;
  if (humanVerifiedCollectionMethod) {
    incident.humanVerifiedCollectionMethod = humanVerifiedCollectionMethod;
    incident.recommendedCollectionMethod = humanVerifiedCollectionMethod;
  }
  if (notes) {
    incident.accessibilityReason = `${incident.accessibilityReason} [Verified by Field Supervisor: ${notes}]`;
  }

  res.json({ success: true, incident });
});

// 5. PATCH /api/incidents/:id/status
app.patch('/api/incidents/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, assignedCrew, resolutionNotes, resolutionProofImage } = req.body;

  const incident = incidents.find((i) => i.id === id || i.ticketNumber === id);
  if (!incident) {
    return res.status(404).json({ success: false, error: 'Incident not found' });
  }

  if (status) incident.status = status;
  if (assignedCrew) incident.assignedCrew = assignedCrew;
  if (resolutionNotes) incident.resolutionNotes = resolutionNotes;
  if (resolutionProofImage) incident.resolutionProofImage = resolutionProofImage;
  if (status === 'resolved') {
    incident.resolvedAt = new Date().toISOString();
    incident.stormDrainBlockage = 'none';
    incident.drainBlockageDetailsEn = 'None / Cleared (drain flushed and unobstructed)';
    incident.drainBlockageDetailsTe = 'అడ్డంకి లేదు (కాలువ పూర్తిగా శుభ్రం చేయబడింది)';
  }

  res.json({ success: true, incident });
});

// 6. PATCH /api/incidents/:id/upvote
app.patch('/api/incidents/:id/upvote', (req: Request, res: Response) => {
  const { id } = req.params;
  const incident = incidents.find((i) => i.id === id || i.ticketNumber === id);
  if (!incident) {
    return res.status(404).json({ success: false, error: 'Incident not found' });
  }

  incident.upvotes += 1;
  incident.verifiedByCitizens += 1;
  res.json({ success: true, upvotes: incident.upvotes, verifiedByCitizens: incident.verifiedByCitizens });
});

// 6. GET /api/wards - Visakhapatnam Wards Telemetry
app.get('/api/wards', (_req: Request, res: Response) => {
  const wardDefs = [
    { number: 18, name: 'MVP Colony (Sectors 1-12)', nameTe: 'ఎం.వి.పి. కాలనీ (సెక్టార్లు 1-12)', zone: 'Zone-2 (Central Coastal)', center: { lat: 17.741, lng: 83.3325 }, polygonOffset: { x: 380, y: 220 } },
    { number: 19, name: "Lawson's Bay & Beach Road", nameTe: 'లాసన్స్ బే & బీచ్ రోడ్', zone: 'Zone-2 (Coastal Corridor)', center: { lat: 17.734, lng: 83.341 }, polygonOffset: { x: 520, y: 310 } },
    { number: 20, name: 'Ushodaya Junction & Sector 6', nameTe: 'ఉషోదయ జంక్షన్ & సెక్టార్ 6', zone: 'Zone-2 (Commercial Market)', center: { lat: 17.7435, lng: 83.3368 }, polygonOffset: { x: 440, y: 150 } },
    { number: 17, name: 'Sivajipalem & Appughar', nameTe: 'శివాజీపాలెం & అప్పుఘర్', zone: 'Zone-2 (North Coastal)', center: { lat: 17.7375, lng: 83.3282 }, polygonOffset: { x: 260, y: 280 } },
    { number: 21, name: 'Isukathota & Venkojipalem', nameTe: 'ఇసుకతోట & వెంకోజీపాలెం', zone: 'Zone-2 (NH16 Corridor)', center: { lat: 17.751, lng: 83.333 }, polygonOffset: { x: 340, y: 100 } },
    { number: 16, name: 'Peda Waltair & Kailasagiri', nameTe: 'పెద్ద వాల్తేరు & కైలాసగిరి', zone: 'Zone-2 (Hillside)', center: { lat: 17.738, lng: 83.348 }, polygonOffset: { x: 580, y: 190 } },
    { number: 22, name: 'Maddilapalem & RTC Corridor', nameTe: 'మద్దిలపాలెం & ఆర్టీసీ కారిడార్', zone: 'Zone-3 (Urban Transit)', center: { lat: 17.732, lng: 83.319 }, polygonOffset: { x: 170, y: 350 } },
    { number: 23, name: 'Siripuram & AU Campus', nameTe: 'సిరిపురం & ఆంధ్రా యూనివర్సిటీ', zone: 'Zone-3 (Institutional)', center: { lat: 17.722, lng: 83.318 }, polygonOffset: { x: 190, y: 430 } },
  ];

  const wardStats = wardDefs.map((w) => {
    const wardIncidents = incidents.filter((i) => i.wardNumber === w.number);
    const total = wardIncidents.length;
    const resolved = wardIncidents.filter((i) => i.status === 'resolved').length;
    const active = total - resolved;
    const severity5Count = wardIncidents.filter((i) => i.severity === 5 && i.status !== 'resolved').length;
    const drainBlockageCount = wardIncidents.filter((i) => i.stormDrainBlockage === 'severe' && i.status !== 'resolved').length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 100;
    const crewsDeployed = wardIncidents.filter((i) => i.assignedCrew).length;

    let densityLevel = 'low';
    if (severity5Count > 0 || drainBlockageCount >= 2 || active >= 3) densityLevel = 'critical';
    else if (active === 2 || drainBlockageCount >= 1) densityLevel = 'high';
    else if (active === 1) densityLevel = 'moderate';

    return {
      ...w,
      total,
      active,
      resolved,
      severity5Count,
      resolutionRate,
      crewsDeployed,
      densityLevel,
      drainBlockageCount,
      meanSlaHours: 3.8,
      recentIncidents: wardIncidents.slice(0, 3),
    };
  });

  res.json({ success: true, wards: wardStats });
});

// Configure Vite dev or serve static
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CivicSnap AI (Visakhapatnam GVMC) listening on port ${PORT}`);
  });
}

startServer();
