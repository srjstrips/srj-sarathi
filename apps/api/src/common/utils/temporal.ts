export const now = (): any => (globalThis as any).Temporal.Instant.fromEpochMilliseconds(Date.now());
export const toInstant = (date: Date): any => (globalThis as any).Temporal.Instant.fromEpochMilliseconds(date.getTime());
export const fromIso = (iso: string): any => (globalThis as any).Temporal.Instant.from(iso);
