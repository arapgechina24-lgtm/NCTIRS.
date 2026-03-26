'use client'

import { useState, useEffect } from "react"
// Layout components
import { Header } from "@/components/layout/Header"
// Threat components
import { ThreatAnalyticsChart } from "@/components/threat/ThreatAnalyticsChart"
import { ThreatMonitor } from "@/components/threat/ThreatMonitor"
import { ThreatAnalyticsEngine } from "@/components/threat/ThreatAnalyticsEngine"
import AdversarialDefensePanel from "@/components/threat/AdversarialDefensePanel"
// Incident components
import { IncidentList } from "@/components/incident/IncidentList"
import { IncidentTrendsChart } from "@/components/incident/IncidentTrendsChart"
import EmergencyOverlay from "@/components/incident/EmergencyOverlay"
import { AutomatedResponsePanel } from "@/components/incident/AutomatedResponsePanel"
// Surveillance components
import { SurveillanceMonitor } from "@/components/surveillance/SurveillanceMonitor"
import { CommunityReports } from "@/components/surveillance/CommunityReports"
// Infrastructure components
import { DataLakeMonitor } from "@/components/infrastructure/DataLakeMonitor"
import { SystemArchitecture } from "@/components/infrastructure/SystemArchitecture"
import CNIHeatmap from "@/components/infrastructure/CNIHeatmap"
// Intelligence components
import AIAssistantPanel from "@/components/intelligence/AIAssistantPanel"
import FederatedLearningHub from "@/components/intelligence/FederatedLearningHub"
import ExplainableAIPanel from "@/components/intelligence/ExplainableAIPanel"
import SovereignAIStatusPanel from "@/components/intelligence/SovereignAIStatusPanel"
// Compliance components
// KenyaContextPanel removed for presentation neatness
import MultiplayerSession from "@/components/shared/MultiplayerSession"
import DemoModeController from "@/components/shared/DemoModeController"
import { VoiceCommandPanel } from "@/components/shared/VoiceCommandPanel"
// NEW War Room Components (Pending restructure)
import { LiveThreatMap } from "@/components/LiveThreatMap"
import { AIConsole } from "@/components/AIConsole"
import { LiveThreatFeed } from "@/components/threat/LiveThreatFeed"
import { SovereignToggle } from "@/components/SovereignToggle"
import { NationalRiskRegistry } from "@/components/NationalRiskRegistry"
import { MultiplayerCanvas } from "@/components/MultiplayerCanvas"
// Analytics tracking
import { trackPageView, trackAction, trackPerformance } from "@/lib/analytics"
// API Client for real data
import { fetchIncidents, fetchThreats } from "@/lib/api"
// Types
import type {
  SecurityIncident,
  CrimePrediction,
  SurveillanceFeed,
  CommunityReport,
  EmergencyResponse,
  ThreatAnalytics,
  TimeSeriesData,
  CyberThreat,
  DataLakeSource,
  BlockchainLedgerEntry,
  CoordinatedAttack,
  AutomatedResponse,
  PerceptionLayerStatus,
  CognitionLayerStatus,
  IntegrityLayerStatus,
  AdversarialMetrics,
  FederatedLearningStatus,
  XAIExplanation,
  SovereignAIStatus,
} from "@/types"
// Mock data generators
import {
  generateCrimePredictions,
  generateSurveillanceFeeds,
  generateCommunityReports,
  generateEmergencyResponses,
  generateThreatAnalytics,
  generateTimeSeriesData,
  generateDataLakeSources,
  generateBlockchainLedger,
  generateCoordinatedAttacks,
  generateAutomatedResponses,
  generatePerceptionLayerStatus,
  generateCognitionLayerStatus,
  generateIntegrityLayerStatus,
  generateAdversarialMetrics,
  generateFederatedNodes,
  generateXAIExplanations,
  generateSovereignAIStatus,
} from "@/lib/mockData"
import {
  generateNairobiTraffic,
  generateMpesaData,
  getCurrentNairobiWeather,
  TrafficNode,
  MpesaTransaction,
  WeatherLog
} from "@/lib/kenyaContextData"
import {
  generateBorderLogs,
  generateWildlifeData,
  generateSocialSentiment,
  generateCyberAttribution,
  BorderLog,
  WildlifePing,
  SocialSentiment,
  ISPTrace
} from "@/lib/kenyaExtendedData"
import { createNC4Report } from "@/lib/soar-logic"

