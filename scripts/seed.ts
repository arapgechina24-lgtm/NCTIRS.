// ═══════════════════════════════════════════════════════════════════════════
// NCTIRS Database Seed Script — Massive Realistic Dataset
// Run with: npx tsx scripts/seed.ts
// ═══════════════════════════════════════════════════════════════════════════
import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import bcrypt from 'bcryptjs'
import { createHash } from 'crypto'

// ── Database Connection ─────────────────────────────────────────────────────
const url = process.env.DATABASE_URL || 'file:./prisma/dev.db'
const authToken = process.env.TURSO_AUTH_TOKEN

const adapter = new PrismaLibSql({
    url,
    ...(authToken ? { authToken } : {}),
})
const prisma = new PrismaClient({ adapter })

// ── Helpers ─────────────────────────────────────────────────────────────────
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const pastDate = (daysBack: number) => new Date(Date.now() - Math.random() * daysBack * 86400000)

const SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
const STATUSES = ['ACTIVE', 'INVESTIGATING', 'CONTAINED', 'RESOLVED']
const INCIDENT_TYPES = ['CYBER_ATTACK', 'TERROR_THREAT', 'FRAUD', 'ESPIONAGE', 'INSIDER_THREAT', 'DATA_BREACH', 'RANSOMWARE', 'DDOS']
const THREAT_TYPES = ['APT', 'RANSOMWARE', 'PHISHING', 'DDOS', 'MALWARE', 'BOTNET', 'INSIDER', 'SUPPLY_CHAIN']
const SECTORS = ['GOVERNMENT', 'FINANCE', 'TELECOM', 'ENERGY', 'HEALTH', 'TRANSPORT', 'EDUCATION', 'DEFENSE']
const RESPONSE_TYPES = ['AIR_GAP', 'BLOCK_IP', 'ISOLATE', 'ALERT', 'CREDENTIAL_LOCKDOWN', 'FORENSIC_CAPTURE']
const SURVEILLANCE_TYPES = ['CCTV', 'ANPR', 'DRONE', 'NETWORK_TAP', 'SIGINT']
const ACTIONS = ['LOGIN', 'VIEW', 'CREATE', 'UPDATE', 'RESPONSE', 'EXPORT', 'SEARCH']
const RESOURCES = ['incidents', 'threats', 'reports', 'users', 'dashboard', 'soar']
const ACTORS = ['APT-KE-LAZARUS', 'CHARMING_KITTEN', 'COBALT_SPIDER', 'PHANTOM_PANDA', 'MACHETE_GROUP', 'SCATTERED_SPIDER', 'TURLA_GROUP', 'WIZARD_SPIDER', 'SANDWORM_TEAM', 'FANCY_BEAR']
const SOURCES = ['China', 'Russia', 'Iran', 'North Korea', 'Nigeria', 'Unknown (TOR)', 'Brazil', 'Turkey']

const COUNTIES = [
    { name: 'Nairobi', lat: -1.2921, lng: 36.8219 }, { name: 'Mombasa', lat: -4.0435, lng: 39.6682 },
    { name: 'Kisumu', lat: -0.0917, lng: 34.7680 }, { name: 'Nakuru', lat: -0.3031, lng: 36.0800 },
    { name: 'Eldoret', lat: 0.5143, lng: 35.2698 }, { name: 'Thika', lat: -1.0396, lng: 37.0833 },
    { name: 'Garissa', lat: -0.4532, lng: 39.6461 }, { name: 'Lamu', lat: -2.2717, lng: 40.9020 },
]

const LOCATIONS = [
    'Nairobi CBD', 'Westlands', 'Upper Hill', 'Industrial Area', 'Mombasa Port',
    'Konza Technopolis', 'JKIA Terminal 1', 'Kilimani', 'Karen', 'Langata',
]

