'use client'

import { TrendingDown, TrendingUp, Shield, Clock, Eye, Globe, Scale, Zap } from 'lucide-react'

interface MetricComparison {
    label: string
    icon: typeof Shield
    before: string
    after: string
    improvement: string
    improvementPct: number
    color: string
}

const METRICS: MetricComparison[] = [
    {
        label: 'Threat Detection Time',
        icon: Clock,
        before: 'Days to Weeks',
        after: 'Sub-Second (<1s)',
        improvement: '99.99% faster',
        improvementPct: 99.99,
        color: 'text-red-400',
    },
    {
        label: 'Incident Response',
        icon: Zap,
        before: 'Hours to Days (Manual)',
        after: '< 200 Milliseconds (Auto)',
        improvement: '99.997% faster',
        improvementPct: 99.99,
        color: 'text-orange-400',
    },
    {
        label: 'Attacker Dwell Time',
        icon: Eye,
        before: '145 Days (Africa Avg)',
        after: 'Near-Zero (Predictive)',
        improvement: '~145 days eliminated',
        improvementPct: 99.5,
        color: 'text-yellow-400',
    },
    {
        label: 'Intelligence Correlation',
        icon: Shield,
        before: 'Siloed Across Agencies',
        after: 'Unified Multi-Agency Fusion',
        improvement: 'Full visibility',
        improvementPct: 95,
        color: 'text-cyan-400',
    },
    {
        label: 'Data Sovereignty',
        icon: Globe,
        before: 'Offshore Cloud Processing',
        after: '100% Sovereign On-Premise',
        improvement: 'Zero offshore exposure',
        improvementPct: 100,
        color: 'text-green-400',
    },
    {
        label: 'Predictive Capability',
        icon: TrendingUp,
        before: 'None',
        after: '7-Day Threat Forecasting',
        improvement: 'New capability',
        improvementPct: 100,
        color: 'text-purple-400',
    },
    {
        label: 'Evidence Admissibility',
        icon: Scale,
        before: 'Manual Evidence Chains',
        after: 'Blockchain-Verified (SHA-256)',
        improvement: 'Court-ready automated',
        improvementPct: 90,
        color: 'text-blue-400',
    },
]

export default function BeforeAfterMetrics() {
    return (
        <div className="bg-black border border-green-900/50 shadow-[0_0_20px_rgba(0,255,0,0.05)]">
            {/* Header */}
            <div className="bg-green-950/20 border-b border-green-900/50 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-green-400" />
                    <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Impact Assessment: Current Posture vs NCTIRS</span>
                </div>
                <div className="flex items-center gap-2 text-[9px] text-green-700 font-mono">
                    <span>KES 12B annual cybercrime loss</span>
                    <span className="text-green-500">|</span>
                    <span>NCTIRS cost: KES 80-150M</span>
                    <span className="text-green-500">|</span>
                    <span className="text-green-400 font-bold">ROI: 160%+</span>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="p-4">
                {/* Column Headers */}
                <div className="grid grid-cols-12 gap-3 mb-3 px-1">
                    <div className="col-span-3 text-[9px] text-green-700 font-mono uppercase tracking-wider">Metric</div>
                    <div className="col-span-3 text-[9px] text-red-600 font-mono uppercase tracking-wider text-center">Current Posture</div>
                    <div className="col-span-3 text-[9px] text-green-600 font-mono uppercase tracking-wider text-center">With NCTIRS</div>
                    <div className="col-span-3 text-[9px] text-cyan-600 font-mono uppercase tracking-wider text-center">Improvement</div>
                </div>

                {/* Rows */}
                <div className="space-y-2">
                    {METRICS.map((m, i) => (
                        <div key={i} className="grid grid-cols-12 gap-3 items-center border border-green-900/20 bg-green-950/5 hover:bg-green-950/10 transition-all p-2">
                            {/* Label */}
                            <div className="col-span-3 flex items-center gap-2">
                                <m.icon className={`h-3.5 w-3.5 ${m.color} shrink-0`} />
                                <span className="text-[10px] font-bold text-green-300 uppercase">{m.label}</span>
                            </div>

                            {/* Before */}
                            <div className="col-span-3 text-center">
                                <span className="text-[10px] text-red-400 font-mono bg-red-950/30 px-2 py-0.5 border border-red-900/30">
                                    {m.before}
                                </span>
                            </div>

                            {/* After */}
                            <div className="col-span-3 text-center">
                                <span className="text-[10px] text-green-400 font-mono bg-green-950/30 px-2 py-0.5 border border-green-900/30">
                                    {m.after}
                                </span>
                            </div>

                            {/* Improvement */}
                            <div className="col-span-3 flex items-center justify-center gap-2">
                                <div className="w-16 h-1.5 bg-gray-900 overflow-hidden">
                                    <div className="h-full bg-green-500" style={{ width: `${m.improvementPct}%` }} />
                                </div>
                                <span className="text-[9px] text-cyan-400 font-mono font-bold">{m.improvement}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="bg-green-950/10 border-t border-green-900/30 p-2 text-center">
                <span className="text-[8px] text-green-800 font-mono uppercase tracking-[0.15em]">
                    Baseline: Kenya National Cybersecurity Assessment 2024 | Africa Average Dwell Time: Mandiant M-Trends Report
                </span>
            </div>
        </div>
    )
}
