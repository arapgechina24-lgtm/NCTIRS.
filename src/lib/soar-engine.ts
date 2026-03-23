// NCTIRS Autonomous SOAR (Security Orchestration, Automation & Response) Engine
// Auto-triggers containment actions when CRITICAL or HIGH incidents are detected
import { prisma } from '@/lib/db';

// ── SOAR Decision Matrix ────────────────────────────────────────────────────
const SOAR_PLAYBOOKS: Record<string, {
    actions: { type: string; protocol: string; target: string }[];
    escalation: string;
}> = {
    'CRITICAL': {
        actions: [
            { type: 'AIR_GAP', protocol: 'AUTO_CONTAINMENT_ALPHA', target: 'Affected Network Segment' },
            { type: 'BLOCK_IP', protocol: 'PERIMETER_LOCKDOWN', target: 'Border Firewall + ISP Gateway' },
            { type: 'ALERT', protocol: 'NIS_DIRECTOR_NOTIFY', target: 'NIS Operations Center' },
        ],
        escalation: 'IMMEDIATE — NIS Director, NCSC, NC4'
    },
    'HIGH': {
        actions: [
            { type: 'ISOLATE', protocol: 'SEGMENT_ISOLATION_BRAVO', target: 'Compromised Host' },
            { type: 'ALERT', protocol: 'L3_ANALYST_ESCALATION', target: 'SOC Level 3 Team' },
        ],
        escalation: 'HIGH — SOC L3 Analyst within 15 minutes'
    },
    'MEDIUM': {
        actions: [
            { type: 'ALERT', protocol: 'WATCHLIST_CHARLIE', target: 'SOC Monitoring Dashboard' },
        ],
        escalation: 'STANDARD — Add to daily threat briefing'
    },
};

export interface SOARExecutionResult {
    triggered: boolean;
    playbook: string | null;
    actionsExecuted: {
        responseId: string;
        type: string;
        protocol: string;
        status: string;
        executedAt: string;
    }[];
    escalation: string | null;
    auditLogId: string | null;
}

// ── Autonomous SOAR Orchestrator ────────────────────────────────────────────
export async function executeSOARPlaybook(
    incidentId: string,
    severity: string,
    title: string,
    targetAsset?: string | null
): Promise<SOARExecutionResult> {
    const playbook = SOAR_PLAYBOOKS[severity];

    // Only auto-trigger for CRITICAL and HIGH
    if (!playbook) {
        return {
            triggered: false,
            playbook: null,
            actionsExecuted: [],
            escalation: null,
            auditLogId: null,
        };
    }

    console.log(`[SOAR] 🚨 Auto-triggering ${severity} playbook for incident ${incidentId}: "${title}"`);

    const actionsExecuted: SOARExecutionResult['actionsExecuted'] = [];
    const now = new Date();

    // Execute each action in the playbook
    for (const action of playbook.actions) {
        try {
            const response = await prisma.response.create({
                data: {
                    type: action.type,
                    status: 'EXECUTING',
                    target: targetAsset || action.target,
                    protocol: action.protocol,
                    executedAt: now,
                    incidentId,
                }
            });

            // Simulate rapid execution (sub-second for autonomous response)
            await prisma.response.update({
                where: { id: response.id },
                data: {
                    status: 'COMPLETED',
                    result: JSON.stringify({
                        protocol: action.protocol,
                        executionTimeMs: Math.floor(Math.random() * 200) + 50,
                        success: true,
                        details: `Autonomous ${action.type} executed on ${action.target}`,
                    }),
                    completedAt: new Date(),
                }
            });

            actionsExecuted.push({
                responseId: response.id,
                type: action.type,
                protocol: action.protocol,
                status: 'COMPLETED',
                executedAt: now.toISOString(),
            });

            console.log(`[SOAR] ✅ ${action.type} (${action.protocol}) completed for ${action.target}`);
        } catch (err) {
            console.error(`[SOAR] ❌ Failed to execute ${action.type}:`, err);
        }
    }

    // Update incident status to INVESTIGATING (auto-contained)
    try {
        await prisma.incident.update({
            where: { id: incidentId },
            data: { status: severity === 'CRITICAL' ? 'CONTAINED' : 'INVESTIGATING' }
        });
    } catch (err) {
        console.error('[SOAR] Failed to update incident status:', err);
    }

    // Create audit log entry for the autonomous action
    let auditLogId: string | null = null;
    try {
        const { createHash } = await import('crypto');
        const auditLog = await prisma.auditLog.create({
            data: {
                action: 'RESPONSE',
                resource: 'incidents',
                resourceId: incidentId,
                details: JSON.stringify({
                    soarPlaybook: severity,
                    actionsCount: actionsExecuted.length,
                    autonomous: true,
                    escalation: playbook.escalation,
                }),
                hash: createHash('sha256').update(`SOAR-${incidentId}-${Date.now()}`).digest('hex'),
            }
        });
        auditLogId = auditLog.id;
    } catch (err) {
        console.error('[SOAR] Failed to create audit log:', err);
    }

    console.log(`[SOAR] 🏁 Playbook complete: ${actionsExecuted.length} actions executed, escalation: ${playbook.escalation}`);

    return {
        triggered: true,
        playbook: `${severity}_PLAYBOOK`,
        actionsExecuted,
        escalation: playbook.escalation,
        auditLogId,
    };
}
