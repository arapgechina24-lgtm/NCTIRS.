// NCTIRS NLP Threat Intelligence Analyzer
// Keyword-based NLP engine for incident text analysis
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// ── Threat Lexicon (weighted keyword dictionaries) ──────────────────────────
const URGENCY_KEYWORDS: Record<string, number> = {
    'critical': 0.95,
    'emergency': 0.9,
    'immediate': 0.85,
    'breach': 0.85,
    'compromised': 0.8,
    'exfiltration': 0.9,
    'ransomware': 0.95,
    'encrypted': 0.8,
    'locked': 0.7,
    'hostage': 0.9,
    'zero-day': 0.95,
    'exploit': 0.75,
    'unauthorized': 0.7,
    'infiltration': 0.8,
    'malware': 0.75,
    'trojan': 0.7,
    'backdoor': 0.85,
    'rootkit': 0.85,
    'worm': 0.7,
    'botnet': 0.65,
    'ddos': 0.8,
    'denial': 0.6,
    'phishing': 0.6,
    'spear-phishing': 0.75,
    'credential': 0.65,
    'brute': 0.6,
    'lateral': 0.75,
    'privilege escalation': 0.8,
    'persistence': 0.7,
    'command and control': 0.85,
    'c2': 0.85,
};

const THREAT_ACTOR_KEYWORDS: Record<string, number> = {
    'state-sponsored': 1.0,
    'nation-state': 1.0,
    'apt': 0.95,
    'advanced persistent': 0.95,
    'organized': 0.7,
    'syndicate': 0.75,
    'terrorist': 0.9,
    'hacktivist': 0.6,
    'insider': 0.8,
    'espionage': 0.9,
    'intelligence': 0.6,
};

const KENYA_CONTEXT_KEYWORDS: Record<string, number> = {
    'ifmis': 0.95,
    'e-citizen': 0.9,
    'ecitizen': 0.9,
    'huduma': 0.85,
    'mpesa': 0.85,
    'm-pesa': 0.85,
    'safaricom': 0.8,
    'kra': 0.9,
    'itax': 0.85,
    'kplc': 0.75,
    'kenet': 0.7,
    'konza': 0.7,
    'ntsa': 0.65,
    'nssf': 0.7,
    'nhif': 0.7,
    'central bank': 0.9,
    'cbk': 0.9,
    'treasury': 0.95,
    'ministry': 0.7,
    'parliament': 0.8,
    'state house': 0.95,
    'nis': 0.9,
    'dci': 0.85,
};

// ── Entity Extraction ───────────────────────────────────────────────────────
interface ExtractedEntity {
    text: string;
    type: 'THREAT_INDICATOR' | 'THREAT_ACTOR' | 'KENYA_ASSET' | 'TECHNICAL_INDICATOR';
    confidence: number;
}

function extractEntities(text: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    const lowerText = text.toLowerCase();

    // Extract IP addresses
    const ipRegex = /\b(\d{1,3}\.){3}\d{1,3}\b/g;
    const ips = text.match(ipRegex);
    if (ips) {
        ips.forEach(ip => entities.push({ text: ip, type: 'TECHNICAL_INDICATOR', confidence: 0.99 }));
    }

    // Extract file hashes (MD5, SHA-256)
    const hashRegex = /\b[a-f0-9]{32,64}\b/gi;
    const hashes = text.match(hashRegex);
    if (hashes) {
        hashes.forEach(hash => entities.push({ text: hash, type: 'TECHNICAL_INDICATOR', confidence: 0.95 }));
    }

    // Extract MITRE ATT&CK IDs
    const mitreRegex = /T\d{4}(\.\d{3})?/g;
    const mitreIds = text.match(mitreRegex);
    if (mitreIds) {
        mitreIds.forEach(id => entities.push({ text: id, type: 'THREAT_INDICATOR', confidence: 0.98 }));
    }

    // Match threat actor keywords
    for (const [keyword, score] of Object.entries(THREAT_ACTOR_KEYWORDS)) {
        if (lowerText.includes(keyword)) {
            entities.push({ text: keyword, type: 'THREAT_ACTOR', confidence: score });
        }
    }

    // Match Kenya context keywords
    for (const [keyword, score] of Object.entries(KENYA_CONTEXT_KEYWORDS)) {
        if (lowerText.includes(keyword)) {
            entities.push({ text: keyword.toUpperCase(), type: 'KENYA_ASSET', confidence: score });
        }
    }

    return entities;
}

