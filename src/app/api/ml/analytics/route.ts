// NCTIRS Deep Analytics Engine
// Anomaly Detection + Behavioral Analysis + Predictive Modeling
// All operating on the real Golden Dataset from the database
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// ═══════════════════════════════════════════════════════════════════════════
//  SECTION 1: ANOMALY DETECTION (Z-Score Statistical Model)
// ═══════════════════════════════════════════════════════════════════════════

interface AnomalyResult {
    incidentId: string;
    title: string;
    anomalyScore: number;
    isAnomaly: boolean;
    deviation: string;
    reason: string;
}

function computeZScore(value: number, mean: number, stdDev: number): number {
    if (stdDev === 0) return 0;
    return (value - mean) / stdDev;
}

function detectAnomalies(
    incidents: { id: string; title: string; severity: string; type: string; createdAt: Date; attackVector: string | null; indicators: string | null }[]
): AnomalyResult[] {
    if (incidents.length < 5) return [];

    // Feature 1: Payload size distribution
    const payloads: number[] = [];
    const incidentPayloads: Map<string, number> = new Map();
    for (const inc of incidents) {
        try {
            const indicators = inc.indicators ? JSON.parse(inc.indicators) : {};
            const payload = indicators.payload_size ?? 0;
            payloads.push(payload);
            incidentPayloads.set(inc.id, payload);
        } catch {
            payloads.push(0);
            incidentPayloads.set(inc.id, 0);
        }
    }

    const meanPayload = payloads.reduce((a, b) => a + b, 0) / payloads.length;
    const stdDevPayload = Math.sqrt(payloads.reduce((sum, p) => sum + Math.pow(p - meanPayload, 2), 0) / payloads.length);

    // Feature 2: Temporal frequency (incidents per hour)
    const hourBuckets: Map<number, number> = new Map();
    for (const inc of incidents) {
        const hour = new Date(inc.createdAt).getHours();
        hourBuckets.set(hour, (hourBuckets.get(hour) || 0) + 1);
    }
    const hourCounts = Array.from(hourBuckets.values());
    const meanHourly = hourCounts.reduce((a, b) => a + b, 0) / hourCounts.length;
    const stdDevHourly = Math.sqrt(hourCounts.reduce((sum, c) => sum + Math.pow(c - meanHourly, 2), 0) / hourCounts.length);

    // Feature 3: Severity scoring
    const severityMap: Record<string, number> = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
    const severityScores = incidents.map(i => severityMap[i.severity] ?? 2);
    const meanSeverity = severityScores.reduce((a, b) => a + b, 0) / severityScores.length;
    const stdDevSeverity = Math.sqrt(severityScores.reduce((sum, s) => sum + Math.pow(s - meanSeverity, 2), 0) / severityScores.length);

    // Detect anomalies using composite Z-score
    const anomalies: AnomalyResult[] = [];
    for (let i = 0; i < incidents.length; i++) {
        const inc = incidents[i];
        const payload = incidentPayloads.get(inc.id) ?? 0;
        const hour = new Date(inc.createdAt).getHours();
        const hourCount = hourBuckets.get(hour) || 0;
        const sevScore = severityMap[inc.severity] ?? 2;

        const zPayload = computeZScore(payload, meanPayload, stdDevPayload);
        const zTemporal = computeZScore(hourCount, meanHourly, stdDevHourly);
        const zSeverity = computeZScore(sevScore, meanSeverity, stdDevSeverity);

        // Composite anomaly score (weighted)
        const compositeZ = Math.abs(zPayload * 0.4) + Math.abs(zTemporal * 0.3) + Math.abs(zSeverity * 0.3);
        const anomalyScore = Math.min(Math.round(compositeZ * 33), 100);
        const isAnomaly = compositeZ > 1.8; // Z > 1.8 = anomalous (~3.6% false positive rate)

        if (isAnomaly) {
            let reason = '';
            const deviations: string[] = [];
            if (Math.abs(zPayload) > 1.5) deviations.push(`payload size ${payload}B is ${zPayload > 0 ? 'abnormally large' : 'abnormally small'}`);
            if (Math.abs(zTemporal) > 1.5) deviations.push(`unusual activity spike at ${hour}:00 (${hourCount} incidents)`);
            if (Math.abs(zSeverity) > 1.5) deviations.push(`severity ${inc.severity} deviates from baseline`);
            reason = deviations.length > 0 ? deviations.join('; ') : 'Composite feature deviation exceeds threshold';

            anomalies.push({
                incidentId: inc.id,
                title: inc.title,
                anomalyScore,
                isAnomaly: true,
                deviation: `Z=${compositeZ.toFixed(2)}`,
                reason,
            });
        }
    }

    return anomalies.sort((a, b) => b.anomalyScore - a.anomalyScore).slice(0, 20);
}