const CNI = [
    'IFMIS — National Treasury Portal', 'KRA iTax Revenue System', 'eCitizen Service Platform',
    'Safaricom M-Pesa Core', 'Kenya Power SCADA Grid', 'JKIA Air Traffic Control',
    'Port of Mombasa Logistics Hub', 'Central Bank RTGS System', 'Huduma Namba Identity Registry',
    'KNH Electronic Medical Records', 'SGR Ticketing & Operations', 'NTSA Motor Vehicle Registry',
    'KENET Academic Backbone', 'NSSF Pension Database', 'Kenya Pipeline SCADA',
    'Equity Bank Core Banking', 'KCB Mobile Banking Gateway', 'KEMSA Drug Supply Chain',
    'Immigration e-Passport System', 'Parliament Hansard System', 'Judiciary Case Management',
    'KNEC Exam Results Portal', 'IEBC Voter Registration DB', 'NYS Payroll System',
]

const MITRE = [
    { id: 'T1190', name: 'Exploit Public-Facing Application' }, { id: 'T1110', name: 'Brute Force' },
    { id: 'T1486', name: 'Data Encrypted for Impact' }, { id: 'T1498', name: 'Network Denial of Service' },
    { id: 'T1566', name: 'Spear Phishing' }, { id: 'T1059', name: 'Command & Scripting Execution' },
    { id: 'T1078', name: 'Valid Account Compromise' }, { id: 'T1071', name: 'Application Layer C2' },
    { id: 'T1562', name: 'Impair Defenses' }, { id: 'T1048', name: 'Exfiltration Over Alt Protocol' },
]

const TITLES: Record<string, string[]> = {
    CYBER_ATTACK: ['APT Detected on IFMIS Servers', 'SQL Injection on eCitizen', 'Zero-Day on KPLC SCADA', 'Credential Stuffing on Civil Service Portal', 'RCE Attempt on CBK RTGS', 'XSS Attack on NTSA Portal', 'API Exploitation on M-Pesa Gateway', 'Watering Hole on Procurement Portal'],
    RANSOMWARE: ['LockBit 3.0 in KNH Network', 'BlackCat Targeting County Systems', 'ALPHV Campaign on NSSF', 'Royal Ransomware in Judiciary', 'Conti Encrypting KEMSA Data'],
    DDOS: ['Volumetric DDoS on KRA iTax (45Gbps)', 'DNS Amplification on KENET', 'Layer 7 DDoS on eCitizen Auth', 'SYN Flood on CBK Gateway', 'HTTP Flood on IEBC Portal'],
    TERROR_THREAT: ['Encrypted Comms from Al-Shabaab Cell', 'Radicalization Campaign — Coast', 'Terror Financing via Mobile Money', 'Suspicious Travel — Garissa Corridor'],
    FRAUD: ['SIM Swap Ring — Equity Bank', 'BEC — Treasury Wire Transfer', 'Deepfake Audio CBK Impersonation', 'Crypto Laundering via LocalBitcoins'],
    ESPIONAGE: ['State-Sponsored Espionage on MoD', 'Diplomatic Cable Interception Attempt', 'Supply Chain Compromise — Govt Vendor'],
    DATA_BREACH: ['Huduma Namba — 2.3M Records Exfiltrated', 'NHIF Records Exposed via API', 'KRA Data on Dark Web', 'KUCCPS Admission Records Breach'],
    INSIDER_THREAT: ['Unauthorized Access by Former NIS Employee', 'Privileged Abuse in Immigration Systems', 'USB Exfiltration at Parliament IT'],
}

