import { prisma } from '../src/lib/db';

// CIC-IDS2017 Attack Types Mapped to Kenyan Context
const ATTACK_TYPES = [
    { type: 'DDoS', vector: 'T1498: Network Denial of Service', severity: 'CRITICAL', targets: ['IFMIS Server (Treasury)', 'KRA iTax Portal', 'KENET Backbone'] },
    { type: 'Ransomware', vector: 'T1486: Data Encrypted for Impact', severity: 'CRITICAL', targets: ['Kenyatta National Hospital Data Storage', 'Nairobi County Revenue System'] },
    { type: 'Web Attack - Brute Force', vector: 'T1110: Brute Force', severity: 'HIGH', targets: ['e-Citizen Login Gateway', 'KPLC Prepaid Token System'] },
    { type: 'Botnet', vector: 'T1090: Proxy', severity: 'MEDIUM', targets: ['Safaricom 5G IoT Devices', 'Government WiFi Network'] },
    { type: 'Infiltration', vector: 'T1190: Exploit Public-Facing Application', severity: 'HIGH', targets: ['Ministry of Interior DB', 'NTSA TIMS Portal'] },
    { type: 'PortScan', vector: 'T1046: Network Service Discovery', severity: 'LOW', targets: ['CBC Infrastructure', 'Mombasa Port Authority'] }
];

const LOCATIONS = [
    { name: 'Nairobi CBD', lat: -1.2921, lng: 36.8219 },
    { name: 'Konza Technopolis', lat: -1.6934, lng: 37.1855 },
    { name: 'Mombasa Port', lat: -4.0435, lng: 39.6682 },
    { name: 'Kisumu Hub', lat: -0.0917, lng: 34.7680 },
    { name: 'Eldoret Data Center', lat: 0.5143, lng: 35.2698 },
];

const COUNTIES = ['Nairobi', 'Mombasa', 'Kisumu', 'Uasin Gishu', 'Machakos'];
const STATUSES = ['ACTIVE', 'INVESTIGATING', 'CONTAINED', 'RESOLVED'];

function generateRandomIP() {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

// Retry helper for transient network errors (ECONNRESET, etc.)
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (err: any) {
            const isTransient = err?.cause?.code === 'ECONNRESET' || err?.message?.includes('fetch failed');
            if (isTransient && attempt < maxRetries) {
                const delay = attempt * 2000; // 2s, 4s, 6s backoff
                process.stdout.write(`\n⚠️  Network error, retrying in ${delay / 1000}s (attempt ${attempt}/${maxRetries})...\n`);
                await new Promise(r => setTimeout(r, delay));
            } else {
                throw err;
            }
        }
    }
    throw new Error('Exhausted retries');
}

async function main() {
    console.log("🧹 Clearing old mock data...");
    await withRetry(() => prisma.threat.deleteMany({}));
    await withRetry(() => prisma.incident.deleteMany({}));

    console.log("🚀 Generating Golden Dataset (Synthesized CIC-IDS2017 + Kenya Context)...");

    const TOTAL_RECORDS = 2500; // Generating 2.5k realistic rows
    let created = 0;

    // Batching to avoid SQLite overload
    const batchSize = 100;
    
    for (let i = 0; i < TOTAL_RECORDS; i += batchSize) {
        const incidentsToCreate = [];
        
        for (let j = 0; j < batchSize && (i + j) < TOTAL_RECORDS; j++) {
            const attack = ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)];
            const loc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
            const target = attack.targets[Math.floor(Math.random() * attack.targets.length)];
            
            // Generate some random jitter for coordinates so they don't overlap perfectly
            const latJitter = (Math.random() - 0.5) * 0.05;
            const lngJitter = (Math.random() - 0.5) * 0.05;

            // Generate realistic dates over the last 30 days
            const daysAgo = Math.floor(Math.random() * 30);
            const dateDetected = new Date();
            dateDetected.setDate(dateDetected.getDate() - daysAgo);
            
            incidentsToCreate.push({
                title: `${attack.type} detected targeting ${target}`,
                description: `Anomaly detected matching CIC-IDS2017 profiles for ${attack.type}. Source IP shows signs of automated exploitation via ${attack.vector}.`,
                type: 'CYBER_ATTACK',
                severity: attack.severity,
                status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
                location: loc.name,
                latitude: loc.lat + latJitter,
                longitude: loc.lng + lngJitter,
                county: COUNTIES[Math.floor(Math.random() * COUNTIES.length)],
                targetAsset: target,
                attackVector: attack.vector,
                indicators: JSON.stringify({ src_ip: generateRandomIP(), payload_size: Math.floor(Math.random() * 5000), protocol: Math.random() > 0.5 ? 'TCP' : 'UDP' }),
                detectedAt: dateDetected,
                createdAt: dateDetected
            });
        }

        // Insert batch with retry
        for (const data of incidentsToCreate) {
            const incident = await withRetry(() => prisma.incident.create({ data }));
            
            // Link a threat 60% of the time based on MITRE
            if (Math.random() > 0.4) {
                await withRetry(() => prisma.threat.create({
                    data: {
                        name: `${data.attackVector.split(':')[0]} Threat Actor`,
                        type: attackTypeFromVector(data.attackVector),
                        severity: data.severity,
                        source: Math.random() > 0.5 ? 'Internal (Compromised Node)' : 'External (Unknown APT)',
                        targetSector: 'GOVERNMENT',
                        confidence: 0.75 + (Math.random() * 0.2), // 75-95%
                        mitreId: data.attackVector.split(':')[0],
                        incidentId: incident.id
                    }
                }));
            }
        }
        
        created += incidentsToCreate.length;
        process.stdout.write(`\r✅ Generated ${created}/${TOTAL_RECORDS} records...`);
    }

    console.log("\n🎉 Golden Dataset successfully seeded into the database.");
}

function attackTypeFromVector(vector) {
    if (vector.includes('T1498')) return 'DDOS';
    if (vector.includes('T1486')) return 'RANSOMWARE';
    if (vector.includes('T1090')) return 'BOTNET';
    if (vector.includes('T1110')) return 'BRUTE_FORCE';
    return 'APT';
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
