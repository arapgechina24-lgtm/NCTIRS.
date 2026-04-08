import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const incidents = await prisma.incident.findMany()
  const threats = await prisma.threat.findMany()
  console.log("Incidents:", incidents.length)
  console.log("Threats:", threats.length)
}
main().catch(console.error).finally(()=> prisma.$disconnect())
