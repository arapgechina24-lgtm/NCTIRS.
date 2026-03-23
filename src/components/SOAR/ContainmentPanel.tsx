'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, Zap, Lock, Globe, AlertTriangle, CheckCircle, Brain, Timer, Server, Ban } from 'lucide-react';

interface AIDecision {
    recommendedActions: string[];
    reasoning: string;
    confidence: number;
    autonomousExecution: boolean;
    humanOverrideWindow: number;
    riskIfNoAction: string;
}

interface SOARResult {
    success: boolean;
    incidentStatus: string;
    aiDecision: AIDecision;
    executionResults: Record<string, unknown>;
    nc4Report: Record<string, unknown>;
    auditTrail: { hash: string; courtAdmissible: boolean; blockchainVerified: boolean };
    totalExecutionMs: number;
}

const ACTION_ICONS: Record<string, typeof Shield> = {
    'ISOLATE_NETWORK': Globe,
    'BLOCK_SOURCE_IPS': Ban,
    'SUSPEND_ACCOUNTS': Lock,
    'NOTIFY_NIS_DIRECTOR': AlertTriangle,
    'SNAPSHOT_BACKUP': Server,
    'FORENSIC_CAPTURE': Shield,
    'ALERT_SOC_TEAM': Zap,
    'INCREASE_MONITORING': Timer,
    'ACTIVATE_CDN_MITIGATION': Globe,
    'RATE_LIMIT_ENDPOINTS': Timer,
    'ROTATE_CREDENTIALS': Lock,
    'ENFORCE_MFA': Shield,
};

