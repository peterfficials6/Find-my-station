export interface ActiveSession {
  id: string;
  lat: number | null;
  lng: number | null;
  country: string | null;
  city: string | null;
  lastSeen: Date;
  currentPath: string;
}

const sessions = new Map<string, ActiveSession>();
const SESSION_TTL = 60_000; // 60 seconds

export function upsertSession(session: ActiveSession) {
  session.lastSeen = new Date();
  sessions.set(session.id, session);
  pruneStale();
}

export function getActiveSessions(): ActiveSession[] {
  pruneStale();
  return Array.from(sessions.values());
}

export function getActiveCount(): number {
  pruneStale();
  return sessions.size;
}

function pruneStale() {
  const cutoff = Date.now() - SESSION_TTL;
  for (const [id, session] of sessions) {
    if (session.lastSeen.getTime() < cutoff) {
      sessions.delete(id);
    }
  }
}
