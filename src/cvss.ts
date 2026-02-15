import type { CveItem, CvssV40, CvssV31, CvssV30, CvssV2 } from './api/nvd/cves/2.0/schema/response';

export interface CvssInfo {
  version: string;
  baseScore: number;
  baseSeverity: string;
  vectorString: string;
}

/**
 * Extract the most relevant CVSS info from a CVE item.
 * Priority: v4.0 > v3.1 > v3.0 > v2.0
 * Within each version, prefer type="Primary" over "Secondary".
 */
export function extractCvssInfo(cve: CveItem): CvssInfo | null {
  const metrics = cve.metrics;
  if (!metrics) return null;

  if (metrics.cvssMetricV40?.length) {
    const m = metrics.cvssMetricV40.find((m: CvssV40) => m.type === 'Primary') ?? metrics.cvssMetricV40[0];
    return {
      version: 'CVSS:4.0',
      baseScore: (m.cvssData as any).baseScore ?? 0,
      baseSeverity: (m.cvssData as any).baseSeverity ?? 'NONE',
      vectorString: m.cvssData.vectorString,
    };
  }

  if (metrics.cvssMetricV31?.length) {
    const m = metrics.cvssMetricV31.find((m: CvssV31) => m.type === 'Primary') ?? metrics.cvssMetricV31[0];
    return {
      version: 'CVSS:3.1',
      baseScore: m.cvssData.baseScore,
      baseSeverity: m.cvssData.baseSeverity,
      vectorString: m.cvssData.vectorString,
    };
  }

  if (metrics.cvssMetricV30?.length) {
    const m = metrics.cvssMetricV30.find((m: CvssV30) => m.type === 'Primary') ?? metrics.cvssMetricV30[0];
    return {
      version: 'CVSS:3.0',
      baseScore: m.cvssData.baseScore,
      baseSeverity: m.cvssData.baseSeverity,
      vectorString: m.cvssData.vectorString,
    };
  }

  if (metrics.cvssMetricV2?.length) {
    const m = metrics.cvssMetricV2.find((m: CvssV2) => m.type === 'Primary') ?? metrics.cvssMetricV2[0];
    return {
      version: 'CVSS:2.0',
      baseScore: m.cvssData.baseScore,
      baseSeverity: m.baseSeverity ?? 'UNKNOWN',
      vectorString: m.cvssData.vectorString,
    };
  }

  return null;
}
