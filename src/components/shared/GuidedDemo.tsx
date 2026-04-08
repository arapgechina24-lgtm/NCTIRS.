'use client'

import { useState, useEffect, useCallback } from 'react'
import { Play, Pause, SkipForward, X, Monitor, ChevronRight } from 'lucide-react'

type ViewType = 'COMMAND_CENTER' | 'FUSION_CENTER' | 'THREAT_MATRIX' | 'ANALYTICS' | 'OPERATIONS'

interface DemoStep {
    id: number
    view: ViewType
    title: string
    narration: string
    duration: number // seconds
    highlight?: string
}

const DEMO_SCRIPT: DemoStep[] = [
    {
        id: 1,
        view: 'COMMAND_CENTER',
        title: 'NATIONAL CYBER COMMAND',
        narration: 'Welcome to NCTIRS — Kenya\'s sovereign AI-powered cyber defence platform. This Command Hub provides a unified threat picture across all Critical National Infrastructure.',
        duration: 10,
    },
    {
        id: 2,
        view: 'COMMAND_CENTER',
        title: 'LIVE THREAT DETECTION',
        narration: 'The God\'s Eye View displays real-time threat vectors mapped across Kenya. The CNI Heatmap shows infrastructure health. Every data point is processed by 4 concurrent ML models.',
        duration: 10,
    },
    {
        id: 3,
        view: 'THREAT_MATRIX',
        title: 'THREAT MATRIX — ACTIVE ENGAGEMENT',
        narration: 'The Threat Matrix shows live attack vectors. Our AI Threat Correlation Engine detects Advanced Persistent Threats with 98.7% confidence using sequential pattern mining.',
        duration: 10,
    },
    {
        id: 4,
        view: 'FUSION_CENTER',
        title: 'MULTI-AGENCY FUSION',
        narration: 'The Fusion Center unifies intelligence across NIS, DCI, KRA, and KPLC. The AI Reasoning Core processes threat data in real-time. Inter-agency collaboration happens on a single secure channel.',
        duration: 10,
    },
    {
        id: 5,
        view: 'ANALYTICS',
        title: 'AI INSIGHTS & PREDICTION',
        narration: 'The Analytics engine provides 7-day threat forecasting using exponential smoothing. Regional threat analysis identifies coordinated campaigns. Every model reports precision, recall, and F1 scores.',
        duration: 10,
    },
    {
        id: 6,
        view: 'OPERATIONS',
        title: 'AUTONOMOUS RESPONSE',
        narration: 'When a CRITICAL threat is detected, the SOAR engine contains it in under 200 milliseconds — before a human can read the alert. Every action is logged to a blockchain integrity ledger, court-admissible under CMCA 2018. This is NCTIRS. Built. Deployed. Ready to protect a nation.',
        duration: 10,
    },
]

interface GuidedDemoProps {
    onNavigate: (view: ViewType) => void
}