// ── Sentiment & Urgency Analyzer ────────────────────────────────────────────
function analyzeSentiment(text: string): {
    urgencyScore: number;
    sentiment: 'HOSTILE' | 'SUSPICIOUS' | 'NEUTRAL' | 'BENIGN';
    matchedKeywords: { keyword: string; weight: number }[];
} {
    const lowerText = text.toLowerCase();
    const matched: { keyword: string; weight: number }[] = [];

    for (const [keyword, weight] of Object.entries(URGENCY_KEYWORDS)) {
        if (lowerText.includes(keyword)) {
            matched.push({ keyword, weight });
        }
    }

    // Compute urgency as weighted average of matched keywords
    const urgencyScore = matched.length > 0
        ? Math.round((matched.reduce((sum, m) => sum + m.weight, 0) / matched.length) * 100)
        : 10;

    let sentiment: 'HOSTILE' | 'SUSPICIOUS' | 'NEUTRAL' | 'BENIGN';
    if (urgencyScore >= 80) sentiment = 'HOSTILE';
    else if (urgencyScore >= 55) sentiment = 'SUSPICIOUS';
    else if (urgencyScore >= 30) sentiment = 'NEUTRAL';
    else sentiment = 'BENIGN';

    return { urgencyScore, sentiment, matchedKeywords: matched };
}

// ── Full NLP Pipeline ───────────────────────────────────────────────────────
function analyzeText(text: string) {
    const startTime = performance.now();

    const sentimentResult = analyzeSentiment(text);
    const entities = extractEntities(text);

    // Word count and complexity metrics
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

    // Threat classification based on NLP features
    const hasThreatActor = entities.some(e => e.type === 'THREAT_ACTOR');
    const hasKenyaAsset = entities.some(e => e.type === 'KENYA_ASSET');
    const hasTechnicalIOC = entities.some(e => e.type === 'TECHNICAL_INDICATOR');

    let threatClassification: string;
    if (hasThreatActor && hasKenyaAsset) {
        threatClassification = 'TARGETED_ATTACK_ON_KENYA_CNI';
    } else if (hasThreatActor) {
        threatClassification = 'APT_ACTIVITY_DETECTED';
    } else if (hasKenyaAsset && sentimentResult.urgencyScore >= 70) {
        threatClassification = 'CNI_THREAT_ELEVATED';
    } else if (hasTechnicalIOC) {
        threatClassification = 'IOC_DETECTED';
    } else if (sentimentResult.urgencyScore >= 50) {
        threatClassification = 'SUSPICIOUS_ACTIVITY';
    } else {
        threatClassification = 'ROUTINE_INTEL';
    }

    const inferenceTimeMs = performance.now() - startTime;

    return {
        sentiment: sentimentResult,
        entities,
        threatClassification,
        textMetrics: {
            wordCount: words.length,
            sentenceCount: sentences.length,
            avgWordsPerSentence: sentences.length > 0 ? Math.round(words.length / sentences.length) : 0,
        },
        inferenceTimeMs: Math.round(inferenceTimeMs * 100) / 100,
        model: {
            name: 'NCTIRS-NLP-ThreatAnalyzer-v1',
            type: 'Keyword-Weighted Lexicon + Named Entity Recognition',
            lexiconSize: Object.keys(URGENCY_KEYWORDS).length + Object.keys(THREAT_ACTOR_KEYWORDS).length + Object.keys(KENYA_CONTEXT_KEYWORDS).length,
            capabilities: ['Urgency Scoring', 'Sentiment Classification', 'Entity Extraction', 'IOC Detection', 'Kenya CNI Context Mapping'],
        },
    };
}

// ── POST Handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { text } = body;

        if (!text || typeof text !== 'string') {
            return NextResponse.json(
                { error: 'Required field: text (string)' },
                { status: 400 }
            );
        }

        const result = analyzeText(text);

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            analysis: result,
        });
    } catch (error) {
        console.error('[ML/NLP] Error:', error);
        return NextResponse.json(
            { error: 'NLP analysis engine error' },
            { status: 500 }
        );
    }
}

// ── GET Handler (demo) ──────────────────────────────────────────────────────
export async function GET() {
    const sampleResult = analyzeText(
        'State-sponsored APT group detected conducting reconnaissance against IFMIS Treasury servers. ' +
        'Source IP 41.89.244.12 linked to known ransomware campaigns targeting Kenyan financial infrastructure. ' +
        'MITRE technique T1190 confirmed. Immediate containment recommended.'
    );

    return NextResponse.json({
        success: true,
        message: 'NCTIRS NLP Threat Intelligence Analyzer — v1.0',
        sampleAnalysis: sampleResult,
        usage: {
            method: 'POST',
            body: { text: 'string — incident description or threat intelligence text' },
        },
    });
}
