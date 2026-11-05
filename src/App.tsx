import React, { useState, useEffect } from 'react';
import { Incident, ActiveScreen, Language, RecommendedCollectionMethod } from './types';
import { INITIAL_INCIDENTS } from './data/sampleData';
import { Header } from './components/Header';
import { ReportModal } from './components/ReportModal';
import { IncidentDetailModal } from './components/IncidentDetailModal';
import { ResolutionModal } from './components/ResolutionModal';
import { LiveStreamScreen } from './screens/LiveStreamScreen';
import { WorkerDispatchScreen } from './screens/WorkerDispatchScreen';
import { WardHeatmapScreen } from './screens/WardHeatmapScreen';
import { AboutScreen } from './screens/AboutScreen';
import { findNearestIncident } from './utils/geo';
import {
  getNearbySensitivePlaces,
  calculateExposureScore,
  calculateCollectionAccessibility,
} from './utils/geoSensitivity';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('home');
  const [lang, setLang] = useState<Language>('en');
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [resolvingIncident, setResolvingIncident] = useState<Incident | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch incidents from server on mount if available
  useEffect(() => {
    fetch('/api/incidents')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.incidents && data.incidents.length > 0) {
          setIncidents(data.incidents);
        }
      })
      .catch((err) => {
        console.log('Using client-side seed incidents for MVP Colony:', err);
      });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Submit new incident with 20-metre Haversine duplicate detection
  const handleCreateIncident = async (newIncidentData: Partial<Incident>) => {
    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIncidentData),
      });
      const data = await res.json();
      if (data.success) {
        if (data.isDuplicate) {
          // Increment verification count and update local state for the existing incident
          setIncidents((prev) =>
            prev.map((item) => {
              if (item.ticketNumber === data.duplicateOf || item.id === data.existingIncident?.id) {
                return {
                  ...item,
                  upvotes: (item.upvotes || 0) + 1,
                  verifiedByCitizens: (item.verifiedByCitizens || 0) + 1,
                };
              }
              return item;
            })
          );
          showToast(
            lang === 'en'
              ? `⚠️ Duplicate intercepted: ${data.distanceMeters}m from existing ticket ${data.duplicateOf}. Second ticket not created; citizen verification added.`
              : `⚠️ డూప్లికేట్ గుర్తించబడింది: ${data.duplicateOf} నుండి ${data.distanceMeters} మీ. ధృవీకరణ జోడించబడింది.`
          );
          return data;
        }

        if (data.incident) {
          setIncidents((prev) => [data.incident, ...prev]);
          showToast(
            lang === 'en'
              ? `Ticket ${data.incident.ticketNumber} registered in GVMC live queue! (DEMO)`
              : `సమస్య ${data.incident.ticketNumber} విజయవంతంగా నమోదయింది! (డెమో)`
          );
          return data;
        }
      }
    } catch (err) {
      console.warn('API error, saving locally with Haversine check:', err);
    }

    // Client fallback creation with 20-metre Haversine duplicate detection
    const targetCoords = newIncidentData.coordinates || { lat: 17.741, lng: 83.3325 };
    const nearest = findNearestIncident(targetCoords.lat, targetCoords.lng, incidents);

    if (nearest && nearest.isWithin20m) {
      // Flag as duplicate: do NOT create a second independent ticket
      setIncidents((prev) =>
        prev.map((item) => {
          if (item.id === nearest.incident.id || item.ticketNumber === nearest.incident.ticketNumber) {
            return {
              ...item,
              upvotes: (item.upvotes || 0) + 1,
              verifiedByCitizens: (item.verifiedByCitizens || 0) + 1,
            };
          }
          return item;
        })
      );
      showToast(
        lang === 'en'
          ? `⚠️ Duplicate intercepted: ${nearest.distanceMeters}m from existing ticket ${nearest.incident.ticketNumber}. Second ticket not created.`
          : `⚠️ డూప్లికేట్ గుర్తించబడింది: ${nearest.incident.ticketNumber} నుండి ${nearest.distanceMeters} మీ.`
      );
      return {
        success: true,
        isDuplicate: true,
        duplicateOf: nearest.incident.ticketNumber,
        existingIncident: nearest.incident,
        distanceMeters: nearest.distanceMeters,
      };
    }

    // Outside 20 metres: create new ticket normally
    const sensitive =
      newIncidentData.nearbySensitivePlaces ||
      getNearbySensitivePlaces(targetCoords.lat, targetCoords.lng);
    const exposure = calculateExposureScore(
      newIncidentData.severity || 3,
      sensitive,
      newIncidentData.stormDrainBlockage || 'partial',
      newIncidentData.category || 'drain_blockage'
    );
    const obstacles = newIncidentData.visibleRoadObstacles || ['Residential access road'];
    const access = calculateCollectionAccessibility(
      obstacles,
      newIncidentData.category || 'drain_blockage',
      newIncidentData.severity || 3
    );

    const randNum = Math.floor(111 + Math.random() * 888);
    const fallbackIncident: Incident = {
      id: `inc-${Date.now()}`,
      ticketNumber: `TKT-${randNum}`,
      category: newIncidentData.category || 'drain_blockage',
      categoryNameEn: newIncidentData.categoryNameEn || 'Storm Drain Plastic Choke',
      categoryNameTe: newIncidentData.categoryNameTe || 'వర్షపు కాలువ ప్లాస్టిక్ అడ్డంకి',
      titleEn: newIncidentData.titleEn || 'Reported Garbage Hazard in MVP Colony',
      titleTe: newIncidentData.titleTe || 'ఎం.వి.పి కాలనీలో పౌర చెత్త సమస్య',
      descriptionEn: newIncidentData.descriptionEn || 'Citizen filed report.',
      descriptionTe: newIncidentData.descriptionTe || 'పౌర ఫిర్యాదు.',
      severity: newIncidentData.severity || 3,
      status: newIncidentData.severity === 5 ? 'dispatched' : 'open',
      stormDrainBlockage: newIncidentData.stormDrainBlockage || 'partial',
      drainBlockageDetailsEn: newIncidentData.drainBlockageDetailsEn || 'Partial obstruction observed',
      drainBlockageDetailsTe: newIncidentData.drainBlockageDetailsTe || 'పాక్షిక అడ్డంకి ఉంది',
      wardNumber: newIncidentData.wardNumber || 18,
      wardName: newIncidentData.wardName || 'MVP Colony (Sector 1-4)',
      wardNameTe: newIncidentData.wardNameTe || 'ఎం.వి.పి. కాలనీ (సెక్టార్ 1-4)',
      locationDetails: newIncidentData.locationDetails || 'MVP Colony, Visakhapatnam',
      coordinates: targetCoords,
      department: newIncidentData.department || 'GVMC Solid Waste Management (Zone-2)',
      departmentTe: newIncidentData.departmentTe || 'జివిఎంసి ఘన వ్యర్థాల నిర్వహణ విభాగం',
      reportedAt: new Date().toISOString(),
      slaDeadline: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
      slaHours: newIncidentData.slaHours || 4,
      upvotes: 1,
      verifiedByCitizens: 1,
      imageThumbnail: newIncidentData.imageThumbnail || 'drain_blockage',
      isDemoData: true,

      // Feature 1
      exposurePriority: newIncidentData.exposurePriority || exposure.priority,
      exposureReason: newIncidentData.exposureReason || exposure.reason,
      nearbySensitivePlaces: sensitive,

      // Feature 2
      detectedMaterials: newIncidentData.detectedMaterials || [
        { material: 'Mixed Municipal Waste Items', confidence: 0.92, visualStatus: 'visually_detected', recoverable: true, recommendedHandling: 'Segregate dry recyclables at ward processing station.' },
      ],
      recoveryOpportunity: newIncidentData.recoveryOpportunity || 'HIGH',
      recommendedRecoveryAction: newIncidentData.recommendedRecoveryAction || 'Deploy dry-waste segregation cart before final compaction.',

      // Feature 3
      collectionAccessibility: newIncidentData.collectionAccessibility || access.accessibility,
      recommendedCollectionMethod: newIncidentData.recommendedCollectionMethod || access.method,
      visibleRoadObstacles: obstacles,
      accessibilityReason: newIncidentData.accessibilityReason || access.reason,

      aiTriageLog: newIncidentData.aiTriageLog || {
        model: 'CivicSnap AI Engine',
        confidence: 0.95,
        hazardAnalysis: 'Auto-verified by edge vision classifier for MVP Colony.',
        recommendedGear: ['Standard Sanitation PPE Kit', 'Debris Rakes'],
        exposurePriority: newIncidentData.exposurePriority || exposure.priority,
        recoveryOpportunity: newIncidentData.recoveryOpportunity || 'HIGH',
        collectionAccessibility: newIncidentData.collectionAccessibility || access.accessibility,
      },
    };

    if (fallbackIncident.severity === 5) {
      fallbackIncident.assignedCrew = {
        id: 'CREW-GVMC-RAPID-01',
        name: 'GVMC Emergency Flying Sanitation Squad',
        vehicle: 'GVMC Rapid Van AP-31-TE-9999',
        contact: '+91 891 274 5500',
      };
    }

    setIncidents((prev) => [fallbackIncident, ...prev]);
    showToast(
      lang === 'en'
        ? `Ticket ${fallbackIncident.ticketNumber} logged in queue! (DEMO)`
        : `సమస్య ${fallbackIncident.ticketNumber} విజయవంతంగా నమోదయింది! (డెమో)`
    );
    return { success: true, isDuplicate: false, incident: fallbackIncident };
  };

  // Human verification / override of collection accessibility
  const handleVerifyAccessibility = (
    id: string,
    method?: RecommendedCollectionMethod,
    notes?: string
  ) => {
    fetch(`/api/incidents/${id}/accessibility`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ humanVerifiedCollectionMethod: method, notes }),
    }).catch(() => {});

    setIncidents((prev) =>
      prev.map((item) => {
        if (item.id === id || item.ticketNumber === id) {
          const updated = {
            ...item,
            humanVerifiedAccessibility: true,
            humanVerifiedCollectionMethod: method || item.recommendedCollectionMethod,
            recommendedCollectionMethod: method || item.recommendedCollectionMethod,
            accessibilityReason: notes
              ? `${item.accessibilityReason} [Verified by Field Supervisor: ${notes}]`
              : `${item.accessibilityReason} [Verified by Field Supervisor]`,
          };
          if (selectedIncident && (selectedIncident.id === id || selectedIncident.ticketNumber === id)) {
            setSelectedIncident(updated);
          }
          return updated;
        }
        return item;
      })
    );

    showToast(
      lang === 'en'
        ? 'Field collection accessibility verified & vehicle assigned!'
        : 'క్షేత్ర పారిశుధ్య వాహన సౌలభ్యం ధృవీకరించబడింది!'
    );
  };

  // Upvote / Verify incident
  const handleUpvote = (id: string) => {
    fetch(`/api/incidents/${id}/upvote`, { method: 'PATCH' }).catch(() => {});

    setIncidents((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            upvotes: item.upvotes + 1,
            verifiedByCitizens: item.verifiedByCitizens + 1,
          };
        }
        return item;
      })
    );

    showToast(lang === 'en' ? 'Thank you! Neighbor verification recorded.' : 'ధన్యవాదాలు! ధృవీకరణ నమోదైంది.');
  };

  // Update status (worker dispatch)
  const handleUpdateStatus = (id: string, newStatus: Incident['status'], crew?: any) => {
    fetch(`/api/incidents/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, assignedCrew: crew }),
    }).catch(() => {});

    setIncidents((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            status: newStatus,
            assignedCrew: crew || item.assignedCrew,
          };
        }
        return item;
      })
    );

    showToast(
      lang === 'en'
        ? `Work order transitioned to ${newStatus.replace('_', ' ').toUpperCase()}!`
        : `స్థితి మార్చబడింది: ${newStatus}!`
    );
  };

  // Resolve incident with proof
  const handleResolveIncident = (id: string, notes: string) => {
    fetch(`/api/incidents/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'resolved',
        resolutionNotes: notes,
      }),
    }).catch(() => {});

    setIncidents((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            status: 'resolved',
            resolutionNotes: notes,
            resolvedAt: new Date().toISOString(),
            stormDrainBlockage: 'none',
            drainBlockageDetailsEn: 'None / Cleared (drain flushed and desilted)',
            drainBlockageDetailsTe: 'అడ్డంకి లేదు (కాలువ పూర్తిగా శుభ్రం చేయబడింది)',
          };
        }
        return item;
      })
    );

    showToast(
      lang === 'en'
        ? 'Field desilting proof submitted and ticket marked RESOLVED!'
        : 'పరిష్కార వివరాలు నమోదు చేయబడ్డాయి. సమస్య పరిష్కరించబడింది!'
    );
  };

  const hasSeverity5Active = incidents.some((i) => i.severity === 5 && i.status !== 'resolved');
  const totalActiveCount = incidents.filter((i) => i.status !== 'resolved').length;

  return (
    <div className={`min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] ${lang === 'te' ? 'lang-te' : ''}`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0F172A] text-white px-4 py-3 rounded-[6px] shadow-lg border border-slate-700 font-mono text-xs flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-[#059669]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <Header
        currentScreen={currentScreen}
        onNavigate={(screen) => setCurrentScreen(screen)}
        lang={lang}
        onToggleLang={(newLang) => setLang(newLang)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        hasSeverity5Active={hasSeverity5Active}
        totalActiveCount={totalActiveCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6">
        {currentScreen === 'home' && (
          <LiveStreamScreen
            incidents={incidents}
            onSelectIncident={(inc) => setSelectedIncident(inc)}
            onUpvoteIncident={handleUpvote}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            lang={lang}
          />
        )}

        {currentScreen === 'dispatch' && (
          <WorkerDispatchScreen
            incidents={incidents}
            onUpdateStatus={handleUpdateStatus}
            onOpenResolutionModal={(inc) => setResolvingIncident(inc)}
            onSelectIncident={(inc) => setSelectedIncident(inc)}
            onVerifyAccessibility={handleVerifyAccessibility}
            lang={lang}
          />
        )}

        {currentScreen === 'heatmap' && (
          <WardHeatmapScreen
            incidents={incidents}
            onSelectIncident={(inc) => setSelectedIncident(inc)}
            lang={lang}
          />
        )}

        {currentScreen === 'about' && <AboutScreen lang={lang} />}
      </main>

      {/* Modals */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleCreateIncident}
        lang={lang}
        existingIncidents={incidents}
        onInspectExistingTicket={(inc) => {
          setIsReportModalOpen(false);
          setSelectedIncident(inc);
        }}
      />

      <IncidentDetailModal
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        onUpvote={handleUpvote}
        onVerifyAccessibility={handleVerifyAccessibility}
        lang={lang}
      />

      <ResolutionModal
        incident={resolvingIncident}
        isOpen={!!resolvingIncident}
        onClose={() => setResolvingIncident(null)}
        onResolve={handleResolveIncident}
        lang={lang}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-[#CBD5E1] bg-white py-6">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-800">CivicSnap AI</span>
            <span>· MVP Colony, Visakhapatnam (GVMC Zone-2)</span>
            <span className="px-1.5 py-0.2 bg-[#F59E0B] text-slate-950 font-bold rounded-[2px] text-[10px]">
              DEMO DATA
            </span>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => setCurrentScreen('about')}
              className="hover:text-slate-900 transition-colors"
            >
              GVMC SLAs & Architecture
            </button>
            <span aria-hidden="true">·</span>
            <span>Toll-Free Helpline: 1800-425-00009 / 112</span>
            <span aria-hidden="true">·</span>
            <span>WCAG AA Certified</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