export default function GuidedDemo({ onNavigate }: GuidedDemoProps) {
    const [isActive, setIsActive] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const [timeRemaining, setTimeRemaining] = useState(0)
    const [totalElapsed, setTotalElapsed] = useState(0)

    const totalDuration = DEMO_SCRIPT.reduce((sum, s) => sum + s.duration, 0)
    const step = DEMO_SCRIPT[currentStep]

    const startDemo = useCallback(() => {
        setIsActive(true)
        setIsPaused(false)
        setCurrentStep(0)
        setTotalElapsed(0)
        setTimeRemaining(DEMO_SCRIPT[0].duration)
        onNavigate(DEMO_SCRIPT[0].view)
    }, [onNavigate])

    const stopDemo = useCallback(() => {
        setIsActive(false)
        setIsPaused(false)
        setCurrentStep(0)
        setTotalElapsed(0)
    }, [])

    const skipStep = useCallback(() => {
        if (currentStep < DEMO_SCRIPT.length - 1) {
            const nextStep = currentStep + 1
            setCurrentStep(nextStep)
            setTimeRemaining(DEMO_SCRIPT[nextStep].duration)
            onNavigate(DEMO_SCRIPT[nextStep].view)
        } else {
            stopDemo()
        }
    }, [currentStep, onNavigate, stopDemo])

    // Timer
    useEffect(() => {
        if (!isActive || isPaused) return

        const interval = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    // Move to next step
                    if (currentStep < DEMO_SCRIPT.length - 1) {
                        const nextStep = currentStep + 1
                        setCurrentStep(nextStep)
                        onNavigate(DEMO_SCRIPT[nextStep].view)
                        return DEMO_SCRIPT[nextStep].duration
                    } else {
                        stopDemo()
                        return 0
                    }
                }
                return prev - 1
            })
            setTotalElapsed(prev => prev + 1)
        }, 1000)

        return () => clearInterval(interval)
    }, [isActive, isPaused, currentStep, onNavigate, stopDemo])

    // Inactive state — show launch button
    if (!isActive) {
        return (
            <button
                onClick={startDemo}
                className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 bg-green-950/90 border-2 border-green-500 text-green-400 hover:bg-green-900/90 hover:shadow-[0_0_30px_rgba(0,255,0,0.3)] transition-all font-mono font-bold text-sm uppercase tracking-wider backdrop-blur-sm group"
            >
                <Play className="h-5 w-5 group-hover:scale-110 transition-transform" />
                START GUIDED DEMO
                <span className="text-[9px] text-green-600 ml-1">({totalDuration}s)</span>
            </button>
        )
    }

    // Active state — narration bar
    const progress = (totalElapsed / totalDuration) * 100

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 border-t-2 border-green-500 backdrop-blur-md shadow-[0_-4px_30px_rgba(0,255,0,0.15)]">
            {/* Progress bar */}
            <div className="h-1 bg-green-950 w-full">
                <div
                    className="h-full bg-green-500 transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(0,255,0,0.5)]"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="flex items-center gap-5 px-6 py-4">
                {/* Controls */}
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={() => setIsPaused(!isPaused)}
                        className="p-2 border border-green-800 bg-green-950/50 text-green-400 hover:bg-green-900/50 transition-all"
                        title={isPaused ? 'Resume' : 'Pause'}
                    >
                        {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    </button>
                    <button
                        onClick={skipStep}
                        className="p-2 border border-green-800 bg-green-950/50 text-green-400 hover:bg-green-900/50 transition-all"
                        title="Next Step"
                    >
                        <SkipForward className="h-4 w-4" />
                    </button>
                    <button
                        onClick={stopDemo}
                        className="p-2 border border-red-800 bg-red-950/50 text-red-400 hover:bg-red-900/50 transition-all"
                        title="End Demo"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Step indicator */}
                <div className="flex items-center gap-2 shrink-0">
                    <Monitor className="h-4 w-4 text-green-600" />
                    <span className="text-[10px] text-green-600 font-mono uppercase">
                        Step {currentStep + 1}/{DEMO_SCRIPT.length}
                    </span>
                    <span className="text-[10px] text-green-800 font-mono">
                        {timeRemaining}s
                    </span>
                </div>

                {/* Step dots */}
                <div className="flex items-center gap-1.5 shrink-0">
                    {DEMO_SCRIPT.map((_, i) => (
                        <div
                            key={i}
                            className={`h-2 w-2 rounded-full transition-all ${
                                i === currentStep
                                    ? 'bg-green-400 shadow-[0_0_8px_rgba(0,255,0,0.6)] scale-125'
                                    : i < currentStep
                                    ? 'bg-green-700'
                                    : 'bg-green-950 border border-green-900'
                            }`}
                        />
                    ))}
                </div>

                {/* Narration */}
                <div className="flex-1 min-w-0 ml-2">
                    <div className="flex items-center gap-2 mb-1">
                        <ChevronRight className="h-3 w-3 text-green-500 animate-pulse" />
                        <span className="text-xs font-bold text-green-400 uppercase tracking-wider">{step?.title}</span>
                    </div>
                    <p className="text-[11px] text-green-600 leading-relaxed truncate">
                        {step?.narration}
                    </p>
                </div>
            </div>
        </div>
    )
}
