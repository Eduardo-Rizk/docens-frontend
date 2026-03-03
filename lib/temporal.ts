/**
 * Pure functions for classifying the temporal state of class events.
 */

export type TemporalState = "upcoming" | "live" | "past";

export function isLiveNow(startsAt: string, durationMin: number): boolean {
  const start = new Date(startsAt).getTime();
  const end = start + durationMin * 60_000;
  const now = Date.now();
  return now >= start && now <= end;
}

export function isEventPast(startsAt: string, durationMin: number): boolean {
  const end = new Date(startsAt).getTime() + durationMin * 60_000;
  return Date.now() > end;
}

export function getEventTemporalState(
  startsAt: string,
  durationMin: number,
  publicationStatus?: string,
): TemporalState {
  if (publicationStatus === "FINISHED") return "past";
  if (isEventPast(startsAt, durationMin)) return "past";
  if (isLiveNow(startsAt, durationMin)) return "live";
  return "upcoming";
}

export function isPurchaseBlocked(
  startsAt: string,
  durationMin: number,
  publicationStatus?: string,
): boolean {
  return getEventTemporalState(startsAt, durationMin, publicationStatus) === "past";
}
