import React, { useState } from 'react';
import { Incident, Language } from '../types';
import { X, CheckCircle, Upload, ShieldCheck } from 'lucide-react';

interface ResolutionModalProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
  onResolve: (id: string, notes: string) => void;
  lang: Language;
}

export const ResolutionModal: React.FC<ResolutionModalProps> = ({
  incident,
  isOpen,
  onClose,
  onResolve,
  lang,
}) => {
  if (!isOpen || !incident) return null;

  const [notes, setNotes] = useState(
    'Field repair completed according to municipal engineering code. Carriageway cleared and inspected operational.'
  );
  const [safetyCheckPassed, setSafetyCheckPassed] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onResolve(incident.id, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white border border-[#CBD5E1] rounded-[8px] shadow-[0_20px_25px_-5px_rgba(15,23,42,0.12)] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#0F172A] text-white">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#059669]" />
            <h3 className="text-sm font-bold tracking-tight text-white">
              {lang === 'en' ? 'Submit Field Resolution Proof' : 'పరిష్కార వివరాలు మరియు నివేదిక'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-[3px] text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-[4px] p-3 text-xs">
            <div className="font-mono text-slate-500 font-bold">{incident.ticketNumber}</div>
            <div className="font-semibold text-slate-900 mt-0.5">
              {lang === 'te' ? incident.titleTe : incident.titleEn}
            </div>
            <div className="text-slate-600 font-mono text-[11px] mt-1">
              Ward {incident.wardNumber} · {incident.locationDetails}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {lang === 'en' ? 'Engineering Resolution Notes' : 'ఇంజనీరింగ్ పరిష్కార వివరాలు'}
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded-[4px] text-slate-900 focus:border-[#059669] focus:ring-1 focus:ring-[#059669]"
              required
            />
          </div>

          <div className="flex items-start gap-2.5 p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-[4px]">
            <input
              type="checkbox"
              id="safetyCheck"
              checked={safetyCheckPassed}
              onChange={(e) => setSafetyCheckPassed(e.target.checked)}
              className="mt-0.5 rounded-[2px] text-[#059669] focus:ring-[#059669]"
            />
            <label htmlFor="safetyCheck" className="text-xs text-[#065F46] select-none">
              <strong>Crew Supervisor Verification:</strong> Site tested safe for pedestrian and vehicular traffic. Zone barricades and debris removed.
            </label>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-[#CBD5E1] rounded-[4px] hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!safetyCheckPassed}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#059669] hover:bg-[#047857] border border-[#047857] rounded-[4px] transition-colors disabled:opacity-50"
            >
              Mark Incident Resolved
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
