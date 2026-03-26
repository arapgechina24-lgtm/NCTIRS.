'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThreatBadge, StatusBadge, Badge } from "@/components/ui/badge"
import { SecurityIncident } from "@/lib/mockData"
import { MapPin, Clock, Users, AlertCircle, FileDown } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { downloadPDF, buildIncidentReport } from "@/lib/pdfExport"

interface IncidentListProps {
  incidents: SecurityIncident[];
  maxItems?: number;
}

export function IncidentList({ incidents, maxItems = 10 }: IncidentListProps) {
  const displayIncidents = incidents.slice(0, maxItems);
  const resolvedCount = displayIncidents.filter(i => i.status === 'RESOLVED').length;

  const handleDownloadReport = (incident: SecurityIncident) => {
    const reportData = buildIncidentReport({
      id: incident.id,
      title: incident.title,
      type: incident.type,
      description: incident.description,
      threatLevel: incident.threatLevel,
      status: incident.status,
      location: incident.location,
      timestamp: incident.timestamp,
      aiConfidence: incident.aiConfidence,
      sources: incident.sources,
    })
    downloadPDF(reportData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            Recent Security Incidents
          </div>
          <div className="flex items-center gap-3">
            {resolvedCount > 0 && (
              <span className="text-[10px] text-cyan-600 font-mono font-normal">{resolvedCount} RESOLVED</span>
            )}
            <span className="text-[10px] text-green-700 font-mono font-normal">{displayIncidents.length} TOTAL</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayIncidents.map((incident) => (
            <div
              key={incident.id}
              className={`flex flex-col gap-3 rounded-none border bg-black/50 p-4 transition-all hover:shadow-[0_0_20px_rgba(0,255,65,0.05)] ${
                incident.status === 'RESOLVED'
                  ? 'border-green-700/40 hover:border-green-500/60 hover:bg-green-950/10'
                  : 'border-green-900/30 hover:border-green-500/50 hover:bg-green-950/10'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <ThreatBadge level={incident.threatLevel} />
                    <StatusBadge status={incident.status} />
                    <Badge variant="info">{incident.type.replace(/_/g, ' ')}</Badge>
                  </div>
                  <h4 className="font-bold text-green-400 font-mono tracking-tight">{incident.title}</h4>
                  <p className="text-[11px] text-green-800 mt-1 uppercase leading-relaxed">{incident.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-green-600 font-mono">
                    AI_CONFIDENCE: {incident.aiConfidence}%
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[10px] text-green-900 font-mono uppercase">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{incident.location.name}, {incident.location.region}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDistanceToNow(incident.timestamp, { addSuffix: true })}</span>
                </div>
                {incident.suspects && (
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{incident.suspects} suspects</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[9px] text-green-950 font-mono uppercase">
                  <span>Data_Sources:</span>
                  {incident.sources.map((source, idx) => (
                    <Badge key={idx} variant="default" className="text-[8px] h-4">
                      {source}
                    </Badge>
                  ))}
                </div>

                {incident.status === 'RESOLVED' && (
                  <button
                    onClick={() => handleDownloadReport(incident)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-mono font-bold uppercase tracking-wider border border-cyan-800/50 bg-cyan-950/30 text-cyan-400 hover:bg-cyan-900/40 hover:border-cyan-600/60 transition-all shrink-0"
                    title="Download NC4 Incident Report (PDF)"
                  >
                    <FileDown className="h-3 w-3" />
                    NC4 Report
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