interface DashboardData {
  incidents: SecurityIncident[];
  predictions: CrimePrediction[];
  surveillanceFeeds: SurveillanceFeed[];
  communityReports: CommunityReport[];
  emergencyResponses: EmergencyResponse[];
  threatAnalytics: ThreatAnalytics[];
  timeSeriesData: TimeSeriesData[];
  // NCTIRS data
  cyberThreats: CyberThreat[];
  dataLakeSources: DataLakeSource[];
  blockchainLedger: BlockchainLedgerEntry[];
  coordinatedAttacks: CoordinatedAttack[];
  automatedResponses: AutomatedResponse[];
  perceptionLayer: PerceptionLayerStatus;
  cognitionLayer: CognitionLayerStatus;
  integrityLayer: IntegrityLayerStatus;
  // 4 WINNING PILLARS
  adversarialMetrics: AdversarialMetrics;
  federatedStatus: FederatedLearningStatus;
  xaiExplanations: XAIExplanation[];
  sovereignAIStatus: SovereignAIStatus;
  // Kenya Context "Golden Data"
  kenyaWeather: WeatherLog;
  kenyaTraffic: TrafficNode[];
  mpesaTransactions: MpesaTransaction[];
  // Extended Metadata
  borderLogs: BorderLog[];
  wildlife: WildlifePing[];
  sentiment: SocialSentiment[];
  cyberTraces: ISPTrace[];
}

// KeyMetrics Component
interface KeyMetricsProps {
  metrics: {
    threatLevel: string;
    activeIncidents: number;
    aiConfidence: number;
    systemLoad: number;
    networkTraffic: string;
    responsesActive: number;
  }
}

function KeyMetrics({ metrics }: KeyMetricsProps) {
  return (
    <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
      <div className="bg-black border border-green-900/50 p-2 text-center">
        <div className="text-[10px] text-green-800">THREAT LEVEL</div>
        <div className={`text-lg font-bold ${metrics.threatLevel === 'CRITICAL' ? 'text-red-500 animate-pulse' : 'text-green-500'}`}>
          {metrics.threatLevel}
        </div>
      </div>
      <div className="bg-black border border-green-900/50 p-2 text-center">
        <div className="text-[10px] text-green-800">ACTIVE CASES</div>
        <div className="text-lg font-bold text-green-400">{metrics.activeIncidents}</div>
      </div>
      <div className="bg-black border border-green-900/50 p-2 text-center">
        <div className="text-[10px] text-green-800">AI CONFIDENCE</div>
        <div className="text-lg font-bold text-cyan-400">{metrics.aiConfidence}%</div>
      </div>
      <div className="bg-black border border-green-900/50 p-2 text-center">
        <div className="text-[10px] text-green-800">SYSTEM LOAD</div>
        <div className="text-lg font-bold text-yellow-500">{metrics.systemLoad}%</div>
      </div>
      <div className="bg-black border border-green-900/50 p-2 text-center">
        <div className="text-[10px] text-green-800">NET TRAFFIC</div>
        <div className="text-lg font-bold text-blue-400">{metrics.networkTraffic}</div>
      </div>
      <div className="bg-black border border-green-900/50 p-2 text-center">
        <div className="text-[10px] text-green-800">AUTO-RESPONSE</div>
        <div className="text-lg font-bold text-purple-400">{metrics.responsesActive}</div>
      </div>
    </div>
  )
}

