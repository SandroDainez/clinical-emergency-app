/**
 * guidelines-version.ts
 *
 * Utility to track clinical guideline versions and detect staleness.
 * Clinical content in this app is periodically reviewed against the sources
 * listed in protocols/guidelines_metadata.json.
 *
 * AUTO-UPDATE CAPABILITY:
 * The architecture supports two modes:
 *  1. Bundled (default): reads the JSON baked into the app bundle.
 *  2. Remote-fetch (future): fetches an updated JSON from a server URL
 *     without requiring an app store release. This allows the clinical
 *     team to update dosing / regimen text between app versions by
 *     publishing a new JSON to a CDN endpoint.
 *
 * HOW TO UPDATE CONTENT WITHOUT A NEW APP RELEASE:
 *  1. Update protocols/*.json files.
 *  2. Bump app_content_version and last_full_review in guidelines_metadata.json.
 *  3. Publish to your CDN / Supabase Storage / GitHub raw URL.
 *  4. Set REMOTE_METADATA_URL below to that URL.
 *  5. On next app launch, users see the "Atualizado" badge in the guidelines banner.
 *
 * NOTE: Clinical guidelines are NOT available as machine-readable APIs.
 * Auto-update still requires a human expert to review literature changes
 * and edit the JSON files. This system tracks and communicates that review status.
 */

import guidelinesMetadata from "../protocols/guidelines_metadata.json";

// ── Types ──────────────────────────────────────────────────────────────────

export interface GuidelineEntry {
  id: string;
  name: string;
  version: string;
  year: number;
  url: string;
  citation: string;
  last_reviewed: string; // ISO date string "YYYY-MM-DD"
  modules_using: string[];
  key_recommendations_covered: string[];
  staleness_threshold_months: number;
  notes?: string;
}

export interface GuidelinesMetadata {
  _meta: {
    schema_version: string;
    description: string;
    update_policy: string;
    maintainer: string;
  };
  guidelines: GuidelineEntry[];
  app_content_version: string;
  last_full_review: string;
  next_review_due: string;
  review_frequency_months: number;
}

export interface GuidelineStatus {
  guideline: GuidelineEntry;
  monthsSinceReview: number;
  isStale: boolean;
  daysUntilStale: number;
  statusLabel: "Atualizado" | "Revisar em breve" | "Desatualizado";
  statusColor: "green" | "yellow" | "red";
}

export interface AppGuidelinesStatus {
  version: string;
  lastFullReview: string;
  nextReviewDue: string;
  overallStatus: "Atualizado" | "Revisão pendente" | "Desatualizado";
  overallColor: "green" | "yellow" | "red";
  staleCount: number;
  guidelineStatuses: GuidelineStatus[];
  warningMessage: string | null;
}

// ── Remote fetch (future capability) ─────────────────────────────────────
// Set this URL to enable remote content updates without an app store release.
// The file at this URL must match the GuidelinesMetadata schema above.
const REMOTE_METADATA_URL: string | null = null;
// Example: "https://cdn.yourhospital.org/clinical-app/guidelines_metadata.json"

// In-memory cache for remote fetch (per session)
let _remoteMetadataCache: GuidelinesMetadata | null = null;
let _remoteFetchAttempted = false;

export async function fetchRemoteMetadata(): Promise<GuidelinesMetadata | null> {
  if (!REMOTE_METADATA_URL) return null;
  if (_remoteFetchAttempted) return _remoteMetadataCache;
  _remoteFetchAttempted = true;
  try {
    const response = await fetch(REMOTE_METADATA_URL, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    const data = (await response.json()) as GuidelinesMetadata;
    if (data?.guidelines && data.app_content_version) {
      _remoteMetadataCache = data;
      return data;
    }
  } catch {
    // Network unavailable — use bundled version silently
  }
  return null;
}

// ── Core Logic ────────────────────────────────────────────────────────────

function monthsBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA);
  const b = new Date(dateB);
  return (
    (b.getFullYear() - a.getFullYear()) * 12 +
    (b.getMonth() - a.getMonth())
  );
}

