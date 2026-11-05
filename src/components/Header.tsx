import React from 'react';
import { ActiveScreen, Language } from '../types';
import { Camera, AlertTriangle, ShieldCheck, Flame } from 'lucide-react';
import { UI_STRINGS } from '../data/sampleData';

interface HeaderProps {
  currentScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  lang: Language;
  onToggleLang: (lang: Language) => void;
  onOpenReportModal: () => void;
  hasSeverity5Active: boolean;
  totalActiveCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  lang,
  onToggleLang,
  onOpenReportModal,
  hasSeverity5Active,
  totalActiveCount,
}) => {
  const strings = UI_STRINGS[lang];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#CBD5E1] shadow-[0_1px_3px_0_rgba(15,23,42,0.06)]">
      {/* Critical Emergency Ticker Bar if Severity 5 exists */}
      {hasSeverity5Active && (
        <div className="bg-[#FEF2F2] border-b border-[#F87171] px-4 py-1.5 text-xs text-[#991B1B] flex items-center justify-between font-mono">
          <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
            <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse"></span>
            <span className="px-1 py-0.2 bg-[#EF4444] text-white text-[9px] font-bold rounded-[2px]">
              DEMO DATA
            </span>
            <span className="font-bold flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[#EF4444]" />
              {lang === 'en' ? 'LIVE SEVERITY 5 ALERT:' : 'తీవ్రత 5 అత్యవసర హెచ్చరిక:'}
            </span>
            <span className="truncate">
              {lang === 'en'
                ? 'Storm drain blocked in Sector 1 (MVP Colony) & bio-medical waste in Sector 3. GVMC Desilting Squads dispatched.'
                : 'సెక్టార్ 1 (ఎం.వి.పి కాలనీ) లో వర్షపు కాలువ అడ్డంకి మరియు సెక్టార్ 3 లో బయో-మెడికల్ వ్యర్థాలు. జివిఎంసి బృందాలు బయలుదేరాయి.'}
            </span>
          </div>
        </div>
      )}

      {/* Main Top Bar: 3-Zone Contract */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
          >
            <div className="w-8 h-8 rounded-[4px] bg-[#059669] flex items-center justify-center text-white font-black text-sm tracking-tighter shadow-sm">
              CS
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-[#0F172A] whitespace-nowrap block leading-none">
                  {strings.appTitle}
                </span>
                <span className="px-1.5 py-0.2 bg-[#F59E0B] text-slate-950 text-[9px] font-mono font-bold rounded-[2px] leading-tight">
                  DEMO DATA
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase block mt-0.5">
                MVP COLONY, VISAKHAPATNAM (GVMC)
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-[4px] transition-colors whitespace-nowrap ${
              currentScreen === 'home'
                ? 'bg-[#0F172A] text-white'
                : 'text-slate-700 hover:text-[#0F172A] hover:bg-slate-100'
            }`}
          >
            {strings.navHome}
          </button>

          <button
            onClick={() => onNavigate('dispatch')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-[4px] transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentScreen === 'dispatch'
                ? 'bg-[#0F172A] text-white'
                : 'text-slate-700 hover:text-[#0F172A] hover:bg-slate-100'
            }`}
          >
            {strings.navDispatch}
            <span className="px-1.5 py-0.2 bg-[#E2E8F0] text-slate-800 text-[10px] font-mono rounded-[2px]">
              {totalActiveCount}
            </span>
          </button>

          <button
            onClick={() => onNavigate('heatmap')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-[4px] transition-colors whitespace-nowrap ${
              currentScreen === 'heatmap'
                ? 'bg-[#0F172A] text-white'
                : 'text-slate-700 hover:text-[#0F172A] hover:bg-slate-100'
            }`}
          >
            {strings.navHeatmap}
          </button>

          <button
            onClick={() => onNavigate('about')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-[4px] transition-colors whitespace-nowrap ${
              currentScreen === 'about'
                ? 'bg-[#0F172A] text-white'
                : 'text-slate-700 hover:text-[#0F172A] hover:bg-slate-100'
            }`}
          >
            {strings.navAbout}
          </button>
        </nav>

        {/* Zone 3: Actions + Bilingual Toggle Bar */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Segmented Bilingual Switch: [English | తెలుగు] */}
          <div className="inline-flex p-0.5 bg-[#E2E8F0] rounded-[4px] border border-[#CBD5E1]">
            <button
              onClick={() => onToggleLang('en')}
              className={`px-2 py-1 text-xs font-bold rounded-[2px] transition-colors whitespace-nowrap ${
                lang === 'en'
                  ? 'bg-[#0F172A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Switch to English"
            >
              EN
            </button>
            <button
              onClick={() => onToggleLang('te')}
              className={`px-2 py-1 text-xs font-bold rounded-[2px] transition-colors whitespace-nowrap ${
                lang === 'te'
                  ? 'bg-[#0F172A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="తెలుగు భాషకు మార్చండి"
            >
              తెలుగు
            </button>
          </div>

          {/* Primary Action Button: Snap & File Issue */}
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#059669] hover:bg-[#047857] border border-[#047857] rounded-[4px] transition-colors whitespace-nowrap shadow-xs focus:ring-2 focus:ring-[#059669] focus:ring-offset-1"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{strings.btnReport}</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-[#E2E8F0] bg-[#F8FAFC] py-1.5 px-2 text-xs">
        <button
          onClick={() => onNavigate('home')}
          className={`px-2 py-1 font-semibold rounded-[2px] ${
            currentScreen === 'home' ? 'text-[#059669] font-bold' : 'text-slate-600'
          }`}
        >
          {strings.navHome}
        </button>
        <button
          onClick={() => onNavigate('dispatch')}
          className={`px-2 py-1 font-semibold rounded-[2px] ${
            currentScreen === 'dispatch' ? 'text-[#059669] font-bold' : 'text-slate-600'
          }`}
        >
          {strings.navDispatch} ({totalActiveCount})
        </button>
        <button
          onClick={() => onNavigate('heatmap')}
          className={`px-2 py-1 font-semibold rounded-[2px] ${
            currentScreen === 'heatmap' ? 'text-[#059669] font-bold' : 'text-slate-600'
          }`}
        >
          {strings.navHeatmap}
        </button>
        <button
          onClick={() => onNavigate('about')}
          className={`px-2 py-1 font-semibold rounded-[2px] ${
            currentScreen === 'about' ? 'text-[#059669] font-bold' : 'text-slate-600'
          }`}
        >
          {strings.navAbout}
        </button>
      </div>
    </header>
  );
};
