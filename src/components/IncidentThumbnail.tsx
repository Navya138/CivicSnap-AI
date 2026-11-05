import React from 'react';
import { IncidentCategory } from '../types';

interface IncidentThumbnailProps {
  category: IncidentCategory;
  thumbnailType?: string;
  severity: number;
  className?: string;
  customImage?: string;
  aspectRatio?: 'video' | 'square' | 'wide';
  isDemoData?: boolean;
}

export const IncidentThumbnail: React.FC<IncidentThumbnailProps> = ({
  category,
  thumbnailType,
  severity,
  className = '',
  customImage,
  aspectRatio = 'video',
  isDemoData = true,
}) => {
  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'wide'
      ? 'aspect-[21/9]'
      : 'aspect-[16/9]';

  // If custom uploaded base64 data URL exists, show it directly with overlay
  if (customImage && customImage.startsWith('data:')) {
    return (
      <div className={`relative overflow-hidden rounded-[4px] bg-[#0F172A] border border-[#CBD5E1] ${aspectClass} ${className}`}>
        <img
          src={customImage}
          alt="Reported civic incident"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        {isDemoData && (
          <div className="absolute top-2 left-2 px-1.5 py-0.5 text-[9px] font-mono font-bold bg-[#F59E0B] text-slate-950 rounded-[2px] shadow-xs">
            DEMO DATA
          </div>
        )}
        <div className="absolute top-2 right-2 px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-[#0F172A]/85 text-white rounded-[2px] backdrop-blur-sm">
          VISAKHA GVMC VERIFIED
        </div>
      </div>
    );
  }

  const effectiveType = thumbnailType || category;

  return (
    <div
      className={`relative overflow-hidden rounded-[4px] bg-[#0F172A] text-white border border-[#CBD5E1] ${aspectClass} ${className} flex items-center justify-center select-none`}
    >
      {/* 1. Storm Drain Plastic Choke */}
      {effectiveType === 'drain_blockage' && (
        <svg viewBox="0 0 400 225" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="225" fill="#1C1917" />
          {/* Concrete drainage culvert & walls */}
          <rect x="30" y="50" width="340" height="150" fill="#44403C" />
          <rect x="50" y="70" width="300" height="110" fill="#292524" />
          {/* Stagnant backflow water */}
          <path d="M50 140 C 120 135, 220 145, 350 140 L 350 180 L 50 180 Z" fill="#451A03" fillOpacity="0.85" />
          <path d="M50 155 C 150 150, 250 160, 350 155 L 350 180 L 50 180 Z" fill="#042F2E" fillOpacity="0.75" />
          {/* Iron drainage grate choked */}
          <line x1="160" y1="70" x2="160" y2="180" stroke="#78716C" strokeWidth="6" />
          <line x1="200" y1="70" x2="200" y2="180" stroke="#78716C" strokeWidth="6" />
          <line x1="240" y1="70" x2="240" y2="180" stroke="#78716C" strokeWidth="6" />
          {/* Compacted Plastic Bottles & Rubbish Mound */}
          <ellipse cx="200" cy="145" rx="100" ry="40" fill="#059669" fillOpacity="0.8" />
          {/* Individual bottles and trash bags */}
          <rect x="130" y="130" width="36" height="14" rx="4" fill="#38BDF8" transform="rotate(-15 130 130)" />
          <rect x="180" y="125" width="40" height="15" rx="5" fill="#FACC15" transform="rotate(8 180 125)" />
          <rect x="235" y="132" width="38" height="14" rx="4" fill="#EF4444" transform="rotate(-25 235 132)" />
          <rect x="155" y="145" width="42" height="16" rx="4" fill="#E2E8F0" transform="rotate(20 155 145)" />
          <circle cx="210" cy="140" r="14" fill="#1E293B" />
          <circle cx="260" cy="148" r="12" fill="#78350F" />
          {/* Label banner */}
          <rect x="16" y="16" width="168" height="26" rx="3" fill="#991B1B" fillOpacity="0.9" />
          <text x="24" y="33" fill="#FFFFFF" fontSize="11" fontFamily="JetBrains Mono" fontWeight="700">DRAIN: 90% CHOKE</text>
        </svg>
      )}

      {/* 2. Hazardous Bio-Medical Waste */}
      {effectiveType === 'bio_hazardous' && (
        <svg viewBox="0 0 400 225" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="225" fill="#1E1B4B" />
          {/* Pavement stone texture */}
          <rect x="0" y="130" width="400" height="95" fill="#312E81" />
          <line x1="0" y1="170" x2="400" y2="170" stroke="#4338CA" strokeWidth="2" strokeDasharray="16 10" />
          {/* Yellow Bio-hazard sacks torn */}
          <path d="M120 160 Q 150 90 200 130 Q 230 110 270 160 Z" fill="#FACC15" fillOpacity="0.95" />
          <path d="M170 165 Q 210 100 260 145 Q 280 120 310 165 Z" fill="#EAB308" fillOpacity="0.9" />
          {/* Biohazard Symbol glyph */}
          <circle cx="195" cy="135" r="12" fill="#78350F" />
          <circle cx="195" cy="135" r="8" fill="#FACC15" />
          {/* Exposed Syringes / Sharps */}
          <line x1="110" y1="150" x2="160" y2="135" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
          <line x1="160" y1="135" x2="175" y2="130" stroke="#94A3B8" strokeWidth="1.5" />
          <line x1="260" y1="155" x2="295" y2="140" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
          <line x1="295" y1="140" x2="310" y2="135" stroke="#94A3B8" strokeWidth="1.5" />
          {/* Blood/Chemical stain */}
          <ellipse cx="230" cy="165" rx="35" ry="12" fill="#991B1B" fillOpacity="0.8" />
          {/* Label banner */}
          <rect x="16" y="16" width="168" height="26" rx="3" fill="#991B1B" fillOpacity="0.9" />
          <text x="24" y="33" fill="#FFFFFF" fontSize="11" fontFamily="JetBrains Mono" fontWeight="700">BIO-MEDICAL SHARPS</text>
        </svg>
      )}

      {/* 3. Commercial Market / Rythu Bazaar Waste */}
      {effectiveType === 'commercial_market' && (
        <svg viewBox="0 0 400 225" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="225" fill="#14532D" fillOpacity="0.5" />
          <rect width="400" height="225" fill="#1C1917" />
          {/* Concrete drain edge */}
          <path d="M0 140 L400 140 L400 225 L0 225 Z" fill="#292524" />
          {/* Market Crates broken */}
          <rect x="70" y="115" width="55" height="35" fill="#B45309" stroke="#78350F" strokeWidth="2" />
          <rect x="290" y="125" width="60" height="38" fill="#B45309" stroke="#78350F" strokeWidth="2" transform="rotate(12 290 125)" />
          {/* Rotting vegetable pile */}
          <polygon points="120,165 200,90 280,165" fill="#15803D" />
          <polygon points="160,165 230,105 300,165" fill="#CA8A04" />
          {/* Rotting produce pieces */}
          <circle cx="160" cy="140" r="14" fill="#DC2626" />
          <circle cx="185" cy="130" r="12" fill="#EAB308" />
          <circle cx="215" cy="125" r="16" fill="#16A34A" />
          <circle cx="245" cy="142" r="15" fill="#991B1B" />
          <circle cx="190" cy="155" r="10" fill="#854D0E" />
          {/* Flies swarm dots */}
          <circle cx="190" cy="85" r="1.5" fill="#FFFFFF" />
          <circle cx="215" cy="78" r="1.5" fill="#FFFFFF" />
          <circle cx="235" cy="88" r="1.5" fill="#FFFFFF" />
          <rect x="16" y="16" width="168" height="26" rx="3" fill="#B45309" fillOpacity="0.9" />
          <text x="24" y="33" fill="#FEF3C7" fontSize="11" fontFamily="JetBrains Mono" fontWeight="700">RYTHU BAZAAR ROT</text>
        </svg>
      )}

      {/* 4. Overflowing Dumper Bin */}
      {effectiveType === 'dumper_overflow' && (
        <svg viewBox="0 0 400 225" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="225" fill="#0F172A" />
          {/* Road carriageway */}
          <rect x="0" y="120" width="400" height="105" fill="#1E293B" />
          <line x1="0" y1="175" x2="400" y2="175" stroke="#475569" strokeWidth="3" strokeDasharray="20 12" />
          {/* 10-cu.m GVMC Dumper Bin (Green metallic) */}
          <polygon points="120,60 280,60 260,150 140,150" fill="#047857" stroke="#065F46" strokeWidth="4" />
          <rect x="135" y="75" width="130" height="20" fill="#064E3B" />
          <text x="200" y="90" textAnchor="middle" fill="#A7F3D0" fontSize="10" fontFamily="JetBrains Mono" fontWeight="700">GVMC DUMPER 10M³</text>
          {/* Overflowing bags & refuse piling out */}
          <circle cx="160" cy="55" r="22" fill="#1E293B" />
          <circle cx="200" cy="45" r="26" fill="#F59E0B" />
          <circle cx="240" cy="50" r="24" fill="#3B82F6" />
          {/* Spill on road blocking lane */}
          <ellipse cx="200" cy="165" rx="110" ry="25" fill="#334155" fillOpacity="0.9" />
          <circle cx="130" cy="165" r="12" fill="#EF4444" />
          <circle cx="170" cy="162" r="14" fill="#E2E8F0" />
          <circle cx="225" cy="168" r="16" fill="#059669" />
          <circle cx="270" cy="165" r="13" fill="#D97706" />
          <rect x="16" y="16" width="168" height="26" rx="3" fill="#D97706" fillOpacity="0.9" />
          <text x="24" y="33" fill="#FFFFFF" fontSize="11" fontFamily="JetBrains Mono" fontWeight="700">DUMPER SPILL: 4 TONS</text>
        </svg>
      )}

      {/* 5. Construction & Demolition Rubble */}
      {effectiveType === 'c_and_d_rubble' && (
        <svg viewBox="0 0 400 225" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="225" fill="#1C1917" />
          {/* Walkway and kerb */}
          <rect x="0" y="110" width="400" height="115" fill="#292524" />
          {/* Stormwater inlet grate covered */}
          <rect x="150" y="140" width="100" height="40" fill="#0C0A09" stroke="#57534E" strokeWidth="3" />
          {/* Concrete slabs & brick mounds */}
          <polygon points="110,165 170,80 230,165" fill="#78716C" />
          <polygon points="180,165 240,95 290,165" fill="#A8A29E" />
          <polygon points="140,165 190,110 240,165" fill="#57534E" />
          {/* Red brick blocks */}
          <rect x="130" y="150" width="28" height="14" fill="#B91C1C" transform="rotate(-15 130 150)" />
          <rect x="220" y="145" width="28" height="14" fill="#991B1B" transform="rotate(25 220 145)" />
          <rect x="175" y="135" width="26" height="13" fill="#B91C1C" />
          <rect x="16" y="16" width="168" height="26" rx="3" fill="#57534E" fillOpacity="0.9" />
          <text x="24" y="33" fill="#F5F5F4" fontSize="11" fontFamily="JetBrains Mono" fontWeight="700">C&D RUBBLE ON GRATE</text>
        </svg>
      )}

      {/* 6. Coastal & Beachfront Litter */}
      {effectiveType === 'coastal_beach' && (
        <svg viewBox="0 0 400 225" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Bay of Bengal waters */}
          <rect width="400" height="100" fill="#0284C7" />
          <path d="M0 70 Q 100 85 200 70 T 400 75 L 400 100 L 0 100 Z" fill="#0369A1" />
          {/* Beach sand */}
          <rect y="100" width="400" height="125" fill="#D97706" fillOpacity="0.65" />
          {/* Tidal plastic accumulation */}
          <ellipse cx="200" cy="145" rx="140" ry="30" fill="#B45309" fillOpacity="0.4" />
          {/* Single-use bottles, nets and thermocol */}
          <rect x="90" y="130" width="32" height="12" rx="3" fill="#38BDF8" transform="rotate(22 90 130)" />
          <rect x="140" y="145" width="35" height="14" rx="4" fill="#F8FAFC" transform="rotate(-18 140 145)" />
          <rect x="195" y="135" width="38" height="13" rx="3" fill="#22C55E" transform="rotate(10 195 135)" />
          <rect x="250" y="140" width="30" height="12" rx="3" fill="#EF4444" transform="rotate(-28 250 140)" />
          <circle cx="170" cy="155" r="12" fill="#E2E8F0" />
          <circle cx="225" cy="150" r="14" fill="#38BDF8" />
          <rect x="16" y="16" width="168" height="26" rx="3" fill="#0369A1" fillOpacity="0.9" />
          <text x="24" y="33" fill="#BAE6FD" fontSize="11" fontFamily="JetBrains Mono" fontWeight="700">LAWSON'S BAY BEACH</text>
        </svg>
      )}

      {/* 7. Residential Solid Waste */}
      {effectiveType === 'residential_solid' && (
        <svg viewBox="0 0 400 225" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="225" fill="#0F172A" />
          <rect y="120" width="400" height="105" fill="#1E293B" />
          {/* Vacant plot vegetation & trash mound */}
          <ellipse cx="200" cy="155" rx="120" ry="45" fill="#334155" />
          <circle cx="150" cy="140" r="22" fill="#0F172A" />
          <circle cx="190" cy="130" r="26" fill="#15803D" />
          <circle cx="235" cy="135" r="24" fill="#0284C7" />
          <circle cx="270" cy="148" r="18" fill="#F59E0B" />
          <rect x="16" y="16" width="168" height="26" rx="3" fill="#334155" fillOpacity="0.9" />
          <text x="24" y="33" fill="#F8FAFC" fontSize="11" fontFamily="JetBrains Mono" fontWeight="700">VACANT PLOT DUMP</text>
        </svg>
      )}

      {/* 8. Bulk Green & Horticulture */}
      {effectiveType === 'bulk_green' && (
        <svg viewBox="0 0 400 225" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="225" fill="#064E3B" />
          <rect y="120" width="400" height="105" fill="#1C1917" />
          {/* Palm leaves and branches */}
          <path d="M100 160 Q 200 90 300 160" stroke="#15803D" strokeWidth="8" strokeLinecap="round" />
          <path d="M120 165 Q 210 110 320 165" stroke="#166534" strokeWidth="6" strokeLinecap="round" />
          <path d="M80 155 Q 180 80 270 155" stroke="#65A30D" strokeWidth="5" strokeLinecap="round" />
          <rect x="16" y="16" width="168" height="26" rx="3" fill="#166534" fillOpacity="0.9" />
          <text x="24" y="33" fill="#DCFCE7" fontSize="11" fontFamily="JetBrains Mono" fontWeight="700">GREENERY CHOKING DRAIN</text>
        </svg>
      )}

      {/* DEMO DATA Top Badge */}
      {isDemoData && (
        <div className="absolute top-2 left-2 px-1.5 py-0.5 text-[9px] font-mono font-bold bg-[#F59E0B] text-slate-950 rounded-[2px] shadow-xs">
          DEMO DATA
        </div>
      )}

      {/* Camera / GPS HUD Badge */}
      <div className="absolute bottom-2 left-2 px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-[#0F172A]/85 text-slate-200 border border-slate-700 rounded-[2px] flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
        <span>MVP COLONY · GVMC</span>
      </div>

      <div className="absolute bottom-2 right-2 px-2 py-0.5 text-[11px] font-mono font-bold bg-[#0F172A] text-white rounded-[2px] border border-slate-700">
        SEV-{severity}
      </div>
    </div>
  );
};
