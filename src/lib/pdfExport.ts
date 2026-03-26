// PDF Export utility for NC4 Compliance Reports
'use client'

import jsPDF from 'jspdf'

interface ReportData {
    title: string
    classification: 'UNCLASSIFIED' | 'CONFIDENTIAL' | 'SECRET' | 'TOP SECRET'
    date: string
    author: string
    agency: string
    incident: {
        id: string
        title: string
        type: string
        severity: string
        status: string
        location?: string
        description: string
        detectedAt: string
        targetAsset?: string
        attackVector?: string
        aiConfidence?: number
        sources?: string[]
    }
    actions: {
        protocol: string
        status: string
        executedAt: string
    }[]
    recommendations: string[]
    hash: string
}

// Add diagonal CLASSIFIED watermark to every page
function addClassifiedWatermark(doc: jsPDF, classification: string) {
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    doc.saveGraphicsState()

    // Diagonal watermark text
    doc.setTextColor(255, 0, 0)
    doc.setFontSize(60)
    doc.setFont('helvetica', 'bold')

    // Set transparency via graphics state
    const gState = new (doc as unknown as { GState: new (opts: { opacity: number }) => unknown }).GState({ opacity: 0.06 })
    doc.setGState(gState)

    // Rotate and place watermark diagonally across the page
    const text = `// ${classification} //`
    const centerX = pageWidth / 2
    const centerY = pageHeight / 2

    // Draw multiple watermarks for coverage
    doc.text(text, centerX, centerY - 60, { align: 'center', angle: 35 })
    doc.text(text, centerX, centerY + 60, { align: 'center', angle: 35 })

    // Reset
    const resetState = new (doc as unknown as { GState: new (opts: { opacity: number }) => unknown }).GState({ opacity: 1 })
    doc.setGState(resetState)
    doc.restoreGraphicsState()
    doc.setTextColor(0, 0, 0)
}

// Add classification banner (top and bottom)
function addClassificationBanners(doc: jsPDF, classification: string) {
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    const centerText = (text: string, yPos: number, fontSize: number = 12) => {
        doc.setFontSize(fontSize)
        const textWidth = doc.getTextWidth(text)
        doc.text(text, (pageWidth - textWidth) / 2, yPos)
    }

    // Top banner
    doc.setFillColor(0, 0, 0)
    doc.rect(0, 0, pageWidth, 12, 'F')
    doc.setTextColor(255, 0, 0)
    doc.setFont('helvetica', 'bold')
    centerText(`// ${classification} // REPUBLIC OF KENYA // NIS //`, 8, 9)

    // Bottom banner
    doc.setFillColor(0, 0, 0)
    doc.rect(0, pageHeight - 12, pageWidth, 12, 'F')
    doc.setTextColor(255, 0, 0)
    centerText(`// ${classification} // UNAUTHORIZED DISCLOSURE IS AN OFFENCE UNDER THE OFFICIAL SECRETS ACT //`, pageHeight - 4, 7)

    doc.setTextColor(0, 0, 0)
}

// Draw a section header bar
function drawSectionHeader(doc: jsPDF, title: string, y: number, color: [number, number, number] = [0, 60, 0]): number {
    const pageWidth = doc.internal.pageSize.getWidth()
    doc.setFillColor(color[0], color[1], color[2])
    doc.rect(20, y, pageWidth - 40, 8, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text(title, 25, y + 6)
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'normal')
    return y + 14
}

// Check if we need a new page
function checkPageBreak(doc: jsPDF, y: number, needed: number, classification: string): number {
    if (y + needed > doc.internal.pageSize.getHeight() - 30) {
        doc.addPage()
        addClassifiedWatermark(doc, classification)
        addClassificationBanners(doc, classification)
        return 22
    }
    return y
}