function getGuidelineStatus(
  entry: GuidelineEntry,
  today: string
): GuidelineStatus {
  const months = monthsBetween(entry.last_reviewed, today);
  const threshold = entry.staleness_threshold_months;
  const daysUntilStale = Math.max(
    0,
    Math.round((threshold - months) * 30.44)
  );
  const isStale = months >= threshold;
  const nearStale = !isStale && months >= threshold * 0.75;

  const statusLabel: GuidelineStatus["statusLabel"] = isStale
    ? "Desatualizado"
    : nearStale
    ? "Revisar em breve"
    : "Atualizado";

  const statusColor: GuidelineStatus["statusColor"] = isStale
    ? "red"
    : nearStale
    ? "yellow"
    : "green";

  return {
    guideline: entry,
    monthsSinceReview: months,
    isStale,
    daysUntilStale,
    statusLabel,
    statusColor,
  };
}

/**
 * Get the full status report for all guidelines.
 * Pass the result of fetchRemoteMetadata() (or null) to prefer remote data.
 */
export function getAppGuidelinesStatus(
  remoteMetadata?: GuidelinesMetadata | null
): AppGuidelinesStatus {
  const metadata = remoteMetadata ?? (guidelinesMetadata as GuidelinesMetadata);
  const today = new Date().toISOString().split("T")[0];

  const statuses = metadata.guidelines.map((g) =>
    getGuidelineStatus(g, today)
  );

  const staleCount = statuses.filter((s) => s.isStale).length;
  const nearStaleCount = statuses.filter(
    (s) => s.statusLabel === "Revisar em breve"
  ).length;

  const overallMonthsSinceReview = monthsBetween(
    metadata.last_full_review,
    today
  );
  const isFullyStale = overallMonthsSinceReview >= metadata.review_frequency_months;
  const isNearStale =
    !isFullyStale &&
    overallMonthsSinceReview >= metadata.review_frequency_months * 0.75;

  const overallStatus: AppGuidelinesStatus["overallStatus"] =
    staleCount > 0 || isFullyStale
      ? "Desatualizado"
      : nearStaleCount > 0 || isNearStale
      ? "Revisão pendente"
      : "Atualizado";

  const overallColor: AppGuidelinesStatus["overallColor"] =
    overallStatus === "Desatualizado"
      ? "red"
      : overallStatus === "Revisão pendente"
      ? "yellow"
      : "green";

  let warningMessage: string | null = null;
  if (staleCount > 0) {
    warningMessage = `${staleCount} diretriz(es) clínica(s) ultrapassaram o prazo de revisão. Verificar antes de uso clínico.`;
  } else if (nearStaleCount > 0 || isNearStale) {
    warningMessage = `Revisão de conteúdo clínico programada em breve. Última revisão: ${metadata.last_full_review}.`;
  }

  return {
    version: metadata.app_content_version,
    lastFullReview: metadata.last_full_review,
    nextReviewDue: metadata.next_review_due,
    overallStatus,
    overallColor,
    staleCount,
    guidelineStatuses: statuses,
    warningMessage,
  };
}

/**
 * Convenience: get status for a single module (e.g., "sepsis_uti_piora").
 * Returns only guidelines relevant to that module.
 */
export function getModuleGuidelinesStatus(
  moduleId: string,
  remoteMetadata?: GuidelinesMetadata | null
): GuidelineStatus[] {
  const metadata = remoteMetadata ?? (guidelinesMetadata as GuidelinesMetadata);
  const today = new Date().toISOString().split("T")[0];
  return metadata.guidelines
    .filter((g) => g.modules_using.includes(moduleId))
    .map((g) => getGuidelineStatus(g, today));
}

/**
 * Returns a short summary string for display in a UI banner.
 * e.g. "Diretrizes: v2.1.0 · Revisado 10/04/2026 · Atualizado"
 */
export function getGuidelinesBannerText(
  remoteMetadata?: GuidelinesMetadata | null
): string {
  const status = getAppGuidelinesStatus(remoteMetadata);
  const dateFormatted = status.lastFullReview
    .split("-")
    .reverse()
    .join("/");
  return `Diretrizes: v${status.version} · Revisado ${dateFormatted} · ${status.overallStatus}`;
}
