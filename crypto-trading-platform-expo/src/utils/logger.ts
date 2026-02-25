/**
 * Demo audit logger.
 * In a real system: structured logs, PII redaction, remote sink, tamper-evident storage.
 */
export type AuditEvent = {
  ts: number;
  type: string;
  detail: Record<string, unknown>;
};

const buffer: AuditEvent[] = [];

export function logEvent(type: string, detail: Record<string, unknown>) {
  buffer.unshift({ ts: Date.now(), type, detail });
  if (buffer.length > 200) buffer.pop();
}

export function getEvents(): AuditEvent[] {
  return [...buffer];
}
