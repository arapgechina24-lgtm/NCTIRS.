'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Radio, Shield, AlertTriangle, Zap, Globe, MapPin } from 'lucide-react';

interface ThreatEvent {
    id: string;
    timestamp: string;
    target: string;
    attackName: string;
    attackType: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    riskScore: number;
    sourceIP: string;
    sourceCountry: string;
    targetLocation: string;
    threatActor: string;
    confidence: number;
    status: string;
    soarTriggered: boolean;
    protocol: string;
}

const SEVERITY_STYLES: Record<string, string> = {
    CRITICAL: 'border-red-700/60 bg-red-950/40',
    HIGH: 'border-orange-700/50 bg-orange-950/30',
    MEDIUM: 'border-yellow-700/40 bg-yellow-950/20',
    LOW: 'border-green-700/30 bg-green-950/20',
};

const SEVERITY_TEXT: Record<string, string> = {
    CRITICAL: 'text-red-400',
    HIGH: 'text-orange-400',
    MEDIUM: 'text-yellow-400',
    LOW: 'text-green-400',
};

export function LiveThreatFeed() {
    const [events, setEvents] = useState<ThreatEvent[]>([]);
    const [totalProcessed, setTotalProcessed] = useState(0);
    const [isLive, setIsLive] = useState(true);
    const [stats, setStats] = useState({ critical: 0, high: 0, medium: 0, low: 0 });
    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchLiveFeed = useCallback(async () => {
        if (!isLive) return;
        try {
            const res = await fetch('/api/threats/live');
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setEvents(prev => {
                        const merged = [...data.events, ...prev].slice(0, 50); // Keep last 50
                        return merged;
                    });
                    setTotalProcessed(prev => prev + data.eventCount);
                    setStats(prev => ({
                        critical: prev.critical + data.stats.critical,
                        high: prev.high + data.stats.high,
                        medium: prev.medium + data.stats.medium,
                        low: prev.low + data.stats.low,
                    }));
                }
            }
        } catch (err) {
            console.error('[LiveFeed] Error:', err);
        }
    }, [isLive]);

    useEffect(() => {
        fetchLiveFeed(); // Initial fetch
        const interval = setInterval(fetchLiveFeed, 5000); // Every 5 seconds
        return () => clearInterval(interval);
    }, [fetchLiveFeed]);

    const formatTime = (ts: string) => {
        return new Date(ts).toLocaleTimeString('en-KE', { hour12: false });
    };

    return (
        <div className="bg-black border border-green-900/50 rounded-none p-4 card-shadow">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <div className={`absolute inset-0 blur-md opacity-40 ${isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
                        <div className={`relative p-1.5 border ${isLive ? 'border-red-700/50 bg-red-950/50' : 'border-gray-700/50 bg-gray-950/50'}`}>
                            <Radio className={`h-4 w-4 ${isLive ? 'text-red-400' : 'text-gray-500'}`} />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xs font-bold text-green-400 tracking-wider">LIVE THREAT INTELLIGENCE FEED</h2>
                        <p className="text-[9px] text-green-800 font-mono">
                            {isLive ? '● STREAMING' : '○ PAUSED'} • {totalProcessed.toLocaleString()} EVENTS PROCESSED
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsLive(!isLive)}
                    className={`px-3 py-1 text-[9px] font-mono border transition-all ${
                        isLive
                            ? 'border-red-700/50 text-red-400 bg-red-950/20 hover:bg-red-950/40'
                            : 'border-green-700/50 text-green-400 bg-green-950/20 hover:bg-green-950/40'
                    }`}
                >
                    {isLive ? '⏸ PAUSE' : '▶ RESUME'}
                </button>
            </div>

            {/* Live Stats Bar */}
            <div className="grid grid-cols-4 gap-1 mb-3">
                {[
                    { label: 'CRITICAL', count: stats.critical, color: 'text-red-400 bg-red-950/30 border-red-900/30' },
                    { label: 'HIGH', count: stats.high, color: 'text-orange-400 bg-orange-950/30 border-orange-900/30' },
                    { label: 'MEDIUM', count: stats.medium, color: 'text-yellow-400 bg-yellow-950/30 border-yellow-900/30' },
                    { label: 'LOW', count: stats.low, color: 'text-green-400 bg-green-950/30 border-green-900/30' },
                ].map(s => (
                    <div key={s.label} className={`text-center p-1.5 border ${s.color}`}>
                        <div className="text-[10px] font-bold font-mono">{s.count}</div>
                        <div className="text-[7px] opacity-70">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Event Stream */}
            <div ref={scrollRef} className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
                {events.length === 0 ? (
                    <div className="text-center py-6 text-green-800 text-xs font-mono animate-pulse">
                        AWAITING INCOMING THREAT DATA...
                    </div>
                ) : (
                    events.map((event, idx) => (
                        <div
                            key={event.id}
                            className={`border p-2 transition-all ${SEVERITY_STYLES[event.severity]} ${
                                idx === 0 ? 'animate-pulse' : ''
                            }`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[8px] text-green-800 font-mono">{formatTime(event.timestamp)}</span>
                                    <span className={`text-[8px] px-1 py-0.5 font-bold ${SEVERITY_TEXT[event.severity]} ${SEVERITY_STYLES[event.severity]}`}>
                                        {event.severity}
                                    </span>
                                    {event.soarTriggered && (
                                        <span className="text-[7px] px-1 py-0.5 bg-purple-950/50 text-purple-400 border border-purple-700/30 flex items-center gap-0.5">
                                            <Zap className="h-2 w-2" />
                                            SOAR
                                        </span>
                                    )}
                                </div>
                                <span className="text-[8px] text-cyan-500 font-mono">RISK: {event.riskScore}</span>
                            </div>

                            <div className="text-[9px] font-bold text-green-400 mb-0.5 truncate">{event.target}</div>

                            <div className="flex items-center justify-between text-[8px]">
                                <div className="flex items-center gap-1 text-green-700">
                                    <Shield className="h-2.5 w-2.5" />
                                    <span>{event.attackName}</span>
                                </div>
                                <span className="text-green-800">{event.attackType}</span>
                            </div>

                            <div className="flex items-center justify-between text-[8px] mt-0.5">
                                <div className="flex items-center gap-1 text-green-800">
                                    <Globe className="h-2.5 w-2.5" />
                                    <span>{event.sourceIP} ({event.sourceCountry})</span>
                                </div>
                                <div className="flex items-center gap-1 text-green-700">
                                    <MapPin className="h-2.5 w-2.5" />
                                    <span>{event.targetLocation}</span>
                                </div>
                            </div>

                            {event.severity === 'CRITICAL' && (
                                <div className="mt-1 flex items-center gap-1 text-[8px] text-red-400">
                                    <AlertTriangle className="h-2.5 w-2.5" />
                                    <span>AUTONOMOUS CONTAINMENT: {event.status}</span>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