const THREAT_NAMES: Record<string, string[]> = {
    APT: ['SILENT_CHEETAH', 'PHANTOM_PANGA', 'COASTAL_VIPER', 'RIFT_VALLEY_GHOST', 'SAVANNA_HAWK'],
    RANSOMWARE: ['KenyaLocker', 'SwahiliCrypt', 'MaasaiRansom', 'TuskEncrypt', 'HarambeeLock'],
    PHISHING: ['FakeKRA', 'eCitizen-Spoof', 'M-Pesa-Scam', 'NHIF-Lure', 'CBK-Phish'],
    DDOS: ['BotStorm-KE', 'FloodGate-254', 'PulseWave', 'ThunderDDoS', 'MegaFlood'],
    MALWARE: ['SafariRAT', 'NairobiStealer', 'KiswahiliWorm', 'MatuLoader', 'BodaBot'],
    BOTNET: ['MombasaNet', 'LakeBotnet', 'WildebeestHerd', 'LocustSwarm', 'TsavoGrid'],
    INSIDER: ['Insider-PRIV-ESC', 'DataMule-GovKE', 'SlowLeak-Treasury'],
    SUPPLY_CHAIN: ['TaintedUpdate-SAP', 'CompromisedVendor', 'PoisonedPatch'],
}

const FEED_LOCATIONS = [
    'JKIA Terminal 1 Gate A', 'JKIA Terminal 2 Arrivals', 'Mombasa Port Entry',
    'Malaba Border Post', 'Busia Border Post', 'Namanga Border',
    'Nairobi CBD Kenyatta Ave', 'Nairobi CBD Moi Ave', 'Westlands Waiyaki Way',
    'Upper Hill Treasury', 'Kilimani Embassy Row', 'Karen Shopping Centre',
    'Mombasa Likoni Ferry', 'Kisumu Airport Road', 'Nakuru CBD',
    'Eldoret Bypass', 'Thika Superhighway Toll', 'SGR Nairobi Terminus',
    'SGR Mombasa Terminus', 'Konza Technopolis Gate', 'Parliament Buildings',
    'State House Perimeter', 'Supreme Court', 'KICC Helipad',
    'Wilson Airport Hangar', 'Athi River Industrial', 'EPZ Kitengela',
    'Turkana Oil Fields', 'Lamu Port Jetty', 'Garissa Camp Perimeter',
    'Nanyuki Barracks Gate', 'Laikipia Ranch Aerial', 'Mt Kenya Park Gate',
    'Maasai Mara Gate', 'Amboseli Park', 'Tsavo East Gate',
    'Naivasha Flower Farm', 'Nyeri Town Centre', 'Machakos Junction',
    'Meru Town', 'Embu Market', 'Kakamega Forest', 'Bungoma CBD',
    'Migori Border', 'Homa Bay Pier', 'Voi Junction', 'Nandi Hills',
    'Kericho Tea Estates', 'Kajiado Town', 'Narok Town',
]