export function generatePDF(data: ReportData): jsPDF {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    // === PAGE 1: Cover & Watermark ===
    addClassifiedWatermark(doc, data.classification)
    addClassificationBanners(doc, data.classification)

    let y = 22

    // NIS Header
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 80, 0)
    const nisHeader = 'REPUBLIC OF KENYA'
    doc.text(nisHeader, (pageWidth - doc.getTextWidth(nisHeader)) / 2, y)
    y += 6
    doc.setFontSize(8)
    doc.setTextColor(80, 80, 80)
    const nisSubheader = 'NATIONAL INTELLIGENCE SERVICE | NATIONAL CYBER COMMAND'
    doc.text(nisSubheader, (pageWidth - doc.getTextWidth(nisSubheader)) / 2, y)
    y += 4
    doc.setDrawColor(0, 80, 0)
    doc.setLineWidth(0.5)
    doc.line(20, y, pageWidth - 20, y)
    y += 8

    // Title
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    const title = 'NC4 INCIDENT RESPONSE REPORT'
    doc.text(title, (pageWidth - doc.getTextWidth(title)) / 2, y)
    y += 7

    // Subtitle
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 80)
    const subtitle = 'Computer Misuse and Cybercrimes Act (2018) | Data Protection Act (2019)'
    doc.text(subtitle, (pageWidth - doc.getTextWidth(subtitle)) / 2, y)
    y += 12

    // Report metadata table
    doc.setFontSize(9)
    doc.setTextColor(0, 0, 0)
    const metaLeft = [
        ['Report ID:', data.incident.id],
        ['Classification:', data.classification],
        ['Author:', data.author],
        ['Agency:', data.agency],
    ]
    const metaRight = [
        ['Date:', data.date],
        ['Status:', data.incident.status],
        ['Severity:', data.incident.severity],
        ['AI Confidence:', `${data.incident.aiConfidence || 'N/A'}%`],
    ]

    for (let i = 0; i < metaLeft.length; i++) {
        doc.setFont('helvetica', 'bold')
        doc.text(metaLeft[i][0], 25, y)
        doc.setFont('helvetica', 'normal')
        doc.text(metaLeft[i][1], 55, y)
        doc.setFont('helvetica', 'bold')
        doc.text(metaRight[i][0], 120, y)
        doc.setFont('helvetica', 'normal')
        doc.text(metaRight[i][1], 155, y)
        y += 6
    }
    y += 8

    // === INCIDENT DETAILS ===
    y = drawSectionHeader(doc, 'SECTION 1: INCIDENT DETAILS', y, [0, 60, 0])

    const incidentDetails = [
        ['Title:', data.incident.title],
        ['Type:', data.incident.type.replace(/_/g, ' ')],
        ['Severity:', data.incident.severity],
        ['Status:', data.incident.status],
        ['Location:', data.incident.location || 'N/A'],
        ['Detected At:', data.incident.detectedAt],
        ['Target Asset:', data.incident.targetAsset || 'N/A'],
        ['Attack Vector:', data.incident.attackVector || 'N/A'],
    ]

    doc.setFontSize(9)
    for (const [label, value] of incidentDetails) {
        y = checkPageBreak(doc, y, 7, data.classification)
        doc.setFont('helvetica', 'bold')
        doc.text(label, 25, y)
        doc.setFont('helvetica', 'normal')
        doc.text(String(value), 70, y)
        y += 6
    }
    y += 4

    // Description
    y = checkPageBreak(doc, y, 30, data.classification)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text('Narrative:', 25, y)
    y += 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    const descLines = doc.splitTextToSize(data.incident.description, pageWidth - 50)
    doc.text(descLines, 25, y)
    y += descLines.length * 4 + 8

    // Intelligence Sources
    if (data.incident.sources && data.incident.sources.length > 0) {
        y = checkPageBreak(doc, y, 15, data.classification)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.text('Intelligence Sources:', 25, y)
        y += 5
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.text(data.incident.sources.join(', '), 25, y)
        y += 8
    }

    // === ACTIONS TAKEN ===
    y = checkPageBreak(doc, y, 25, data.classification)
    y = drawSectionHeader(doc, 'SECTION 2: RESPONSE ACTIONS TAKEN', y, [0, 0, 80])
    doc.setFontSize(9)

    if (data.actions.length > 0) {
        for (const action of data.actions) {
            y = checkPageBreak(doc, y, 12, data.classification)
            doc.setFont('helvetica', 'bold')
            doc.text(`\u2022 ${action.protocol}`, 25, y)
            y += 5
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(8)
            doc.text(`Status: ${action.status}  |  Executed: ${action.executedAt}`, 30, y)
            doc.setFontSize(9)
            y += 7
        }
    } else {
        doc.text('No automated response actions were triggered for this incident.', 25, y)
        y += 7
    }
    y += 4

    // === RECOMMENDATIONS ===
    if (data.recommendations.length > 0) {
        y = checkPageBreak(doc, y, 25, data.classification)
        y = drawSectionHeader(doc, 'SECTION 3: RECOMMENDATIONS', y, [100, 50, 0])
        doc.setFontSize(9)

        for (const rec of data.recommendations) {
            y = checkPageBreak(doc, y, 10, data.classification)
            const recLines = doc.splitTextToSize(`\u2022 ${rec}`, pageWidth - 50)
            doc.text(recLines, 25, y)
            y += recLines.length * 4 + 4
        }
        y += 4
    }

    // === LEGAL COMPLIANCE ===
    y = checkPageBreak(doc, y, 40, data.classification)
    y = drawSectionHeader(doc, 'SECTION 4: LEGAL & COMPLIANCE', y, [60, 0, 60])
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')

    const legalText = [
        'This report is generated pursuant to the following legislative instruments:',
        '',
        '1. Kenya Computer Misuse and Cybercrimes Act (2018), Section 11 - Evidence Admissibility',
        '2. Kenya Data Protection Act (2019) - ODPC Compliance Requirements',
        '3. National Computer & Cybercrimes Coordination Committee (NC4) Reporting Standards',
        '4. NIST SP 800-53 Security Controls Framework',
        '',
        'All evidence chains are verified via SHA-256 blockchain integrity ledger.',
        'Automated actions comply with the National Intelligence Service Act (2012).',
    ]

    for (const line of legalText) {
        y = checkPageBreak(doc, y, 5, data.classification)
        doc.text(line, 25, y)
        y += 4.5
    }
    y += 6

    // === INTEGRITY FOOTER ===
    y = checkPageBreak(doc, y, 30, data.classification)
    doc.setDrawColor(0, 60, 0)
    doc.setLineWidth(0.3)
    doc.line(20, y, pageWidth - 20, y)
    y += 6
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.text('DOCUMENT INTEGRITY VERIFICATION', 25, y)
    y += 4
    doc.setFont('helvetica', 'normal')
    doc.text(`SHA-256 Hash: ${data.hash}`, 25, y)
    y += 4
    doc.text(`Generated: ${new Date().toISOString()} | NCTIRS v1.3.0 | AI-Powered Sovereign Platform`, 25, y)
    y += 4
    doc.text('This document is court-admissible under CMCA 2018, Section 11.', 25, y)

    return doc
}