// ═══════════════════════════════════════════════════════════════════════════
//  SECTION 2: BEHAVIORAL ANALYSIS (Attack Pattern Sequencing)
// ═══════════════════════════════════════════════════════════════════════════

interface BehavioralPattern {
    pattern: string;
    description: string;
    frequency: number;
    riskLevel: string;
    mitreTactics: string[];
    confidence: number;
}

interface AttackChain {
    chainId: string;
    steps: { attackVector: string; timestamp: Date; target: string }[];
    classification: string;
    killChainPhase: string;
}

function analyzeAttackBehavior(
    incidents: { id: string; type: string; severity: string; attackVector: string | null; targetAsset: string | null; createdAt: Date; location: string | null }[]
): { patterns: BehavioralPattern[]; attackChains: AttackChain[]; behaviorProfile: Record<string, unknown> } {
    // Pattern 1: Temporal clustering (attacks within short windows)
    const sorted = [...incidents].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const patterns: BehavioralPattern[] = [];
    const attackChains: AttackChain[] = [];

    // Detect burst patterns (>3 attacks in 1 hour)
    const hourlyBuckets: Map<string, typeof incidents> = new Map();
    for (const inc of sorted) {
        const key = `${new Date(inc.createdAt).toISOString().slice(0, 13)}`; // YYYY-MM-DDTHH
        const bucket = hourlyBuckets.get(key) || [];
        bucket.push(inc);
        hourlyBuckets.set(key, bucket);
    }

    let burstCount = 0;
    for (const [, bucket] of hourlyBuckets) {
        if (bucket.length >= 3) burstCount++;
    }

    if (burstCount > 0) {
        patterns.push({
            pattern: 'TEMPORAL_BURST',
            description: `Detected ${burstCount} time windows with ≥3 concurrent attacks — indicates coordinated campaign`,
            frequency: burstCount,
            riskLevel: burstCount > 5 ? 'CRITICAL' : 'HIGH',
            mitreTactics: ['TA0001 Initial Access', 'TA0042 Resource Development'],
            confidence: Math.min(0.7 + burstCount * 0.03, 0.98),
        });
    }

    // Pattern 2: Target fixation (same asset attacked multiple times)
    const targetCounts: Map<string, number> = new Map();
    for (const inc of incidents) {
        if (inc.targetAsset) {
            targetCounts.set(inc.targetAsset, (targetCounts.get(inc.targetAsset) || 0) + 1);
        }
    }

    const fixatedTargets = Array.from(targetCounts.entries()).filter(([, count]) => count >= 3);
    for (const [target, count] of fixatedTargets) {
        patterns.push({
            pattern: 'TARGET_FIXATION',
            description: `"${target}" attacked ${count} times — persistent adversary interest`,
            frequency: count,
            riskLevel: count >= 10 ? 'CRITICAL' : 'HIGH',
            mitreTactics: ['TA0043 Reconnaissance', 'TA0001 Initial Access'],
            confidence: Math.min(0.65 + count * 0.03, 0.95),
        });
    }

    // Pattern 3: Attack vector diversity (same target, multiple vectors = APT)
    const targetVectors: Map<string, Set<string>> = new Map();
    for (const inc of incidents) {
        if (inc.targetAsset && inc.attackVector) {
            const vectors = targetVectors.get(inc.targetAsset) || new Set();
            vectors.add(inc.attackVector);
            targetVectors.set(inc.targetAsset, vectors);
        }
    }

    for (const [target, vectors] of targetVectors) {
        if (vectors.size >= 3) {
            patterns.push({
                pattern: 'MULTI_VECTOR_APT',
                description: `"${target}" targeted by ${vectors.size} distinct attack vectors — APT-level sophistication`,
                frequency: vectors.size,
                riskLevel: 'CRITICAL',
                mitreTactics: ['TA0005 Defense Evasion', 'TA0008 Lateral Movement', 'TA0010 Exfiltration'],
                confidence: Math.min(0.8 + vectors.size * 0.03, 0.98),
            });
        }
    }

    // Pattern 4: Geographic correlation (attacks from same location cluster)
    const locationCounts: Map<string, number> = new Map();
    for (const inc of incidents) {
        if (inc.location) {
            locationCounts.set(inc.location, (locationCounts.get(inc.location) || 0) + 1);
        }
    }

    const hotspots = Array.from(locationCounts.entries())
        .filter(([, count]) => count >= 5)
        .sort((a, b) => b[1] - a[1]);

    for (const [location, count] of hotspots.slice(0, 3)) {
        patterns.push({
            pattern: 'GEOGRAPHIC_CLUSTER',
            description: `${count} attacks originating from ${location} — potential botnet staging ground`,
            frequency: count,
            riskLevel: count >= 15 ? 'CRITICAL' : 'MEDIUM',
            mitreTactics: ['TA0011 Command and Control'],
            confidence: Math.min(0.6 + count * 0.02, 0.92),
        });
    }

    // Build attack chains (sequential attacks on related targets)
    let chainCounter = 0;
    for (const [target, count] of fixatedTargets.slice(0, 5)) {
        const targetIncidents = sorted
            .filter(i => i.targetAsset === target)
            .slice(0, 5);

        if (targetIncidents.length >= 2) {
            const vectors = targetIncidents.map(i => i.attackVector || 'UNKNOWN');
            let killChainPhase = 'RECONNAISSANCE';
            if (vectors.some(v => v.includes('T1190') || v.includes('T1110'))) killChainPhase = 'WEAPONIZATION';
            if (vectors.some(v => v.includes('T1486') || v.includes('T1498'))) killChainPhase = 'ACTIONS_ON_OBJECTIVES';

            attackChains.push({
                chainId: `CHAIN-${String(++chainCounter).padStart(3, '0')}`,
                steps: targetIncidents.map(i => ({
                    attackVector: i.attackVector || 'UNKNOWN',
                    timestamp: i.createdAt,
                    target: target,
                })),
                classification: count >= 5 ? 'ADVANCED_PERSISTENT_THREAT' : 'OPPORTUNISTIC_CAMPAIGN',
                killChainPhase,
            });
        }
    }

    // Behavior profile summary
    const behaviorProfile = {
        totalIncidents: incidents.length,
        uniqueTargets: targetCounts.size,
        uniqueVectors: new Set(incidents.map(i => i.attackVector).filter(Boolean)).size,
        uniqueLocations: locationCounts.size,
        avgAttacksPerTarget: targetCounts.size > 0 ? Math.round(incidents.length / targetCounts.size * 10) / 10 : 0,
        peakAttackHour: (() => {
            let maxCount = 0; let maxHour = 0;
            for (const [hour, bucket] of hourlyBuckets) {
                if (bucket.length > maxCount) { maxCount = bucket.length; maxHour = parseInt(hour.slice(-2)); }
            }
            return `${maxHour}:00 UTC (${maxCount} attacks)`;
        })(),
        dominantSeverity: (() => {
            const sevCounts: Record<string, number> = {};
            for (const i of incidents) sevCounts[i.severity] = (sevCounts[i.severity] || 0) + 1;
            return Object.entries(sevCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'UNKNOWN';
        })(),
    };

    return {
        patterns: patterns.sort((a, b) => {
            const riskOrder: Record<string, number> = { 'CRITICAL': 3, 'HIGH': 2, 'MEDIUM': 1, 'LOW': 0 };
            return (riskOrder[b.riskLevel] ?? 0) - (riskOrder[a.riskLevel] ?? 0);
        }),
        attackChains,
        behaviorProfile,
    };
}

// ═══════════════════════════════════════════════════════════════════════════
//  SECTION 3: PREDICTIVE MODELING (Exponential Smoothing Forecaster)
// ═══════════════════════════════════════════════════════════════════════════

interface PredictionResult {
    period: string;
    predictedIncidents: number;
    predictedCritical: number;
    confidence: number;
    trend: 'ESCALATING' | 'STABLE' | 'DECLINING';
    riskForecast: string;
}

function predictThreatTrends(
    incidents: { severity: string; createdAt: Date }[]
): { predictions: PredictionResult[]; processingMetrics: Record<string, number>; modelInfo: Record<string, string> } {
    // Build daily time series
    const dailyCounts: Map<string, { total: number; critical: number }> = new Map();
    for (const inc of incidents) {
        const day = new Date(inc.createdAt).toISOString().slice(0, 10);
        const entry = dailyCounts.get(day) || { total: 0, critical: 0 };
        entry.total++;
        if (inc.severity === 'CRITICAL') entry.critical++;
        dailyCounts.set(day, entry);
    }

    const sortedDays = Array.from(dailyCounts.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    if (sortedDays.length < 3) {
        return {
            predictions: [],
            processingMetrics: { recordsAnalyzed: incidents.length, timeSeriesLength: sortedDays.length },
            modelInfo: { name: 'Insufficient data', type: 'N/A' },
        };
    }

    // Exponential smoothing (alpha = 0.3)
    const alpha = 0.3;
    const totalSeries = sortedDays.map(d => d[1].total);
    const criticalSeries = sortedDays.map(d => d[1].critical);

    function exponentialSmooth(series: number[]): number[] {
        const smoothed = [series[0]];
        for (let i = 1; i < series.length; i++) {
            smoothed.push(alpha * series[i] + (1 - alpha) * smoothed[i - 1]);
        }
        return smoothed;
    }

    const smoothedTotal = exponentialSmooth(totalSeries);
    const smoothedCritical = exponentialSmooth(criticalSeries);

    // Compute trend (linear regression on last 7 days)
    const recentWindow = smoothedTotal.slice(-7);
    const n = recentWindow.length;
    const xMean = (n - 1) / 2;
    const yMean = recentWindow.reduce((a, b) => a + b, 0) / n;
    let numerator = 0, denominator = 0;
    for (let i = 0; i < n; i++) {
        numerator += (i - xMean) * (recentWindow[i] - yMean);
        denominator += (i - xMean) * (i - xMean);
    }
    const slope = denominator !== 0 ? numerator / denominator : 0;

    // Forecast next 7 days
    const lastSmoothedTotal = smoothedTotal[smoothedTotal.length - 1];
    const lastSmoothedCritical = smoothedCritical[smoothedCritical.length - 1];
    const lastDate = new Date(sortedDays[sortedDays.length - 1][0]);

    const predictions: PredictionResult[] = [];
    for (let d = 1; d <= 7; d++) {
        const forecastDate = new Date(lastDate);
        forecastDate.setDate(forecastDate.getDate() + d);

        const predictedTotal = Math.max(0, Math.round(lastSmoothedTotal + slope * d));
        const predictedCritical = Math.max(0, Math.round(lastSmoothedCritical + slope * d * 0.3));
        const confidence = Math.max(0.5, 0.95 - d * 0.05); // Confidence decays over forecast horizon

        let trend: 'ESCALATING' | 'STABLE' | 'DECLINING';
        if (slope > 2) trend = 'ESCALATING';
        else if (slope < -2) trend = 'DECLINING';
        else trend = 'STABLE';

        let riskForecast: string;
        if (predictedCritical >= 5) riskForecast = 'SEVERE — Multiple critical incidents expected, recommend pre-emptive SOAR activation';
        else if (predictedTotal >= 50) riskForecast = 'ELEVATED — High volume expected, increase SOC staffing';
        else if (trend === 'ESCALATING') riskForecast = 'WATCH — Upward trend detected, monitor closely';
        else riskForecast = 'NORMAL — Within baseline parameters';

        predictions.push({
            period: forecastDate.toISOString().slice(0, 10),
            predictedIncidents: predictedTotal,
            predictedCritical,
            confidence: Math.round(confidence * 100) / 100,
            trend,
            riskForecast,
        });
    }

    const processingMetrics = {
        recordsAnalyzed: incidents.length,
        timeSeriesLength: sortedDays.length,
        smoothingFactor: alpha,
        trendSlope: Math.round(slope * 100) / 100,
        forecastHorizonDays: 7,
    };

    return {
        predictions,
        processingMetrics,
        modelInfo: {
            name: 'NCTIRS-PredictiveForecaster-v1',
            type: 'Exponential Smoothing + Linear Trend Extrapolation',
            trainingWindow: `${sortedDays.length} days`,
            dataset: 'CIC-IDS2017 Golden Dataset',
        },
    };
}

// ═══════════════════════════════════════════════════════════════════════════
//  API HANDLER
// ═══════════════════════════════════════════════════════════════════════════

export async function GET() {
    const startTime = performance.now();

    try {
        // Fetch real data from the database
        const incidents = await prisma.incident.findMany({
            orderBy: { createdAt: 'desc' },
            take: 2500,
            select: {
                id: true,
                title: true,
                type: true,
                severity: true,
                status: true,
                location: true,
                targetAsset: true,
                attackVector: true,
                indicators: true,
                createdAt: true,
            },
        });

        if (incidents.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No incident data available. Run the Golden Dataset seed script first.',
                anomalies: [],
                behavioral: { patterns: [], attackChains: [], behaviorProfile: {} },
                predictions: { predictions: [], processingMetrics: {}, modelInfo: {} },
            });
        }

        // Run all three engines
        const anomalies = detectAnomalies(incidents);
        const behavioral = analyzeAttackBehavior(incidents);
        const predictions = predictThreatTrends(incidents);

        const totalInferenceMs = performance.now() - startTime;

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            engineVersion: 'NCTIRS-ATAE-DeepAnalytics-v1.0',
            totalInferenceMs: Math.round(totalInferenceMs * 100) / 100,
            recordsProcessed: incidents.length,
            anomalyDetection: {
                model: 'Z-Score Statistical Anomaly Detector',
                anomaliesFound: anomalies.length,
                threshold: 'Z > 1.8 (97th percentile)',
                results: anomalies,
            },
            behavioralAnalysis: {
                model: 'Sequential Pattern Analyzer + Kill Chain Mapper',
                patternsFound: behavioral.patterns.length,
                attackChainsIdentified: behavioral.attackChains.length,
                patterns: behavioral.patterns,
                attackChains: behavioral.attackChains,
                behaviorProfile: behavioral.behaviorProfile,
            },
            predictiveModeling: {
                model: predictions.modelInfo,
                processingMetrics: predictions.processingMetrics,
                forecast: predictions.predictions,
            },
        });
    } catch (error) {
        console.error('[ATAE/Analytics] Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Analytics engine error',
            details: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
    }
}
