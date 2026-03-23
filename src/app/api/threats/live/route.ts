// NCTIRS Live Threat Feed API
// Generates a realistic stream of simulated incidents for live demos
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const KENYA_CNI_TARGETS = [
    'IFMIS — National Treasury Portal',
    'KRA iTax Revenue System',
    'eCitizen Service Platform',
    'KENET Academic Backbone',
    'Safaricom M-Pesa Core',
    'Kenya Power SCADA Grid',
    'JKIA Air Traffic Control',
    'Port of Mombasa Logistics Hub',
    'Central Bank RTGS System',
    'Huduma Namba Identity Registry',
    'NYS Payroll System',
    'IEBC Voter Registration DB',
    'KNH Electronic Medical Records',
    'SGR Ticketing & Operations',
    'NTSA Motor Vehicle Registry',
];

const ATTACK_VECTORS = [
    { technique: 'T1190', name: 'Exploit Public-Facing Application', type: 'APT' },
    { technique: 'T1110', name: 'Brute Force Credential Attack', type: 'BRUTE_FORCE' },
    { technique: 'T1486', name: 'Ransomware Data Encryption', type: 'RANSOMWARE' },
    { technique: 'T1498', name: 'Network Denial of Service', type: 'DDOS' },
    { technique: 'T1566', name: 'Spear Phishing Campaign', type: 'PHISHING' },
    { technique: 'T1059', name: 'Command & Scripting Execution', type: 'MALWARE' },
    { technique: 'T1078', name: 'Valid Account Compromise', type: 'APT' },
    { technique: 'T1203', name: 'Exploitation for Client Execution', type: 'APT' },
    { technique: 'T1071', name: 'Application Layer C2 Protocol', type: 'BOTNET' },
    { technique: 'T1562', name: 'Impair Defenses', type: 'APT' },
];

const THREAT_ACTORS = [
    'APT-KE-LAZARUS',
    'CHARMING_KITTEN',
    'COBALT_SPIDER',
    'PHANTOM_PANDA',
    'MACHETE_GROUP',
    'UNKNOWN_STATE_ACTOR',
    'HACKTIVISM_COLLECTIVE',
    'ORGANIZED_CYBER_CRIME',
];

const SOURCE_COUNTRIES = [
    { country: 'China', code: 'CN', lat: 39.9, lng: 116.4 },
    { country: 'Russia', code: 'RU', lat: 55.7, lng: 37.6 },
    { country: 'Iran', code: 'IR', lat: 35.7, lng: 51.4 },
    { country: 'North Korea', code: 'KP', lat: 39.0, lng: 125.7 },
    { country: 'Nigeria', code: 'NG', lat: 9.0, lng: 7.5 },
    { country: 'Unknown (TOR)', code: 'XX', lat: 0, lng: 0 },
    { country: 'Brazil', code: 'BR', lat: -15.8, lng: -47.9 },
    { country: 'Turkey', code: 'TR', lat: 39.9, lng: 32.9 },
];

const KENYA_LOCATIONS = [
    { name: 'Nairobi CBD', lat: -1.2864, lng: 36.8172 },
    { name: 'Westlands', lat: -1.2672, lng: 36.8115 },
    { name: 'Mombasa', lat: -4.0435, lng: 39.6682 },
    { name: 'Konza Technopolis', lat: -1.7417, lng: 37.1168 },
    { name: 'Kisumu', lat: -0.0917, lng: 34.7680 },
    { name: 'Eldoret', lat: 0.5143, lng: 35.2698 },
    { name: 'Thika', lat: -1.0396, lng: 37.0833 },
    { name: 'Nakuru', lat: -0.3031, lng: 36.0800 },
];

function generateRandomIP(): string {
    const prefixes = ['41.89', '196.201', '154.159', '185.220', '103.252', '45.33'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    return `${prefix}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

function generateThreatEvent() {
    const target = KENYA_CNI_TARGETS[Math.floor(Math.random() * KENYA_CNI_TARGETS.length)];
    const attack = ATTACK_VECTORS[Math.floor(Math.random() * ATTACK_VECTORS.length)];
    const source = SOURCE_COUNTRIES[Math.floor(Math.random() * SOURCE_COUNTRIES.length)];
    const location = KENYA_LOCATIONS[Math.floor(Math.random() * KENYA_LOCATIONS.length)];
    const actor = THREAT_ACTORS[Math.floor(Math.random() * THREAT_ACTORS.length)];

    // Weight severity — more frequent LOW/MEDIUM, rare CRITICAL
    const sevRoll = Math.random();
    const severity = sevRoll < 0.05 ? 'CRITICAL' : sevRoll < 0.20 ? 'HIGH' : sevRoll < 0.55 ? 'MEDIUM' : 'LOW';

    const riskScore = severity === 'CRITICAL' ? 85 + Math.floor(Math.random() * 16)
        : severity === 'HIGH' ? 65 + Math.floor(Math.random() * 20)
        : severity === 'MEDIUM' ? 35 + Math.floor(Math.random() * 30)
        : 5 + Math.floor(Math.random() * 30);

    return {
        id: `LIVE-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        target,
        attackVector: attack.technique,
        attackName: attack.name,
        attackType: attack.type,
        severity,
        riskScore,
        sourceIP: generateRandomIP(),
        sourceCountry: source.country,
        sourceCode: source.code,
        sourceCoords: { lat: source.lat, lng: source.lng },
        targetLocation: location.name,
        targetCoords: { lat: location.lat, lng: location.lng },
        threatActor: actor,
        confidence: 65 + Math.floor(Math.random() * 30),
        status: severity === 'CRITICAL' ? 'SOAR_AUTO_CONTAINED' : severity === 'HIGH' ? 'INVESTIGATING' : 'MONITORING',
        soarTriggered: severity === 'CRITICAL',
        payloadSize: Math.floor(Math.random() * 10000) + 100,
        protocol: ['TCP', 'UDP', 'HTTPS', 'DNS', 'ICMP'][Math.floor(Math.random() * 5)],
    };
}

export async function GET() {
    // Generate a batch of 3-5 live events (simulating a 5-second window)
    const batchSize = 3 + Math.floor(Math.random() * 3);
    const events = Array.from({ length: batchSize }, () => generateThreatEvent());

    // Add slight time offset to each event
    events.forEach((event, i) => {
        const offset = new Date(Date.now() - i * 1200);
        event.timestamp = offset.toISOString();
    });

    return NextResponse.json({
        success: true,
        feedType: 'NCTIRS_LIVE_THREAT_INTELLIGENCE',
        generatedAt: new Date().toISOString(),
        eventCount: events.length,
        events,
        stats: {
            critical: events.filter(e => e.severity === 'CRITICAL').length,
            high: events.filter(e => e.severity === 'HIGH').length,
            medium: events.filter(e => e.severity === 'MEDIUM').length,
            low: events.filter(e => e.severity === 'LOW').length,
            soarTriggered: events.filter(e => e.soarTriggered).length,
        },
    });
}