export function ContainmentPanel({ incidentId }: { incidentId: string }) {
    const [aiDecision, setAiDecision] = useState<AIDecision | null>(null);
    const [soarResult, setSoarResult] = useState<SOARResult | null>(null);
    const [executing, setExecuting] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [autoExecuteTimer, setAutoExecuteTimer] = useState<ReturnType<typeof setInterval> | null>(null);
    const [loadingPreview, setLoadingPreview] = useState(true);

    // Step 1: Fetch AI Decision Preview on mount
    const fetchAIDecision = useCallback(async () => {
        try {
            const res = await fetch(`/api/soar/execute?incidentId=${incidentId}`);
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.aiDecision) {
                    setAiDecision(data.aiDecision);

                    // Step 2: If autonomous, start countdown
                    if (data.aiDecision.autonomousExecution) {
                        setCountdown(data.aiDecision.humanOverrideWindow);
                    }
                }
            }
        } catch (err) {
            console.error('[SOAR] AI Decision fetch failed:', err);
        } finally {
            setLoadingPreview(false);
        }
    }, [incidentId]);

    useEffect(() => {
        fetchAIDecision();
    }, [fetchAIDecision]);

    // Step 3: Autonomous execution countdown
    useEffect(() => {
        if (countdown === null || countdown <= 0 || soarResult) return;

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev === null || prev <= 1) {
                    clearInterval(timer);
                    // Auto-execute when countdown reaches 0
                    executeSOAR();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        setAutoExecuteTimer(timer);
        return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [countdown !== null && soarResult === null]); // Only trigger once

    // Cancel autonomous execution (human override)
    const cancelAutoExecute = () => {
        if (autoExecuteTimer) clearInterval(autoExecuteTimer);
        setCountdown(null);
    };

    // Execute SOAR containment
    const executeSOAR = async (overrideAction?: string) => {
        if (executing || soarResult) return;
        setExecuting(true);
        if (autoExecuteTimer) clearInterval(autoExecuteTimer);
        setCountdown(null);

        try {
            const res = await fetch('/api/soar/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    incidentId,
                    ...(overrideAction ? { override: overrideAction } : {}),
                }),
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setSoarResult(data);
                }
            }
        } catch (err) {
            console.error('[SOAR] Execution failed:', err);
        } finally {
            setExecuting(false);
        }
    };

    return (
        <div className="border border-red-900/50 bg-black p-4 font-mono">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <div className="absolute inset-0 bg-red-600 blur-md opacity-30 animate-pulse" />
                        <div className="relative p-1.5 bg-red-950/50 border border-red-700/50">
                            <Shield className="h-4 w-4 text-red-400" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-red-400 tracking-wider">ARCM — AUTONOMOUS RESPONSE</h3>
                        <p className="text-[9px] text-red-900 font-mono">SOAR Engine v2.0 • AI-DRIVEN CONTAINMENT</p>
                    </div>
                </div>
                {soarResult && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-950/30 border border-green-700/50">
                        <CheckCircle className="h-3 w-3 text-green-400" />
                        <span className="text-[9px] text-green-400">CONTAINED</span>
                    </div>
                )}
            </div>

            {/* Loading State */}
            {loadingPreview && (
                <div className="py-4 text-center">
                    <Brain className="h-5 w-5 text-purple-400 mx-auto animate-pulse mb-2" />
                    <div className="text-[10px] text-purple-400 animate-pulse">AI ANALYZING THREAT PROFILE...</div>
                </div>
            )}

            {/* AI Decision Preview */}
            {aiDecision && !soarResult && (
                <>
                    {/* AI Reasoning */}
                    <div className="mb-3 p-2 bg-purple-950/20 border border-purple-800/30">
                        <div className="flex items-center gap-1.5 mb-1.5">
                            <Brain className="h-3 w-3 text-purple-400" />
                            <span className="text-[9px] font-bold text-purple-400">AI DECISION — {Math.round(aiDecision.confidence * 100)}% CONFIDENCE</span>
                        </div>
                        <p className="text-[9px] text-purple-300/80">{aiDecision.reasoning}</p>
                        <p className="text-[8px] text-red-400/70 mt-1">⚠ RISK IF NO ACTION: {aiDecision.riskIfNoAction}</p>
                    </div>

                    {/* Autonomous Countdown */}
                    {countdown !== null && countdown > 0 && (
                        <div className="mb-3 p-3 bg-red-950/30 border border-red-600/50 animate-pulse">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Timer className="h-4 w-4 text-red-400" />
                                    <span className="text-xs font-bold text-red-400">AUTONOMOUS EXECUTION IN {countdown}s</span>
                                </div>
                                <button
                                    onClick={cancelAutoExecute}
                                    className="px-3 py-1 bg-yellow-900/50 border border-yellow-600 text-yellow-400 text-[9px] font-bold hover:bg-yellow-900 transition-all"
                                >
                                    ✋ HUMAN OVERRIDE — CANCEL
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Recommended Actions */}
                    <div className="space-y-1.5 mb-3">
                        <div className="text-[9px] text-green-600 font-bold">RECOMMENDED CONTAINMENT ACTIONS:</div>
                        {aiDecision.recommendedActions.map((action, idx) => {
                            const Icon = ACTION_ICONS[action] || Zap;
                            return (
                                <button
                                    key={action}
                                    onClick={() => executeSOAR(action)}
                                    disabled={executing}
                                    className="w-full flex items-center gap-2 p-2 bg-black/50 border border-green-900/30 hover:border-green-600/50 hover:bg-green-950/20 transition-all text-left disabled:opacity-50"
                                >
                                    <span className="text-[8px] text-green-900 w-4">{idx + 1}.</span>
                                    <Icon className="h-3.5 w-3.5 text-green-500" />
                                    <span className="text-[10px] text-green-400 font-mono flex-1">
                                        {action.replace(/_/g, ' ')}
                                    </span>
                                    {aiDecision.autonomousExecution && (
                                        <span className="text-[7px] px-1 py-0.5 bg-red-950/50 text-red-400 border border-red-900/30">AUTO</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Execute All Button */}
                    <button
                        onClick={() => executeSOAR()}
                        disabled={executing}
                        className="w-full p-2.5 bg-red-950/30 border-2 border-red-700/50 text-red-400 text-xs font-bold hover:bg-red-900/30 hover:border-red-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {executing ? (
                            <>
                                <div className="h-3 w-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                EXECUTING CONTAINMENT...
                            </>
                        ) : (
                            <>
                                <Zap className="h-4 w-4" />
                                [ EXECUTE ALL {aiDecision.recommendedActions.length} ACTIONS NOW ]
                            </>
                        )}
                    </button>
                </>
            )}

            {/* Execution Results */}
            {soarResult && (
                <div className="space-y-2">
                    {/* Success Banner */}
                    <div className="p-2 bg-green-950/20 border border-green-700/30">
                        <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span className="text-xs font-bold text-green-400">THREAT NEUTRALIZED — {soarResult.totalExecutionMs}ms</span>
                        </div>
                        <p className="text-[9px] text-green-600">
                            {soarResult.aiDecision.recommendedActions.length} containment actions executed.
                            Incident status: <span className="text-green-400 font-bold">{soarResult.incidentStatus}</span>
                        </p>
                    </div>

                    {/* Executed Actions Summary */}
                    {Object.entries(soarResult.executionResults).map(([key, value]) => (
                        <div key={key} className="p-2 bg-black/50 border border-green-900/20">
                            <div className="text-[9px] font-bold text-cyan-400 mb-1">{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</div>
                            <pre className="text-[8px] text-green-700 overflow-x-auto">{JSON.stringify(value, null, 1)}</pre>
                        </div>
                    ))}

                    {/* Audit Trail */}
                    <div className="p-2 bg-amber-950/10 border border-amber-900/30">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Lock className="h-3 w-3 text-amber-400" />
                            <span className="text-[9px] font-bold text-amber-400">BLOCKCHAIN AUDIT TRAIL</span>
                        </div>
                        <div className="text-[8px] text-amber-600 font-mono">
                            <div>HASH: {soarResult.auditTrail.hash}</div>
                            <div>COURT ADMISSIBLE: {soarResult.auditTrail.courtAdmissible ? '✅ YES' : '❌ NO'}</div>
                            <div>NC4 REPORT: {(soarResult.nc4Report as Record<string, string>).reportId}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
