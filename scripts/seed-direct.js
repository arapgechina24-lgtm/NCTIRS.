// Direct libsql seed — no Prisma needed
const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');
const { createHash, randomUUID } = require('crypto');

const db = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const cuid = () => 'c' + randomUUID().replace(/-/g, '').slice(0, 24);
const pastISO = (days) => new Date(Date.now() - Math.random() * days * 86400000).toISOString();

const SEVERITIES = ['CRITICAL','HIGH','MEDIUM','LOW'];
const STATUSES = ['ACTIVE','INVESTIGATING','CONTAINED','RESOLVED'];
const INC_TYPES = ['CYBER_ATTACK','TERROR_THREAT','FRAUD','ESPIONAGE','INSIDER_THREAT','DATA_BREACH','RANSOMWARE','DDOS'];
const THR_TYPES = ['APT','RANSOMWARE','PHISHING','DDOS','MALWARE','BOTNET','INSIDER','SUPPLY_CHAIN'];
const SECTORS = ['GOVERNMENT','FINANCE','TELECOM','ENERGY','HEALTH','TRANSPORT','EDUCATION','DEFENSE'];
const RESP_TYPES = ['AIR_GAP','BLOCK_IP','ISOLATE','ALERT','CREDENTIAL_LOCKDOWN','FORENSIC_CAPTURE'];
const SURV_TYPES = ['CCTV','ANPR','DRONE','NETWORK_TAP','SIGINT'];
const ACTORS = ['APT-KE-LAZARUS','CHARMING_KITTEN','COBALT_SPIDER','PHANTOM_PANDA','SCATTERED_SPIDER','TURLA_GROUP','WIZARD_SPIDER','SANDWORM_TEAM','FANCY_BEAR','COZY_BEAR'];
const SOURCES = ['China','Russia','Iran','North Korea','Nigeria','Unknown (TOR)','Brazil','Turkey'];
const COUNTIES = [
    {n:'Nairobi',lat:-1.2921,lng:36.8219},{n:'Mombasa',lat:-4.0435,lng:39.6682},
    {n:'Kisumu',lat:-0.0917,lng:34.7680},{n:'Nakuru',lat:-0.3031,lng:36.0800},
    {n:'Eldoret',lat:0.5143,lng:35.2698},{n:'Thika',lat:-1.0396,lng:37.0833},
    {n:'Garissa',lat:-0.4532,lng:39.6461},{n:'Lamu',lat:-2.2717,lng:40.9020},
];
const LOCS = ['Nairobi CBD','Westlands','Upper Hill','Industrial Area','Mombasa Port','Konza Technopolis','JKIA Terminal 1','Kilimani','Karen','Langata'];
const CNI = [
    'IFMIS — National Treasury Portal','KRA iTax Revenue System','eCitizen Service Platform',
    'Safaricom M-Pesa Core','Kenya Power SCADA Grid','JKIA Air Traffic Control',
    'Port of Mombasa Logistics Hub','Central Bank RTGS System','Huduma Namba Identity Registry',
    'KNH Electronic Medical Records','SGR Ticketing & Operations','NTSA Motor Vehicle Registry',
    'KENET Academic Backbone','NSSF Pension Database','Kenya Pipeline SCADA',
    'Equity Bank Core Banking','KCB Mobile Banking Gateway','KEMSA Drug Supply Chain',
    'Immigration e-Passport System','Parliament Hansard System','Judiciary Case Management',
    'KNEC Exam Results Portal','IEBC Voter Registration DB','NYS Payroll System',
];
const MITRE = [
    {id:'T1190',nm:'Exploit Public-Facing App'},{id:'T1110',nm:'Brute Force'},{id:'T1486',nm:'Data Encrypted for Impact'},
    {id:'T1498',nm:'Network DoS'},{id:'T1566',nm:'Spear Phishing'},{id:'T1059',nm:'Command Execution'},
    {id:'T1078',nm:'Valid Account Compromise'},{id:'T1071',nm:'App Layer C2'},{id:'T1562',nm:'Impair Defenses'},
    {id:'T1048',nm:'Exfil Over Alt Protocol'},{id:'T1053',nm:'Scheduled Task'},{id:'T1098',nm:'Account Manipulation'},
];
const TITLES = {
    CYBER_ATTACK:['APT Detected on IFMIS Servers','SQL Injection on eCitizen','Zero-Day on KPLC SCADA','Credential Stuffing on Civil Service Portal','RCE Attempt on CBK RTGS','XSS on NTSA Portal','API Exploit on M-Pesa Gateway','Watering Hole on Procurement Portal'],
    RANSOMWARE:['LockBit 3.0 in KNH Network','BlackCat on County Systems','ALPHV Campaign on NSSF','Royal Ransomware in Judiciary','Conti Encrypting KEMSA Data'],
    DDOS:['Volumetric DDoS on KRA iTax (45Gbps)','DNS Amplification on KENET','Layer 7 DDoS on eCitizen Auth','SYN Flood on CBK Gateway','HTTP Flood on IEBC Portal'],
    TERROR_THREAT:['Encrypted Comms from Al-Shabaab Cell','Radicalization Campaign — Coast','Terror Financing via Mobile Money','Suspicious Travel — Garissa'],
    FRAUD:['SIM Swap Ring — Equity Bank','BEC — Treasury Wire Transfer','Deepfake Audio CBK Impersonation','Crypto Laundering LocalBitcoins'],
    ESPIONAGE:['State-Sponsored Espionage on MoD','Diplomatic Cable Interception','Supply Chain Compromise — Govt Vendor'],
    DATA_BREACH:['Huduma Namba — 2.3M Records Exfiltrated','NHIF Records Exposed via API','KRA Data on Dark Web','KUCCPS Admission Records Breach'],
    INSIDER_THREAT:['Unauthorized Access by Former NIS Employee','Privileged Abuse in Immigration','USB Exfil at Parliament IT'],
};
const THR_NAMES = {
    APT:['SILENT_CHEETAH','PHANTOM_PANGA','COASTAL_VIPER','RIFT_VALLEY_GHOST','SAVANNA_HAWK'],
    RANSOMWARE:['KenyaLocker','SwahiliCrypt','MaasaiRansom','TuskEncrypt','HarambeeLock'],
    PHISHING:['FakeKRA','eCitizen-Spoof','M-Pesa-Scam','NHIF-Lure','CBK-Phish'],
    DDOS:['BotStorm-KE','FloodGate-254','PulseWave','ThunderDDoS','MegaFlood'],
    MALWARE:['SafariRAT','NairobiStealer','KiswahiliWorm','MatuLoader','BodaBot'],
    BOTNET:['MombasaNet','LakeBotnet','WildebeestHerd','LocustSwarm','TsavoGrid'],
    INSIDER:['Insider-PRIV-ESC','DataMule-GovKE','SlowLeak-Treasury'],
    SUPPLY_CHAIN:['TaintedUpdate-SAP','CompromisedVendor','PoisonedPatch'],
};
const FEEDS = [
    'JKIA Terminal 1 Gate A','JKIA Terminal 2 Arrivals','Mombasa Port Entry','Malaba Border Post',
    'Busia Border Post','Namanga Border','Nairobi CBD Kenyatta Ave','Nairobi CBD Moi Ave',
    'Westlands Waiyaki Way','Upper Hill Treasury','Kilimani Embassy Row','Karen Shopping Centre',
    'Mombasa Likoni Ferry','Kisumu Airport Road','Nakuru CBD','Eldoret Bypass',
    'Thika Superhighway Toll','SGR Nairobi Terminus','SGR Mombasa Terminus','Konza Technopolis Gate',
    'Parliament Buildings','State House Perimeter','Supreme Court','KICC Helipad',
    'Wilson Airport Hangar','Athi River Industrial','EPZ Kitengela','Turkana Oil Fields',
    'Lamu Port Jetty','Garissa Camp Perimeter','Nanyuki Barracks Gate','Laikipia Ranch Aerial',
    'Mt Kenya Park Gate','Maasai Mara Gate','Amboseli Park','Tsavo East Gate',
    'Naivasha Flower Farm','Nyeri Town Centre','Machakos Junction','Meru Town',
    'Embu Market','Kakamega Forest','Bungoma CBD','Migori Border',
    'Homa Bay Pier','Voi Junction','Nandi Hills','Kericho Tea Estates','Kajiado Town','Narok Town',
];