export default function Home() {
  /* 
   * View State
   */
  const [currentView, setCurrentView] = useState<'COMMAND_CENTER' | 'FUSION_CENTER' | 'THREAT_MATRIX' | 'ANALYTICS' | 'OPERATIONS'>('COMMAND_CENTER')
  const [isEmergency, setIsEmergency] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [data, setData] = useState<DashboardData | null>(null)

  // Track page views and view changes
  useEffect(() => {
    trackPageView('NCTIRS Dashboard', { initialView: 'COMMAND_CENTER' })
    const startTime = performance.now()

    return () => {
      const loadTime = performance.now() - startTime
      trackPerformance('session_duration', { loadTime })
    }
  }, [])

  // Track view changes
  useEffect(() => {
    if (mounted) {
      trackAction('view_change', { view: currentView })
    }
  }, [currentView, mounted])

  useEffect(() => {
    // Async function to load data from API + mock generators
    async function loadData() {
      const startTime = performance.now()

      try {
        // Fetch from API (with fallback to mock data)
        const [incidents, cyberThreats] = await Promise.all([
          fetchIncidents({ limit: 30 }),
          fetchThreats({ limit: 20 }),
        ])

        // Generate remaining mock data for components without API yet
        const predictions = generateCrimePredictions(15);
        const surveillanceFeeds = generateSurveillanceFeeds(40);
        const communityReports = generateCommunityReports(25);
        const emergencyResponses = generateEmergencyResponses(12);
        const threatAnalytics = generateThreatAnalytics();
        const timeSeriesData = generateTimeSeriesData(30);
        // NCTIRS data (mock for now)
        const dataLakeSources = generateDataLakeSources();
        const blockchainLedger = generateBlockchainLedger(25);
        const coordinatedAttacks = generateCoordinatedAttacks(5);
        const automatedResponses = generateAutomatedResponses(15);
        const perceptionLayer = generatePerceptionLayerStatus();
        const cognitionLayer = generateCognitionLayerStatus();
        const integrityLayer = generateIntegrityLayerStatus();
        // 4 WINNING PILLARS data
        const adversarialMetrics = generateAdversarialMetrics();
        const federatedStatus = generateFederatedNodes();
        const xaiExplanations = generateXAIExplanations(8);
        const sovereignAIStatus = generateSovereignAIStatus();

        // Kenya 'Golden Data'
        const kenyaWeather = getCurrentNairobiWeather();
        const kenyaTraffic = generateNairobiTraffic(30);
        const mpesaTransactions = generateMpesaData(40);
        const borderLogs = generateBorderLogs();
        const wildlife = generateWildlifeData();
        const sentiment = generateSocialSentiment();
        const cyberTraces = generateCyberAttribution();

        setData({
          incidents,
          predictions,
          surveillanceFeeds,
          communityReports,
          emergencyResponses,
          threatAnalytics,
          timeSeriesData,
          cyberThreats,
          dataLakeSources,
          blockchainLedger,
          coordinatedAttacks,
          automatedResponses,
          perceptionLayer,
          cognitionLayer,
          integrityLayer,
          // 4 WINNING PILLARS
          adversarialMetrics,
          federatedStatus,
          xaiExplanations,
          sovereignAIStatus,
          kenyaWeather,
          kenyaTraffic,
          mpesaTransactions,
          borderLogs,
          wildlife,
          sentiment,
          cyberTraces
        })
      } catch (error) {
        console.error('Critical Error loading dashboard data:', error);
        // Fallback to entirely mock data if critical failure (though individual fetches should handle this)
      } finally {
        setMounted(true)
        // Track render performance
        const renderTime = performance.now() - startTime
        trackPerformance('initial_render', { renderTime })
      }
    }

    loadData()
  }, [])

  if (!mounted || !data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono text-green-500">
        <div className="text-center">
          <div className="animate-pulse text-xl mb-2">NCTIRS</div>
          <div className="text-sm text-green-800">INITIALIZING_SECURE_CONNECTION...</div>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-ping" />
            <div className="h-2 w-2 bg-green-500 rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
            <div className="h-2 w-2 bg-green-500 rounded-full animate-ping" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    )
  }

  // Calculate stats logic was removed here

  const handleMitigation = async () => {
    // 1. Orchestration: Simulate Air-Gap
    console.log("⚡ INITIATING EMERGENCY AIR-GAP PROTOCOL...");

    // 2. Response: Generate NC4 Report
    const report = createNC4Report(
      "SEACOM SUBMARINE CABLE - MOMBASA",
      "CRITICAL",
      "T1098.004", // SSH Authorized Keys or similar technique
      "Mombasa"
    );

    // 2b. PERSISTENCE: Save to "Real" Database (JSON File)
    // This proves backend integration
    try {
      const { addAuditLog } = await import('@/lib/actions/audit');
      await addAuditLog({
        assetName: report.incident_details.target_asset,
        sector: "Telecommunications (Mombasa)",
        action: report.actions_taken.protocol_executed,
        severity: "CRITICAL",
        notifiedNC4: true,
        receiptId: `NC4-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
      });
      console.log("💾 AUDIT LOG PERSISTED TO SECURE STORAGE");
    } catch (e) {
      console.error("Failed to persist log", e);
    }

    console.log("📄 NC4 COMPLIANCE REPORT GENERATED:", report);
    console.log("📡 TRANSMITTING TO KE-CIRT/CC...");

    // 3. Return report for visualization
    return report;
  };

  const {
    highThreatCount = 0,
    activeResponses = 0,
    criticalCyber = 0,
    activeCoordinated = 0
  } = {
    // Recalculating these cheaply for display since we removed the vars before
    highThreatCount: data.incidents.filter(i => i.threatLevel === 'CRITICAL' || i.threatLevel === 'HIGH').length,
    activeResponses: data.emergencyResponses.filter(r => r.status !== 'RESOLVED').length,
    criticalCyber: data.cyberThreats.filter(t => t.severity === 'CRITICAL').length,
    activeCoordinated: data.coordinatedAttacks.filter(a => a.status !== 'RESOLVED').length
  };

  return (

    <div className={`min-h-screen bg-black text-green-500 font-mono selection:bg-green-900 selection:text-white`}>
      <div className="fixed inset-0 pointer-events-none z-50 bg-[url('/scanline.png')] opacity-10 mix-blend-overlay"></div>
      <div className="fixed inset-0 pointer-events-none z-50 bg-gradient-to-b from-transparent via-green-900/5 to-green-900/10"></div>

      <Header currentView={currentView} onViewChange={setCurrentView} />

      <main className="p-6 relative z-0">
        <MultiplayerSession />

        {/* View Routing */}
        {currentView === 'COMMAND_CENTER' && (
          <div className="flex flex-col gap-6 overflow-y-auto" style={{ height: 'calc(100vh - 9rem)' }}>

            {/* TOP ROW: Metrics Bar with Emergency Button */}
            <div className="flex items-stretch gap-4 shrink-0">
              <div className="flex-1">
                <KeyMetrics metrics={{
                  threatLevel: activeCoordinated > 0 ? 'CRITICAL' : highThreatCount > 5 ? 'HIGH' : 'MEDIUM',
                  activeIncidents: data.incidents.length,
                  aiConfidence: 94.2,
                  systemLoad: 78,
                  responsesActive: activeResponses,
                  networkTraffic: '45.2 TB/s'
                }} />
              </div>
              <SovereignToggle />
              <button
                onClick={() => setIsEmergency(true)}
                className="bg-red-950/50 text-red-400 text-xs border-2 border-red-800 px-5 hover:bg-red-900/60 uppercase font-bold transition-all flex items-center gap-2 shrink-0"
              >
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                SIMULATE BREACH
              </button>
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                HERO ROW: Infrastructure Context + God's Eye View (Primary Focal Points)
                These two panels dominate the viewport for maximum situational awareness.
               ══════════════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 shrink-0">

              {/* HERO LEFT: Infrastructure Context (CNI Heatmap) */}
              <div className="lg:col-span-5 flex flex-col gap-3">
                <div className="text-xs text-green-500 uppercase tracking-widest font-bold px-1 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  Infrastructure Context
                </div>
                <div className="min-h-[480px] border border-green-900/50 bg-black shadow-[0_0_30px_rgba(0,255,0,0.08)]">
                  <CNIHeatmap />
                </div>
              </div>

              {/* HERO RIGHT: Live Threat Vector God's Eye View */}
              <div className="lg:col-span-7 flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                  <div className="text-xs text-green-500 uppercase tracking-widest font-bold flex items-center gap-2">
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                    Live Threat Vector — God&apos;s Eye View
                  </div>
                  {/* Quick Stats inline */}
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-red-500 uppercase tracking-wider">Critical</span>
                      <span className="text-lg font-bold text-red-400 animate-pulse">{criticalCyber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-purple-500 uppercase tracking-wider">Blocked</span>
                      <span className="text-lg font-bold text-purple-400">14.2K</span>
                    </div>
                  </div>
                </div>
                <div className="min-h-[480px] border border-green-900/50 overflow-hidden relative shadow-[0_0_30px_rgba(0,255,0,0.1)] flex flex-col bg-black">
                  <LiveThreatMap
                    incidents={data.incidents}
                    predictions={data.predictions}
                    surveillance={data.surveillanceFeeds}
                  />
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                SECONDARY ROW: Live Intel Feed + Threat Engine + Community Intel
               ══════════════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Live Threat Feed */}
              <div className="lg:col-span-5 flex flex-col gap-3">
                <div className="text-xs text-green-500 uppercase tracking-widest font-bold px-1 flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-500 rounded-full" />
                  Live Threat Intelligence
                </div>
                <LiveThreatFeed />
              </div>

              {/* Threat Analytics Engine */}
              <div className="lg:col-span-4 flex flex-col gap-3">
                <div className="text-xs text-green-500 uppercase tracking-widest font-bold px-1 flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  Threat Correlation Engine
                </div>
                <ThreatAnalyticsEngine
                  cyberThreats={data.cyberThreats}
                  coordinatedAttacks={data.coordinatedAttacks}
                />
              </div>

              {/* Community Reports */}
              <div className="lg:col-span-3 flex flex-col gap-3">
                <div className="text-xs text-green-500 uppercase tracking-widest font-bold px-1 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full" />
                  Community Intelligence
                </div>
                <CommunityReports reports={data.communityReports} maxItems={8} />
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                TERTIARY ROW: Architecture | Risk Registry | Data Lake (Secondary Panels)
               ══════════════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* NCTIRS Three-Layer Architecture */}
              <div className="flex flex-col gap-3">
                <div className="text-xs text-green-500 uppercase tracking-widest font-bold px-1 flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                  NCTIRS Three-Layer Architecture
                </div>
                <div className="min-h-[280px]">
                  <SystemArchitecture
                    perception={data.perceptionLayer}
                    cognition={data.cognitionLayer}
                    integrity={data.integrityLayer}
                  />
                </div>
              </div>

              {/* National Risk Registry */}
              <div className="flex flex-col gap-3">
                <div className="text-xs text-red-500 uppercase tracking-widest font-bold px-1 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  National Risk Registry
                </div>
                <div className="min-h-[280px]">
                  <NationalRiskRegistry threats={data.cyberThreats} />
                </div>
              </div>

              {/* Unified Data Lake */}
              <div className="flex flex-col gap-3">
                <div className="text-xs text-green-500 uppercase tracking-widest font-bold px-1 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full" />
                  Unified Data Lake
                </div>
                <div className="min-h-[280px]">
                  <DataLakeMonitor sources={data.dataLakeSources} />
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                FULL WIDTH: Recent Security Incidents — Bottom Panel
               ══════════════════════════════════════════════════════════════════ */}
            <div className="flex flex-col gap-3">
              <div className="text-xs text-red-500 uppercase tracking-widest font-bold px-1 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Recent Security Incidents
              </div>
              <IncidentList incidents={data.incidents} maxItems={12} />
            </div>

            {/* FULL WIDTH: Surveillance Network */}
            <div className="flex flex-col gap-4">
              <SurveillanceMonitor feeds={data.surveillanceFeeds} maxItems={12} />
            </div>
          </div>
        )}

        {currentView === 'FUSION_CENTER' && (
          <div className="grid grid-cols-12 gap-6 h-[calc(100vh-10rem)]">
            {/* LEFT - Main Content */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-5">
              <div className="flex-1 min-h-[300px]">
                <LiveThreatMap
                  incidents={data.incidents}
                  predictions={data.predictions}
                  surveillance={data.surveillanceFeeds}
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <CNIHeatmap />
                <DataLakeMonitor sources={data.dataLakeSources} />
              </div>
            </div>
            {/* RIGHT - Intel Sidebar */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-5 overflow-y-auto">
              {/* AI Reasoning Core — relocated from Command Hub */}
              <div className="min-h-[320px]">
                <AIConsole />
              </div>

              <div className="bg-black border border-green-900/50 p-4">
                <h2 className="text-sm font-bold text-green-400 mb-3 border-b border-green-900/50 pb-2 uppercase tracking-wider">
                  Inter-Agency Comms
                </h2>
                <div className="h-64 mb-4">
                  <MultiplayerCanvas />
                </div>
                <AIAssistantPanel />
              </div>
              <CommunityReports reports={data.communityReports} maxItems={8} />
              <SurveillanceMonitor feeds={data.surveillanceFeeds} maxItems={5} />
            </div>
          </div>
        )}


        {
          currentView === 'THREAT_MATRIX' && (
            <div className="grid grid-cols-12 gap-4 h-[calc(100vh-10rem)]">
              {/* LEFT - Threat List */}
              <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-1">
                <IncidentList incidents={data.incidents} maxItems={15} />
                <ThreatAnalyticsEngine
                  cyberThreats={data.cyberThreats}
                  coordinatedAttacks={data.coordinatedAttacks}
                />
              </div>
              {/* RIGHT - Map & Metrics */}
              <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
                <KeyMetrics metrics={{
                  threatLevel: 'CRITICAL',
                  activeIncidents: 42,
                  aiConfidence: 89.5,
                  systemLoad: 65,
                  responsesActive: 12,
                  networkTraffic: '12 TB/s'
                }} />
                <div className="flex-1 bg-black border border-red-900/30 p-2 relative min-h-[300px]">
                  <div className="absolute top-2 right-2 bg-red-900/30 text-red-500 text-[9px] px-2 py-1 font-bold uppercase tracking-wider z-10">
                    Live Attack Vectors
                  </div>
                  <LiveThreatMap
                    incidents={data.incidents}
                    predictions={data.predictions}
                    surveillance={data.surveillanceFeeds}
                  />
                </div>
              </div>
            </div>
          )
        }

        {
          currentView === 'ANALYTICS' && (
            <div className="flex flex-col gap-6 overflow-y-auto" style={{ height: 'calc(100vh - 9rem)' }}>
              {/* Regional Threat Analysis — relocated from Command Hub as primary analytics view */}
              <div className="flex flex-col gap-3">
                <div className="text-xs text-green-500 uppercase tracking-widest font-bold px-1 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  Regional Threat Analysis
                </div>
                <ThreatAnalyticsChart analytics={data.threatAnalytics} />
              </div>

              <div className="grid grid-cols-12 gap-6">
                {/* LEFT - Incident Trends */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-5">
                  <div className="flex flex-col gap-3">
                    <div className="text-xs text-green-500 uppercase tracking-widest font-bold px-1 flex items-center gap-2">
                      <span className="w-2 h-2 bg-cyan-500 rounded-full" />
                      Incident Trend Analysis
                    </div>
                    <div className="h-80">
                      <IncidentTrendsChart data={data.timeSeriesData} />
                    </div>
                  </div>
                </div>
                {/* RIGHT - Sidebar */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">
                  <ThreatAnalyticsEngine
                    cyberThreats={data.cyberThreats}
                    coordinatedAttacks={data.coordinatedAttacks}
                  />
                  <DataLakeMonitor sources={data.dataLakeSources} />
                  <div className="bg-black border border-blue-900/50 p-4 flex-1">
                    <h3 className="text-blue-400 font-bold mb-3 text-sm uppercase tracking-wider">Predictive Models</h3>
                    <div className="space-y-3">
                      {data.predictions.slice(0, 5).map((p, i) => (
                        <div key={i} className="flex justify-between items-center text-xs border-b border-blue-900/20 pb-2">
                          <span className="text-gray-400 truncate mr-2">{p.crimeTypes.join(', ')}</span>
                          <span className="text-blue-400 font-mono">{(p.probability * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        }

        {
          currentView === 'OPERATIONS' && (
            <div className="flex flex-col gap-4 overflow-y-auto" style={{ height: 'calc(100vh - 9rem)' }}>
              {/* 4 PILLARS HEADER */}
              <div className="flex items-center justify-between px-1 shrink-0">
                <div className="text-xs text-green-500 uppercase tracking-widest font-bold flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  MAJESTIC SHIELD: 4 Winning Pillars
                </div>
                <div className="text-[10px] text-gray-500">
                  National Security Gold Standard
                </div>
              </div>

              {/* 2x2 Grid Layout for better visibility */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Pillar 1: Adversarial Defense */}
                <AdversarialDefensePanel metrics={data.adversarialMetrics} />

                {/* Pillar 2: Federated Learning */}
                <FederatedLearningHub status={data.federatedStatus} />

                {/* Pillar 3: Explainable AI */}
                <ExplainableAIPanel explanations={data.xaiExplanations} />

                {/* Pillar 4: Sovereign AI */}
                <SovereignAIStatusPanel status={data.sovereignAIStatus} />
              </div>

              {/* Response Panel - Full Width */}
              <div className="shrink-0">
                <AutomatedResponsePanel responses={data.automatedResponses} />
              </div>
            </div>
          )
        }

      </main >

      <ThreatMonitor
        incidents={data?.incidents || []}
        cyberThreats={data?.cyberThreats || []}
        onAlert={() => setIsEmergency(true)}
      />

      <EmergencyOverlay
        isActive={isEmergency}
        targetAsset="SEACOM SUBMARINE CABLE - MOMBASA"
        onMitigate={handleMitigation}
        onDismiss={() => setIsEmergency(false)}
      />

      <VoiceCommandPanel
        onNavigate={setCurrentView}
        onEmergency={() => setIsEmergency(true)}
        onRefresh={() => window.location.reload()}
      />

      <DemoModeController onTriggerEmergency={() => setIsEmergency(true)} />
    </div >
  );
}