const USERS_DATA = [
    { email: 'admin@nis.go.ke', name: 'System Administrator', role: 'L4', agency: 'NIS', dept: 'Cyber Division', cl: 4 },
    { email: 'kibara@dci.go.ke', name: 'Commander Kibara', role: 'L3', agency: 'DCI', dept: 'Counter-Terrorism', cl: 3 },
    { email: 'wanjiku@nis.go.ke', name: 'Analyst Wanjiku', role: 'L2', agency: 'NIS', dept: 'Signals Intel', cl: 2 },
    { email: 'otieno@cak.go.ke', name: 'Eng. Otieno', role: 'L2', agency: 'CAK', dept: 'Critical Infrastructure', cl: 2 },
    { email: 'muthoni@cbk.go.ke', name: 'Dr. Muthoni', role: 'L3', agency: 'CBK', dept: 'Fraud Unit', cl: 3 },
    { email: 'kamau@kps.go.ke', name: 'Inspector Kamau', role: 'L2', agency: 'KPS', dept: 'SOC Operations', cl: 2 },
    { email: 'njeri@ncfc.go.ke', name: 'Analyst Njeri', role: 'L1', agency: 'NCFC', dept: 'Cyber Division', cl: 1 },
    { email: 'ochieng@nis.go.ke', name: 'Capt. Ochieng', role: 'L3', agency: 'NIS', dept: 'Counter-Terrorism', cl: 3 },
]

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
    console.log('═══════════════════════════════════════════════════════')
    console.log('  NCTIRS DATABASE SEEDER — Kenya Cyber Threat Intel')
    console.log('═══════════════════════════════════════════════════════')
    console.log(`  DB: ${url}\n`)

    // 1. Users
    console.log('👥 Creating operators...')
    const pw = await bcrypt.hash('admin123', 12)
    const userIds: string[] = []
    for (const u of USERS_DATA) {
        const user = await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: { email: u.email, name: u.name, password: pw, role: u.role, agency: u.agency, department: u.dept, clearanceLevel: u.cl },
        })
        userIds.push(user.id)
    }
    console.log(`   ✓ ${userIds.length} operators`)

    // 2. Incidents (120)
    console.log('🚨 Generating 120 incidents...')
    const incidentIds: string[] = []
    for (let i = 0; i < 120; i++) {
        const type = pick(INCIDENT_TYPES)
        const titles = TITLES[type] || TITLES['CYBER_ATTACK']
        const county = pick(COUNTIES)
        const mitre = pick(MITRE)
        const inc = await prisma.incident.create({
            data: {
                title: pick(titles),
                description: `AI-correlated ${type.replace(/_/g, ' ').toLowerCase()} targeting ${pick(CNI)}. MITRE ${mitre.id} (${mitre.name}). Actor: ${pick(ACTORS)}, origin: ${pick(SOURCES)}. ${rand(2, 15)} IOCs.`,
                type, severity: pick(SEVERITIES), status: pick(STATUSES),
                location: pick(LOCATIONS),
                latitude: county.lat + (Math.random() - 0.5) * 0.2,
                longitude: county.lng + (Math.random() - 0.5) * 0.2,
                county: county.name, targetAsset: pick(CNI),
                attackVector: `${mitre.id}: ${mitre.name}`,
                indicators: JSON.stringify({ source_ip: `${rand(1,223)}.${rand(0,255)}.${rand(0,255)}.${rand(1,254)}`, source_ips: Array.from({length: rand(1,4)}, () => `${rand(1,223)}.${rand(0,255)}.${rand(0,255)}.${rand(1,254)}`), payload_size: rand(100, 15000), hashes: [createHash('sha256').update(`ioc-${i}`).digest('hex')] }),
                createdById: pick(userIds), createdAt: pastDate(90), detectedAt: pastDate(90),
                resolvedAt: Math.random() > 0.5 ? pastDate(80) : null,
            },
        })
        incidentIds.push(inc.id)
    }
    console.log(`   ✓ ${incidentIds.length} incidents`)

    // 3. Threats (200)
    console.log('🛡️  Generating 200 threats...')
    for (let i = 0; i < 200; i++) {
        const type = pick(THREAT_TYPES)
        const names = THREAT_NAMES[type] || THREAT_NAMES['MALWARE']
        const mitre = pick(MITRE)
        await prisma.threat.create({
            data: {
                name: `${pick(names)}-${rand(100,999)}`,
                type, severity: pick(SEVERITIES), source: pick(SOURCES), targetSector: pick(SECTORS),
                confidence: parseFloat((0.6 + Math.random() * 0.39).toFixed(2)),
                mitreId: mitre.id,
                description: `${type}: ${mitre.name}. Actor: ${pick(ACTORS)}. Targeting ${pick(SECTORS).toLowerCase()} sector.`,
                indicators: JSON.stringify({ hashes: [createHash('md5').update(`t-${i}`).digest('hex')], ips: [`${rand(1,223)}.${rand(0,255)}.${rand(0,255)}.${rand(1,254)}`] }),
                incidentId: Math.random() > 0.3 ? pick(incidentIds) : null,
                createdAt: pastDate(90),
            },
        })
    }
    console.log('   ✓ 200 threats')

    // 4. Responses (80)
    console.log('⚡ Generating 80 SOAR responses...')
    for (let i = 0; i < 80; i++) {
        const done = Math.random() > 0.3
        await prisma.response.create({
            data: {
                type: pick(RESPONSE_TYPES), status: done ? 'COMPLETED' : pick(['PENDING', 'EXECUTING', 'FAILED']),
                target: pick(CNI), protocol: `${pick(['CONTAINMENT','PERIMETER','FORENSIC','LOCKDOWN'])}_${pick(['ALPHA','BRAVO','CHARLIE'])}`,
                result: done ? JSON.stringify({ success: true, ms: rand(50,3000) }) : null,
                executedAt: pastDate(60), completedAt: done ? pastDate(59) : null,
                incidentId: pick(incidentIds),
            },
        })
    }
    console.log('   ✓ 80 responses')

    // 5. Audit Logs (300, chained)
    console.log('📜 Generating 300 audit logs...')
    let prevHash: string | null = null
    for (let i = 0; i < 300; i++) {
        const action = pick(ACTIONS)
        const ts = Date.now() - (300 - i) * rand(60000, 600000)
        const hash = createHash('sha256').update(`${action}-${ts}-${prevHash || 'genesis'}`).digest('hex')
        await prisma.auditLog.create({
            data: {
                action, resource: pick(RESOURCES), resourceId: Math.random() > 0.3 ? pick(incidentIds) : null,
                details: JSON.stringify({ action, severity: pick(SEVERITIES) }),
                ipAddress: `10.${rand(0,255)}.${rand(0,255)}.${rand(1,254)}`, userAgent: 'NCTIRS-Console/2.0',
                hash, previousHash: prevHash, userId: pick(userIds),
                incidentId: action === 'RESPONSE' ? pick(incidentIds) : null,
                createdAt: new Date(ts),
            },
        })
        prevHash = hash
    }
    console.log('   ✓ 300 audit logs')

    // 6. Surveillance (50)
    console.log('📡 Generating 50 surveillance feeds...')
    for (const loc of FEED_LOCATIONS) {
        const c = pick(COUNTIES)
        await prisma.surveillanceFeed.create({
            data: {
                location: loc, type: pick(SURVEILLANCE_TYPES),
                status: Math.random() > 0.15 ? 'ACTIVE' : 'OFFLINE',
                latitude: c.lat + (Math.random()-0.5)*0.3, longitude: c.lng + (Math.random()-0.5)*0.3,
                streamUrl: `rtsp://cam-${rand(1000,9999)}.nctirs.ke/${loc.replace(/\s+/g,'-').toLowerCase()}`,
            },
        })
    }
    console.log(`   ✓ ${FEED_LOCATIONS.length} feeds`)

    // 7. Reports (25)
    console.log('📄 Generating 25 NC4 reports...')
    for (let i = 0; i < 25; i++) {
        await prisma.report.create({
            data: {
                type: pick(['NC4','INCIDENT','THREAT_INTEL']), title: `NC4 Report — ${pick(CNI)} Incident`,
                content: JSON.stringify({ target: pick(CNI), action: pick(RESPONSE_TYPES), compliance: { act: 'CMCA_2018', odpc: true } }),
                classification: pick(['CONFIDENTIAL','SECRET','TOP SECRET']),
                status: pick(['DRAFT','SUBMITTED','APPROVED']),
                hash: createHash('sha256').update(`rpt-${i}-${Date.now()}`).digest('hex'),
                createdById: pick(userIds), createdAt: pastDate(60),
                submittedAt: Math.random() > 0.4 ? pastDate(55) : null,
            },
        })
    }
    console.log('   ✓ 25 reports')

    // Summary
    console.log('\n═══════════════════════════════════════════════════════')
    console.log('  ✅ SEED COMPLETE — 783 records')
    console.log('  👥8 users  🚨120 incidents  🛡️200 threats')
    console.log('  ⚡80 responses  📜300 audit logs  📡50 feeds  📄25 reports')
    console.log('  Demo login: admin@nis.go.ke / admin123')
    console.log('═══════════════════════════════════════════════════════')
}

main()
    .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1) })
    .finally(() => prisma.$disconnect())