async function main() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  NCTIRS DATABASE SEEDER (Direct LibSQL)');
    console.log('═══════════════════════════════════════════════════════\n');

    // Test connection
    await db.execute('SELECT 1');
    console.log('✓ Database connected\n');

    // 1. Users
    console.log('👥 Creating 8 operators...');
    const pw = await bcrypt.hash('admin123', 12);
    const users = [
        {email:'admin@nis.go.ke',name:'System Administrator',role:'L4',agency:'NIS',dept:'Cyber Division',cl:4},
        {email:'kibara@dci.go.ke',name:'Commander Kibara',role:'L3',agency:'DCI',dept:'Counter-Terrorism',cl:3},
        {email:'wanjiku@nis.go.ke',name:'Analyst Wanjiku',role:'L2',agency:'NIS',dept:'Signals Intel',cl:2},
        {email:'otieno@cak.go.ke',name:'Eng. Otieno',role:'L2',agency:'CAK',dept:'Critical Infrastructure',cl:2},
        {email:'muthoni@cbk.go.ke',name:'Dr. Muthoni',role:'L3',agency:'CBK',dept:'Fraud Unit',cl:3},
        {email:'kamau@kps.go.ke',name:'Inspector Kamau',role:'L2',agency:'KPS',dept:'SOC Operations',cl:2},
        {email:'njeri@ncfc.go.ke',name:'Analyst Njeri',role:'L1',agency:'NCFC',dept:'Cyber Division',cl:1},
        {email:'ochieng@nis.go.ke',name:'Capt. Ochieng',role:'L3',agency:'NIS',dept:'Counter-Terrorism',cl:3},
    ];
    const userIds = [];
    const now = new Date().toISOString();
    for (const u of users) {
        const id = cuid();
        try {
            await db.execute({ sql: `INSERT INTO User (id, email, name, password, role, agency, department, clearanceLevel, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`, args: [id, u.email, u.name, pw, u.role, u.agency, u.dept, u.cl, now, now] });
            userIds.push(id);
        } catch (e) {
            // User exists, fetch their id
            const r = await db.execute({ sql: `SELECT id FROM User WHERE email = ?`, args: [u.email] });
            if (r.rows.length) userIds.push(r.rows[0].id);
        }
    }
    console.log(`   ✓ ${userIds.length} operators\n`);

    // 2. Incidents (120)
    console.log('🚨 Generating 120 incidents...');
    const incIds = [];
    for (let i = 0; i < 120; i++) {
        const id = cuid();
        const type = pick(INC_TYPES);
        const titles = TITLES[type] || TITLES['CYBER_ATTACK'];
        const county = pick(COUNTIES);
        const mitre = pick(MITRE);
        const sev = pick(SEVERITIES);
        const created = pastISO(90);
        await db.execute({
            sql: `INSERT INTO Incident (id, title, description, type, severity, status, location, latitude, longitude, county, targetAsset, attackVector, indicators, createdAt, updatedAt, detectedAt, resolvedAt, createdById) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            args: [
                id, pick(titles),
                `AI-correlated ${type.replace(/_/g,' ').toLowerCase()} targeting ${pick(CNI)}. MITRE ${mitre.id} (${mitre.nm}). Actor: ${pick(ACTORS)}, origin: ${pick(SOURCES)}. ${rand(2,15)} IOCs.`,
                type, sev, pick(STATUSES), pick(LOCS),
                county.lat + (Math.random()-0.5)*0.2, county.lng + (Math.random()-0.5)*0.2,
                county.n, pick(CNI), `${mitre.id}: ${mitre.nm}`,
                JSON.stringify({source_ip:`${rand(1,223)}.${rand(0,255)}.${rand(0,255)}.${rand(1,254)}`,payload_size:rand(100,15000),hashes:[createHash('sha256').update(`ioc-${i}`).digest('hex')]}),
                created, created, created,
                Math.random()>0.5 ? pastISO(80) : null,
                pick(userIds),
            ],
        });
        incIds.push(id);
        if ((i+1) % 30 === 0) process.stdout.write(`   ${i+1}... `);
    }
    console.log(`\n   ✓ ${incIds.length} incidents\n`);

    // 3. Threats (200)
    console.log('🛡️  Generating 200 threats...');
    for (let i = 0; i < 200; i++) {
        const type = pick(THR_TYPES);
        const names = THR_NAMES[type] || THR_NAMES['MALWARE'];
        const mitre = pick(MITRE);
        const created = pastISO(90);
        await db.execute({
            sql: `INSERT INTO Threat (id, name, type, severity, source, targetSector, confidence, mitreId, description, indicators, createdAt, updatedAt, incidentId) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            args: [
                cuid(), `${pick(names)}-${rand(100,999)}`, type, pick(SEVERITIES), pick(SOURCES), pick(SECTORS),
                parseFloat((0.6+Math.random()*0.39).toFixed(2)), mitre.id,
                `${type}: ${mitre.nm}. Actor: ${pick(ACTORS)}. Targeting ${pick(SECTORS).toLowerCase()}.`,
                JSON.stringify({hashes:[createHash('md5').update(`t-${i}`).digest('hex')],ips:[`${rand(1,223)}.${rand(0,255)}.${rand(0,255)}.${rand(1,254)}`]}),
                created, created, Math.random()>0.3 ? pick(incIds) : null,
            ],
        });
        if ((i+1) % 50 === 0) process.stdout.write(`   ${i+1}... `);
    }
    console.log('\n   ✓ 200 threats\n');

    // 4. Responses (80)
    console.log('⚡ Generating 80 SOAR responses...');
    for (let i = 0; i < 80; i++) {
        const done = Math.random() > 0.3;
        const created = pastISO(60);
        await db.execute({
            sql: `INSERT INTO Response (id, type, status, target, protocol, result, executedAt, completedAt, createdAt, updatedAt, incidentId) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
            args: [
                cuid(), pick(RESP_TYPES), done?'COMPLETED':pick(['PENDING','EXECUTING','FAILED']),
                pick(CNI), `${pick(['CONTAINMENT','PERIMETER','FORENSIC','LOCKDOWN'])}_${pick(['ALPHA','BRAVO','CHARLIE'])}`,
                done ? JSON.stringify({success:true,ms:rand(50,3000)}) : null,
                created, done ? created : null, created, created, pick(incIds),
            ],
        });
    }
    console.log('   ✓ 80 responses\n');

    // 5. Audit Logs (300)
    console.log('📜 Generating 300 audit logs...');
    const ACTIONS = ['LOGIN','VIEW','CREATE','UPDATE','RESPONSE','EXPORT','SEARCH'];
    const RESOURCES = ['incidents','threats','reports','users','dashboard','soar'];
    let prevHash = null;
    for (let i = 0; i < 300; i++) {
        const action = pick(ACTIONS);
        const ts = new Date(Date.now() - (300-i)*rand(60000,600000)).toISOString();
        const hash = createHash('sha256').update(`${action}-${ts}-${prevHash||'genesis'}`).digest('hex');
        await db.execute({
            sql: `INSERT INTO AuditLog (id, action, resource, resourceId, details, ipAddress, userAgent, hash, previousHash, createdAt, userId, incidentId) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
            args: [
                cuid(), action, pick(RESOURCES), Math.random()>0.3?pick(incIds):null,
                JSON.stringify({action,severity:pick(SEVERITIES)}),
                `10.${rand(0,255)}.${rand(0,255)}.${rand(1,254)}`, 'NCTIRS-Console/2.0',
                hash, prevHash, ts, pick(userIds),
                action==='RESPONSE'?pick(incIds):null,
            ],
        });
        prevHash = hash;
        if ((i+1) % 100 === 0) process.stdout.write(`   ${i+1}... `);
    }
    console.log('\n   ✓ 300 audit logs\n');

    // 6. Surveillance (50)
    console.log('📡 Generating 50 surveillance feeds...');
    for (const loc of FEEDS) {
        const c = pick(COUNTIES);
        const created = now;
        await db.execute({
            sql: `INSERT INTO SurveillanceFeed (id, location, type, status, latitude, longitude, streamUrl, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?)`,
            args: [
                cuid(), loc, pick(SURV_TYPES), Math.random()>0.15?'ACTIVE':'OFFLINE',
                c.lat+(Math.random()-0.5)*0.3, c.lng+(Math.random()-0.5)*0.3,
                `rtsp://cam-${rand(1000,9999)}.nctirs.ke/${loc.replace(/\s+/g,'-').toLowerCase()}`,
                created, created,
            ],
        });
    }
    console.log(`   ✓ ${FEEDS.length} feeds\n`);

    // 7. Reports (25)
    console.log('📄 Generating 25 NC4 reports...');
    for (let i = 0; i < 25; i++) {
        const created = pastISO(60);
        await db.execute({
            sql: `INSERT INTO Report (id, type, title, content, classification, status, hash, createdAt, updatedAt, submittedAt, createdById) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
            args: [
                cuid(), pick(['NC4','INCIDENT','THREAT_INTEL']), `NC4 Report — ${pick(CNI)} Incident`,
                JSON.stringify({target:pick(CNI),action:pick(RESP_TYPES),compliance:{act:'CMCA_2018',odpc:true}}),
                pick(['CONFIDENTIAL','SECRET','TOP SECRET']), pick(['DRAFT','SUBMITTED','APPROVED']),
                createHash('sha256').update(`rpt-${i}-${Date.now()}`).digest('hex'),
                created, created, Math.random()>0.4?pastISO(55):null, pick(userIds),
            ],
        });
    }
    console.log('   ✓ 25 reports\n');

    console.log('═══════════════════════════════════════════════════════');
    console.log('  ✅ SEED COMPLETE — 783 records');
    console.log('  👥8 users  🚨120 incidents  🛡️200 threats');
    console.log('  ⚡80 responses  📜300 logs  📡50 feeds  📄25 reports');
    console.log('  Demo: admin@nis.go.ke / admin123');
    console.log('═══════════════════════════════════════════════════════');
}

main().catch(e => { console.error('❌', e); process.exit(1); });