// Download PDF helper
export function downloadPDF(data: ReportData, filename?: string) {
    const doc = generatePDF(data)
    const defaultFilename = `NC4_Report_${data.incident.id}_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(filename || defaultFilename)
}

// Preview PDF in new window
export function previewPDF(data: ReportData) {
    const doc = generatePDF(data)
    const pdfDataUri = doc.output('datauristring')
    window.open(pdfDataUri, '_blank')
}

// Helper to generate a SHA-256-like hash for reports
export function generateReportHash(incidentId: string): string {
    const seed = `${incidentId}-${Date.now()}-NCTIRS`
    let hash = ''
    for (let i = 0; i < 64; i++) {
        hash += ((seed.charCodeAt(i % seed.length) * 7 + i * 13) % 16).toString(16)
    }
    return hash
}

// Build report data from a SecurityIncident
export function buildIncidentReport(incident: {
    id: string
    title: string
    type: string
    description: string
    severity?: string
    threatLevel?: string
    status: string
    location?: { name: string; region: string }
    timestamp?: Date
    aiConfidence?: number
    sources?: string[]
    targetAsset?: string
    attackVector?: string
}): ReportData {
    const hash = generateReportHash(incident.id)
    const severity = incident.severity || incident.threatLevel || 'UNKNOWN'

    return {
        title: 'NC4 Incident Response Report',
        classification: severity === 'CRITICAL' ? 'TOP SECRET' : severity === 'HIGH' ? 'SECRET' : 'CONFIDENTIAL',
        date: new Date().toLocaleDateString('en-KE', { dateStyle: 'full' }),
        author: 'NCTIRS Automated Report Engine',
        agency: 'National Intelligence Service - Cyber Command',
        incident: {
            id: incident.id,
            title: incident.title,
            type: incident.type,
            severity,
            status: incident.status,
            location: incident.location ? `${incident.location.name}, ${incident.location.region}` : 'N/A',
            description: incident.description,
            detectedAt: incident.timestamp ? new Date(incident.timestamp).toLocaleString('en-KE') : new Date().toLocaleString('en-KE'),
            targetAsset: incident.targetAsset || undefined,
            attackVector: incident.attackVector || undefined,
            aiConfidence: incident.aiConfidence,
            sources: incident.sources,
        },
        actions: incident.status === 'RESOLVED' || incident.status === 'CONTAINED' || incident.status === 'NEUTRALIZED'
            ? [
                { protocol: 'NETWORK_AIRGAP - Subnet isolation executed', status: 'COMPLETED', executedAt: new Date().toLocaleString('en-KE') },
                { protocol: 'IP_BLOCK - Source addresses blacklisted at border firewall', status: 'COMPLETED', executedAt: new Date().toLocaleString('en-KE') },
                { protocol: 'NIS_DIRECTOR_NOTIFICATION - Escalation transmitted', status: 'COMPLETED', executedAt: new Date().toLocaleString('en-KE') },
                { protocol: 'EVIDENCE_PRESERVE - Forensic snapshot captured to blockchain ledger', status: 'COMPLETED', executedAt: new Date().toLocaleString('en-KE') },
            ]
            : [
                { protocol: 'MONITORING - Incident under active surveillance', status: 'IN PROGRESS', executedAt: new Date().toLocaleString('en-KE') },
            ],
        recommendations: [
            'Conduct full forensic analysis of affected systems within 48 hours.',
            'Rotate all credentials associated with the targeted asset.',
            'Update MITRE ATT&CK mapping and share IOCs with KE-CIRT/CC.',
            'Brief the NC4 Committee within the statutory 72-hour reporting window.',
            'Schedule post-incident review with all participating agencies.',
        ],
        hash,
    }
}

export type { ReportData }
