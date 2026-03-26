'use client'

import { Calendar, Server, Users, Shield, CheckCircle, Clock, ArrowRight, Rocket } from 'lucide-react'

interface Phase {
    month: number
    title: string
    subtitle: string
    color: string
    borderColor: string
    icon: typeof Server
    milestones: string[]
    deliverables: string[]
    hardware?: string
}

const PHASES: Phase[] = [
    {
        month: 1,
        title: 'MONTH 1: SANDBOX DEPLOYMENT',
        subtitle: 'NIS Secure Environment Setup & Security Audit',
        color: 'text-cyan-400',
        borderColor: 'border-cyan-800/50',
        icon: Server,
        milestones: [
            'Deploy NCTIRS on NIS isolated sandbox environment',
            'Complete NIST SP 800-53 security audit and penetration testing',
            'Configure AES-256-GCM encryption for data at rest and in transit',
            'Validate blockchain integrity ledger with NIS cryptographic standards',
            'Onboard 3 SOC analysts for initial system familiarisation',
        ],
        deliverables: [
            'Security Audit Report (NIST compliant)',
            'Sandbox Deployment Certificate',
            'Initial SOC Analyst Training Manual',
        ],
        hardware: '2x Dell R750xa (96-core, 512GB RAM) | 10TB NVMe Storage | Isolated VLAN',
    },
    {
        month: 2,
        title: 'MONTH 2: MULTI-AGENCY INTEGRATION',
        subtitle: 'DCI, KRA, KPLC, KE-CIRT Data Feed Integration',
        color: 'text-amber-400',
        borderColor: 'border-amber-800/50',
        icon: Users,
        milestones: [
            'Establish secure API connections to DCI, KRA, and KPLC telemetry',
            'Integrate KE-CIRT/CC threat intelligence feeds (STIX/TAXII)',
            'Deploy ML models trained on live Kenyan infrastructure data',
            'Conduct multi-agency tabletop exercise simulating coordinated attack',
            'Validate SOAR containment protocols with agency stakeholders',
        ],
        deliverables: [
            'API Integration Specification Document',
            'Multi-Agency SLA Framework',
            'Tabletop Exercise After-Action Report',
        ],
    },
    {
        month: 3,
        title: 'MONTH 3: PRODUCTION GO-LIVE',
        subtitle: 'Operational Deployment & Continuous Monitoring',
        color: 'text-green-400',
        borderColor: 'border-green-800/50',
        icon: Shield,
        milestones: [
            'Transition from sandbox to production NIS infrastructure',
            'Activate 24/7 autonomous threat monitoring and SOAR containment',
            'Complete SOC analyst certification programme (10 operators)',
            'Submit NC4 compliance report to National Cyber Coordination Committee',
            'Begin continental capability assessment for AU partner deployment',
        ],
        deliverables: [
            'Production Deployment Certificate',
            'NC4 Compliance Submission',
            'SOC Certification Records (10 analysts)',
            'Continental Expansion Feasibility Brief',
        ],
    },
]

export default function DeploymentRoadmap() {
    return (
        <div className="bg-black border border-green-900/50 shadow-[0_0_20px_rgba(0,255,0,0.05)]">
            {/* Header */}
            <div className="bg-green-950/20 border-b border-green-900/50 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-950/50 border border-green-800/50">
                        <Rocket className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                        <h3 className="text-green-400 font-bold text-sm uppercase tracking-wider">90-Day NIS Deployment Roadmap</h3>
                        <p className="text-[9px] text-green-700 font-mono mt-0.5">SANDBOX → INTEGRATION → PRODUCTION | ESTIMATED COST: KES 80-150M</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span className="text-[10px] text-green-600 font-mono">Q3-Q4 2026</span>
                </div>
            </div>

            {/* Timeline */}
            <div className="p-4 space-y-4">
                {PHASES.map((phase, idx) => (
                    <div key={idx} className={`border ${phase.borderColor} bg-black/50 overflow-hidden`}>
                        {/* Phase Header */}
                        <div className={`flex items-center gap-3 p-3 border-b ${phase.borderColor} bg-green-950/10`}>
                            <div className={`p-1.5 border ${phase.borderColor}`}>
                                <phase.icon className={`h-4 w-4 ${phase.color}`} />
                            </div>
                            <div className="flex-1">
                                <div className={`text-xs font-bold ${phase.color} uppercase tracking-wider`}>{phase.title}</div>
                                <div className="text-[9px] text-gray-500 font-mono">{phase.subtitle}</div>
                            </div>
                            {idx < PHASES.length - 1 && (
                                <ArrowRight className="h-4 w-4 text-green-800" />
                            )}
                            {idx === PHASES.length - 1 && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                            {/* Milestones */}
                            <div className="p-3 border-r border-green-900/20">
                                <div className="text-[9px] text-green-600 font-mono font-bold uppercase mb-2 flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> Key Milestones
                                </div>
                                <div className="space-y-1.5">
                                    {phase.milestones.map((m, i) => (
                                        <div key={i} className="flex items-start gap-2 text-[10px] text-gray-400">
                                            <span className="text-green-700 shrink-0 mt-0.5">&#x25B8;</span>
                                            <span>{m}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Deliverables */}
                            <div className="p-3">
                                <div className="text-[9px] text-cyan-600 font-mono font-bold uppercase mb-2 flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" /> Deliverables
                                </div>
                                <div className="space-y-1.5">
                                    {phase.deliverables.map((d, i) => (
                                        <div key={i} className="flex items-start gap-2 text-[10px] text-gray-400">
                                            <span className="text-cyan-700 shrink-0 mt-0.5">&#x25B8;</span>
                                            <span>{d}</span>
                                        </div>
                                    ))}
                                </div>
                                {phase.hardware && (
                                    <div className="mt-3 pt-2 border-t border-green-900/20">
                                        <div className="text-[8px] text-green-700 font-mono">
                                            <span className="font-bold">HARDWARE: </span>{phase.hardware}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="bg-green-950/10 border-t border-green-900/30 p-2 text-center">
                <span className="text-[8px] text-green-800 font-mono uppercase tracking-[0.15em]">
                    Contingent on NIRU incubation approval | Aligned with NIS Modernisation Programme | DPA 2019 compliant
                </span>
            </div>
        </div>
    )
}
