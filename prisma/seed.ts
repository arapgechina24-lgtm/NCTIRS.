import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Clearing old data...')
  await prisma.Incident.deleteMany({})
  await prisma.Threat.deleteMany({})
  await prisma.User.deleteMany({})

  console.log('Seeding fake operations data...')

  const admin = await prisma.user.create({
    data: {
      email: 'admin@nctirs.ke',
      name: 'System Admin',
      password: 'hashed-password-here', // In a real app, hash this!
      role: 'L4',
      agency: 'NIS',
      department: 'Cyber Command',
      clearanceLevel: 5
    }
  })

  // 1. Create robust Incidents (For Active Cases & Recent Security Incidents)
  const types = ['CYBER_ATTACK', 'TERRORISM', 'ORGANIZED_CRIME', 'BORDER_SECURITY', 'VIOLENT_CRIME', 'TRAFFICKING']
  const severities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
  const counties = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Turkana', 'Garissa', 'Mandera']
  
  for (let i = 0; i < 45; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    const severity = severities[Math.floor(Math.random() * severities.length)]
    const county = counties[Math.floor(Math.random() * counties.length)]
    const status = Math.random() > 0.3 ? 'ACTIVE' : (Math.random() > 0.5 ? 'RESOLVED' : 'INVESTIGATING')

    await prisma.incident.create({
      data: {
        title: `${severity} ${type.replace('_', ' ')} detected in ${county}`,
        description: `Automated detection of localized ${type} event matching known patterns. Multi-agency response coordinated by NIS.`,
        type,
        severity,
        status,
        location: `${county} CBD Sector`,
        county,
        latitude: -1.2921 + (Math.random() * 2 - 1),
        longitude: 36.8219 + (Math.random() * 2 - 1),
        targetAsset: Math.random() > 0.5 ? 'Government Infrastructure' : 'Civilian Target',
        attackVector: 'Standard Execution',
        indicators: JSON.stringify(['IOC-1', 'IOC-2']),
        createdById: admin.id,
      }
    })
  }

  // 2. Create Threats (For National Risk Registry)
  const threatTypes = ['APT', 'ZERO_DAY', 'DDOS', 'RANSOMWARE', 'PHISHING']
  const sectors = ['GOVERNMENT', 'FINANCIAL', 'INFRASTRUCTURE', 'HEALTHCARE']

  for (let i = 0; i < 30; i++) {
    const type = threatTypes[Math.floor(Math.random() * threatTypes.length)]
    const severity = severities[Math.floor(Math.random() * severities.length)]
    const sector = sectors[Math.floor(Math.random() * sectors.length)]

    await prisma.threat.create({
      data: {
        name: `${type} Strike on ${sector}`,
        type,
        severity,
        source: 'Unknown APT Group',
        targetSector: sector,
        confidence: Math.random() * 0.4 + 0.6, // 60% to 100%
        mitreId: 'T1566',
        description: `${severity} severity threat identified traversing critical boundaries. Potential data exfiltration risk.`,
        indicators: JSON.stringify(['192.168.1.100', 'malicious-domain.com'])
      }
    })
  }

  console.log('Seeding complete! Dashboard should now have plenty of data.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
