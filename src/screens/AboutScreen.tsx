import React from 'react';
import { Language } from '../types';
import {
  ShieldCheck,
  Cpu,
  Clock,
  Phone,
  Waves,
  Sparkles,
  MapPin,
  Trash2,
} from 'lucide-react';

interface AboutScreenProps {
  lang: Language;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({ lang }) => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Banner */}
      <div className="bg-[#0F172A] text-white rounded-[8px] p-6 sm:p-8 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#059669]"></span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              GVMC SWACHH VISAKHA ARCHITECTURE
            </span>
            <span className="px-1.5 py-0.2 bg-[#F59E0B] text-slate-950 text-[9px] font-mono font-bold rounded-[2px]">
              DEMO DATA
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            CivicSnap AI — MVP Colony, Visakhapatnam
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {lang === 'en'
              ? 'A dedicated municipal solid waste triage and stormwater drainage protection platform tailored for Greater Visakhapatnam Municipal Corporation (GVMC), Andhra Pradesh. Powered by Gemini Multimodal Vision AI to automatically score garbage severity (1–5), identify critical drain chokes, and dispatch zone desilting squads.'
              : 'మహా విశాఖ నగర పాలక సంస్థ (జివిఎంసి) పరిధిలోని ఎం.వి.పి కాలనీలో చెత్త నిర్వహణ, వర్షపు కాలువల అడ్డంకుల పర్యవేక్షణ మరియు స్వచ్ఛ విశాఖ బృందాల వేగవంతమైన స్పందన కొరకు రూపొందించబడిన ఏఐ వేదిక.'}
          </p>
          <div className="pt-1 flex items-center gap-2 text-xs font-mono text-[#F59E0B]">
            <span>Active Dataset: 10 Sample Garbage Tickets (TKT-101 to TKT-110)</span>
          </div>
        </div>
      </div>

      {/* THREE MAJOR AI-POWERED FEATURES DOSSIER */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
          <h2 className="text-base font-bold text-[#0F172A] font-mono flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#059669]" />
            <span>3 MAJOR AI-POWERED SANITATION FEATURES (GEMINI VISION + SPATIAL GIS)</span>
          </h2>
          <span className="text-xs text-slate-500 font-mono">MVP COLONY DEPLOYMENT</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Feature 1: Public Health Exposure Mapper */}
          <div className="bg-white border border-[#CBD5E1] rounded-[6px] p-5 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-[#FEF2F2] border border-[#F87171] text-[#991B1B] text-[10px] font-mono font-bold rounded-[2px]">
                  FEATURE 01
                </span>
                <span className="text-[10px] font-mono text-slate-500">EXPLAINABLE GIS</span>
              </div>
              <h3 className="text-base font-bold text-[#0F172A] leading-snug">
                Public Health Exposure Mapper
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Combines Gemini Vision hazard classification with real-time GPS proximity calculations to 10 sensitive MVP Colony landmarks (schools, health centers, food markets, and beachfronts). Computes transparent HIGH, MEDIUM, and LOW exposure-priority scores.
              </p>
              <div className="space-y-1 pt-1 text-[11px] font-mono text-slate-700 bg-[#F8FAFC] p-2.5 rounded-[4px] border border-slate-200">
                <span className="font-bold text-[#991B1B] block">EXPLAINABLE METRICS:</span>
                <div>• Proximity to AS Raja School &amp; MVP Health Center</div>
                <div>• Storm drain stagnation &amp; flood vectors</div>
                <div>• Bio-medical and decomposing organic rot multipliers</div>
              </div>
            </div>
            <div className="p-2.5 bg-[#FFFBEB] border border-[#FCD34D] rounded-[4px] text-[10px] text-[#92400E] font-medium leading-tight">
              <strong>Strict Ethical Boundary:</strong> CivicSnap AI assesses environmental exposure proximity only and <em>never claims that disease or actual clinical health damage has been detected or diagnosed.</em>
            </div>
          </div>

          {/* Feature 2: Waste Recovery Opportunity Finder */}
          <div className="bg-white border border-[#CBD5E1] rounded-[6px] p-5 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-[10px] font-mono font-bold rounded-[2px]">
                  FEATURE 02
                </span>
                <span className="text-[10px] font-mono text-slate-500">CIRCULAR ECONOMY</span>
              </div>
              <h3 className="text-base font-bold text-[#0F172A] leading-snug">
                Waste Recovery Opportunity Finder
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Identifies recoverable circular materials—PET plastic bottles, corrugated cardboard, packaging paper, metals, and green biomass. Assigns high/medium/none recovery potential and specifies segregated dispatch to municipal Material Recovery Facilities (MRF).
              </p>
              <div className="space-y-1 pt-1 text-[11px] font-mono text-slate-700 bg-[#F8FAFC] p-2.5 rounded-[4px] border border-slate-200">
                <span className="font-bold text-[#065F46] block">CIRCULAR TAXONOMY:</span>
                <div>• Plastic, Paper, Metal, Glass, and Biomass detection</div>
                <div>• Segregation handling actions before compaction</div>
                <div>• Prevents recyclables from choking monsoon culverts</div>
              </div>
            </div>
            <div className="p-2.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-[4px] text-[10px] text-[#1E40AF] font-medium leading-tight">
              <strong>Material Verification Boundary:</strong> Distinguishes visually detected fractions from confirmed inventory; never invents recycling facilities or claims materials have already been processed.
            </div>
          </div>

          {/* Feature 3: Collection Accessibility Score */}
          <div className="bg-white border border-[#CBD5E1] rounded-[6px] p-5 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] text-[10px] font-mono font-bold rounded-[2px]">
                  FEATURE 03
                </span>
                <span className="text-[10px] font-mono text-slate-500">FLEET LOGISTICS</span>
              </div>
              <h3 className="text-base font-bold text-[#0F172A] leading-snug">
                Collection Accessibility Score
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Analyzes road conditions, narrow residential lanes, parked two-wheelers, and storm culvert openings. Recommends the appropriate GVMC fleet class: Large Compactor Truck, Mini-Tipper (Auto), or Manual Sanitation Squad.
              </p>
              <div className="space-y-1 pt-1 text-[11px] font-mono text-slate-700 bg-[#F8FAFC] p-2.5 rounded-[4px] border border-slate-200">
                <span className="font-bold text-[#1E40AF] block">FLEET MATCHING:</span>
                <div>• Wide double roads &rarr; Large Compactor Truck</div>
                <div>• Narrow sector crossways &rarr; Mini-Tipper / Auto</div>
                <div>• Culverts &amp; blocked passages &rarr; Manual Squad</div>
              </div>
            </div>
            <div className="p-2.5 bg-[#FEF2F2] border border-[#F87171] rounded-[4px] text-[10px] text-[#991B1B] font-medium leading-tight">
              <strong>Human Verification Requirement:</strong> Image analysis alone cannot confirm actual physical road width or weight limits; human verification and vehicle override are built into dispatch.
            </div>
          </div>
        </div>
      </div>

      {/* 4-Step Closed Loop Pipeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
          <h2 className="text-base font-bold text-[#0F172A] font-mono flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#059669]" />
            <span>THE 4-STAGE GVMC SOLID WASTE & DRAIN CLEANSING PIPELINE</span>
          </h2>
          <span className="text-xs text-slate-500 font-mono">GVMC ZONE-2 PROTOCOL</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Stage 1 */}
          <div className="bg-white border border-[#CBD5E1] rounded-[6px] p-4 space-y-2 shadow-xs">
            <div className="w-7 h-7 rounded-[3px] bg-[#0F172A] text-white flex items-center justify-center text-xs font-mono font-bold">
              01
            </div>
            <h3 className="text-sm font-bold text-[#0F172A]">Citizen Photo Capture</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Citizens snap geotagged photos of roadside garbage, overflowing dumpers, or blocked storm drains in MVP Colony. Works offline and syncs automatically.
            </p>
          </div>

          {/* Stage 2 */}
          <div className="bg-white border border-[#CBD5E1] rounded-[6px] p-4 space-y-2 shadow-xs">
            <div className="w-7 h-7 rounded-[3px] bg-[#059669] text-white flex items-center justify-center text-xs font-mono font-bold">
              02
            </div>
            <h3 className="text-sm font-bold text-[#0F172A]">Gemini Vision Triage</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Multimodal AI classifies waste type, evaluates health exposure priority, flags recoverable recyclables, scores vehicle accessibility, and monitors storm drains.
            </p>
          </div>

          {/* Stage 3 */}
          <div className="bg-white border border-[#CBD5E1] rounded-[6px] p-4 space-y-2 shadow-xs">
            <div className="w-7 h-7 rounded-[3px] bg-[#0F172A] text-white flex items-center justify-center text-xs font-mono font-bold">
              03
            </div>
            <h3 className="text-sm font-bold text-[#0F172A]">Automated Squad Dispatch</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Instant routing to GVMC Super-Sucker Desilting Squads, Biohazard Carriers, or Market Compactors with turn-by-turn coordinates, verified vehicle clearance, and mandated PPE.
            </p>
          </div>

          {/* Stage 4 */}
          <div className="bg-white border border-[#CBD5E1] rounded-[6px] p-4 space-y-2 shadow-xs">
            <div className="w-7 h-7 rounded-[3px] bg-[#059669] text-white flex items-center justify-center text-xs font-mono font-bold">
              04
            </div>
            <h3 className="text-sm font-bold text-[#0F172A]">Public Desilting Proof</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Post-cleanup resolution photos and desilted drain inspections are verified by the field supervisor and posted to the public ledger for citizen audit.
            </p>
          </div>
        </div>
      </div>

      {/* Municipal SLA Matrix Table for Solid Waste */}
      <div className="bg-white border border-[#CBD5E1] rounded-[6px] p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#0F172A] font-mono flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#059669]" />
            <span>GVMC SANITATION SLA GUARANTEE & DRAIN CHOKE CRITERIA</span>
          </h2>
          <span className="text-xs font-mono text-[#059669] font-bold">SWACHH VISAKHA PROTOCOL</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#CBD5E1] bg-[#F8FAFC] text-slate-700 font-mono">
                <th className="py-2.5 px-3">TIER</th>
                <th className="py-2.5 px-3">GARBAGE & DRAIN CRITERIA</th>
                <th className="py-2.5 px-3">MANDATED SLA</th>
                <th className="py-2.5 px-3">RESPONSIBLE WING</th>
                <th className="py-2.5 px-3">ESCALATION LEVEL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              <tr>
                <td className="py-3 px-3 font-mono font-bold text-[#991B1B]">
                  <span className="px-1.5 py-0.5 bg-[#FEF2F2] border border-[#F87171] rounded-[2px]">
                    SEV-5
                  </span>
                </td>
                <td className="py-3 px-3 font-medium text-slate-900">
                  Critical storm culvert 90% blocked by compacted plastics threatening residential flooding (TKT-101), or bio-medical sharps/syringes on walkway (TKT-102).
                </td>
                <td className="py-3 px-3 font-mono font-bold text-[#991B1B]">2 Hours</td>
                <td className="py-3 px-3 text-slate-700">GVMC Storm Drains & Public Health</td>
                <td className="py-3 px-3 font-mono text-slate-600">Zonal Commissioner (Zone-2)</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-mono font-bold text-[#92400E]">
                  <span className="px-1.5 py-0.5 bg-[#FFFBEB] border border-[#FCD34D] rounded-[2px]">
                    SEV-4
                  </span>
                </td>
                <td className="py-3 px-3 font-medium text-slate-900">
                  Market organic rot in storm channel (TKT-103), secondary dumper bin overflowing onto road (TKT-104), coastal tidal plastic choke (TKT-106).
                </td>
                <td className="py-3 px-3 font-mono font-bold text-[#92400E]">4 Hours</td>
                <td className="py-3 px-3 text-slate-700">Market Sanitation & Dumper Logistics</td>
                <td className="py-3 px-3 font-mono text-slate-600">Executive Engineer (Sanitation)</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-mono font-bold text-slate-700">
                  <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded-[2px]">
                    SEV-3
                  </span>
                </td>
                <td className="py-3 px-3 font-medium text-slate-900">
                  C&D concrete rubble on storm inlet grate (TKT-105), domestic garbage mound in vacant plot (TKT-107), commercial grease dumping (TKT-109).
                </td>
                <td className="py-3 px-3 font-mono font-bold text-slate-900">12 Hours</td>
                <td className="py-3 px-3 text-slate-700">C&D Cell / Commercial Enforcement</td>
                <td className="py-3 px-3 font-mono text-slate-600">Sanitary Inspector</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-mono font-bold text-[#065F46]">
                  <span className="px-1.5 py-0.5 bg-[#ECFDF5] border border-[#A7F3D0] rounded-[2px]">
                    SEV-2
                  </span>
                </td>
                <td className="py-3 px-3 font-medium text-slate-900">
                  Felled coconut fronds and pruning branches obstructing shallow surface drain (TKT-108).
                </td>
                <td className="py-3 px-3 font-mono font-bold text-[#059669]">24 Hours</td>
                <td className="py-3 px-3 text-slate-700">Urban Forestry & Green Waste Squad</td>
                <td className="py-3 px-3 font-mono text-slate-600">Ward Sanitary Supervisor</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-mono font-bold text-slate-500">
                  <span className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded-[2px]">
                    SEV-1
                  </span>
                </td>
                <td className="py-3 px-3 font-medium text-slate-900">
                  Routine litter pickup and beachfront promenade desilted storm grate maintenance (TKT-110).
                </td>
                <td className="py-3 px-3 font-mono font-bold text-slate-700">24 Hours</td>
                <td className="py-3 px-3 text-slate-700">Beachfront Sanitation Unit</td>
                <td className="py-3 px-3 font-mono text-slate-600">Section Lead</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Emergency Helplines & GVMC Contacts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#CBD5E1] rounded-[6px] p-4 space-y-1">
          <div className="flex items-center gap-2 text-[#991B1B] font-bold text-xs font-mono">
            <Phone className="w-4 h-4 text-[#EF4444]" />
            <span>GVMC EMERGENCY TOLL-FREE</span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">1800-425-00009</div>
          <p className="text-[11px] text-slate-500 font-mono">24/7 Visakhapatnam Municipal Command</p>
        </div>

        <div className="bg-white border border-[#CBD5E1] rounded-[6px] p-4 space-y-1">
          <div className="flex items-center gap-2 text-[#92400E] font-bold text-xs font-mono">
            <Phone className="w-4 h-4 text-[#F59E0B]" />
            <span>MVP COLONY WARD-18 DESK</span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">0891-2746300</div>
          <p className="text-[11px] text-slate-500 font-mono">Zone-2 Desilting & Drainage Squad</p>
        </div>

        <div className="bg-white border border-[#CBD5E1] rounded-[6px] p-4 space-y-1">
          <div className="flex items-center gap-2 text-[#065F46] font-bold text-xs font-mono">
            <Phone className="w-4 h-4 text-[#059669]" />
            <span>SWACHH VIZAG WHATSAPP</span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">+91 91542 52933</div>
          <p className="text-[11px] text-slate-500 font-mono">Instant Citizen Photo Grievance Bot</p>
        </div>
      </div>

      {/* Demo Notice & Transparency */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] p-4 text-xs text-slate-600 space-y-2 font-mono">
        <div className="font-bold text-[#0F172A] flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#059669]" />
          <span>CIVICSNAP AI DEMO DATA DISCLOSURE</span>
        </div>
        <p className="leading-relaxed">
          This system preview is populated with 10 representative municipal garbage and storm drain tickets (TKT-101 to TKT-110) for MVP Colony, Visakhapatnam, Andhra Pradesh. All tickets, coordinates, and telemetry records are labeled as DEMO DATA for verification and evaluation purposes.
        </p>
      </div>
    </div>
  );
};
